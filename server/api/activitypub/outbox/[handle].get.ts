import { db } from '../../../db'
import { users, posts, customEmojis } from '../../../db/schema'
import { and, eq, desc, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!
  const domain = process.env.INSTANCE_DOMAIN!

  const user = await db.query.users.findFirst({
    where: and(eq(users.handle, handle), eq(users.isLocal, true)),
  })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const userPosts = await db.query.posts.findMany({
    where: and(eq(posts.authorId, user.id), eq(posts.visibility, 'public')),
    orderBy: desc(posts.createdAt),
    limit: 20,
  })

  // 로컬 커스텀 이모지 맵
  const emojiRows = await db.select().from(customEmojis).where(isNull(customEmojis.domain))
  const emojiMap = Object.fromEntries(emojiRows.map(e => [e.shortcode, e.url]))

  // 본문에서 :shortcode: 패턴 추출 → AP Emoji tag 배열 생성
  function extractEmojiTags(content: string) {
    const matches = [...content.matchAll(/:([a-zA-Z0-9_]+):/g)]
    return matches
      .map(m => m[1])
      .filter((sc, i, arr) => arr.indexOf(sc) === i && emojiMap[sc])
      .map(sc => ({
        type: 'Emoji',
        name: `:${sc}:`,
        icon: { type: 'Image', url: emojiMap[sc] },
      }))
  }

  setHeader(event, 'Content-Type', 'application/activity+json')

  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      { toot: 'http://joinmastodon.org/ns#', Emoji: 'toot:Emoji' },
    ],
    id:         `${user.actorUrl}/outbox`,
    type:       'OrderedCollection',
    totalItems: userPosts.length,
    orderedItems: userPosts.map(post => {
      const emojiTags = extractEmojiTags(post.content)
      return {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          { toot: 'http://joinmastodon.org/ns#', Emoji: 'toot:Emoji' },
        ],
        id:         `${post.apId}#activity`,
        type:       'Create',
        actor:      user.actorUrl,
        published:  post.createdAt,
        object: {
          id:           post.apId,
          type:         'Note',
          content:      post.contentHtml ?? post.content,
          published:    post.createdAt,
          attributedTo: user.actorUrl,
          to:           ['https://www.w3.org/ns/activitystreams#Public'],
          tag:          emojiTags.length > 0 ? emojiTags : undefined,
        },
      }
    }),
  }
})