import { signRequest } from './httpSignature'
import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

export async function deliverActivity(
  activity: Record<string, unknown>,
  senderHandle: string,
  targetInboxUrl: string,
) {
  const sender = await db.query.users.findFirst({
    where: eq(users.handle, senderHandle),
  })

  if (!sender?.privateKey) throw new Error('No private key')

  const body = JSON.stringify(activity)
  const keyId = `${sender.actorUrl}#main-key`

  const { date, digest, signature } = signRequest(
    'POST',
    targetInboxUrl,
    body,
    sender.privateKey,
    keyId,
  )

  const res = await fetch(targetInboxUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/activity+json',
      'Accept':       'application/activity+json',
      Date:           date,
      Digest:         digest,
      Signature:      signature,
    },
    body,
  })

  if (!res.ok) {
    throw new Error(`Delivery failed: ${res.status} ${await res.text()}`)
  }

  return res
}

// 팔로워 전체에게 전송
export async function deliverToFollowers(
  activity: Record<string, unknown>,
  senderHandle: string,
  followerInboxUrls: string[],
) {
  await Promise.allSettled(
    followerInboxUrls.map(url => deliverActivity(activity, senderHandle, url))
  )
}