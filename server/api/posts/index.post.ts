import { db } from '../../db'
import { posts, channels, media } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { eq, sql, inArray } from 'drizzle-orm'
import { z } from 'zod'

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

  const [post] = await db.insert(posts).values({
    authorId:    user.id,
    channelId,
    title:       body.title,
    content:     body.content,
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

  return { ...post, apId: `https://${domain}/posts/${post.id}` }
})