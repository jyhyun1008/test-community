CREATE TABLE "custom_emojis" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shortcode" text NOT NULL,
	"url" text NOT NULL,
	"domain" text,
	"visible_in_picker" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "custom_emojis_local_unique" ON "custom_emojis" USING btree ("shortcode") WHERE "custom_emojis"."domain" IS NULL;