import { db } from '../../db'
import { channels } from '../../db/schema'
import { eq, asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  return db.query.channels.findMany({
    where: eq(channels.isArchived, false),
    orderBy: asc(channels.sortOrder),
  })
})