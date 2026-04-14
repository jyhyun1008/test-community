import { db } from '../../../db'
import { users } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq, desc, ilike } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  page:   z.coerce.number().default(1),
  limit:  z.coerce.number().max(50).default(20),
  search: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query  = await getValidatedQuery(event, querySchema.parse)
  const offset = (query.page - 1) * query.limit

  return db.query.users.findMany({
    where: query.search
      ? ilike(users.handle, `%${query.search}%`)
      : eq(users.isLocal, true),
    columns: {
      id: true, handle: true, email: true,
      role: true, isSuspended: true, isLocal: true,
      createdAt: true,
    },
    orderBy: desc(users.createdAt),
    limit:  query.limit,
    offset,
  })
})