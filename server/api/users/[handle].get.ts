import { db } from '../../db'
import { users, follows } from '../../db/schema'
import { and, eq, count } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!

  const user = await db.query.users.findFirst({
    where: and(
        eq(users.handle, handle),
        eq(users.isLocal, true),  // ← 추가
    ),
    columns: {
      id: true, handle: true, domain: true,
      displayName: true, bio: true,
      avatarUrl: true, headerUrl: true,
      isLocal: true, isBot: true, createdAt: true,
    },
  })
  if (!user) throw createError({ statusCode: 404, message: '유저를 찾을 수 없습니다' })

  // 팔로워/팔로잉 수
  const [followerCount] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, user.id))

  const [followingCount] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, user.id))

  return {
    ...user,
    followerCount:  followerCount.count,
    followingCount: followingCount.count,
  }
})