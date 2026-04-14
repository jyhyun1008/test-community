import { db } from '../../db'
import { users } from '../../db/schema'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const resource = getQuery(event).resource as string

  // acct:alice@yourdomain.com 형식 파싱
  if (!resource?.startsWith('acct:')) {
    throw createError({ statusCode: 400, message: 'Invalid resource' })
  }

  const [handle, domain] = resource.slice(5).split('@')
  const instanceDomain = process.env.INSTANCE_DOMAIN!

  if (domain !== instanceDomain) {
    throw createError({ statusCode: 404, message: 'Not found' })
  }

  const user = await db.query.users.findFirst({
    where: and(
      eq(users.handle, handle),
      eq(users.isLocal, true),
    ),
  })

  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }

  // WebFinger 응답은 Content-Type이 중요
  setHeader(event, 'Content-Type', 'application/jrd+json')

  return {
    subject: `acct:${user.handle}@${instanceDomain}`,
    links: [
      {
        rel:  'self',
        type: 'application/activity+json',
        href: user.actorUrl,
      },
      {
        rel:  'http://webfinger.net/rel/profile-page',
        href: `https://${instanceDomain}/@${user.handle}`,
      },
    ],
  }
})