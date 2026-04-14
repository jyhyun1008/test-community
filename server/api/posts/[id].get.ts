import { db } from '../../db'
import { posts, likes } from '../../db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!

  const token = getCookie(event, 'auth_token')
  let userId: string | undefined
  if (token) {
    const payload = await verifyToken(token).catch(() => null)
    if (payload) userId = payload.userId
  }

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
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
  })

  if (!post) {
    throw createError({ statusCode: 404, message: '글을 찾을 수 없습니다' })
  }

  let isLiked = false
  if (userId) {
    const like = await db.query.likes.findFirst({
      where: and(eq(likes.userId, userId), eq(likes.postId, id)),
    })
    isLiked = !!like
  }

  return { ...post, isLiked }
})