<template>
  <div class="layout">
    <header class="navbar">
      <div class="navbar-inner">
        <NuxtLink to="/" class="logo">
          {{ config.public.instanceName }}
        </NuxtLink>

        <div class="nav-actions">
          <template v-if="auth.isLoggedIn">
            <NuxtLink :to="`/@${auth.user?.handle}`" class="user-chip">
              <span class="handle">@{{ auth.user?.handle }}</span>
            </NuxtLink>
            <button @click="auth.logout" class="btn-ghost">로그아웃</button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login"    class="btn-ghost">로그인</NuxtLink>
            <NuxtLink to="/auth/register" class="btn-primary">가입</NuxtLink>
          </template>
        </div>
      </div>
    </header>

    <div class="content-wrap">
      <aside class="sidebar">
        <div class="sidebar-top">
          <button class="theme-toggle" @click="theme.toggle()">
            <IconSun v-if="theme.isDark.value" :size="14" />
            <IconMoon v-else :size="14" />
            {{ theme.isDark.value ? '라이트 모드' : '다크 모드' }}
          </button>
        </div>

        <div class="sidebar-section">
          <p class="sidebar-label">채널</p>
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
        </div>

        <div v-if="auth.isLoggedIn" class="sidebar-section">
          <p class="sidebar-label">유저 검색</p>
          <UserSearch />
        </div>

        <div v-if="auth.isLoggedIn" class="sidebar-section">
          <NuxtLink to="/settings" class="bottom-link">
            <IconSettings :size="16" /> 설정
          </NuxtLink>
          <NuxtLink v-if="auth.isAdmin" to="/admin" class="bottom-link admin-link">
            <IconShield :size="16" /> 관리자
          </NuxtLink>
        </div>

      </aside>

      <main class="main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMoon, IconSun, IconSettings, IconShield } from '@tabler/icons-vue'
import { useAuthStore } from '~/stores/auth'
const auth    = useAuthStore()
const config  = useRuntimeConfig()
const theme   = useTheme()
const { data: channels } = await useFetch('/api/channels')
</script>

<style scoped>
.layout        { min-height: 100vh; }
.navbar        { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-surface); z-index: 10; }
.navbar-inner  { max-width: 1080px; margin: 0 auto; padding: 0 1rem; height: 56px; display: flex; align-items: center; gap: 1.5rem; }
.logo          { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: var(--accent); flex: 1; }
.nav-actions   { display: flex; align-items: center; gap: 0.75rem; }

.user-chip     { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; padding: 0.375rem 0.75rem; border-radius: 6px; border: 1px solid var(--border); color: var(--text-primary); }
.user-chip:hover { background: var(--bg-hover); }
.user-avatar   { width: 26px; height: 26px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; overflow: hidden; flex-shrink: 0; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.handle        { font-size: 0.8rem; color: var(--text-muted); }

.btn-ghost     { padding: 0.375rem 0.75rem; border-radius: 6px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.875rem; font-family: inherit; text-decoration: none; color: var(--text-primary); }
.btn-ghost:hover { background: var(--bg-hover); }
.btn-primary   { padding: 0.375rem 0.75rem; border-radius: 6px; background: var(--accent); color: white; text-decoration: none; font-size: 0.875rem; font-family: inherit; }

.content-wrap  { max-width: 1080px; margin: 0 auto; display: flex; align-items: flex-start; }

.sidebar       { width: 220px; flex-shrink: 0; border-right: 1px solid var(--border); padding: 1.25rem 1rem; position: sticky; top: 56px; height: calc(100vh - 100px); overflow-y: auto; display: flex; flex-direction: column; }
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-label { font-size: 0.75rem; font-weight: 600; color: var(--text-placeholder); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem 0; }
.channel-nav   { display: flex; flex-direction: column; gap: 0.25rem; }
.channel-link  { padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.875rem; text-decoration: none; color: var(--text-muted); display: block; }
.channel-link:hover                { background: var(--bg-hover); color: var(--text-primary); }
.channel-link.router-link-active  { background: var(--accent-subtle); color: var(--accent); font-weight: 500; }

.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 0.25rem; }
.bottom-link   { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.875rem; text-decoration: none; color: var(--text-muted); }
.bottom-link:hover                { background: var(--bg-hover); color: var(--text-primary); }
.bottom-link.router-link-active  { background: var(--accent-subtle); color: var(--accent); }
.admin-link    { color: var(--accent); }
.admin-link:hover { color: var(--accent); }

.sidebar-top   { margin-bottom: 1rem; }
.theme-toggle  { width: 100%; text-align: left; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.375rem 0.75rem; cursor: pointer; color: var(--text-muted); font-size: 0.8rem; font-family: inherit; display: flex; align-items: center; gap: 0.4rem; }
.theme-toggle:hover { background: var(--bg-hover); color: var(--text-primary); }

.main          { flex: 1; min-width: 0; padding: 1.5rem 1rem; }
</style>
