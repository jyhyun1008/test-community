import type { InstanceConfig } from '~/types/config'

const config: InstanceConfig = {
  // ─── 인스턴스 기본 정보 ─────────────────────────────
  info: {
    name: 'My Fediverse Community',
    shortDescription: '나만의 연합우주 커뮤니티',
    description: '인스턴스 설명을 입력하세요',
    contactEmail: 'admin@yourdomain.com',
    languages: ['ko'],
    version: '0.1.0',
  },

  // ─── 연합(Federation) 설정 ──────────────────────────
  federation: {
    enabled: true,
    allowedInstances: [],      // 비어있으면 전체 허용
    blockedInstances: [],      // 인스턴스 도메인 블락
    blockedDomains: [],        // 특정 도메인 글 수신 차단
    requireHttpSignature: true,
    deliveryRetries: 5,
    deliveryTimeout: 10_000,   // ms
  },

  // ─── 가입/계정 정책 ─────────────────────────────────
  registrations: {
    open: true,
    requireEmailVerification: true,
    requireApproval: false,    // true면 관리자 승인 후 가입
    inviteOnly: false,
    maxUsersPerInstance: 0,    // 0 = 무제한
    defaultRole: 'user',       // user | moderator | admin
  },

  // ─── 채널(카테고리) 기본 생성 ───────────────────────
  // 설치 시 시드 데이터로 사용
  defaultChannels: [
    { slug: 'general', name: '일반', description: '자유 토론' },
    { slug: 'meta',    name: '메타', description: '이 인스턴스 관련' },
  ],

  // ─── 콘텐츠 정책 ────────────────────────────────────
  content: {
    maxPostLength: 5000,       // 글자 제한
    maxMediaPerPost: 4,
    maxMediaSizeMB: 40,
    allowedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'],
    enableMarkdown: true,
    enableMentions: true,
    enableHashtags: true,
    localTimelineEnabled: true,
    federatedTimelineEnabled: true,
  },

  // ─── Rate Limiting ──────────────────────────────────
  rateLimit: {
    api: { windowMs: 60_000, max: 300 },
    auth: { windowMs: 60_000, max: 10 },
    mediaUpload: { windowMs: 3_600_000, max: 50 },
    activityPubInbox: { windowMs: 60_000, max: 500 },
  },

  // ─── UI 설정 ────────────────────────────────────────
  ui: {
    defaultTheme: 'system',    // light | dark | system
    accentColor: 'var(--accent)',
    logoUrl: '',               // 비어있으면 기본 로고
    faviconUrl: '',
    customCss: '',
    showFederatedTimeline: true,
    postSortDefault: 'latest', // latest | hot | top
  },
}

export default config