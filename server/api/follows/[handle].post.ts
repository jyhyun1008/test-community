import { db } from '../../db'
import { follows, users } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)
  const handle = getRouterParam(event, 'handle')!

  const target = await db.query.users.findFirst({
    where: eq(users.handle, handle),
  })
  if (!target) throw createError({ statusCode: 404, message: '유저를 찾을 수 없습니다' })
  if (target.id === me.id) throw createError({ statusCode: 400, message: '자기 자신을 팔로우할 수 없습니다' })

  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, me.id), eq(follows.followingId, target.id)),
  })

  if (existing) {
    // 언팔로우
    await db.delete(follows).where(eq(follows.id, existing.id))
    return { following: false }
  } else {
    // 팔로우
    await db.insert(follows).values({
      followerId:  me.id,
      followingId: target.id,
      accepted:    !target.isLocked,
    })
    return { following: true }
  }
})