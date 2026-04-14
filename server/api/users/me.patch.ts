import { db } from '../../db'
import { users } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const schema = z.object({
  displayName: z.string().max(50).optional(),
  bio:         z.string().max(500).optional(),
  avatarUrl:   z.string().url().optional(),
  headerUrl:   z.string().url().optional(),
})

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readValidatedBody(event, schema.parse)

  const [updated] = await db.update(users)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .returning({
      id: users.id, handle: users.handle,
      displayName: users.displayName, bio: users.bio,
      avatarUrl: users.avatarUrl, headerUrl: users.headerUrl,
    })

  return updated
})