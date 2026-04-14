<template>
  <div>
    <div class="page-header">
      <h1>커스텀 이모지</h1>
    </div>

    <!-- 등록 폼 -->
    <div class="form-card">
      <h2>이모지 추가</h2>

      <!-- 이미지 업로드 -->
      <div class="upload-area" :class="{ 'has-preview': previewUrl }" @click="fileInput?.click()">
        <img v-if="previewUrl" :src="previewUrl" class="preview-img" />
        <template v-else>
          <IconPhoto :size="28" class="upload-icon" />
          <span>이미지 클릭해서 선택</span>
          <span class="upload-sub">PNG, GIF, WebP 권장 · 최대 512×512px</span>
        </template>
        <input ref="fileInput" type="file" accept="image/png,image/gif,image/webp,image/jpeg" style="display:none" @change="handleFile" />
      </div>

      <div class="form-row">
        <div class="field">
          <label>shortcode</label>
          <div class="input-prefix">
            <span>:</span>
            <input v-model="form.shortcode" placeholder="blobcat" maxlength="64" @input="sanitizeShortcode" />
            <span>:</span>
          </div>
          <p class="field-hint">영문, 숫자, 언더스코어만 사용 가능</p>
        </div>
      </div>

      <p v-if="formError" class="form-error">{{ formError }}</p>

      <button class="btn-primary" :disabled="submitting || !form.shortcode || !uploadedUrl" @click="addEmoji">
        {{ submitting ? '등록 중...' : '등록' }}
      </button>
    </div>

    <!-- 이모지 목록 -->
    <div class="table-wrap">
      <div v-if="!emojis?.length" class="empty">아직 등록된 이모지가 없습니다.</div>
      <table v-else>
        <thead>
          <tr>
            <th>미리보기</th>
            <th>shortcode</th>
            <th>URL</th>
            <th>등록일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in emojis" :key="e.id">
            <td><img :src="e.url" :alt="`:${e.shortcode}:`" class="emoji-preview" /></td>
            <td><code>:{{ e.shortcode }}:</code></td>
            <td class="url-cell">{{ e.url }}</td>
            <td>{{ new Date(e.createdAt).toLocaleDateString('ko-KR') }}</td>
            <td>
              <button class="btn-danger-sm" @click="remove(e.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconPhoto } from '@tabler/icons-vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: emojis, refresh } = await useFetch('/api/admin/emojis')

const fileInput  = ref<HTMLInputElement>()
const previewUrl = ref('')
const uploadedUrl = ref('')
const submitting  = ref(false)
const formError   = ref('')
const form = reactive({ shortcode: '' })

function sanitizeShortcode() {
  form.shortcode = form.shortcode.replace(/[^a-zA-Z0-9_]/g, '')
}

async function handleFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  previewUrl.value  = URL.createObjectURL(file)
  uploadedUrl.value = ''
  const fd = new FormData()
  fd.append('file', file)
  const res = await $fetch<{ url: string }>('/api/media/upload', { method: 'POST', body: fd })
  uploadedUrl.value = res.url.startsWith('http') ? res.url : `https://${res.url}`
}

async function addEmoji() {
  if (!form.shortcode || !uploadedUrl.value) return
  submitting.value = true
  formError.value  = ''
  try {
    await $fetch('/api/admin/emojis', {
      method: 'POST',
      body: { shortcode: form.shortcode, url: uploadedUrl.value },
    })
    form.shortcode    = ''
    previewUrl.value  = ''
    uploadedUrl.value = ''
    await refresh()
  } catch (err: any) {
    formError.value = err.data?.message ?? '오류가 발생했습니다'
  } finally {
    submitting.value = false
  }
}

async function remove(id: string) {
  if (!confirm('이모지를 삭제할까요?')) return
  await $fetch(`/api/admin/emojis/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.page-header  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1            { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-primary); }
h2            { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; color: var(--text-primary); }

.form-card    { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }

.upload-area  { border: 2px dashed var(--border); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1rem; min-height: 100px; transition: border-color 0.15s; }
.upload-area:hover { border-color: var(--accent); color: var(--text-primary); }
.upload-area.has-preview { padding: 0.5rem; }
.upload-icon  { color: var(--text-placeholder); }
.upload-sub   { font-size: 0.75rem; color: var(--text-placeholder); }
.preview-img  { max-height: 80px; max-width: 80px; object-fit: contain; border-radius: 6px; }

.form-row     { display: flex; gap: 1rem; margin-bottom: 1rem; }
.field        { flex: 1; }
label         { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: var(--text-secondary); }
.input-prefix       { display: flex; align-items: center; border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
.input-prefix span  { padding: 0.5rem 0.6rem; background: var(--bg-subtle); color: var(--text-muted); font-size: 0.9rem; font-family: monospace; }
.input-prefix input { border: none; flex: 1; padding: 0.5rem; font-size: 0.9rem; outline: none; background: var(--bg-surface); color: var(--text-primary); }
.field-hint   { font-size: 0.75rem; color: var(--text-placeholder); margin: 0.25rem 0 0; }

.form-error   { color: #ef4444; font-size: 0.875rem; margin-bottom: 0.75rem; }
.btn-primary  { padding: 0.5rem 1.25rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.table-wrap   { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.empty        { padding: 2rem; text-align: center; color: var(--text-placeholder); font-size: 0.9rem; }
table         { width: 100%; border-collapse: collapse; }
th            { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; color: var(--text-muted); border-bottom: 1px solid var(--border); background: var(--bg-subtle); }
td            { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); vertical-align: middle; }
.emoji-preview { width: 32px; height: 32px; object-fit: contain; }
.url-cell     { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; color: var(--text-placeholder); }
.btn-danger-sm { padding: 0.25rem 0.5rem; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
</style>
