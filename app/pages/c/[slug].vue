<template>
  <div>
    <div v-if="channel" class="channel-header">
      <h1>#{{ channel.name }}</h1>
      <p v-if="channel.description" class="desc">{{ channel.description }}</p>
    </div>

    <PostComposer v-if="auth.isLoggedIn" @posted="refresh" />

    <div v-if="pending" class="loading">불러오는 중...</div>

    <div v-else-if="posts?.length === 0" class="empty">
      이 채널엔 아직 글이 없어요.
    </div>

    <div v-else class="feed">
      <PostCard v-for="post in posts" :key="post.id" :post="post" @deleted="refresh"  />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth  = useAuthStore()
const route = useRoute()
const slug  = route.params.slug as string

const { data: channel } = await useFetch(`/api/channels/${slug}`)
const { data: posts, pending, refresh } = await useFetch('/api/posts', {
  query: { channel: slug },
})
</script>

<style scoped>
.channel-header { margin-bottom: 1.25rem; }
h1   { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; }
.desc { color: #6b7280; margin: 0; }
.loading { text-align: center; padding: 3rem; color: #9ca3af; }
.empty   { text-align: center; padding: 3rem; color: #9ca3af; }
.feed    { display: flex; flex-direction: column; gap: 0.75rem; }
</style>