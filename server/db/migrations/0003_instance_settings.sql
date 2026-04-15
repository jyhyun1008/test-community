CREATE TABLE "instance_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"overrides" jsonb DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
-- 초기 행 삽입 (오버라이드 없는 빈 상태)
INSERT INTO "instance_settings" ("id", "overrides") VALUES (1, '{}') ON CONFLICT DO NOTHING;
