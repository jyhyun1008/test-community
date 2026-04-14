<template>
  <div>
    <h1>유저 관리</h1>

    <input
      v-model="search"
      placeholder="핸들로 검색..."
      class="search-input"
    />

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>핸들</th>
            <th>이메일</th>
            <th>권한</th>
            <th>정지</th>
            <th>가입일</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>@{{ u.handle }}</td>
            <td>{{ u.email }}</td>
            <td>
              <select :value="u.role" @change="updateRole(u.id, ($event.target as HTMLSelectElement).value)">
                <option>user</option>
                <option>moderator</option>
                <option>admin</option>
              </select>
            </td>
            <td>
            <div style="display:flex;gap:0.5rem">
                <button
                :class="u.isSuspended ? 'btn-warning-sm' : 'btn-danger-sm'"
                @click="toggleSuspend(u.id, u.isSuspended)"
                >
                {{ u.isSuspended ? '정지 해제' : '정지' }}
                </button>
                <button
                class="btn-danger-sm"
                @click="deleteUser(u.id, u.handle)"
                >
                삭제
                </button>
            </div>
            </td>
            <td>{{ new Date(u.createdAt).toLocaleDateString('ko-KR') }}</td>
            <td>
              <NuxtLink :to="`/@${u.handle}`" class="btn-ghost-sm">프로필</NuxtLink>
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

const search = ref('')
const { data: users, refresh } = await useFetch('/api/admin/users', {
  query: { search },
  watch: [search],
})

async function updateRole(id: string, role: string) {
  await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: { role } })
  await refresh()
}

async function toggleSuspend(id: string, current: boolean) {
  await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: { isSuspended: !current } })
  await refresh()
}
async function deleteUser(id: string, handle: string) {
  if (!confirm(`@${handle} 계정을 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return
  await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>

<style scoped>
h1            { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
.search-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 1rem; font-size: 0.9rem; box-sizing: border-box; }
.table-wrap   { background: white; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
table         { width: 100%; border-collapse: collapse; }
th            { text-align: left; padding: 0.75rem 1rem; font-size: 0.8rem; color: #6b7280; border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
td            { padding: 0.75rem 1rem; font-size: 0.875rem; border-bottom: 1px solid #f4f4f4; }
select        { padding: 0.25rem; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 0.875rem; }
.btn-danger-sm  { padding: 0.25rem 0.5rem; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-warning-sm { padding: 0.25rem 0.5rem; background: #fef3c7; color: #d97706; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem; }
.btn-ghost-sm   { padding: 0.25rem 0.5rem; border: 1px solid #e5e7eb; border-radius: 4px; text-decoration: none; color: #374151; font-size: 0.8rem; }
</style>