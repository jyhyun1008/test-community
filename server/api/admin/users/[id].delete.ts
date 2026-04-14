import { db } from '../../../db'
import { users } from '../../../db/schema'
import { requireAdmin } from '../../../utils/admin'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  // 자기 자신은 삭제 불가
  const me = await requireAdmin(event)
  if (me.id === id) {
    throw createError({ statusCode: 400, message: '자기 자신은 삭제할 수 없습니다' })
  }

  await db.delete(users).where(eq(users.id, id))
  return { ok: true }
})