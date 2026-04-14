export interface InstanceConfig {
  info: {
    name: string
    shortDescription: string
    description: string
    contactEmail: string
    languages: string[]
    version: string
  }
  federation: {
    enabled: boolean
    allowedInstances: string[]
    blockedInstances: string[]
    blockedDomains: string[]
    requireHttpSignature: boolean
    deliveryRetries: number
    deliveryTimeout: number
  }
  registrations: {
    open: boolean
    requireEmailVerification: boolean
    requireApproval: boolean
    inviteOnly: boolean
    maxUsersPerInstance: number
    defaultRole: 'user' | 'moderator' | 'admin'
  }
  defaultChannels: Array<{
    slug: string
    name: string
    description: string
  }>
  content: {
    maxPostLength: number
    maxMediaPerPost: number
    maxMediaSizeMB: number
    allowedMediaTypes: string[]
    enableMarkdown: boolean
    enableMentions: boolean
    enableHashtags: boolean
    localTimelineEnabled: boolean
    federatedTimelineEnabled: boolean
  }
  rateLimit: {
    api: RateLimitRule
    auth: RateLimitRule
    mediaUpload: RateLimitRule
    activityPubInbox: RateLimitRule
  }
  ui: {
    defaultTheme: 'light' | 'dark' | 'system'
    accentColor: string
    logoUrl: string
    faviconUrl: string
    customCss: string
    showFederatedTimeline: boolean
    postSortDefault: 'latest' | 'hot' | 'top'
  }
}

interface RateLimitRule {
  windowMs: number
  max: number
}