import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function getDatabaseUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) return null
  // prisma+postgres:// is the Data Proxy format — extract the real PG URL from the api_key
  if (raw.startsWith('prisma+postgres://')) {
    try {
      const u = new URL(raw)
      const apiKey = u.searchParams.get('api_key')
      if (apiKey) {
        const decoded = JSON.parse(Buffer.from(apiKey, 'base64url').toString())
        return decoded.databaseUrl || raw
      }
    } catch { /* fall through */ }
  }
  return raw
}

const dbUrl = getDatabaseUrl()
const adapter = dbUrl ? new PrismaPg({ connectionString: dbUrl }) : undefined

const prisma = globalThis.__prisma || (adapter
  ? new PrismaClient({ adapter, log: ['error'] })
  : null)

if (process.env.NODE_ENV !== 'production' && prisma) globalThis.__prisma = prisma

export default prisma
