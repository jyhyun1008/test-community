import { db } from '../../../db'
import { instanceBlocks } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return db.query.instanceBlocks.findMany({
    orderBy: desc(instanceBlocks.createdAt),
  })
})