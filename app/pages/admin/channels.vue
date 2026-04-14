<template>
  <div>
    <div class="page-header">
      <h1>채널 관리</h1>
      <button class="btn-primary" @click="showForm = true">+ 채널 추가</button>
    </div>

    <!-- 채널 추가 폼 -->
    <div v-if="showForm" class="form-card">
      <h2>새 채널</h2>
      <div class="field">
        <label>슬러그 (영문, 숫자, 하이픈)</label>
        <input v-model="form.slug" placeholder="tech" />
      </div>
      <div class="field">
        <label>이름</label>
        <input v-model="form.name" placeholder="기술" />
      </div>
      <div class="field">
        <label>설명</label>
        <input v-model="form.description" placeholder="개발/기술 이야기" />
      </div>
      <div class="field-row">
        <label><input type="checkbox" v-model="form.isNsfw" /> NSFW</label>
        <label>순서 <input type="number" v-model="form.sortOrder" style="width:60px" /></label>
      </div>
      <div class="form-actions">
        <button @click="showForm = false" class="btn-ghost">취소</button>
        <button @click="createChannel" class="btn-primary">생성</button>
      </div>
    </div>

    <!-- 채널 목록 -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>슬러그</th>
            <th>이름</th>
            <th>설명</th>
            <th>NSFW</th>
            <th>보관</th>
            <th>순서</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ch in channels" :key="ch.id">
            <td><code>#{{ ch.slug }}</code></td>
            <td>{{ ch.name }}</td>
            <td>{{ ch.description ?? '-' }}</td>
            <td>{{ ch.isNsfw ? '✅' : '-' }}</td>
            <td>{{ ch.isArchived ? '✅' : '-' }}</td>
            <td>{{ ch.sortOrder }}</td>
            <td>
              <button class="btn-danger-sm" @click="deleteChannel(ch.id)">삭제</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',  // ← 추가
})

const { data: channels, refresh } = await useFetch('/api/channels')
const showForm = ref(false)
const form     = reactive({ slug: '', name: '', description: '', isNsfw: false, sortOrder: 0 })

async function createChannel() {
  await $fetch('/api/admin/channels', { method: 'POST', body: form })
  showForm.value  = false
  form.slug       = ''
  form.name       = ''
  form.description = ''
  await refresh()
}

async function deleteChannel(id: string) {
  if (!confirm('정말 삭제할까요? 채널의 글은 채널 없음 상태가 됩니다.')) return
  await $fetch(`/api/admin/channels/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.page-header  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1            { font-size: 1.5rem; font-weight: 700; margin: 0; }
.form-card    { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.5rem; margin-bottom: 1.5rem; }
h2            { font-size: 1rem; font-weight: 600; margin: 0 0 1rem; }
.field        { margin-bottom: 0.75rem; }
.field-row    { display: flex; gap: 1.5rem; margin-bottom: 0.75rem; }
label         { display: block; font-size: 0.875rem; margin-bottom: 0.25rem; color: #374151; }
input         { width: 100%; padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.9rem; box-sizing: border-box; }
.form-actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem; }
.table-wrap   { background: white; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
table         { width: 100%; border-collapse: collapse; }
th            { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; color: #6b7280; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
td            { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #f4f4f4; }
.btn-primary  { padding: 0.5rem 1rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
.btn-ghost    { padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
.btn-danger-sm { padding: 0.25rem 0.5rem; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
</style>