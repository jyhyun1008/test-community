import { db } from '../../../db'
import { channels } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(1).max(50).optional(),
  description: z.string().max(200).optional(),
  isNsfw:      z.boolean().optional(),
  isArchived:  z.boolean().optional(),
  sortOrder:   z.number().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, schema.parse)

  const [channel] = await db.update(channels)
    .set(body)
    .where(eq(channels.id, id))
    .returning()

  return channel
})