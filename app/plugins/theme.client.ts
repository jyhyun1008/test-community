// app/plugins/theme.client.ts  ← 파일명에 .client 추가
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const accentColor = config.public.accentColor as string

  if (accentColor) {
    document.documentElement.style.setProperty('--accent', accentColor)
  }
})