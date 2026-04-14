import { marked } from 'marked'
import { markedSmartypants } from 'marked-smartypants'

marked.use(markedSmartypants())
marked.setOptions({
  gfm: true,    // GitHub Flavored Markdown
  breaks: true, // 줄바꿈 적용
})

export function renderMarkdown(content: string): string {
  return marked.parse(content) as string
}