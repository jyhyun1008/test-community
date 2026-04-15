import { requireAdmin } from '../../utils/admin'
import { getInstanceSettings, getInstanceOverrides } from '../../utils/instanceSettings'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [merged, overrides] = await Promise.all([
    getInstanceSettings(),
    getInstanceOverrides(),
  ])

  // 클라이언트에 전달: 머지된 현재 값 + 어떤 항목이 DB에서 덮여있는지 여부
  return { settings: merged, overrides }
})
