import { db } from '../../../db'
import { follows, users } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'
import { verifyToken } from '../../../utils/jwt'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!

  const token = getCookie(event, 'auth_token')
  if (!token) return { following: false }

  const payload = await verifyToken(token).catch(() => null)
  if (!payload) return { following: false }

  const [handlePart, domainPart] = handle.includes('@') 
  ? handle.split('@') 
  : [handle, null]

  const target = await db.query.users.findFirst({
  where: domainPart
    ? and(eq(users.handle, handlePart), eq(users.domain, domainPart))
    : eq(users.handle, handlePart),
})
  if (!target) return { following: false }

  const existing = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, payload.userId),
      eq(follows.followingId, target.id),
    ),
  })

  return { following: !!existing }
})