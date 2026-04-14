<template>
  <div class="picker-wrap" ref="wrapRef">
    <button type="button" class="trigger-btn" @click="open = !open" title="커스텀 이모지">
      <IconMoodSmile :size="18" />
    </button>

    <div v-if="open" class="picker-dropdown">
      <div v-if="!emojis?.length" class="picker-empty">
        등록된 이모지 없음
      </div>
      <div v-else class="emoji-grid">
        <button
          v-for="e in emojis"
          :key="e.shortcode"
          type="button"
          class="emoji-btn"
          :title="`:${e.shortcode}:`"
          @click="select(e.shortcode)"
        >
          <img :src="e.url" :alt="`:${e.shortcode}:`" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IconMoodSmile } from '@tabler/icons-vue'

const emit = defineEmits<{ select: [shortcode: string] }>()

const wrapRef = ref<HTMLElement>()
const open    = ref(false)

const { data: emojis } = await useFetch('/api/emojis')

function select(shortcode: string) {
  emit('select', shortcode)
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (wrapRef.value && !wrapRef.value.contains(e.target as Node)) {
      open.value = false
    }
  })
})
</script>

<style scoped>
.picker-wrap       { position: relative; }
.trigger-btn       { background: none; border: none; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 6px; color: var(--text-muted); display: flex; align-items: center; }
.trigger-btn:hover { background: var(--bg-hover); color: var(--text-primary); }

.picker-dropdown { position: absolute; bottom: calc(100% + 6px); left: 0; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 0.5rem; z-index: 200; box-shadow: 0 4px 16px rgba(0,0,0,0.15); width: 220px; }
.picker-empty    { font-size: 0.8rem; color: var(--text-placeholder); text-align: center; padding: 0.5rem; }
.emoji-grid      { display: grid; grid-template-columns: repeat(6, 1fr); gap: 2px; }
.emoji-btn       { background: none; border: none; cursor: pointer; border-radius: 6px; padding: 4px; display: flex; align-items: center; justify-content: center; }
.emoji-btn:hover { background: var(--bg-hover); }
.emoji-btn img   { width: 28px; height: 28px; object-fit: contain; }
</style>
