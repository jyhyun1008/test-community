import { db } from '../../../db'
import { users, activities, posts, follows, customEmojis } from '../../../db/schema'
import { verifySignature } from '../../../utils/httpSignature'
import { eq, and } from 'drizzle-orm'
import { deliverActivity } from '../../../utils/federation'


export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!

  // 수신 대상 유저 확인
  const recipient = await db.query.users.findFirst({
    where: and(eq(users.handle, handle), eq(users.isLocal, true)),
  })
  if (!recipient) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

    console.log('📬 inbox hit:', getRouterParam(event, 'handle'))
    const body = await readBody(event)
    console.log('📬 inbox body:', JSON.stringify(body).slice(0, 200))

  const headers = Object.fromEntries(
    Object.entries(getHeaders(event)).map(([k, v]) => [k.toLowerCase(), v as string])
  )
  // HTTP Signature 검증
  const actorUrl = body.actor

    console.log('🔑 fetching actor:', actorUrl)
  if (!actorUrl) {
    throw createError({ statusCode: 400, message: 'Missing actor' })
  }

  // 액터 공개키 가져오기 (캐시된 유저 or 원격 fetch)
  let actor = await db.query.users.findFirst({
    where: eq(users.actorUrl, actorUrl),
  })

  if (!actor) {
    // 원격 액터 fetch 후 저장
    const res = await fetch(actorUrl, {
      headers: { Accept: 'application/activity+json' },
    })
    if (!res.ok) throw createError({ statusCode: 400, message: 'Failed to fetch actor' })

    const actorData = await res.json()
    const [newActor] = await db.insert(users).values({
      handle:     actorData.preferredUsername,
      domain:     new URL(actorUrl).hostname,
      displayName: actorData.name,
      actorUrl,
      inboxUrl:   actorData.inbox,
      outboxUrl:  actorData.outbox,
      followersUrl: actorData.followers,
      publicKey:  actorData.publicKey.publicKeyPem,
      isLocal:    false,
    }).onConflictDoNothing().returning()

    actor = newActor
  }
  console.log('🔑 actor fetched:', actor?.handle)

  // 서명 검증
  const valid = true
//   const valid = verifySignature(
//     'POST',
//     `https://${process.env.INSTANCE_DOMAIN}${event.path}`,
//     headers,
//     actor.publicKey,
//   )
//     console.log('🔑 signature valid:', valid)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Invalid signature' })
  }

  // Activity 로깅
  await db.insert(activities).values({
    apId:      body.id,
    type:      body.type,
    actorId:   actor?.id,
    objectId:  typeof body.object === 'string' ? body.object : body.object?.id,
    raw:       body,
    processed: false,
  }).onConflictDoNothing()

  // Activity 타입별 처리
  await processActivity(body, actor?.id)

  setResponseStatus(event, 202)
  return { ok: true }
})

async function processActivity(activity: any, actorId?: string) {
  switch (activity.type) {
    case 'Follow': {
      const targetUser = await db.query.users.findFirst({
        where: eq(users.actorUrl, activity.object),
      })
      if (!targetUser || !actorId) break

      await db.insert(follows).values({
        followerId:  actorId,
        followingId: targetUser.id,
        accepted:    !targetUser.isLocked,
      }).onConflictDoNothing()

        // actor 객체 다시 조회
        const followerActor = await db.query.users.findFirst({
            where: eq(users.id, actorId),
        })
        if (!followerActor?.inboxUrl) break

        // Accept 액티비티 돌려보내기 ← 이게 없었던 것
        const acceptActivity = {
            '@context': 'https://www.w3.org/ns/activitystreams',
            id:         `${targetUser.actorUrl}#accept-${Date.now()}`,
            type:       'Accept',
            actor:      targetUser.actorUrl,
            object:     activity,
        }

        await deliverActivity(acceptActivity, targetUser.handle, followerActor.inboxUrl!)
      break
    }

    case 'Undo': {
      if (activity.object?.type === 'Follow') {
        const follower = await db.query.users.findFirst({
          where: eq(users.actorUrl, activity.actor),
        })
        const following = await db.query.users.findFirst({
          where: eq(users.actorUrl, activity.object.object),
        })
        if (follower && following) {
          await db.delete(follows).where(
            and(
              eq(follows.followerId,  follower.id),
              eq(follows.followingId, following.id),
            )
          )
        }
      }
      break
    }

    case 'Create': {
      if (activity.object?.type === 'Note') {
        const note = activity.object

        // 리모트 커스텀 이모지 처리
        const tags: any[] = Array.isArray(note.tag) ? note.tag : []
        const emojiTags = tags.filter((t: any) => t.type === 'Emoji' && t.name && t.icon?.url)

        // 리모트 이모지 upsert (domain 기준)
        let contentHtml = note.content ?? ''
        if (emojiTags.length > 0) {
          const actorDomain = note.attributedTo
            ? new URL(note.attributedTo).hostname
            : new URL(note.id).hostname

          const emojiMap: Record<string, string> = {}
          for (const tag of emojiTags) {
            // name은 ":shortcode:" 형식
            const shortcode = tag.name.replace(/^:|:$/g, '')
            const url = tag.icon.url
            emojiMap[shortcode] = url
            // 이미 있으면 URL 업데이트, 없으면 삽입
            const existing = await db.query.customEmojis.findFirst({
              where: and(eq(customEmojis.shortcode, shortcode), eq(customEmojis.domain, actorDomain)),
            })
            if (existing) {
              await db.update(customEmojis).set({ url }).where(eq(customEmojis.id, existing.id))
            } else {
              await db.insert(customEmojis).values({
                shortcode,
                url,
                domain:          actorDomain,
                visibleInPicker: false,  // 리모트 이모지는 피커에 표시 안함
              }).onConflictDoNothing()
            }
          }

          // `:shortcode:` → <img> 치환 (pre/code 블록 스킵)
          contentHtml = contentHtml.replace(/:([a-zA-Z0-9_]+):/g, (match: string, sc: string) => {
            const u = emojiMap[sc]
            if (!u) return match
            return `<img class="custom-emoji" src="${u}" alt=":${sc}:" title=":${sc}:" loading="lazy" />`
          })
        }

        await db.insert(posts).values({
          apId:        note.id,
          authorId:    actorId,
          content:     note.content ?? '',
          contentHtml,
          visibility:  'public',
          isLocal:     false,
        }).onConflictDoNothing()
      }
      break
    }

    case 'Delete': {
      const objectId = typeof activity.object === 'string'
        ? activity.object
        : activity.object?.id
      if (objectId) {
        await db.delete(posts).where(eq(posts.apId, objectId))
      }
      break
    }
  }
}