<template>
  <div class="settings-wrap">
    <h1>프로필 설정</h1>

    <div class="section">
      <div class="banner-wrap">
        <img v-if="form.headerUrl" :src="form.headerUrl" class="banner-preview" />
        <div v-else class="banner-placeholder">배너 이미지</div>
        <label class="upload-overlay">
          <IconCamera :size="16" /> 변경
          <input type="file" accept="image/*" style="display:none" @change="uploadHeader" />
        </label>
      </div>

      <div class="avatar-wrap">
        <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar-preview" />
        <div v-else class="avatar-placeholder">{{ auth.user?.handle[0].toUpperCase() }}</div>
        <label class="avatar-upload">
          <IconCamera :size="14" />
          <input type="file" accept="image/*" style="display:none" @change="uploadAvatar" />
        </label>
      </div>
    </div>

    <div class="section">
      <div class="field">
        <label>표시 이름</label>
        <input v-model="form.displayName" placeholder="표시될 이름" maxlength="50" />
      </div>
      <div class="field">
        <label>소개</label>
        <textarea v-model="form.bio" placeholder="자기소개" rows="3" maxlength="500" />
        <span class="char-count">{{ form.bio?.length ?? 0 }} / 500</span>
      </div>
    </div>

    <p v-if="error"   class="error">{{ error }}</p>
    <p v-if="success" class="success">저장됐습니다!</p>

    <button class="btn-primary" :disabled="pending" @click="save">
      {{ pending ? '저장 중...' : '저장' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { IconCamera } from '@tabler/icons-vue'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'default' })

const auth    = useAuthStore()
const pending = ref(false)
const error   = ref('')
const success = ref(false)

const form = reactive({
  displayName: auth.user?.displayName ?? '',
  bio:         auth.user?.bio ?? '',
  avatarUrl:   auth.user?.avatarUrl ?? '',
  headerUrl:   auth.user?.headerUrl ?? '',
})

const { data: me } = await useFetch('/api/auth/me')
if (me.value) {
  form.displayName = me.value.displayName ?? ''
  form.bio         = me.value.bio ?? ''
  form.avatarUrl   = me.value.avatarUrl ?? ''
  form.headerUrl   = me.value.headerUrl ?? ''
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData()
  fd.append('file', file)
  const res = await $fetch<{ url: string }>('/api/media/upload', { method: 'POST', body: fd })
  return res.url
}

async function uploadAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  var au = await uploadFile(file)
  form.avatarUrl = 'https://'+au
}

async function uploadHeader(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  var hu = await uploadFile(file)
  form.headerUrl = 'https://'+hu
}

async function save() {
  pending.value = true
  error.value   = ''
  success.value = false
  try {
    await $fetch('/api/users/me', {
      method: 'PATCH',
      body: {
        displayName: form.displayName || undefined,
        bio:         form.bio || undefined,
        avatarUrl:   form.avatarUrl || undefined,
        headerUrl:   form.headerUrl || undefined,
      },
    })
    await auth.fetchMe()
    success.value = true
  } catch (e: any) {
    error.value = e.data?.message ?? '오류가 발생했습니다'
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.settings-wrap  { max-width: 1080px; width: 100% }
h1              { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-primary); }
.section        { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; }
.banner-wrap    { position: relative; height: 140px; border-radius: 8px; overflow: hidden; margin-bottom: 1rem; }
.banner-preview { width: 100%; height: 100%; object-fit: cover; }
.banner-placeholder { width: 100%; height: 100%; background: var(--bg-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-placeholder); }
.upload-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; gap: 0.4rem; color: white; cursor: pointer; opacity: 0; transition: opacity 0.15s; font-size: 0.9rem; }
.banner-wrap:hover .upload-overlay { opacity: 1; }
.avatar-wrap    { position: relative; width: 72px; height: 72px; }
.avatar-preview { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }
.avatar-placeholder { width: 72px; height: 72px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; }
.avatar-upload  { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; color: white; cursor: pointer; opacity: 0; transition: opacity 0.15s; }
.avatar-wrap:hover .avatar-upload { opacity: 1; }
.field          { margin-bottom: 1rem; }
label           { display: block; font-size: 0.875rem; margin-bottom: 0.375rem; color: var(--text-secondary); font-weight: 500; }
label.upload-overlay, label.avatar-upload {margin-bottom: 0 !important;}
input, textarea { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.9rem; font-family: inherit; box-sizing: border-box; outline: none; background: var(--bg-surface); color: var(--text-primary); }
textarea        { resize: vertical; }
.char-count     { font-size: 0.75rem; color: var(--text-placeholder); float: right; }
.btn-primary    { padding: 0.625rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.error          { color: #ef4444; font-size: 0.875rem; margin-bottom: 0.5rem; }
.success        { color: #10b981; font-size: 0.875rem; margin-bottom: 0.5rem; }
</style>
