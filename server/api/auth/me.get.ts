import { db } from '../../db'
import { users } from '../../db/schema'
import { verifyToken } from '../../utils/jwt'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다' })
  }

  const payload = await verifyToken(token).catch(() => {
    throw createError({ statusCode: 401, message: '유효하지 않은 토큰입니다' })
  })

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
    columns: {
      id: true, handle: true, displayName: true,
      avatarUrl: true, bio: true, role: true, createdAt: true,
    },
  })

  if (!user) {
    throw createError({ statusCode: 401, message: '존재하지 않는 유저입니다' })
  }

  return user
})