import { db } from '../../db'
import { deliverToFollowers } from '../../utils/federation'
import { posts, channels, media, follows, customEmojis } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { eq, sql, inArray, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { renderMarkdown } from '../../utils/markdown'

const schema = z.object({
  title:      z.string().max(200).optional(),
  content:    z.string().min(1).max(5000),
  channelSlug: z.string().optional(),
  visibility: z.enum(['public', 'unlisted', 'followers']).default('public'),
  replyToId:  z.string().uuid().optional(),
  sensitive:  z.boolean().default(false),
  mediaIds:    z.array(z.string().uuid()).max(4).default([]),  // ← 추가
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, schema.parse)
  const domain = process.env.INSTANCE_DOMAIN!

  let channelId: string | undefined
  if (body.channelSlug) {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.slug, body.channelSlug),
    })
    if (!channel) {
      throw createError({ statusCode: 404, message: '채널을 찾을 수 없습니다' })
    }
    channelId = channel.id
  }

  // 로컬 커스텀 이모지 로드
  const emojiRows = await db.select().from(customEmojis).where(isNull(customEmojis.domain))
  const emojiMap = Object.fromEntries(emojiRows.map(e => [e.shortcode, e.url]))

  const [post] = await db.insert(posts).values({
    authorId:    user.id,
    channelId,
    title:       body.title,
    content:     body.content,
    contentHtml: renderMarkdown(body.content, emojiMap),
    visibility:  body.visibility,
    replyToId:   body.replyToId,
    isSensitive: body.sensitive,
    isLocal:     true,
  }).returning()


    // 답글이면 부모 글 replyCount 증가  ← 추가
    if (body.replyToId) {
    await db.update(posts)
        .set({ replyCount: sql`${posts.replyCount} + 1` })
        .where(eq(posts.id, body.replyToId))
    }

  // 미디어 연결  ← 추가
  if (body.mediaIds.length > 0) {
    await db.update(media)
      .set({ postId: post.id })
      .where(inArray(media.id, body.mediaIds))
  }

  // ActivityPub IRI 업데이트
  await db.update(posts)
    .set({ apId: `https://${domain}/posts/${post.id}` })
    .where(eq(posts.id, post.id))


// 팔로워 inbox URL 목록 가져오기
const followerList = await db.query.follows.findMany({
  where: eq(follows.followingId, user.id),
  with: { follower: { columns: { inboxUrl: true, isLocal: true } } },
})

const remoteFollowerInboxes = followerList
  .filter(f => !f.follower.isLocal && f.follower.inboxUrl)
  .map(f => f.follower.inboxUrl!)

if (remoteFollowerInboxes.length > 0) {
  // 본문에서 커스텀 이모지 태그 추출
  const emojiTags = Object.entries(emojiMap)
    .filter(([sc]) => post.content.includes(`:${sc}:`))
    .map(([sc, url]) => ({
      type: 'Emoji',
      name: `:${sc}:`,
      icon: { type: 'Image', url },
    }))

  const createActivity = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      { toot: 'http://joinmastodon.org/ns#', Emoji: 'toot:Emoji' },
    ],
    id:         `https://${domain}/posts/${post.id}#activity`,
    type:       'Create',
    actor:      `https://${domain}/users/${user.handle}`,
    published:  post.createdAt,
    to:         ['https://www.w3.org/ns/activitystreams#Public'],
    object: {
      id:           `https://${domain}/posts/${post.id}`,
      type:         'Note',
      content:      post.contentHtml ?? post.content,
      published:    post.createdAt,
      attributedTo: `https://${domain}/users/${user.handle}`,
      to:           ['https://www.w3.org/ns/activitystreams#Public'],
      tag:          emojiTags.length > 0 ? emojiTags : undefined,
    },
  }
  // 비동기로 배달 (응답 기다리지 않음)
  deliverToFollowers(createActivity, user.handle, remoteFollowerInboxes).catch(console.error)
}

  return { ...post, apId: `https://${domain}/posts/${post.id}` }
})