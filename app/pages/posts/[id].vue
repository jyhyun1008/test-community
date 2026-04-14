<template>
  <div>
    <button class="back-btn" @click="$router.back()">← 뒤로</button>

    <div v-if="pending" class="loading">불러오는 중...</div>

    <div v-else-if="post" class="post-detail">
      <div class="post-header">
        <NuxtLink v-if="post.author" :to="post.author ? `/@${post.author.handle}` : '#'" class="author">
        <div class="avatar-wrap">
            <img v-if="post.author?.avatarUrl" :src="post.author.avatarUrl" class="avatar" />
            <div v-else class="avatar-placeholder">
            {{ post.author ? post.author.handle[0].toUpperCase() : '?' }}
            </div>
        </div>
        <div>
            <div class="display-name">
            {{ post.author?.displayName ?? post.author?.handle ?? '삭제된 사용자' }}
            </div>
            <div class="handle">
            {{ post.author ? `@${post.author.handle}${post.author.isLocal ? '' : `@${post.author.domain}`}` : '' }}
            </div>
        </div>
        </NuxtLink>
        <span v-else class="deleted-author">삭제된 사용자</span>

        <div class="post-info">
          <NuxtLink v-if="post.channel" :to="`/c/${post.channel.slug}`" class="channel-badge">
            #{{ post.channel.slug }}
          </NuxtLink>
          <span class="date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>

      <h1 v-if="post.title" class="post-title">{{ post.title }}</h1>
      <div class="post-content md-content" v-html="post.contentHtml ?? post.content" />


    <div v-if="post.media?.length" class="media-grid" :class="`count-${post.media.length}`">
        <img
            v-for="m in post.media"
            :key="m.id"
            :src="`https://${m.url}`"
            :alt="m.altText ?? ''"
            class="media-img"
        />
    </div>
        <div class="post-actions">
        <button class="action-btn">💬 {{ post.replyCount }}</button>
        <button class="action-btn">🔁 {{ post.repostCount }}</button>
        <button
            class="action-btn"
            :class="{ active: liked }"
            @click="toggleLike"
        >
            {{ liked ? '❤️' : '🤍' }} {{ likeCount }}
        </button>
        <button
            v-if="post.author && auth.user?.id === post.author.id"
            class="action-btn danger"
            @click="deletePost"
        >
            🗑️ 삭제
        </button>
        </div>

      <!-- 답글 작성 -->
      <div v-if="auth.isLoggedIn && post.author" class="reply-composer">
        <textarea
          v-model="replyContent"
          placeholder="답글 달기..."
          rows="2"
          class="reply-input"
        />
        <button
          class="btn-primary"
          :disabled="!replyContent.trim()"
          @click="submitReply"
        >
          답글
        </button>
      </div>

      <!-- 답글 목록 -->
      <div class="replies">
        <PostCard
          v-for="reply in replies"
          :key="reply.id"
          :post="reply"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth  = useAuthStore()
const route = useRoute()
const id    = route.params.id as string

const { data: post, pending } = await useFetch(`/api/posts/${id}`)
const { data: replies, refresh: refreshReplies } = await useFetch('/api/posts', {
  query: { replyTo: id },
})

const replyContent = ref('')

const liked     = ref(post.value?.isLiked ?? false)
const likeCount = ref(post.value?.likeCount ?? 0)

async function toggleLike() {
  if (!auth.isLoggedIn) return navigateTo('/auth/login')
  const res = await $fetch(`/api/posts/${id}/like`, { method: 'POST' })
  liked.value      = res.liked
  likeCount.value += res.liked ? 1 : -1
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

async function submitReply() {
  if (!replyContent.value.trim()) return
  await $fetch('/api/posts', {
    method: 'POST',
    body: { content: replyContent.value, replyToId: id },
  })
  replyContent.value = ''
  await refreshReplies()
}

async function deletePost() {
  if (!confirm('정말 삭제할까요?')) return
  await $fetch(`/api/posts/${id}`, { method: 'DELETE' })
  navigateTo('/')
}
</script>

<style scoped>
.back-btn       { background: none; border: none; cursor: pointer; color: #6b7280; font-size: 0.9rem; margin-bottom: 1rem; padding: 0; }
.back-btn:hover { color: #111827; }
.loading        { text-align: center; padding: 3rem; color: #9ca3af; }
.post-detail    { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.5rem; }
.post-header    { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
.author         { display: flex; gap: 0.75rem; text-decoration: none; color: inherit; }
.avatar         { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; }
.display-name   { font-weight: 600; }
.handle         { font-size: 0.85rem; color: #9ca3af; }
.post-info      { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; }
.channel-badge  { font-size: 0.75rem; padding: 0.125rem 0.5rem; background: #ede9fe; color: var(--accent); border-radius: 9999px; text-decoration: none; }
.date           { font-size: 0.8rem; color: #9ca3af; }
.post-title     { font-size: 1.4rem; font-weight: 700; margin: 0 0 0.75rem; }
.post-content   { font-size: 0.95rem; line-height: 1.7; color: #374151; white-space: pre-wrap; margin: 0;  max-height: none;  -webkit-mask-image: none; mask-image: none;}
.post-actions   { display: flex; gap: 1rem; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #f4f4f4; }
.action-btn     { background: none; border: none; cursor: pointer; font-size: 0.875rem; color: #6b7280; padding: 0.25rem 0.5rem; border-radius: 6px; }
.action-btn:hover { background: #f4f4f4; }
.action-btn.danger:hover { background: #fee2e2; color: #ef4444; }
.reply-composer { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.reply-input    { width: 100%; border: 1px solid #e5e7eb; border-radius: 8px; padding: 0.625rem; font-size: 0.9rem; font-family: inherit; resize: vertical; outline: none; box-sizing: border-box; }
.btn-primary    { align-self: flex-end; padding: 0.375rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.replies        { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.deleted-author { font-size: 0.875rem; color: #9ca3af; font-style: italic; }
.media-grid          { display: grid; gap: 4px; margin: 1rem 0; border-radius: 10px; overflow: hidden; }
.media-grid.count-1  { grid-template-columns: 1fr; }
.media-grid.count-2  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3 .media-img:first-child { grid-column: span 2; }
.media-grid.count-4  { grid-template-columns: 1fr 1fr; }
.media-img           { width: 100%; aspect-ratio: 16/9; object-fit: cover; }
</style>