
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const db = drizzle(postgres(process.env.DATABASE_URL))
await migrate(db, { migrationsFolder: './server/db/migrations' })
console.log('✅ Migration done')
process.exit(0)