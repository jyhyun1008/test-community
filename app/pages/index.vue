<template>
  <div>
    <PostComposer v-if="auth.isLoggedIn" @posted="refresh" />

    <div v-if="pending" class="loading">불러오는 중...</div>

    <div v-else-if="posts?.length === 0" class="empty">
      아직 글이 없어요. 첫 번째 글을 올려보세요!
    </div>

    <div v-else class="feed">
      <PostCard v-for="post in posts" :key="post.id" :post="post" @deleted="refresh" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth = useAuthStore()
const { data: posts, pending, refresh } = await useFetch('/api/posts')
</script>

<style scoped>
.loading { text-align: center; padding: 3rem; color: #9ca3af; }
.empty   { text-align: center; padding: 3rem; color: #9ca3af; }
.feed    { display: flex; flex-direction: column; gap: 0.75rem; }
</style>