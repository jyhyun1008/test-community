import { db } from '../../db'
import { posts } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { and, eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')!

  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  })

  if (!post) {
    throw createError({ statusCode: 404, message: '글을 찾을 수 없습니다' })
  }

  // 본인 글 또는 관리자만 삭제 가능
  if (post.authorId !== user.id && user.role === 'user') {
    throw createError({ statusCode: 403, message: '권한이 없습니다' })
  }
  
  if (post.replyToId) {
    await db.update(posts)
      .set({ replyCount: sql`GREATEST(${posts.replyCount} - 1, 0)` })
      .where(eq(posts.id, post.replyToId))
  }

  // 답글 있으면 소프트 삭제, 없으면 완전 삭제
  const hasReplies = post.replyCount > 0

  if (hasReplies) {
    await db.update(posts)
      .set({
        content:     '[삭제된 글입니다]',
        contentHtml: '[삭제된 글입니다]',
        title:       null,
        authorId:    null,
      })
      .where(eq(posts.id, id))
  } else {
    await db.delete(posts).where(eq(posts.id, id))
  }

  return { ok: true }
})