export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const accentColor = config.public.accentColor as string

  if (accentColor) {
    document.documentElement.style.setProperty('--accent', accentColor)
  }

  const { init } = useTheme()
  init()
})