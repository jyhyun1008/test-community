<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <NuxtLink to="/" class="logo">← 사이트로</NuxtLink>
        <h2>관리자</h2>
      </div>
      <nav>
        <NuxtLink to="/admin" class="nav-item">📊 대시보드</NuxtLink>
        <NuxtLink to="/admin/channels" class="nav-item">📁 채널 관리</NuxtLink>
        <NuxtLink to="/admin/users" class="nav-item">👥 유저 관리</NuxtLink>
        <NuxtLink to="/admin/blocks" class="nav-item">🚫 인스턴스 블락</NuxtLink>
      </nav>
    </aside>
    <main class="admin-main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// 레이아웃에서 직접 체크 제거, 미들웨어로 처리
</script>
<style scoped>
.admin-layout  { display: flex; min-height: 100vh; }
.sidebar       { width: 220px; border-right: 1px solid #e5e7eb; padding: 1.5rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; position: sticky; top: 0; height: 100vh; }
.sidebar-header { margin-bottom: 1rem; }
.logo          { font-size: 0.8rem; color: #9ca3af; text-decoration: none; }
h2             { font-size: 1rem; font-weight: 700; margin: 0.5rem 0 0; }
.nav-item      { display: block; padding: 0.5rem 0.75rem; border-radius: 6px; text-decoration: none; color: #374151; font-size: 0.9rem; }
.nav-item:hover, .nav-item.router-link-active { background: #f4f4f4; }
.admin-main    { flex: 1; padding: 2rem; max-width: 900px; }
</style>