import { db } from '../../../db'
import { likes, posts } from '../../../db/schema'
import { requireAuth } from '../../../utils/auth'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const postId = getRouterParam(event, 'id')!

  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.userId, user.id), eq(likes.postId, postId)),
  })

  if (existing) {
    // 이미 좋아요 → 취소
    await db.delete(likes).where(eq(likes.id, existing.id))
    await db.update(posts)
      .set({ likeCount: sql`GREATEST(${posts.likeCount} - 1, 0)` })
      .where(eq(posts.id, postId))
    return { liked: false }
  } else {
    // 좋아요 추가
    await db.insert(likes).values({ userId: user.id, postId })
    await db.update(posts)
      .set({ likeCount: sql`${posts.likeCount} + 1` })
      .where(eq(posts.id, postId))
    return { liked: true }
  }
})