<template>
  <div class="layout">
    <header class="navbar">
      <div class="navbar-inner">
        <NuxtLink to="/" class="logo">
          {{ config.public.instanceName }}
        </NuxtLink>

        <nav class="channel-nav">
          <NuxtLink
            v-for="ch in channels"
            :key="ch.slug"
            :to="`/c/${ch.slug}`"
            class="channel-link"
          >
            #{{ ch.slug }}
          </NuxtLink>
        </nav>

        <div class="nav-actions">
            <UserSearch v-if="auth.isLoggedIn" />  <!-- ← 추가 -->
          <template v-if="auth.isLoggedIn">
            <NuxtLink to="/settings" class="btn-ghost">설정</NuxtLink>
            <span class="handle">@{{ auth.user?.handle }}</span>
            <button @click="auth.logout" class="btn-ghost">로그아웃</button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login"    class="btn-ghost">로그인</NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary">가입</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <main class="main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth    = useAuthStore()
const config  = useRuntimeConfig()
const { data: channels } = await useFetch('/api/channels')
</script>

<style scoped>
.layout        { min-height: 100vh; }
.navbar        { border-bottom: 1px solid #e5e7eb; position: sticky; top: 0; background: white; z-index: 10; }
.navbar-inner  { max-width: 1080px; margin: 0 auto; padding: 0 1rem; height: 56px; display: flex; align-items: center; gap: 1.5rem; }
.logo          { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: inherit; }
.channel-nav   { display: flex; gap: 0.5rem; flex: 1; }
.channel-link  { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; text-decoration: none; color: #6b7280; }
.channel-link:hover, .channel-link.router-link-active { background: #f4f4f4; color: #111827; }
.nav-actions   { display: flex; align-items: center; gap: 0.75rem; }
.handle        { font-size: 0.875rem; color: #6b7280; }
.btn-ghost     { padding: 0.375rem 0.75rem; border-radius: 6px; border: 1px solid #e5e7eb; background: none; cursor: pointer; font-size: 0.875rem; font-family: inherit;}
.btn-primary   { padding: 0.375rem 0.75rem; border-radius: 6px; background: var(--accent); color: white; text-decoration: none; font-size: 0.875rem; font-family: inherit;}
.main          { max-width: 1080px; margin: 0 auto; padding: 1.5rem 1rem; }
</style>