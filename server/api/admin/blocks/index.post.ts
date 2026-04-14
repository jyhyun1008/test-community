import { db } from '../../../db'
import { instanceBlocks } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { z } from 'zod'

const schema = z.object({
  domain: z.string().min(1),
  reason: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, schema.parse)
  const [block] = await db.insert(instanceBlocks).values(body).returning()
  return block
})