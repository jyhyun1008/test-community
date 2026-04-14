import { db } from '../../../db'
import { channels } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { z } from 'zod'

const schema = z.object({
  slug:        z.string().min(1).max(30).regex(/^[a-z0-9-]+$/),
  name:        z.string().min(1).max(50),
  description: z.string().max(200).optional(),
  isNsfw:      z.boolean().default(false),
  sortOrder:   z.number().default(0),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readValidatedBody(event, schema.parse)

  const [channel] = await db.insert(channels).values(body).returning()
  return channel
})