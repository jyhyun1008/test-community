import { db } from '../../db'
import { posts, users, channels, likes } from '../../db/schema'
import { eq, desc, and, isNull } from 'drizzle-orm'
import { z } from 'zod'
import { verifyToken } from '../../utils/jwt'

const querySchema = z.object({
  channel:  z.string().optional(),   // 채널 slug
  replyTo: z.string().uuid().optional(), 
  author:  z.string().optional(), 
  page:     z.coerce.number().default(1),
  limit:    z.coerce.number().max(50).default(20),
})



export default defineEventHandler(async (event) => {

  const token = getCookie(event, 'auth_token')
  let userId: string | undefined
  if (token) {
    const payload = await verifyToken(token).catch(() => null)
    if (payload) userId = payload.userId
  }

  const query = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

 // author 필터
    let authorId: string | undefined
    if (query.author) {
    const author = await db.query.users.findFirst({
        where: eq(users.handle, query.author),
    })
    if (author) authorId = author.id
    }

  // 채널 slug로 필터링
  let channelId: string | undefined
  if (query.channel) {
    const channel = await db.query.channels.findFirst({
      where: eq(channels.slug, query.channel),
    })
    if (!channel) {
      throw createError({ statusCode: 404, message: '채널을 찾을 수 없습니다' })
    }
    channelId = channel.id
  }

  const result = await db.query.posts.findMany({
    where: and(
        eq(posts.visibility, 'public'),
        authorId ? eq(posts.authorId, authorId) : undefined,
        query.replyTo
        ? eq(posts.replyToId, query.replyTo)   // 답글 모드
        : isNull(posts.replyToId),             // 일반 피드
        channelId ? eq(posts.channelId, channelId) : undefined,
    ),
    with: {
        author: {
            columns: {
            id: true, handle: true, domain: true,
            displayName: true, avatarUrl: true, isLocal: true,
            },
        },
      channel: {
        columns: { id: true, slug: true, name: true },
      },
      media: true,
    },
    orderBy: desc(posts.createdAt),
    limit:  query.limit,
    offset,
  })

  // isLiked 추가
  if (userId) {
    const likedPostIds = new Set(
      (await db.query.likes.findMany({
        where: eq(likes.userId, userId),
        columns: { postId: true },
      })).map(l => l.postId)
    )
    return result.map(post => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }))
  }

  return result.map(post => ({ ...post, isLiked: false }))
})