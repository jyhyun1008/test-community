<template>
  <div class="search-wrap" ref="wrapRef">
    <div class="search-input-wrap">
      <input
        v-model="query"
        placeholder="@handle@domain 검색"
        class="search-input"
        @keydown.enter="lookup"
        @focus="showResult = true"
      />
      <button class="search-btn" @click="lookup">🔍</button>
    </div>

    <div v-if="showResult && result" class="search-result">
      <div class="result-user">
        <img v-if="result.avatarUrl" :src="result.avatarUrl" class="avatar" />
        <div v-else class="avatar-placeholder">{{ result.handle[0].toUpperCase() }}</div>
        <div class="result-info">
            <NuxtLink
                :to="`/@${result.handle}@${result.domain}`"
                class="display-name"
                @click="showResult = false"
            >
                {{ result.displayName ?? result.handle }}
            </NuxtLink>
            <div class="handle">@{{ result.handle }}@{{ result.domain }}</div>
            </div>
        <button
          class="follow-btn"
          :class="{ following: isFollowing }"
          @click="toggleFollow"
        >
          {{ isFollowing ? '팔로잉' : '팔로우' }}
        </button>
      </div>
    </div>

    <p v-if="error" class="search-error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const wrapRef    = ref<HTMLElement>()
const query      = ref('')
const result     = ref<any>(null)
const error      = ref('')
const showResult = ref(false)
const isFollowing = ref(false)

async function lookup() {
  if (!query.value.trim()) return
  error.value  = ''
  result.value = null

  // @handle@domain 또는 handle@domain 형식
  const acct = query.value.startsWith('@') ? query.value.slice(1) : query.value

  try {
    result.value = await $fetch(`/api/users/lookup?acct=${acct}`)
    showResult.value = true

    // 팔로우 상태 확인// 팔로우 상태 확인 - 리모트면 handle@domain으로
    const statusHandle = result.value.isLocal 
    ? result.value.handle 
    : `${result.value.handle}@${result.value.domain}`
    const status = await $fetch(`/api/users/${statusHandle}/follow-status`)
    isFollowing.value = status.following
  } catch {
    error.value = '유저를 찾을 수 없습니다'
  }
}

async function toggleFollow() {
  if (!auth.isLoggedIn) return navigateTo('/auth/login')
  const followHandle = result.value.isLocal
    ? result.value.handle
    : `${result.value.handle}@${result.value.domain}`
  const res = await $fetch(`/api/follows/${followHandle}`, { method: 'POST' })
  isFollowing.value = res.following
}
// 바깥 클릭시 닫기
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
      showResult.value = false
    }
  })
})
</script>

<style scoped>
.search-wrap       { position: relative; }
.search-input-wrap { display: flex; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.search-input      { border: none; padding: 0.375rem 0.75rem; font-size: 0.85rem; width: 200px; outline: none; }
.search-btn        { padding: 0.375rem 0.5rem; background: none; border: none; cursor: pointer; }
.search-result     { position: absolute; top: calc(100% + 4px); left: 0; width: 320px; background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.75rem; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.result-user       { display: flex; align-items: center; gap: 0.75rem; }
.avatar            { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 40px; height: 40px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; }
.result-info       { flex: 1; }
.display-name      { font-weight: 600; font-size: 0.9rem; }
.handle            { font-size: 0.8rem; color: #9ca3af; }
.follow-btn        { padding: 0.375rem 0.875rem; border-radius: 9999px; border: 1px solid var(--accent); color: var(--accent); background: white; cursor: pointer; font-size: 0.8rem; font-weight: 600; white-space: nowrap; }
.follow-btn.following { background: var(--accent); color: white; }
.search-error      { font-size: 0.8rem; color: #ef4444; margin-top: 0.25rem; }
</style>