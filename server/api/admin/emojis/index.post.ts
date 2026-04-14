import { db } from '../../../db'
import { customEmojis } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq, isNull, and } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  shortcode: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_]+$/, '영문, 숫자, 언더스코어만 가능합니다'),
  url:       z.string().url(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, schema.parse)

  // 로컬 shortcode 중복 확인
  const existing = await db.query.customEmojis.findFirst({
    where: and(eq(customEmojis.shortcode, body.shortcode), isNull(customEmojis.domain)),
  })
  if (existing) {
    throw createError({ statusCode: 409, message: `'${body.shortcode}' 이모지가 이미 존재합니다` })
  }

  const [emoji] = await db.insert(customEmojis).values({
    shortcode: body.shortcode,
    url:       body.url,
    domain:    null,
  }).returning()

  return emoji
})
