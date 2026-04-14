// server/middleware/activitypub.ts
import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]
  const qs   = event.path.includes('?') ? event.path.slice(event.path.indexOf('?')) : ''
  const method = event.method  // ← 메서드 확인용

  console.log('AP middleware:', method, path)  // 임시 로그
  
  if (path.startsWith('/api/')) return

  let targetPath: string | null = null

  if (path === '/.well-known/webfinger') {
    targetPath = `/api/activitypub/webfinger${qs}`
  } else if (path.startsWith('/users/')) {
    const parts = path.split('/').filter(Boolean)
    const handle = parts[1]
    const sub    = parts[2]

    if (handle) {
      targetPath = sub
        ? `/api/activitypub/${sub}/${handle}${qs}`
        : `/api/activitypub/actor/${handle}${qs}`
    }
  }

  if (targetPath) {
    console.log('proxying:', event.method, targetPath)
    return proxyRequest(event, `http://127.0.0.1:3000${targetPath}`)
  }
})