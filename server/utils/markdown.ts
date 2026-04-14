import { marked } from 'marked'
import { markedSmartypants } from 'marked-smartypants'

marked.use(markedSmartypants())
marked.setOptions({
  gfm: true,
  breaks: true,
})

// :shortcode: → <img> 치환 (pre/code 블록 내부는 스킵)
function applyCustomEmojis(html: string, emojis: Record<string, string>): string {
  const parts = html.split(/(<(?:pre|code)[^>]*>[\s\S]*?<\/(?:pre|code)>)/gi)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part // code/pre 블록 그대로 반환
    return part.replace(/:([a-zA-Z0-9_]+):/g, (match, shortcode) => {
      const url = emojis[shortcode]
      if (!url) return match
      return `<img class="custom-emoji" src="${url}" alt=":${shortcode}:" title=":${shortcode}:" loading="lazy" />`
    })
  }).join('')
}

export function renderMarkdown(content: string, emojis: Record<string, string> = {}): string {
  const html = marked.parse(content) as string
  if (Object.keys(emojis).length === 0) return html
  return applyCustomEmojis(html, emojis)
}
