import { requireAuth } from './auth'
import type { H3Event } from 'h3'

export async function requireAdmin(event: H3Event) {
  const user = await requireAuth(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, message: '관리자만 접근 가능합니다' })
  }
  return user
}

export async function requireModerator(event: H3Event) {
  const user = await requireAuth(event)
  if (user.role === 'user') {
    throw createError({ statusCode: 403, message: '권한이 없습니다' })
  }
  return user
}