import { db } from '../../../db'
import { customEmojis } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await db.delete(customEmojis).where(eq(customEmojis.id, id))
  return { ok: true }
})
