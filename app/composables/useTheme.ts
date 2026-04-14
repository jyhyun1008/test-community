export const useTheme = () => {
  const isDark = useState('isDark', () => false)

  const apply = (dark: boolean) => {
    if (!process.client) return
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }

  const init = () => {
    if (!process.client) return
    const saved = localStorage.getItem('theme')
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    apply(isDark.value)
  }

  const toggle = () => {
    isDark.value = !isDark.value
    if (process.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      apply(isDark.value)
    }
  }

  return { isDark, init, toggle }
}
