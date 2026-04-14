import { db } from '../../db'
import { users } from '../../db/schema'
import { verifyPassword } from '../../utils/password'
import { signToken } from '../../utils/jwt'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  email:    z.string().email(),
  password: z.string(),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)

  const user = await db.query.users.findFirst({
    where: eq(users.email, body.email),
  })

  if (!user || !user.password) {
    throw createError({ statusCode: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다' })
  }

  const valid = await verifyPassword(body.password, user.password)
  if (!valid) {
    throw createError({ statusCode: 401, message: '이메일 또는 비밀번호가 올바르지 않습니다' })
  }

  if (user.isSuspended) {
    throw createError({ statusCode: 403, message: '정지된 계정입니다' })
  }

  const token = await signToken({ userId: user.id, handle: user.handle })

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,
    path:     '/',
  })

  return {
    id:          user.id,
    handle:      user.handle,
    displayName: user.displayName,
    avatarUrl:   user.avatarUrl,
  }
})