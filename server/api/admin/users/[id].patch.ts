import { db } from '../../../db'
import { users } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  role:        z.enum(['user', 'moderator', 'admin']).optional(),
  isSuspended: z.boolean().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id   = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, schema.parse)

  const [user] = await db.update(users)
    .set(body)
    .where(eq(users.id, id))
    .returning({
      id: users.id, handle: users.handle,
      role: users.role, isSuspended: users.isSuspended,
    })

  return user
})