<template>
  <div>
    <h1>대시보드</h1>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">{{ stats?.userCount ?? '-' }}</div>
        <div class="stat-label">전체 유저</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.postCount ?? '-' }}</div>
        <div class="stat-label">전체 글</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ stats?.channelCount ?? '-' }}</div>
        <div class="stat-label">채널</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const headers = useRequestHeaders(['cookie'])
const { data: stats } = await useFetch('/api/admin/stats', { headers })
</script>

<style scoped>
h1          { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
.stats      { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.stat-card  { background: white; border: 1px solid #e5e7eb; border-radius: 10px; padding: 1.5rem; text-align: center; }
.stat-value { font-size: 2rem; font-weight: 700; color: #6366f1; }
.stat-label { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
</style>