import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { channels } from '../server/db/schema'
import instanceConfig from '../config/instance'

import 'dotenv/config'  // ← 이거 추가
import { drizzle } from 'drizzle-orm/postgres-js'

const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

async function seed() {
  console.log('🌱 Seeding channels...')

  for (const ch of instanceConfig.defaultChannels) {
    await db.insert(channels)
      .values(ch)
      .onConflictDoNothing()  // 이미 있으면 스킵
  }

  console.log(`✅ ${instanceConfig.defaultChannels.length}개 채널 생성 완료`)
  await client.end()
}

seed().catch(console.error)