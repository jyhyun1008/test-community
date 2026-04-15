import { db } from '../db'
import { instanceSettings } from '../db/schema'
import { eq } from 'drizzle-orm'
import type { InstanceConfig } from '~/types/config'

/** config/instance.ts 의 정적 기본값에 DB 오버라이드를 깊게 병합한 설정을 반환 */
export async function getInstanceSettings(): Promise<InstanceConfig> {
  const config = useRuntimeConfig()
  const base = config.instance as InstanceConfig

  try {
    const row = await db.query.instanceSettings.findFirst({
      where: eq(instanceSettings.id, 1),
    })
    if (!row || !row.overrides || Object.keys(row.overrides as object).length === 0) {
      return base
    }
    return deepMerge(base, row.overrides as Partial<InstanceConfig>)
  } catch {
    // 테이블 미존재(마이그레이션 미실행) 등의 경우 기본값으로 폴백
    return base
  }
}

/** DB에 저장된 오버라이드 부분만 반환 (관리자 페이지 초기값 로드용) */
export async function getInstanceOverrides(): Promise<Partial<InstanceConfig>> {
  try {
    const row = await db.query.instanceSettings.findFirst({
      where: eq(instanceSettings.id, 1),
    })
    return (row?.overrides ?? {}) as Partial<InstanceConfig>
  } catch {
    return {}
  }
}

/** 오버라이드를 DB에 upsert */
export async function saveInstanceOverrides(patch: Partial<InstanceConfig>): Promise<void> {
  const existing = await getInstanceOverrides()
  const merged = deepMerge(existing, patch)

  await db
    .insert(instanceSettings)
    .values({ id: 1, overrides: merged, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: instanceSettings.id,
      set: { overrides: merged, updatedAt: new Date() },
    })
}

// ─── 유틸 ─────────────────────────────────────────────────

function deepMerge<T extends object>(base: T, override: Partial<T>): T {
  const result = { ...base }
  for (const key in override) {
    const val = override[key]
    if (val !== undefined && val !== null) {
      if (isPlainObject(val) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key] as object, val as object) as T[typeof key]
      } else {
        result[key] = val as T[typeof key]
      }
    }
  }
  return result
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}
