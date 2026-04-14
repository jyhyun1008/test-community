import { db } from '../../../db'
import { users, posts } from '../../../db/schema'
import { and, eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const handle = getRouterParam(event, 'handle')!
  const domain = process.env.INSTANCE_DOMAIN!

  const user = await db.query.users.findFirst({
    where: and(eq(users.handle, handle), eq(users.isLocal, true)),
  })
  if (!user) throw createError({ statusCode: 404, message: 'User not found' })

  const userPosts = await db.query.posts.findMany({
    where: and(eq(posts.authorId, user.id), eq(posts.visibility, 'public')),
    orderBy: desc(posts.createdAt),
    limit: 20,
  })

  setHeader(event, 'Content-Type', 'application/activity+json')

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id:         `${user.actorUrl}/outbox`,
    type:       'OrderedCollection',
    totalItems: userPosts.length,
    orderedItems: userPosts.map(post => ({
      '@context': 'https://www.w3.org/ns/activitystreams',
      id:         `${post.apId}#activity`,
      type:       'Create',
      actor:      user.actorUrl,
      published:  post.createdAt,
      object: {
        id:           post.apId,
        type:         'Note',
        content:      post.content,
        published:    post.createdAt,
        attributedTo: user.actorUrl,
        to:           ['https://www.w3.org/ns/activitystreams#Public'],
      },
    })),
  }
})