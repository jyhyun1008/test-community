<template>
  <div class="layout">
    <header class="navbar">
      <div class="navbar-inner">
        <NuxtLink to="/" class="logo">
          {{ config.public.instanceName }}
        </NuxtLink>

        <!-- 모바일: 햄버거 버튼 -->
        <button class="menu-btn mobile-only" @click="drawerOpen = true">
          <IconMenu2 :size="20" />
        </button>

        <!-- 데스크탑: 기존 액션 -->
        <ClientOnly>
          <div class="nav-actions desktop-only">
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
          <template #fallback>
            <div class="nav-actions desktop-only" />
          </template>
        </ClientOnly>

        <!-- 모바일: 로그인/아바타 버튼 -->
        <ClientOnly>
          <div class="nav-actions-mobile mobile-only">
            <template v-if="auth.isLoggedIn">
              <NuxtLink :to="`/@${auth.user?.handle}`" class="avatar-btn">
                <span class="avatar-initial">{{ auth.user?.handle?.[0]?.toUpperCase() }}</span>
              </NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/auth/login" class="btn-ghost-sm">로그인</NuxtLink>
            </template>
          </div>
          <template #fallback>
            <div class="nav-actions-mobile mobile-only" style="width:30px" />
          </template>
        </ClientOnly>
      </div>
    </header>

    <!-- 모바일 드로어 오버레이 -->
    <Transition name="fade">
      <div v-if="drawerOpen" class="drawer-overlay" @click="drawerOpen = false" />
    </Transition>

    <div class="content-wrap">
      <!-- 사이드바 (데스크탑: 고정, 모바일: 드로어) -->
      <aside class="sidebar" :class="{ 'sidebar-open': drawerOpen }">
        <!-- 모바일 드로어 헤더 -->
        <div class="drawer-header mobile-only">
          <span class="drawer-title">메뉴</span>
          <button class="close-btn" @click="drawerOpen = false">
            <IconX :size="18" />
          </button>
        </div>

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
              @click="drawerOpen = false"
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
          <NuxtLink to="/settings" class="bottom-link" @click="drawerOpen = false">
            <IconSettings :size="16" /> 설정
          </NuxtLink>
          <NuxtLink v-if="auth.isAdmin" to="/admin" class="bottom-link admin-link" @click="drawerOpen = false">
            <IconShield :size="16" /> 관리자
          </NuxtLink>
        </div>

        <!-- 모바일 드로어: 로그아웃 버튼 -->
        <div v-if="auth.isLoggedIn" class="sidebar-section mobile-only">
          <button @click="auth.logout(); drawerOpen = false" class="logout-btn">
            로그아웃
          </button>
        </div>
        <div v-else class="sidebar-section mobile-only">
          <NuxtLink to="/auth/login" class="bottom-link" @click="drawerOpen = false">로그인</NuxtLink>
          <NuxtLink to="/auth/register" class="bottom-link" @click="drawerOpen = false">가입</NuxtLink>
        </div>
      </aside>

      <main class="main">
        <slot />
      </main>
    </div>

    <!-- 모바일 하단 탭바 -->
    <nav class="mobile-tabbar mobile-only">
      <NuxtLink to="/" class="tab-item" exact-active-class="tab-active">
        <IconHome :size="22" />
        <span>홈</span>
      </NuxtLink>
      <button class="tab-item" @click="drawerOpen = true">
        <IconHash :size="22" />
        <span>채널</span>
      </button>
      <ClientOnly>
        <NuxtLink v-if="auth.isLoggedIn" :to="`/@${auth.user?.handle}`" class="tab-item" active-class="tab-active">
          <IconUser :size="22" />
          <span>프로필</span>
        </NuxtLink>
        <NuxtLink v-else to="/auth/login" class="tab-item" active-class="tab-active">
          <IconUser :size="22" />
          <span>로그인</span>
        </NuxtLink>
        <template #fallback>
          <div class="tab-item">
            <IconUser :size="22" />
          </div>
        </template>
      </ClientOnly>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { IconMoon, IconSun, IconSettings, IconShield, IconMenu2, IconX, IconHome, IconHash, IconUser } from '@tabler/icons-vue'
import { useAuthStore } from '~/stores/auth'
const auth    = useAuthStore()
const config  = useRuntimeConfig()
const theme   = useTheme()
const { data: channels } = await useFetch('/api/channels')

const drawerOpen = ref(false)

// 테마 초기화 (클라이언트에서만, localStorage 기반)
onMounted(() => theme.init())

// 라우트 변경 시 드로어 닫기
const route = useRoute()
watch(() => route.path, () => { drawerOpen.value = false })
</script>

<style scoped>
/* ── 유틸 ── */
.mobile-only  { display: none !important; }
.desktop-only { display: flex; }

@media (max-width: 767px) {
  .mobile-only  { display: flex !important; }
  .desktop-only { display: none !important; }
}

/* ── 레이아웃 ── */
.layout        { min-height: 100vh; }

/* ── 네비게이션 바 ── */
.navbar        { border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg-surface); z-index: 100; }
.navbar-inner  { max-width: 1080px; margin: 0 auto; padding: 0 1rem; height: 52px; display: flex; align-items: center; gap: 1rem; }
.logo          { font-weight: 700; font-size: 1.1rem; text-decoration: none; color: var(--accent); flex: 1; }
.nav-actions   { display: flex; align-items: center; gap: 0.75rem; }

.menu-btn      { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; display: flex; align-items: center; }
.menu-btn:hover { color: var(--text-primary); }

.nav-actions-mobile { align-items: center; gap: 0.5rem; }
.avatar-btn    { width: 30px; height: 30px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; text-decoration: none; }
.btn-ghost-sm  { padding: 0.3rem 0.6rem; border-radius: 6px; border: 1px solid var(--border); background: none; font-size: 0.8rem; text-decoration: none; color: var(--text-primary); }

.user-chip     { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; padding: 0.375rem 0.75rem; border-radius: 6px; border: 1px solid var(--border); color: var(--text-primary); }
.user-chip:hover { background: var(--bg-hover); }
.handle        { font-size: 0.8rem; color: var(--text-muted); }

.btn-ghost     { padding: 0.375rem 0.75rem; border-radius: 6px; border: 1px solid var(--border); background: none; cursor: pointer; font-size: 0.875rem; font-family: inherit; text-decoration: none; color: var(--text-primary); }
.btn-ghost:hover { background: var(--bg-hover); }
.btn-primary   { padding: 0.375rem 0.75rem; border-radius: 6px; background: var(--accent); color: white; text-decoration: none; font-size: 0.875rem; font-family: inherit; }

/* ── 드로어 오버레이 ── */
.drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 200; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── 콘텐츠 래퍼 ── */
.content-wrap  { max-width: 1080px; margin: 0 auto; display: flex; align-items: flex-start; }

/* ── 사이드바 ── */
.sidebar       { width: 220px; flex-shrink: 0; border-right: 1px solid var(--border); padding: 1.25rem 1rem; position: sticky; top: 52px; height: calc(100vh - 52px); overflow-y: auto; display: flex; flex-direction: column; }
.sidebar-section { margin-bottom: 1.5rem; }
.sidebar-label { font-size: 0.75rem; font-weight: 600; color: var(--text-placeholder); text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.5rem 0; }
.channel-nav   { display: flex; flex-direction: column; gap: 0.25rem; }
.channel-link  { padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.875rem; text-decoration: none; color: var(--text-muted); display: block; }
.channel-link:hover               { background: var(--bg-hover); color: var(--text-primary); }
.channel-link.router-link-active  { background: var(--accent-subtle); color: var(--accent); font-weight: 500; }

.sidebar-bottom { margin-top: auto; display: flex; flex-direction: column; gap: 0.25rem; }
.bottom-link   { display: flex; align-items: center; gap: 0.5rem; padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.875rem; text-decoration: none; color: var(--text-muted); }
.bottom-link:hover               { background: var(--bg-hover); color: var(--text-primary); }
.bottom-link.router-link-active  { background: var(--accent-subtle); color: var(--accent); }
.admin-link    { color: var(--accent); }
.admin-link:hover { color: var(--accent); }

.sidebar-top   { margin-bottom: 1rem; }
.theme-toggle  { width: 100%; text-align: left; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.375rem 0.75rem; cursor: pointer; color: var(--text-muted); font-size: 0.8rem; font-family: inherit; display: flex; align-items: center; gap: 0.4rem; }
.theme-toggle:hover { background: var(--bg-hover); color: var(--text-primary); }

.logout-btn    { width: 100%; text-align: left; background: none; border: 1px solid var(--border); border-radius: 6px; padding: 0.375rem 0.75rem; cursor: pointer; color: #ef4444; font-size: 0.875rem; font-family: inherit; }
.logout-btn:hover { background: #fef2f2; }

/* ── 메인 콘텐츠 ── */
.main          { flex: 1; min-width: 0; padding: 1.5rem 1rem; }

/* ── 모바일 하단 탭바 ── */
.mobile-tabbar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border);
  z-index: 100;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
}

.tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  text-decoration: none;
  font-family: inherit;
  font-size: 0.65rem;
}
.tab-item:hover, .tab-active { color: var(--accent); }

/* ── 모바일 드로어 ── */
.drawer-header {
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}
.drawer-title  { font-weight: 600; font-size: 1rem; color: var(--text-primary); }
.close-btn     { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 0.25rem; display: flex; align-items: center; }
.close-btn:hover { color: var(--text-primary); }

/* ── 모바일 반응형 ── */
@media (max-width: 767px) {
  .mobile-tabbar { display: flex; }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100dvh;
    width: 280px;
    z-index: 300;
    transform: translateX(-100%);
    transition: transform 0.25s ease;
    border-right: 1px solid var(--border);
    padding: 1rem;
    background: var(--bg-surface);
  }
  .sidebar.sidebar-open { transform: translateX(0); }

  .main {
    padding: 1rem 0.875rem;
    /* 하단 탭바 높이 + safe area 만큼 여백 */
    padding-bottom: calc(56px + env(safe-area-inset-bottom) + 1rem);
  }

  .content-wrap { padding: 0; }
}
</style>
