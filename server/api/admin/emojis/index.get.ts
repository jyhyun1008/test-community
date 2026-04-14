import { db } from '../../../db'
import { customEmojis } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { desc, isNull } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return db.select().from(customEmojis).where(isNull(customEmojis.domain)).orderBy(desc(customEmojis.createdAt))
})
