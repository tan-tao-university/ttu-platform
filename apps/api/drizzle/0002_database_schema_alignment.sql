ALTER TABLE "content_items" RENAME TO "contents";--> statement-breakpoint
ALTER TABLE "people_translations" RENAME TO "person_translations";--> statement-breakpoint
ALTER TABLE "academic_program_translations" RENAME TO "program_translations";--> statement-breakpoint
ALTER TABLE "academic_programs" RENAME TO "programs";--> statement-breakpoint
ALTER TABLE "programs" DROP CONSTRAINT "academic_programs_code_unique";--> statement-breakpoint
ALTER TABLE "page_sections" DROP CONSTRAINT "uq_page_sections_page_order";--> statement-breakpoint
ALTER TABLE "programs" DROP CONSTRAINT "academic_programs_status_check";--> statement-breakpoint
ALTER TABLE "contents" DROP CONSTRAINT "content_items_type_check";--> statement-breakpoint
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_target_check";--> statement-breakpoint
ALTER TABLE "program_translations" DROP CONSTRAINT "academic_program_translations_program_id_academic_programs_id_fk";
--> statement-breakpoint
ALTER TABLE "program_translations" DROP CONSTRAINT "academic_program_translations_locale_locales_code_fk";
--> statement-breakpoint
ALTER TABLE "content_category_assignments" DROP CONSTRAINT "content_category_assignments_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "contents" DROP CONSTRAINT "content_items_author_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contents" DROP CONSTRAINT "content_items_featured_media_id_media_assets_id_fk";
--> statement-breakpoint
ALTER TABLE "contents" DROP CONSTRAINT "content_items_created_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "contents" DROP CONSTRAINT "content_items_updated_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "content_revisions" DROP CONSTRAINT "content_revisions_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "content_tag_assignments" DROP CONSTRAINT "content_tag_assignments_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "content_translations" DROP CONSTRAINT "content_translations_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "events" DROP CONSTRAINT "events_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_content_id_content_items_id_fk";
--> statement-breakpoint
ALTER TABLE "person_translations" DROP CONSTRAINT "people_translations_person_id_people_id_fk";
--> statement-breakpoint
ALTER TABLE "person_translations" DROP CONSTRAINT "people_translations_locale_locales_code_fk";
--> statement-breakpoint
ALTER TABLE "public_routes" DROP CONSTRAINT "public_routes_content_id_content_items_id_fk";
--> statement-breakpoint
DROP INDEX "idx_audit_occurred_at";--> statement-breakpoint
DROP INDEX "idx_audit_actor";--> statement-breakpoint
DROP INDEX "idx_audit_entity";--> statement-breakpoint
DROP INDEX "idx_content_items_type_active";--> statement-breakpoint
DROP INDEX "idx_content_scheduler";--> statement-breakpoint
DROP INDEX "idx_content_translation_public_feed";--> statement-breakpoint
ALTER TABLE "program_translations" DROP CONSTRAINT "academic_program_translations_program_id_locale_pk";--> statement-breakpoint
ALTER TABLE "person_translations" DROP CONSTRAINT "people_translations_person_id_locale_pk";--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "metadata" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "audit_logs" ALTER COLUMN "metadata" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "media_assets" ALTER COLUMN "checksum_sha256" SET DATA TYPE char(64);--> statement-breakpoint
ALTER TABLE "page_sections" ALTER COLUMN "component_key" SET DATA TYPE varchar(150);--> statement-breakpoint
ALTER TABLE "page_sections" ALTER COLUMN "sort_order" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "program_translations" ADD CONSTRAINT "program_translations_program_id_locale_pk" PRIMARY KEY("program_id","locale");--> statement-breakpoint
ALTER TABLE "person_translations" ADD CONSTRAINT "person_translations_person_id_locale_pk" PRIMARY KEY("person_id","locale");--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "request_id" varchar(100);--> statement-breakpoint
ALTER TABLE "program_translations" ADD CONSTRAINT "program_translations_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_translations" ADD CONSTRAINT "program_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_category_assignments" ADD CONSTRAINT "content_category_assignments_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_featured_media_id_media_assets_id_fk" FOREIGN KEY ("featured_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tag_assignments" ADD CONSTRAINT "content_tag_assignments_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_translations" ADD CONSTRAINT "person_translations_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "person_translations" ADD CONSTRAINT "person_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_routes" ADD CONSTRAINT "public_routes_content_id_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_programs_status_sort" ON "programs" USING btree ("status","sort_order") WHERE "programs"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_audit_actor_time" ON "audit_logs" USING btree ("actor_user_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_entity_time" ON "audit_logs" USING btree ("entity_type","entity_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_contents_type_active" ON "contents" USING btree ("type") WHERE "contents"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_content_revisions_entity_locale_version" ON "content_revisions" USING btree ("content_id","locale","version_number" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_content_translation_scheduler" ON "content_translations" USING btree ("scheduled_at") WHERE "content_translations"."status" = 'SCHEDULED';--> statement-breakpoint
CREATE INDEX "idx_page_revisions_entity_locale_version" ON "page_revisions" USING btree ("page_id","locale","version_number" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_page_sections_page_order" ON "page_sections" USING btree ("page_id","sort_order");--> statement-breakpoint
CREATE INDEX "idx_page_translations_status" ON "page_translations" USING btree ("locale","status") WHERE "page_translations"."status" <> 'ARCHIVED';--> statement-breakpoint
CREATE INDEX "idx_page_translation_scheduler" ON "page_translations" USING btree ("scheduled_at") WHERE "page_translations"."status" = 'SCHEDULED';--> statement-breakpoint
CREATE UNIQUE INDEX "uq_redirects_active_locale_source" ON "redirects" USING btree ("locale","source_path") WHERE "redirects"."is_active" = true AND "redirects"."locale" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_redirects_active_global_source" ON "redirects" USING btree ("source_path") WHERE "redirects"."is_active" = true AND "redirects"."locale" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_content_translation_public_feed" ON "content_translations" USING btree ("locale","published_at" DESC NULLS LAST) WHERE "content_translations"."status" = 'PUBLISHED';--> statement-breakpoint
ALTER TABLE "menu_items" DROP COLUMN "target";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "scheduled_at";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "published_at";--> statement-breakpoint
ALTER TABLE "redirects" DROP COLUMN "notes";--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_code_unique" UNIQUE("code");--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_status_check" CHECK ("programs"."status" IN ('DRAFT','ACTIVE','INACTIVE','ARCHIVED'));--> statement-breakpoint
ALTER TABLE "contents" ADD CONSTRAINT "contents_type_check" CHECK ("contents"."type" IN ('NEWS','ANNOUNCEMENT','PRESS_RELEASE','RESEARCH_ARTICLE','EVENT'));