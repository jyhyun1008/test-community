DROP INDEX "users_handle_domain_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "users_handle_domain_unique" ON "users" USING btree ("handle","domain");