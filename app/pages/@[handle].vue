<template>
  <div>
    <div v-if="pending" class="loading">불러오는 중...</div>

    <div v-else-if="user">
      <div class="profile-header">
        <img v-if="user.headerUrl" :src="user.headerUrl" class="header-img" />
        <img v-else-if="!user.headerUrl" src="https://images.pexels.com/photos/15067862/pexels-photo-15067862.jpeg" class="header-img" />
        <div class="profile-body">
          <img v-if="user.avatarUrl" :src="user.avatarUrl" class="avatar" />
          <div v-else class="avatar-placeholder">
            {{ user.handle[0].toUpperCase() }}
          </div>
        <div class="profile-info">
          <div class="profile-top">
            <div>
              <h1>{{ user.displayName ?? user.handle }}</h1>
              <p class="handle">@{{ user.handle }}{{ user.isLocal ? '' : `@${user.domain}` }}</p>
            </div>
            <button
              v-if="auth.isLoggedIn && auth.user?.handle !== user.handle"
              class="follow-btn"
              :class="{ following: isFollowing }"
              @click="toggleFollow"
            >
              {{ isFollowing ? '팔로잉' : '팔로우' }}
            </button>
          </div>
          <p v-if="user.bio" class="bio">{{ user.bio }}</p>
          <div class="stats">
            <span><b>{{ user.followerCount }}</b> 팔로워</span>
            <span><b>{{ user.followingCount }}</b> 팔로잉</span>
          </div>
        </div>
        </div>
      </div>

      <div class="feed">
        <PostCard v-for="post in posts" :key="post.id" :post="post" @deleted="refresh"  />
        <p v-if="posts?.length === 0" class="empty">아직 글이 없어요.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
definePageMeta({ layout: 'default' })

const auth   = useAuthStore()
const route  = useRoute()
const handle = route.params.handle as string

const { data: user }                       = await useFetch(`/api/users/${handle}`)
const { data: posts, refresh: refreshPosts } = await useFetch('/api/posts', { query: { author: handle } })
const { data: followStatus }               = await useFetch(`/api/users/${handle}/follow-status`)

const isFollowing = ref(followStatus.value?.following ?? false)

async function toggleFollow() {
  const res = await $fetch(`/api/follows/${handle}`, { method: 'POST' })
  isFollowing.value = res.following
  if (user.value) {
    user.value.followerCount += res.following ? 1 : -1
  }
}
</script>

<style scoped>
.loading         { text-align: center; padding: 3rem; color: #9ca3af; }
.profile-header  { background: white; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; margin-bottom: 1.25rem; }
.header-img      { width: 100%; height: 160px; object-fit: cover; }
.profile-body    { display: flex; align-items: flex-end; gap: 1rem; padding: 1rem 1.25rem; }
.avatar          { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid white; margin-top: -36px; }
.avatar-placeholder { width: 72px; height: 72px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 3px solid white; margin-top: -36px; }
.profile-info h1 { font-size: 1.25rem; font-weight: 700; margin: 0; }
.handle          { color: #9ca3af; font-size: 0.875rem; margin: 0.25rem 0; }
.bio             { color: #374151; font-size: 0.9rem; margin: 0.5rem 0 0; }
.feed            { display: flex; flex-direction: column; gap: 0.75rem; }
.empty           { text-align: center; padding: 3rem; color: #9ca3af; }

.profile-top  { display: flex; justify-content: space-between; align-items: flex-start; }
.follow-btn   { padding: 0.5rem 1.25rem; border-radius: 9999px; border: 1px solid #6366f1; color: #6366f1; background: white; cursor: pointer; font-size: 0.875rem; font-weight: 600; }
.follow-btn.following { background: #6366f1; color: white; }
.follow-btn.following:hover { background: #ef4444; border-color: #ef4444; content: '언팔로우'; }
.stats        { display: flex; gap: 1rem; margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280; }
.stats b      { color: #111827; }
</style>