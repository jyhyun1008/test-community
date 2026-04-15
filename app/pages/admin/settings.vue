<template>
  <div>
    <div class="page-header">
      <h1>서버 설정</h1>
      <span class="domain-badge">도메인: {{ domain }}</span>
    </div>

    <p class="subtitle">
      변경한 내용은 DB에 저장되어 런타임에 즉시 반영됩니다.
      <code>config/instance.ts</code>의 값이 기본값으로 유지되며, 여기서 설정한 항목만 덮어씁니다.
    </p>

    <!-- 탭 -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >{{ tab.label }}</button>
    </div>

    <div v-if="fetchError" class="error-box">
      설정을 불러오지 못했습니다. 마이그레이션이 실행됐는지 확인해주세요.<br />
      <code>{{ fetchError }}</code>
    </div>

    <div v-else-if="form" class="form-body">

      <!-- ── 기본 정보 ───────────────────────────────────── -->
      <div v-if="activeTab === 'info'" class="section-card">
        <h2>기본 정보</h2>
        <p class="section-desc">다른 서버에 ActivityPub/NodeInfo로 노출되는 인스턴스 메타데이터입니다.</p>

        <div class="field">
          <label>인스턴스 이름</label>
          <input v-model="form.info.name" placeholder="My Fediverse Community" />
        </div>
        <div class="field">
          <label>짧은 설명 (한 줄)</label>
          <input v-model="form.info.shortDescription" placeholder="오픈 커뮤니티" />
        </div>
        <div class="field">
          <label>상세 설명</label>
          <textarea v-model="form.info.description" rows="4" placeholder="이 인스턴스에 대한 자세한 설명..." />
        </div>
        <div class="field">
          <label>관리자 연락처 이메일</label>
          <input v-model="form.info.contactEmail" type="email" placeholder="admin@yourdomain.com" />
        </div>
      </div>

      <!-- ── UI 설정 ─────────────────────────────────────── -->
      <div v-if="activeTab === 'ui'" class="section-card">
        <h2>UI 설정</h2>
        <p class="section-desc">사이트 외형과 브랜딩을 설정합니다.</p>

        <div class="field-row">
          <div class="field">
            <label>강조 색상 (Accent Color)</label>
            <div class="color-row">
              <input type="color" v-model="form.ui.accentColor" class="color-swatch" />
              <input v-model="form.ui.accentColor" placeholder="#ff9899" class="color-text" />
            </div>
          </div>
          <div class="field">
            <label>기본 테마</label>
            <select v-model="form.ui.defaultTheme">
              <option value="system">시스템 설정 따르기</option>
              <option value="light">라이트</option>
              <option value="dark">다크</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label>로고 URL (비워두면 기본 로고)</label>
          <input v-model="form.ui.logoUrl" placeholder="https://..." />
        </div>
        <div class="field">
          <label>파비콘 URL (비워두면 기본 파비콘)</label>
          <input v-model="form.ui.faviconUrl" placeholder="https://..." />
        </div>

        <div class="field-row checks">
          <label>
            <input type="checkbox" v-model="form.ui.showFederatedTimeline" />
            연합 타임라인 UI 표시
          </label>
        </div>

        <div class="field">
          <label>기본 글 정렬</label>
          <select v-model="form.ui.postSortDefault">
            <option value="latest">최신순</option>
            <option value="hot">인기순</option>
            <option value="top">베스트</option>
          </select>
        </div>

        <div class="field">
          <label>커스텀 CSS (고급)</label>
          <textarea v-model="form.ui.customCss" rows="6" placeholder=":root { --accent: #ff9899; }" class="mono" />
        </div>
      </div>

      <!-- ── 가입 정책 ───────────────────────────────────── -->
      <div v-if="activeTab === 'registrations'" class="section-card">
        <h2>가입 정책</h2>
        <p class="section-desc">신규 계정 가입 방식을 설정합니다.</p>

        <div class="toggle-list">
          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">가입 허용</span>
              <span class="toggle-desc">끄면 신규 가입이 완전히 차단됩니다</span>
            </div>
            <input type="checkbox" v-model="form.registrations.open" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">이메일 인증 필요</span>
              <span class="toggle-desc">가입 시 이메일 주소를 인증해야 합니다</span>
            </div>
            <input type="checkbox" v-model="form.registrations.requireEmailVerification" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">관리자 승인 필요</span>
              <span class="toggle-desc">관리자가 직접 승인해야 가입이 완료됩니다</span>
            </div>
            <input type="checkbox" v-model="form.registrations.requireApproval" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">초대 전용</span>
              <span class="toggle-desc">초대 링크가 있어야만 가입 가능합니다</span>
            </div>
            <input type="checkbox" v-model="form.registrations.inviteOnly" class="toggle-check" />
          </label>
        </div>

        <div class="field" style="margin-top: 1rem;">
          <label>최대 계정 수 (0 = 무제한)</label>
          <input type="number" v-model.number="form.registrations.maxUsersPerInstance" min="0" style="width:120px" />
        </div>
      </div>

      <!-- ── 연합 설정 ───────────────────────────────────── -->
      <div v-if="activeTab === 'federation'" class="section-card">
        <h2>연합 설정</h2>
        <p class="section-desc">
          ActivityPub 연합 동작을 설정합니다.
          <strong>도메인은 연합우주 특성상 변경할 수 없습니다.</strong>
          인스턴스 블락은 <NuxtLink to="/admin/blocks">블락 관리</NuxtLink> 페이지에서 관리하세요.
        </p>

        <div class="toggle-list">
          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">연합 활성화</span>
              <span class="toggle-desc">끄면 이 인스턴스는 다른 서버와 연합하지 않습니다</span>
            </div>
            <input type="checkbox" v-model="form.federation.enabled" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">HTTP 서명 검증 필요</span>
              <span class="toggle-desc">인박스로 들어오는 활동의 서명을 검증합니다</span>
            </div>
            <input type="checkbox" v-model="form.federation.requireHttpSignature" class="toggle-check" />
          </label>
        </div>

        <div class="field-row" style="margin-top: 1rem;">
          <div class="field">
            <label>배달 재시도 횟수</label>
            <input type="number" v-model.number="form.federation.deliveryRetries" min="0" max="20" style="width:80px" />
          </div>
          <div class="field">
            <label>배달 타임아웃 (ms)</label>
            <input type="number" v-model.number="form.federation.deliveryTimeout" min="1000" step="1000" style="width:120px" />
          </div>
        </div>
      </div>

      <!-- ── 콘텐츠 정책 ─────────────────────────────────── -->
      <div v-if="activeTab === 'content'" class="section-card">
        <h2>콘텐츠 정책</h2>
        <p class="section-desc">글 작성 및 미디어 관련 제한을 설정합니다.</p>

        <div class="field-row">
          <div class="field">
            <label>최대 글 길이 (글자)</label>
            <input type="number" v-model.number="form.content.maxPostLength" min="1" style="width:120px" />
          </div>
          <div class="field">
            <label>글 당 최대 미디어 수</label>
            <input type="number" v-model.number="form.content.maxMediaPerPost" min="1" max="20" style="width:80px" />
          </div>
          <div class="field">
            <label>미디어 최대 용량 (MB)</label>
            <input type="number" v-model.number="form.content.maxMediaSizeMB" min="1" style="width:100px" />
          </div>
        </div>

        <div class="toggle-list" style="margin-top:1rem">
          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">로컬 타임라인</span>
              <span class="toggle-desc">이 인스턴스 유저의 글만 모아 보는 타임라인</span>
            </div>
            <input type="checkbox" v-model="form.content.localTimelineEnabled" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">연합 타임라인</span>
              <span class="toggle-desc">연합된 모든 서버의 글을 볼 수 있는 타임라인</span>
            </div>
            <input type="checkbox" v-model="form.content.federatedTimelineEnabled" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">마크다운 허용</span>
            </div>
            <input type="checkbox" v-model="form.content.enableMarkdown" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">멘션 허용</span>
            </div>
            <input type="checkbox" v-model="form.content.enableMentions" class="toggle-check" />
          </label>

          <label class="toggle-item">
            <div class="toggle-info">
              <span class="toggle-label">해시태그 허용</span>
            </div>
            <input type="checkbox" v-model="form.content.enableHashtags" class="toggle-check" />
          </label>
        </div>
      </div>

      <!-- 저장 버튼 -->
      <div class="save-bar">
        <span v-if="saved" class="saved-msg">저장됨</span>
        <button class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <div v-else class="loading">불러오는 중...</div>

  </div>
</template>

<script setup lang="ts">
import type { InstanceConfig } from '~/types/config'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const config  = useRuntimeConfig()
const domain  = config.public.instanceDomain

const tabs = [
  { key: 'info',          label: '기본 정보'  },
  { key: 'ui',            label: 'UI 설정'    },
  { key: 'registrations', label: '가입 정책'  },
  { key: 'federation',    label: '연합 설정'  },
  { key: 'content',       label: '콘텐츠 정책' },
]
const activeTab = ref('info')

const headers = useRequestHeaders(['cookie'])
const { data, error } = await useFetch('/api/admin/settings', { headers })

const fetchError = computed(() =>
  error.value ? (error.value.data?.message ?? error.value.message ?? '알 수 없는 오류') : null
)

// merged 설정을 폼 초기값으로 사용
const form = ref<InstanceConfig | null>(null)
if (data.value?.settings) {
  form.value = JSON.parse(JSON.stringify(data.value.settings)) as InstanceConfig
}

const saving = ref(false)
const saved  = ref(false)

async function save() {
  if (!form.value) return
  saving.value = true
  saved.value  = false
  try {
    await $fetch('/api/admin/settings', {
      method: 'PATCH',
      body: form.value,
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.page-header   { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
h1             { font-size: 1.5rem; font-weight: 700; margin: 0; color: var(--text-primary); }
.domain-badge  { font-size: 0.8rem; background: var(--bg-subtle); border: 1px solid var(--border); border-radius: 20px; padding: 0.2rem 0.75rem; color: var(--text-muted); font-family: monospace; }
.subtitle      { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6; }
.subtitle code { background: var(--bg-subtle); padding: 0.1rem 0.4rem; border-radius: 4px; font-size: 0.8rem; }

.tabs          { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--border); margin-bottom: 1.5rem; }
.tab-btn       { padding: 0.5rem 1rem; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-size: 0.875rem; color: var(--text-muted); font-family: inherit; margin-bottom: -1px; }
.tab-btn:hover { color: var(--text-primary); }
.tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 500; }

.section-card  { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; margin-bottom: 1rem; }
h2             { font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem; color: var(--text-primary); }
.section-desc  { font-size: 0.8rem; color: var(--text-muted); margin: 0 0 1.25rem; line-height: 1.6; }
.section-desc a { color: var(--accent); text-decoration: none; }
.section-desc a:hover { text-decoration: underline; }

.field         { margin-bottom: 1rem; }
.field-row     { display: flex; gap: 1.5rem; flex-wrap: wrap; }
label          { display: block; font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.3rem; font-weight: 500; }
input[type="text"],
input[type="email"],
input[type="number"],
input:not([type]),
select,
textarea       { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border); border-radius: 6px; font-size: 0.875rem; background: var(--bg-base, var(--bg-surface)); color: var(--text-primary); font-family: inherit; box-sizing: border-box; }
select         { cursor: pointer; }
textarea       { resize: vertical; line-height: 1.5; }
textarea.mono  { font-family: monospace; font-size: 0.8rem; }

.color-row     { display: flex; align-items: center; gap: 0.5rem; }
.color-swatch  { width: 44px; height: 36px; padding: 2px; border-radius: 6px; cursor: pointer; flex-shrink: 0; }
.color-text    { flex: 1; }

/* 토글 리스트 */
.toggle-list   { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.toggle-item   { display: flex; align-items: center; justify-content: space-between; padding: 0.875rem 1rem; cursor: pointer; border-bottom: 1px solid var(--border-subtle, var(--border)); }
.toggle-item:last-child { border-bottom: none; }
.toggle-item:hover { background: var(--bg-hover); }
.toggle-info   { display: flex; flex-direction: column; gap: 0.15rem; }
.toggle-label  { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }
.toggle-desc   { font-size: 0.75rem; color: var(--text-muted); }
.toggle-check  { width: 1rem; height: 1rem; cursor: pointer; flex-shrink: 0; }

/* 저장 바 */
.save-bar      { display: flex; align-items: center; justify-content: flex-end; gap: 1rem; padding-top: 0.5rem; }
.saved-msg     { font-size: 0.875rem; color: #10b981; }
.btn-primary   { padding: 0.5rem 1.5rem; background: var(--accent); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; font-family: inherit; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.loading       { color: var(--text-muted); padding: 2rem; text-align: center; }
.error-box     { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 1rem 1.25rem; color: #b91c1c; font-size: 0.875rem; line-height: 1.7; }
.error-box code { font-size: 0.8rem; display: block; margin-top: 0.5rem; color: #7f1d1d; word-break: break-all; }
</style>
