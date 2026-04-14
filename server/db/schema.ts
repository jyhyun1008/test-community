import {
  pgTable, uniqueIndex, uuid, text, boolean, timestamp,
  integer, jsonb, pgEnum, index
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm'

// ─── Enums ───────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['user', 'moderator', 'admin'])
export const visibilityEnum = pgEnum('visibility', ['public', 'unlisted', 'followers'])
export const activityTypeEnum = pgEnum('activity_type', [
  'Create', 'Update', 'Delete',
  'Follow', 'Unfollow', 'Accept', 'Reject',
  'Like', 'Undo', 'Announce',
])

// ─── Users ───────────────────────────────────────────────

export const users = pgTable('users', {
  id:          uuid('id').primaryKey().defaultRandom(),
  handle:      text('handle').notNull(),        // alice
  domain:      text('domain').notNull(),         // yourdomain.com
  displayName: text('display_name'),
  bio:         text('bio'),
  avatarUrl:   text('avatar_url'),
  headerUrl:   text('header_url'),

  email:       text('email').unique(),           // 로컬 유저만
  password:    text('password'),                 // bcrypt hash, 로컬만
  role:        roleEnum('role').default('user'),

  publicKey:   text('public_key').notNull(),     // HTTP Sig 검증
  privateKey:  text('private_key'),              // null = 원격 액터

  isLocal:     boolean('is_local').default(false),
  isBot:       boolean('is_bot').default(false),
  isLocked:    boolean('is_locked').default(false),  // 팔로우 승인제
  isSuspended: boolean('is_suspended').default(false),

  actorUrl:    text('actor_url').unique(),        // https://domain/users/alice
  inboxUrl:    text('inbox_url'),
  outboxUrl:   text('outbox_url'),
  followersUrl: text('followers_url'),

  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
}, t => [
  uniqueIndex('users_handle_domain_unique').on(t.handle, t.domain),  // unique로 변경
])

// ─── Channels ────────────────────────────────────────────

export const channels = pgTable('channels', {
  id:          uuid('id').primaryKey().defaultRandom(),
  slug:        text('slug').unique().notNull(),  // tech, general
  name:        text('name').notNull(),
  description: text('description'),
  iconUrl:     text('icon_url'),
  isNsfw:      boolean('is_nsfw').default(false),
  isArchived:  boolean('is_archived').default(false),
  sortOrder:   integer('sort_order').default(0),
  createdAt:   timestamp('created_at').defaultNow(),
})

// ─── Posts ───────────────────────────────────────────────

export const posts = pgTable('posts', {
  id:           uuid('id').primaryKey().defaultRandom(),
  apId:         text('ap_id').unique(),          // ActivityPub IRI
  authorId:     uuid('author_id').references(() => users.id, { onDelete: 'cascade' }),
  channelId:    uuid('channel_id').references(() => channels.id, { onDelete: 'set null' }),

  title:        text('title'),                   // 커뮤니티 글 제목 (선택)
  content:      text('content').notNull(),       // plaintext
  contentHtml:  text('content_html'),            // 렌더링된 HTML
  language:     text('language').default('ko'),

  visibility:   visibilityEnum('visibility').default('public'),
  isLocal:      boolean('is_local').default(false),
  isSensitive:  boolean('is_sensitive').default(false),
  isPinned:     boolean('is_pinned').default(false),

  replyToId:    uuid('reply_to_id'),             // 답글
  repostOfId:   uuid('repost_of_id'),            // 부스트/리포스트

  likeCount:    integer('like_count').default(0),
  replyCount:   integer('reply_count').default(0),
  repostCount:  integer('repost_count').default(0),

  createdAt:    timestamp('created_at').defaultNow(),
  updatedAt:    timestamp('updated_at').defaultNow(),
}, t => [
  index('posts_author_idx').on(t.authorId),
  index('posts_channel_idx').on(t.channelId),
  index('posts_created_idx').on(t.createdAt),
])

// ─── Media ───────────────────────────────────────────────

export const media = pgTable('media', {
  id:          uuid('id').primaryKey().defaultRandom(),
  postId:      uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  uploaderId:  uuid('uploader_id').references(() => users.id),
  url:         text('url').notNull(),            // R2 public URL
  mimeType:    text('mime_type').notNull(),
  altText:     text('alt_text'),
  blurhash:    text('blurhash'),
  width:       integer('width'),
  height:      integer('height'),
  sizeBytes:   integer('size_bytes'),
  createdAt:   timestamp('created_at').defaultNow(),
})

// ─── Follows ─────────────────────────────────────────────

export const follows = pgTable('follows', {
  id:          uuid('id').primaryKey().defaultRandom(),
  followerId:  uuid('follower_id').references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').references(() => users.id, { onDelete: 'cascade' }),
  accepted:    boolean('accepted').default(true), // 승인제면 false로 시작
  createdAt:   timestamp('created_at').defaultNow(),
}, t => [
  index('follows_pair_idx').on(t.followerId, t.followingId),
])

// ─── Likes ───────────────────────────────────────────────

export const likes = pgTable('likes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  postId:    uuid('post_id').references(() => posts.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, t => [
  index('likes_pair_idx').on(t.userId, t.postId),
])

// ─── Activities (AP 로그) ────────────────────────────────

export const activities = pgTable('activities', {
  id:        uuid('id').primaryKey().defaultRandom(),
  apId:      text('ap_id').unique(),
  type:      activityTypeEnum('type').notNull(),
  actorId:   uuid('actor_id').references(() => users.id),
  objectId:  text('object_id'),                  // AP IRI
  raw:       jsonb('raw'),                       // 원본 JSON-LD
  processed: boolean('processed').default(false),
  error:     text('error'),                      // 처리 실패 사유
  createdAt: timestamp('created_at').defaultNow(),
}, t => [
  index('activities_actor_idx').on(t.actorId),
  index('activities_processed_idx').on(t.processed),
])

// ─── Custom Emojis ───────────────────────────────────────

export const customEmojis = pgTable('custom_emojis', {
  id:              uuid('id').primaryKey().defaultRandom(),
  shortcode:       text('shortcode').notNull(),       // blobcat (콜론 없이)
  url:             text('url').notNull(),              // 이미지 full URL
  domain:          text('domain'),                    // null = 로컬, 'mastodon.social' = 리모트
  visibleInPicker: boolean('visible_in_picker').notNull().default(true),
  createdAt:       timestamp('created_at').defaultNow(),
}, t => [
  // 로컬 이모지(domain IS NULL)의 shortcode 중복 방지
  uniqueIndex('custom_emojis_local_unique').on(t.shortcode).where(sql`${t.domain} IS NULL`),
])

// ─── Instance Blocks ─────────────────────────────────────

export const instanceBlocks = pgTable('instance_blocks', {
  id:        uuid('id').primaryKey().defaultRandom(),
  domain:    text('domain').unique().notNull(),
  reason:    text('reason'),
  createdAt: timestamp('created_at').defaultNow(),
})


export const usersRelations = relations(users, ({ many }) => ({
  posts:      many(posts),
  media:      many(media),
  likes:      many(likes),
  following:  many(follows, { relationName: 'following' }),
  followers:  many(follows, { relationName: 'followers' }),
}))

export const channelsRelations = relations(channels, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  author:  one(users,    { fields: [posts.authorId],  references: [users.id] }),
  channel: one(channels, { fields: [posts.channelId], references: [channels.id] }),
  media:   many(media),
  likes:   many(likes),
}))

export const mediaRelations = relations(media, ({ one }) => ({
  post:     one(posts, { fields: [media.postId],     references: [posts.id] }),
  uploader: one(users, { fields: [media.uploaderId], references: [users.id] }),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower:  one(users, { fields: [follows.followerId],  references: [users.id], relationName: 'following' }),
  following: one(users, { fields: [follows.followingId], references: [users.id], relationName: 'followers' }),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, { fields: [likes.userId], references: [users.id] }),
  post: one(posts, { fields: [likes.postId], references: [posts.id] }),
}))