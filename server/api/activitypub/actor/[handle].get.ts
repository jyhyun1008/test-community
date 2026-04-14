import { db } from '../../../db'
import { users } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!
  const domain = process.env.INSTANCE_DOMAIN!

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.handle, handle),
      eq(users.isLocal, true),
    ),
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'Actor not found' })
  }

  setHeader(event, 'Content-Type', 'application/activity+json')

  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1',
    ],
    id:                user.actorUrl,
    type:              'Person',
    preferredUsername: user.handle,
    name:              user.displayName ?? user.handle,
    summary:           user.bio ?? '',
    url:               `https://${domain}/@${user.handle}`,
    inbox:             user.inboxUrl,
    outbox:            user.outboxUrl,
    followers:         user.followersUrl,
    following:         `${user.actorUrl}/following`,
    icon: user.avatarUrl ? {
      type:      'Image',
      mediaType: 'image/jpeg',
      url:       user.avatarUrl,
    } : undefined,
    publicKey: {
      id:           `${user.actorUrl}#main-key`,
      owner:        user.actorUrl,
      publicKeyPem: user.publicKey,
    },
  }
})