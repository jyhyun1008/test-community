<template>
  <div>
    <button class="back-btn" @click="$router.back()">
      <IconArrowLeft :size="16" /> 뒤로
    </button>

    <div v-if="pending" class="loading">불러오는 중...</div>

    <div v-else-if="post" class="post-detail">
      <div class="post-header">
        <NuxtLink v-if="post.author" :to="post.author.isLocal
          ? `/@${post.author.handle}`
          : `/@${post.author.handle}@${post.author.domain}`" class="author">
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
        <button class="action-btn">
          <IconMessage :size="16" /> {{ post.replyCount }}
        </button>
        <button class="action-btn">
          <IconRepeat :size="16" /> {{ post.repostCount }}
        </button>
        <button class="action-btn" :class="{ active: liked }" @click="toggleLike">
          <IconHeartFilled v-if="liked" :size="16" />
          <IconHeart v-else :size="16" />
          {{ likeCount }}
        </button>
        <button
          v-if="post.author && auth.user?.id === post.author.id"
          class="action-btn danger"
          @click="deletePost"
        >
          <IconTrash :size="16" /> 삭제
        </button>
      </div>

      <div v-if="auth.isLoggedIn && post.author" class="reply-composer">
        <textarea
          v-model="replyContent"
          placeholder="답글 달기..."
          rows="2"
          class="reply-input"
        />
        <button class="btn-primary" :disabled="!replyContent.trim()" @click="submitReply">
          답글
        </button>
      </div>

      <div class="replies">
        <PostCard v-for="reply in replies" :key="reply.id" :post="reply" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconArrowLeft, IconMessage, IconRepeat, IconHeart, IconHeartFilled, IconTrash } from '@tabler/icons-vue'
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
.back-btn       { display: flex; align-items: center; gap: 0.3rem; background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; padding: 0; font-family: inherit; }
.back-btn:hover { color: var(--text-primary); }
.loading        { text-align: center; padding: 3rem; color: var(--text-placeholder); }
.post-detail    { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; }
.post-header    { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; gap: 0.5rem; }
.author         { display: flex; gap: 0.75rem; text-decoration: none; color: inherit; min-width: 0; }
.avatar         { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.avatar-placeholder { width: 44px; height: 44px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 600; flex-shrink: 0; }
.display-name   { font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.handle         { font-size: 0.85rem; color: var(--text-placeholder); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.post-info      { display: flex; flex-direction: column; align-items: flex-end; gap: 0.25rem; flex-shrink: 0; }
.channel-badge  { font-size: 0.75rem; padding: 0.125rem 0.5rem; background: var(--badge-bg); color: var(--badge-color); border-radius: 9999px; text-decoration: none; }
.date           { font-size: 0.8rem; color: var(--text-placeholder); }
.post-title     { font-size: 1.4rem; font-weight: 700; margin: 0 0 0.75rem; color: var(--text-primary); }
.post-content   { font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary); margin: 0; }
.post-content :deep(p)            { margin: 0 0 0.5rem; }
.post-content :deep(p:last-child) { margin-bottom: 0; }
.post-actions   { display: flex; gap: 0.5rem; margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--border-subtle); }
.action-btn     { display: flex; align-items: center; gap: 0.3rem; background: none; border: none; cursor: pointer; font-size: 0.8rem; color: var(--text-muted); padding: 0.25rem 0.5rem; border-radius: 6px; font-family: inherit; }
.action-btn:hover { background: var(--bg-hover); }
.action-btn.active { color: #ef4444; }
.action-btn.danger:hover { color: #ef4444; }
.reply-composer { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.reply-input    { width: 100%; border: 1px solid var(--border); border-radius: 8px; padding: 0.625rem; font-size: 0.9rem; font-family: inherit; resize: vertical; outline: none; box-sizing: border-box; background: var(--bg-surface); color: var(--text-primary); }
.reply-input::placeholder { color: var(--text-placeholder); }
.btn-primary    { align-self: flex-end; padding: 0.375rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.replies        { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
.deleted-author { font-size: 0.875rem; color: var(--text-placeholder); font-style: italic; }
.media-grid          { display: grid; gap: 4px; margin: 1rem 0; border-radius: 10px; overflow: hidden; }
.media-grid.count-1  { grid-template-columns: 1fr; }
.media-grid.count-2  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3  { grid-template-columns: 1fr 1fr; }
.media-grid.count-3 .media-img:first-child { grid-column: span 2; }
.media-grid.count-4  { grid-template-columns: 1fr 1fr; }
.media-img           { width: 100%; aspect-ratio: 16/9; object-fit: cover; }

@media (max-width: 767px) {
  .post-detail  { padding: 1rem 0.875rem; border-radius: 8px; }
  .avatar, .avatar-placeholder { width: 36px; height: 36px; font-size: 0.875rem; }
  .post-title   { font-size: 1.2rem; }
}
</style>
