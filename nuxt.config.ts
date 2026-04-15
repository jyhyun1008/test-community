import instanceConfig from './config/instance'

export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      ],
    },
  },
  modules: ['@pinia/nuxt'],
  nitro: {
    moduleSideEffects: ['drizzle-orm/pg-core'],
    externals: {
      inline: ['drizzle-orm', 'drizzle-orm/pg-core', 'postgres'],
    },
  },
  vite: {
    optimizeDeps: {
      include: ['drizzle-orm', 'drizzle-orm/pg-core'],
    },
  },
  runtimeConfig: {
    // 서버 전용 (클라이언트에 절대 노출 X)
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),

    storage: {
      driver: process.env.STORAGE_DRIVER ?? 'local',
      endpoint: process.env.STORAGE_ENDPOINT,
      accessKey: process.env.STORAGE_ACCESS_KEY,
      secretKey: process.env.STORAGE_SECRET_KEY,
      bucket: process.env.STORAGE_BUCKET,
      publicUrl: process.env.STORAGE_PUBLIC_URL,
    },

    smtp: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },

    // instance.ts 전체를 서버 runtimeConfig로
    instance: instanceConfig,

    public: {
      // 클라이언트에서도 읽어야 하는 값만
      instanceDomain: process.env.INSTANCE_DOMAIN,
      instanceName: instanceConfig.info.name,
      maxPostLength: instanceConfig.content.maxPostLength,
      registrationsOpen: instanceConfig.registrations.open,
      federationEnabled: instanceConfig.federation.enabled,
      defaultTheme: instanceConfig.ui.defaultTheme,
      accentColor: instanceConfig.ui.accentColor,
    },
  },
})