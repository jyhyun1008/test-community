<template>
  <div class="post-card">
    <div class="post-meta">
  <!-- author가 있을 때만 표시 -->
  <NuxtLink v-if="post.author" :to="`/@${post.author.handle}`" class="author">
    <img
      v-if="post.author.avatarUrl"
      :src="post.author.avatarUrl"
      class="avatar"
    />
    <div v-else class="avatar-placeholder">
      {{ post.author.handle[0].toUpperCase() }}
    </div>
    <span class="display-name">{{ post.author.displayName ?? post.author.handle }}</span>
    <span class="handle">@{{ post.author.handle }}{{ post.author.isLocal ? '' : `@${post.author.domain}` }}</span>
  </NuxtLink>

  <!-- 삭제된 글이면 대신 표시 -->
  <span v-else class="deleted-author">삭제된 사용자</span>

  <div class="post-info">
        <NuxtLink v-if="post.channel" :to="`/c/${post.channel.slug}`" class="channel-badge">
          #{{ post.channel.slug }}
        </NuxtLink>
        <span class="date">{{ formatDate(post.createdAt) }}</span>
      </div>
    </div>

    <NuxtLink :to="`/posts/${post.id}`" class="post-body">
        <h2 v-if="post.title" class="post-title">{{ post.title }}</h2>
        <p class="post-content" :class="{ deleted: post.content === '[삭제된 글입니다]' }">
            {{ post.content }}
        </p>
  <!-- 미디어 추가 -->
  <div v-if="post.media?.length" class="media-grid" :class="`count-${post.media.length}`">
    <img
      v-for="m in post.media"
      :key="m.id"
      :src="`https://${m.url}`"
      :alt="m.altText ?? ''"
      class="media-img"
    />
  </div>
    </NuxtLink>
<div class="post-actions">
  <button class="action-btn">💬 {{ post.replyCount }}</button>
  <button class="action-btn">🔁 {{ post.repostCount }}</button>
  <button
    class="action-btn"
    :class="{ active: liked }"
    @click.prevent="toggleLike"
  >
    {{ liked ? '❤️' : '🤍' }} {{ likeCount }}
  </button>
  <button
    v-if="post.author && auth.user?.id === post.author.id"
    class="action-btn danger"
    @click.prevent="deletePost"
  >
    🗑️
  </button>
</div>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const emit = defineEmits<{ deleted: [], liked: [] }>()

const props = defineProps<{
  post: {
    id: string
    title: string | null
    content: string
    createdAt: string
    likeCount: number
    replyCount: number
    repostCount: number
    isLiked: boolean
    media: Array<{       // ← 추가
      id: string
      url: string
      mimeType: string
      altText: string | null
    }>
    author: {
      id: string
      handle: string
      displayName: string | null
      avatarUrl: string | null
      isLocal: boolean
      domain: string
    } | null
    channel: { slug: string; name: string } | null
  }
}>()

// ← 이거 추가
function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
const liked     = ref(props.post.isLiked ?? false)  // ← 수정
const likeCount = ref(props.post.likeCount)

async function toggleLike() {
  if (!auth.isLoggedIn) return navigateTo('/auth/login')
  const res = await $fetch(`/api/posts/${props.post.id}/like`, { method: 'POST' })
  liked.value     = res.liked
  likeCount.value += res.liked ? 1 : -1
}

async function deletePost() {
  if (!confirm('정말 삭제할까요?')) return
  await $fetch(`/api/posts/${props.post.id}`, { method: 'DELETE' })
  emit('deleted')
}
</script>

<style scoped>
.post-card      { padding: 1.25rem; border: 1px solid #e5e7eb; border-radius: 10px; background: white; transition: box-shadow 0.15s; }
.post-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.post-meta      { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.author         { display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: inherit; }
.avatar         { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 32px; height: 32px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; }
.display-name   { font-weight: 600; font-size: 0.9rem; }
.handle         { color: #9ca3af; font-size: 0.8rem; }
.post-info      { display: flex; align-items: center; gap: 0.5rem; }
.channel-badge  { font-size: 0.75rem; padding: 0.125rem 0.5rem; background: #ede9fe; color: #6366f1; border-radius: 9999px; text-decoration: none; }
.date           { font-size: 0.75rem; color: #9ca3af; }
.post-body      { text-decoration: none; color: inherit; display: block; }
.post-title     { font-size: 1rem; font-weight: 600; margin: 0 0 0.375rem; }
.post-content   { font-size: 0.9rem; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.post-actions   { display: flex; gap: 1rem; margin-top: 0.875rem; padding-top: 0.875rem; border-top: 1px solid #f3f4f6; }
.action-btn     { background: none; border: none; cursor: pointer; font-size: 0.875rem; color: #6b7280; padding: 0.25rem 0.5rem; border-radius: 6px; }
.action-btn:hover { background: #f3f4f6; }
.action-btn.active { color: #ef4444; }
.deleted { color: #9ca3af; font-style: italic; }
.deleted-author { font-size: 0.875rem; color: #9ca3af; font-style: italic; }
.media-grid          { display: grid; gap: 4px; margin-top: 0.75rem; border-radius: 10px; overflow: hidden; }
.media-grid.count-1  { grid-template-columns: 1fr; }
.media-grid.count-2  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3 .media-img:first-child { grid-column: span 2; }
.media-grid.count-4  { grid-template-columns: 1fr 1fr; }
.media-img           { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
</style>