<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/" class="logo">
          <IconArrowLeft :size="14" /> 사이트로
        </NuxtLink>
        <h2>관리자</h2>
      </div>
      <nav>
        <NuxtLink to="/admin" class="nav-item">
          <IconLayoutDashboard :size="16" /> 대시보드
        </NuxtLink>
        <NuxtLink to="/admin/channels" class="nav-item">
          <IconFolder :size="16" /> 채널 관리
        </NuxtLink>
        <NuxtLink to="/admin/users" class="nav-item">
          <IconUsers :size="16" /> 유저 관리
        </NuxtLink>
        <NuxtLink to="/admin/blocks" class="nav-item">
          <IconBan :size="16" /> 인스턴스 블락
        </NuxtLink>
        <NuxtLink to="/admin/emojis" class="nav-item">
          <IconMoodSmile :size="16" /> 커스텀 이모지
        </NuxtLink>
      </nav>
      <div class="sidebar-footer">
        <button class="theme-toggle" @click="theme.toggle()">
          <IconSun v-if="theme.isDark.value" :size="14" />
          <IconMoon v-else :size="14" />
          {{ theme.isDark.value ? '라이트' : '다크' }}
        </button>
      </div>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconLayoutDashboard, IconFolder, IconUsers, IconBan, IconMoon, IconSun, IconMoodSmile } from '@tabler/icons-vue'
const theme = useTheme()
</script>
<style scoped>
.admin-layout  { display: flex; min-height: 100vh; }
.sidebar       { width: 220px; border-right: 1px solid var(--border); background: var(--bg-surface); padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; position: sticky; top: 0; height: 100vh; }
.sidebar-header { margin-bottom: 1rem; }
.logo          { font-size: 0.8rem; color: var(--text-placeholder); text-decoration: none; display: flex; align-items: center; gap: 0.3rem; }
h2             { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0; color: var(--text-primary); }
.nav-item      { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 6px; text-decoration: none; color: var(--text-secondary); font-size: 0.9rem; }
.nav-item:hover, .nav-item.router-link-active { background: var(--bg-hover); }
.admin-main    { flex: 1; padding: 2rem; max-width: 900px; }
.sidebar-footer { margin-top: auto; }
.theme-toggle  { width: 100%; text-align: left; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.375rem 0.75rem; cursor: pointer; color: var(--text-muted); font-size: 0.8rem; font-family: inherit; display: flex; align-items: center; gap: 0.4rem; }
.theme-toggle:hover { background: var(--bg-hover); color: var(--text-primary); }
</style>
