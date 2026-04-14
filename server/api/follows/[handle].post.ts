import { db } from '../../db'
import { follows, users } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { deliverActivity } from '../../utils/federation'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const me = await requireAuth(event)
  const handle = getRouterParam(event, 'handle')!

  const target = await db.query.users.findFirst({
    where: eq(users.handle, handle),
  })
  if (!target) throw createError({ statusCode: 404, message: '유저를 찾을 수 없습니다' })
  if (target.id === me.id) throw createError({ statusCode: 400, message: '자기 자신을 팔로우할 수 없습니다' })

  const existing = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, me.id), eq(follows.followingId, target.id)),
  })

  if (existing) {
    // 언팔로우
    await db.delete(follows).where(eq(follows.id, existing.id))

    // 원격 유저면 Undo Follow 전송
    if (!target.isLocal && target.inboxUrl) {
      const undoActivity = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id:         `${me.actorUrl}#undo-follow-${Date.now()}`,
        type:       'Undo',
        actor:      me.actorUrl,
        object: {
          type:   'Follow',
          actor:  me.actorUrl,
          object: target.actorUrl,
        },
      }
      deliverActivity(undoActivity, me.handle, target.inboxUrl).catch(console.error)
    }

    return { following: false }
  } else {
    // 팔로우
    await db.insert(follows).values({
      followerId:  me.id,
      followingId: target.id,
      accepted:    !target.isLocked,
    })

    // 원격 유저면 Follow 액티비티 전송
    if (!target.isLocal && target.inboxUrl) {
      const followActivity = {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id:         `${me.actorUrl}#follow-${Date.now()}`,
        type:       'Follow',
        actor:      me.actorUrl,
        object:     target.actorUrl,
      }
      deliverActivity(followActivity, me.handle, target.inboxUrl).catch(console.error)
    }
    return { following: true }
  }
})