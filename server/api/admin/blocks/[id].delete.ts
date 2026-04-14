import { db } from '../../../db'
import { instanceBlocks } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  await db.delete(instanceBlocks).where(eq(instanceBlocks.id, id))
  return { ok: true }
})