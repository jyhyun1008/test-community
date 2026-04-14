<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <h1>로그인</h1>

      <form @submit.prevent="submit">
        <div class="field">
          <label>이메일</label>
          <input v-model="form.email" type="email" required />
        </div>

        <div class="field">
          <label>비밀번호</label>
          <input v-model="form.password" type="password" required />
        </div>

        <p v-if="error" class="error">{{ error }}</p>

        <button type="submit" class="btn-primary" :disabled="pending">
          {{ pending ? '처리 중...' : '로그인' }}
        </button>
      </form>

      <p class="switch">
        계정이 없나요?
        <NuxtLink to="/auth/register">가입하기</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

import { useAuthStore } from '~/stores/auth'
const auth    = useAuthStore()
const error   = ref('')
const pending = ref(false)
const form    = reactive({ email: '', password: '' })

async function submit() {
  error.value   = ''
  pending.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: form })
    await auth.fetchMe()
    navigateTo('/')
  } catch (e: any) {
    error.value = e.data?.message ?? '오류가 발생했습니다'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.auth-wrap   { display: flex; justify-content: center; padding: 4rem 1rem; }
.auth-card   { width: 100%; max-width: 400px; }
h1           { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-primary); }
.field       { margin-bottom: 1rem; }
label        { display: block; font-size: 0.875rem; margin-bottom: 0.375rem; color: var(--text-secondary); }
input        { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; background: var(--bg-surface); color: var(--text-primary); outline: none; }
.error       { color: #ef4444; font-size: 0.875rem; margin-bottom: 0.75rem; }
.btn-primary { width: 100%; padding: 0.625rem; background: var(--accent); color: white; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.switch      { margin-top: 1rem; font-size: 0.875rem; text-align: center; color: var(--text-muted); }
.switch a    { color: var(--accent); }
</style>
