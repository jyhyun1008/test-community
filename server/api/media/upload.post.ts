import { db } from '../../db'
import { media } from '../../db/schema'
import { requireAuth } from '../../utils/auth'
import { uploadFile } from '../../utils/storage'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_MB   = Number(process.env.MAX_MEDIA_SIZE_MB ?? 10)

export default defineEventHandler(async (event) => {
  const user     = await requireAuth(event)
  const formData = await readMultipartFormData(event)

  if (!formData?.length) {
    throw createError({ statusCode: 400, message: '파일이 없습니다' })
  }

  const file = formData[0]

  if (!file.type || !ALLOWED_TYPES.includes(file.type)) {
    throw createError({ statusCode: 400, message: '지원하지 않는 파일 형식입니다' })
  }

  if (file.data.length > MAX_SIZE_MB * 1024 * 1024) {
    throw createError({ statusCode: 400, message: `${MAX_SIZE_MB}MB 이하만 업로드 가능합니다` })
  }

  const url = await uploadFile(file.data, file.type, 'media')

  const [uploaded] = await db.insert(media).values({
    uploaderId: user.id,
    url,
    mimeType:   file.type,
    sizeBytes:  file.data.length,
  }).returning()

  return uploaded
})