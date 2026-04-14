import { db } from '../../db'
import { customEmojis } from '../../db/schema'
import { eq, isNull, and } from 'drizzle-orm'

// 공개 엔드포인트 — 로컬 커스텀 이모지 목록 (피커용)
export default defineEventHandler(async () => {
  return db.select({
    shortcode:       customEmojis.shortcode,
    url:             customEmojis.url,
    visibleInPicker: customEmojis.visibleInPicker,
  })
    .from(customEmojis)
    .where(and(isNull(customEmojis.domain), eq(customEmojis.visibleInPicker, true)))
})
