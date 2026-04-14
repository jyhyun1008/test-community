import { db } from '../../db'
import { users, posts, channels } from '../../db/schema'
import { requireAdmin } from '../../utils/admin'
import { count, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [[userCount], [postCount], [channelCount]] = await Promise.all([
    db.select({ count: count() }).from(users).where(eq(users.isLocal, true)),
    db.select({ count: count() }).from(posts).where(eq(posts.isLocal, true)),
    db.select({ count: count() }).from(channels),
  ])

  return {
    userCount:    userCount.count,
    postCount:    postCount.count,
    channelCount: channelCount.count,
  }
})