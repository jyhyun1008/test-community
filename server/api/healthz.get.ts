import { db } from '../db'
import { users } from '../db/schema'

export default defineEventHandler(async () => {
  await db.select().from(users).limit(1)
  return { status: 'ok', db: 'connected' }
})