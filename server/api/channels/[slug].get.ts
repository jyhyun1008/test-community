import { db } from '../../db'
import { channels } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!

  const channel = await db.query.channels.findFirst({
    where: eq(channels.slug, slug),
  })

  if (!channel) {
    throw createError({ statusCode: 404, message: '채널을 찾을 수 없습니다' })
  }

  return channel
})