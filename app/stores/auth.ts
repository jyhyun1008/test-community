import { defineStore } from 'pinia'

interface User {
  id: string
  handle: string
  displayName: string | null
  avatarUrl: string | null
  headerUrl: string | null
  bio: string | null
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const pending = ref(true)

  async function fetchMe() {
    try {
      user.value = await $fetch('/api/auth/me')
    } catch {
      user.value = null
    } finally {
      pending.value = false
    }
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    navigateTo('/auth/login')
  }

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  return { user, pending, isLoggedIn, isAdmin, fetchMe, logout }
})