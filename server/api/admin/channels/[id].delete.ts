// server/api/admin/channels/[id].delete.ts
import { db } from '../../../db'
import { channels } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await db.delete(channels).where(eq(channels.id, id))
  return { ok: true }
})