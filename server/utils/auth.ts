import { verifyToken } from './jwt'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { H3Event } from 'h3'

export async function requireAuth(event: H3Event) {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, message: '로그인이 필요합니다' })
  }

  const payload = await verifyToken(token).catch(() => {
    throw createError({ statusCode: 401, message: '유효하지 않은 토큰입니다' })
  })

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.userId),
  })

  if (!user || user.isSuspended) {
    throw createError({ statusCode: 401, message: '인증 실패' })
  }

  return user
}