<template>
  <div class="composer">
    <form @submit.prevent="submit">
      <input
        v-model="form.title"
        class="title-input"
        placeholder="제목 (선택)"
      />
      <textarea
        v-model="form.content"
        class="content-input"
        placeholder="무슨 생각을 하고 있나요?"
        rows="3"
        required
      />
      <!-- 이미지 미리보기 -->
      <div v-if="previews.length" class="previews">
        <div v-for="(p, i) in previews" :key="i" class="preview-item">
          <img :src="p" />
          <button type="button" @click="removeImage(i)">✕</button>
        </div>
      </div>

      <div class="composer-footer">
        <select v-model="form.channelSlug" class="channel-select">
          <option value="">채널 선택 (선택)</option>
          <option v-for="ch in channels" :key="ch.id" :value="ch.slug">
            #{{ ch.slug }}
          </option>
        </select>
        <!-- 이미지 업로드 버튼 -->
        <label class="upload-btn">
          🖼️
          <input
            type="file"
            accept="image/*"
            multiple
            style="display:none"
            @change="handleFiles"
          />
        </label>
        <span class="char-count" :class="{ over: form.content.length > maxLength }">
          {{ form.content.length }} / {{ maxLength }}
        </span>
        <button type="submit" class="btn-primary" :disabled="pending || !form.content.trim()">
          {{ pending ? '올리는 중...' : '올리기' }}
        </button>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ posted: [] }>()

const config    = useRuntimeConfig()
const maxLength = config.public.maxPostLength as number

const { data: channels } = await useFetch('/api/channels')

const pending  = ref(false)
const error    = ref('')
const previews = ref<string[]>([])
const mediaIds = ref<string[]>([])
const form     = reactive({ title: '', content: '', channelSlug: '' })

async function handleFiles(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return

  for (const file of Array.from(files)) {
    if (mediaIds.value.length >= 4) break

    // 미리보기
    previews.value.push(URL.createObjectURL(file))

    // 업로드
    const fd = new FormData()
    fd.append('file', file)
    const res = await $fetch('/api/media/upload', { method: 'POST', body: fd })
    mediaIds.value.push(res.id)
  }
}

function removeImage(i: number) {
  previews.value.splice(i, 1)
  mediaIds.value.splice(i, 1)
}

async function submit() {
  if (form.content.length > maxLength) return
  pending.value = true
  error.value   = ''
  try {
    await $fetch('/api/posts', {
      method: 'POST',
      body: {
        title:       form.title || undefined,
        content:     form.content,
        channelSlug: form.channelSlug || undefined,
        mediaIds:    mediaIds.value,
      },
    })
    form.title       = ''
    form.content     = ''
    form.channelSlug = ''
    previews.value   = []
    mediaIds.value   = []
    emit('posted')
  } catch (e: any) {
    error.value = e.data?.message ?? '오류가 발생했습니다'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.composer       { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; margin-bottom: 1.25rem; }
.title-input    { width: 100%; border: none; font-size: 1rem; font-weight: 600; outline: none; margin-bottom: 0.5rem; box-sizing: border-box; }
.content-input  { width: 100%; border: none; resize: vertical; font-size: 0.9rem; outline: none; font-family: inherit; line-height: 1.6; box-sizing: border-box; }
.composer-footer { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; padding-top: 0.75rem; border-top: 1px solid #f4f4f4; }
.channel-select { font-size: 0.8rem; border: 1px solid #e5e7eb; border-radius: 6px; padding: 0.25rem 0.5rem; color: #6b7280; }
.char-count     { font-size: 0.8rem; color: #9ca3af; margin-left: auto; }
.char-count.over { color: #ef4444; }
.btn-primary    { padding: 0.375rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; font-size: 0.875rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.error          { color: #ef4444; font-size: 0.875rem; margin-top: 0.5rem; }
.previews      { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
.preview-item  { position: relative; }
.preview-item img    { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; }
.preview-item button { position: absolute; top: -6px; right: -6px; width: 20px; height: 20px; border-radius: 50%; background: #111; color: white; border: none; cursor: pointer; font-size: 10px; display: flex; align-items: center; justify-content: center; }
.upload-btn    { cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 1rem; }
.upload-btn:hover { background: #f4f4f4; }
</style>