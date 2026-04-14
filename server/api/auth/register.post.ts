import { db } from '../../db'
import { users } from '../../db/schema'
import { hashPassword } from '../../utils/password'
import { generateKeyPair } from '../../utils/keys'
import { signToken } from '../../utils/jwt'
import { z } from 'zod'

const schema = z.object({
  handle:   z.string().min(2).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email:    z.string().email(),
  password: z.string().min(8),
})

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)
  const domain = process.env.INSTANCE_DOMAIN!

  // 중복 확인
  const exists = await db.query.users.findFirst({
    where: (u, { or, eq }) => or(
      eq(u.email, body.email),
      eq(u.handle, body.handle),
    ),
  })
  if (exists) {
    throw createError({ statusCode: 409, message: '이미 사용중인 이메일 또는 핸들입니다' })
  }

  const { publicKey, privateKey } = generateKeyPair()
  const hashed = await hashPassword(body.password)
  const actorUrl = `https://${domain}/users/${body.handle}`

  const [user] = await db.insert(users).values({
    handle:      body.handle,
    domain,
    email:       body.email,
    password:    hashed,
    publicKey,
    privateKey,
    isLocal:     true,
    actorUrl,
    inboxUrl:    `${actorUrl}/inbox`,
    outboxUrl:   `${actorUrl}/outbox`,
    followersUrl: `${actorUrl}/followers`,
  }).returning()

  const token = await signToken({ userId: user.id, handle: user.handle })

  // HttpOnly 쿠키로 저장
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * 24 * 30,  // 30일
    path:     '/',
  })

  return {
    id:          user.id,
    handle:      user.handle,
    displayName: user.displayName,
    avatarUrl:   user.avatarUrl,
  }
})