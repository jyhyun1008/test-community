import { requireAdmin } from '../../utils/admin'
import { saveInstanceOverrides } from '../../utils/instanceSettings'
import type { InstanceConfig } from '~/types/config'

// 수정 허용 섹션만 화이트리스트로 제한
const ALLOWED_KEYS: (keyof InstanceConfig)[] = [
  'info',
  'ui',
  'registrations',
  'content',
  'federation',
]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<Partial<InstanceConfig>>(event)
  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, message: '잘못된 요청입니다' })
  }

  // 허용된 키만 통과
  const patch: Partial<InstanceConfig> = {}
  for (const key of ALLOWED_KEYS) {
    if (key in body) {
      (patch as Record<string, unknown>)[key] = body[key]
    }
  }

  // federation 에서 도메인 관련 필드는 건드리지 않음 (연합우주 특성상)
  if (patch.federation) {
    const { allowedInstances, blockedInstances, blockedDomains, ...safeFed } = patch.federation as InstanceConfig['federation']
    // 블락 목록은 blocks 전용 API를 통해서만 수정하도록 분리
    patch.federation = safeFed as InstanceConfig['federation']
  }

  await saveInstanceOverrides(patch)

  return { ok: true }
})
