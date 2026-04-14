<template>
  <div>
    <div class="page-header">
      <h1>인스턴스 블락</h1>
      <button class="btn-primary" @click="showForm = !showForm">+ 추가</button>
    </div>

    <div v-if="showForm" class="form-card">
      <div class="field-row">
        <input v-model="form.domain" placeholder="mastodon.example.com" style="flex:1" />
        <input v-model="form.reason" placeholder="사유 (선택)" style="flex:1" />
        <button @click="addBlock" class="btn-primary">추가</button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>도메인</th><th>사유</th><th>추가일</th><th></th></tr>
        </thead>
        <tbody>
          <tr v-for="b in blocks" :key="b.id">
            <td><code>{{ b.domain }}</code></td>
            <td>{{ b.reason ?? '-' }}</td>
            <td>{{ new Date(b.createdAt).toLocaleDateString('ko-KR') }}</td>
            <td>
              <button class="btn-danger-sm" @click="removeBlock(b.id)">해제</button>
            </td>
          </tr>
          <tr v-if="!blocks?.length">
            <td colspan="4" style="text-align:center;color:#9ca3af">블락된 인스턴스 없음</td>
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

const { data: blocks, refresh } = await useFetch('/api/admin/blocks')
const showForm = ref(false)
const form     = reactive({ domain: '', reason: '' })

async function addBlock() {
  await $fetch('/api/admin/blocks', { method: 'POST', body: form })
  form.domain = ''
  form.reason = ''
  await refresh()
}

async function removeBlock(id: string) {
  await $fetch(`/api/admin/blocks/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
.page-header  { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1            { font-size: 1.5rem; font-weight: 700; margin: 0; }
.form-card    { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1rem; margin-bottom: 1rem; }
.field-row    { display: flex; gap: 0.5rem; }
input         { padding: 0.5rem; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.9rem; }
.table-wrap   { background: white; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
table         { width: 100%; border-collapse: collapse; }
th            { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; color: #6b7280; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
td            { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #f3f4f6; }
.btn-primary  { padding: 0.5rem 1rem; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; }
.btn-danger-sm { padding: 0.25rem 0.5rem; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
</style>