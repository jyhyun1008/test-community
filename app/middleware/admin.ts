export default defineNuxtRouteMiddleware(async (to) => {
  // 클라이언트에서는 스토어 사용
  if (import.meta.client) {
    const auth = useAuthStore()
    await auth.fetchMe()
    if (!auth.isAdmin) return navigateTo('/')
    return
  }

  // 서버사이드에서는 쿠키 직접 전달
  const headers = useRequestHeaders(['cookie'])
  try {
    const user = await $fetch('/api/auth/me', { headers })
    if (user.role !== 'admin') return navigateTo('/')
  } catch {
    return navigateTo('/')
  }
})