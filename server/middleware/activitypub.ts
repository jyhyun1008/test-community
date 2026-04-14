// server/middleware/activitypub.ts
export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]
  const qs   = event.path.includes('?') ? event.path.slice(event.path.indexOf('?')) : ''

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
    await sendProxy(event, `http://localhost:${process.env.PORT ?? 3000}${targetPath}`)
  }
})