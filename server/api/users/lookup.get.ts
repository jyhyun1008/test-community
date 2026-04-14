// server/api/users/lookup.get.ts
import { db } from '../../db'
import { users } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

const querySchema = z.object({
  acct: z.string(), // alice@mastodon.social
})

export default defineEventHandler(async (event) => {
  const { acct } = await getValidatedQuery(event, querySchema.parse)
  const [handle, domain] = acct.split('@')

  if (!domain) throw createError({ statusCode: 400, message: 'acct 형식: handle@domain' })

  // 이미 DB에 있으면 반환
  const existing = await db.query.users.findFirst({
    where: eq(users.actorUrl, `https://${domain}/users/${handle}`),
  })
  if (existing) return existing

  // WebFinger로 액터 URL 찾기
  const wfRes = await fetch(
    `https://${domain}/.well-known/webfinger?resource=acct:${handle}@${domain}`,
    { headers: { Accept: 'application/jrd+json' } }
  )
  if (!wfRes.ok) throw createError({ statusCode: 404, message: '유저를 찾을 수 없습니다' })

  const wf = await wfRes.json()
  const actorUrl = wf.links?.find((l: any) => l.rel === 'self')?.href
  if (!actorUrl) throw createError({ statusCode: 404, message: 'Actor URL을 찾을 수 없습니다' })

  // 액터 정보 fetch
  const actorRes = await fetch(actorUrl, {
    headers: { Accept: 'application/activity+json' },
  })
  if (!actorRes.ok) throw createError({ statusCode: 404, message: '액터를 찾을 수 없습니다' })

  const actor = await actorRes.json()

  const [user] = await db.insert(users).values({
    handle:      actor.preferredUsername,
    domain,
    displayName: actor.name,
    bio:         actor.summary,
    avatarUrl:   actor.icon?.url,
    actorUrl,
    inboxUrl:    actor.inbox,
    outboxUrl:   actor.outbox,
    followersUrl: actor.followers,
    publicKey:   actor.publicKey.publicKeyPem,
    isLocal:     false,
  }).onConflictDoUpdate({
    target: users.actorUrl,
    set: {
      displayName: actor.name,
      bio:         actor.summary,
      avatarUrl:   actor.icon?.url,
      publicKey:   actor.publicKey.publicKeyPem,
    },
  }).returning()

  return user
})