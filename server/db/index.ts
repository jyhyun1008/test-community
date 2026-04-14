import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL!

// 마이그레이션용 (max 1 connection)
export const migrationClient = postgres(connectionString, { max: 1 })

// 앱 전체에서 쓰는 클라이언트
const queryClient = postgres(connectionString)
export const db = drizzle(queryClient, { schema })