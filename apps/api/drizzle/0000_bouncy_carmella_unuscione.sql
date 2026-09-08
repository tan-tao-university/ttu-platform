CREATE TABLE "academic_program_translations" (
	"program_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"summary" text,
	"description" jsonb,
	CONSTRAINT "academic_program_translations_program_id_locale_pk" PRIMARY KEY("program_id","locale")
);
--> statement-breakpoint
CREATE TABLE "academic_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(64),
	"degree_level" varchar(30),
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academic_programs_code_unique" UNIQUE("code"),
	CONSTRAINT "academic_programs_status_check" CHECK ("academic_programs"."status" IN ('DRAFT','ACTIVE','INACTIVE','ARCHIVED'))
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "audit_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"actor_user_id" uuid,
	"action" varchar(150) NOT NULL,
	"entity_type" varchar(100),
	"entity_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" "inet",
	"user_agent" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"code" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_code_unique" UNIQUE("code"),
	CONSTRAINT "categories_parent_not_self_check" CHECK ("categories"."parent_id" IS NULL OR "categories"."parent_id" <> "categories"."id")
);
--> statement-breakpoint
CREATE TABLE "category_translations" (
	"category_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" text,
	CONSTRAINT "category_translations_category_id_locale_pk" PRIMARY KEY("category_id","locale")
);
--> statement-breakpoint
CREATE TABLE "content_category_assignments" (
	"content_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_category_assignments_content_id_category_id_pk" PRIMARY KEY("content_id","category_id")
);
--> statement-breakpoint
CREATE TABLE "content_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(30) NOT NULL,
	"author_user_id" uuid,
	"featured_media_id" uuid,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_items_type_check" CHECK ("content_items"."type" IN ('NEWS','ANNOUNCEMENT','PRESS_RELEASE','RESEARCH_ARTICLE','EVENT'))
);
--> statement-breakpoint
CREATE TABLE "content_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"version_number" integer NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"publish_note" text,
	CONSTRAINT "uq_content_revisions_content_locale_version" UNIQUE("content_id","locale","version_number"),
	CONSTRAINT "uq_content_revisions_id_content_locale" UNIQUE("id","content_id","locale"),
	CONSTRAINT "content_revisions_version_number_check" CHECK ("content_revisions"."version_number" > 0),
	CONSTRAINT "content_revisions_schema_version_check" CHECK ("content_revisions"."schema_version" > 0),
	CONSTRAINT "content_revisions_snapshot_object_check" CHECK (jsonb_typeof("content_revisions"."snapshot") = 'object')
);
--> statement-breakpoint
CREATE TABLE "content_tag_assignments" (
	"content_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_tag_assignments_content_id_tag_id_pk" PRIMARY KEY("content_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "content_translations" (
	"content_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"path" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"excerpt" text,
	"body" jsonb NOT NULL,
	"body_format" varchar(32) DEFAULT 'rich_text_v1' NOT NULL,
	"seo_title" varchar(500),
	"seo_description" varchar(1000),
	"og_title" varchar(500),
	"og_description" varchar(1000),
	"og_image_id" uuid,
	"canonical_url" text,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"published_revision_id" uuid,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "content_translations_content_id_locale_pk" PRIMARY KEY("content_id","locale"),
	CONSTRAINT "content_translations_status_check" CHECK ("content_translations"."status" IN ('DRAFT','IN_REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED'))
);
--> statement-breakpoint
CREATE TABLE "events" (
	"content_id" uuid PRIMARY KEY NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"timezone" varchar(64) DEFAULT 'Asia/Ho_Chi_Minh' NOT NULL,
	"location_name" varchar(500),
	"location_url" text,
	"registration_url" text,
	"is_online" boolean DEFAULT false NOT NULL,
	CONSTRAINT "events_end_at_check" CHECK ("events"."end_at" IS NULL OR "events"."end_at" >= "events"."start_at")
);
--> statement-breakpoint
CREATE TABLE "locales" (
	"code" varchar(16) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"native_name" varchar(100) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "locales_sort_order_check" CHECK ("locales"."sort_order" >= 0)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket" varchar(100) NOT NULL,
	"storage_key" text NOT NULL,
	"original_file_name" text NOT NULL,
	"mime_type" varchar(150) NOT NULL,
	"file_size" bigint NOT NULL,
	"width" integer,
	"height" integer,
	"checksum_sha256" varchar(64),
	"uploaded_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_file_size_check" CHECK ("media_assets"."file_size" > 0),
	CONSTRAINT "media_assets_width_check" CHECK ("media_assets"."width" IS NULL OR "media_assets"."width" > 0),
	CONSTRAINT "media_assets_height_check" CHECK ("media_assets"."height" IS NULL OR "media_assets"."height" > 0)
);
--> statement-breakpoint
CREATE TABLE "media_translations" (
	"media_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"alt_text" varchar(500),
	"caption" text,
	CONSTRAINT "media_translations_media_id_locale_pk" PRIMARY KEY("media_id","locale")
);
--> statement-breakpoint
CREATE TABLE "menu_item_translations" (
	"menu_item_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"label" varchar(255) NOT NULL,
	"custom_path" text,
	CONSTRAINT "menu_item_translations_menu_item_id_locale_pk" PRIMARY KEY("menu_item_id","locale")
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_id" uuid NOT NULL,
	"parent_id" uuid,
	"link_type" varchar(20) NOT NULL,
	"page_id" uuid,
	"content_id" uuid,
	"external_url" text,
	"target" varchar(10) DEFAULT '_self' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menu_items_parent_not_self_check" CHECK ("menu_items"."parent_id" IS NULL OR "menu_items"."parent_id" <> "menu_items"."id"),
	CONSTRAINT "menu_items_target_check" CHECK ("menu_items"."target" IN ('_self','_blank')),
	CONSTRAINT "menu_items_link_type_check" CHECK (("menu_items"."link_type" = 'PAGE' AND "menu_items"."page_id" IS NOT NULL AND "menu_items"."content_id" IS NULL AND "menu_items"."external_url" IS NULL)
        OR ("menu_items"."link_type" = 'CONTENT' AND "menu_items"."content_id" IS NOT NULL AND "menu_items"."page_id" IS NULL AND "menu_items"."external_url" IS NULL)
        OR ("menu_items"."link_type" = 'EXTERNAL' AND "menu_items"."external_url" IS NOT NULL AND "menu_items"."page_id" IS NULL AND "menu_items"."content_id" IS NULL)
        OR ("menu_items"."link_type" IN ('CUSTOM_PATH','GROUP') AND "menu_items"."page_id" IS NULL AND "menu_items"."content_id" IS NULL AND "menu_items"."external_url" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "menus_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "page_revisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"version_number" integer NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"snapshot" jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"publish_note" text,
	CONSTRAINT "uq_page_revisions_page_locale_version" UNIQUE("page_id","locale","version_number"),
	CONSTRAINT "uq_page_revisions_id_page_locale" UNIQUE("id","page_id","locale"),
	CONSTRAINT "page_revisions_version_number_check" CHECK ("page_revisions"."version_number" > 0),
	CONSTRAINT "page_revisions_schema_version_check" CHECK ("page_revisions"."schema_version" > 0),
	CONSTRAINT "page_revisions_snapshot_object_check" CHECK (jsonb_typeof("page_revisions"."snapshot") = 'object')
);
--> statement-breakpoint
CREATE TABLE "page_section_translations" (
	"section_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_section_translations_section_id_locale_pk" PRIMARY KEY("section_id","locale"),
	CONSTRAINT "page_section_translations_content_object_check" CHECK (jsonb_typeof("page_section_translations"."content") = 'object')
);
--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"component_key" varchar(100) NOT NULL,
	"component_version" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"style" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_page_sections_page_order" UNIQUE("page_id","sort_order"),
	CONSTRAINT "page_sections_component_version_check" CHECK ("page_sections"."component_version" > 0),
	CONSTRAINT "page_sections_sort_order_check" CHECK ("page_sections"."sort_order" >= 0),
	CONSTRAINT "page_sections_config_object_check" CHECK (jsonb_typeof("page_sections"."config") = 'object'),
	CONSTRAINT "page_sections_style_object_check" CHECK (jsonb_typeof("page_sections"."style") = 'object')
);
--> statement-breakpoint
CREATE TABLE "page_translations" (
	"page_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"path" text NOT NULL,
	"title" varchar(500) NOT NULL,
	"seo_title" varchar(500),
	"seo_description" varchar(1000),
	"og_title" varchar(500),
	"og_description" varchar(1000),
	"og_image_id" uuid,
	"canonical_url" text,
	"robots_index" boolean DEFAULT true NOT NULL,
	"robots_follow" boolean DEFAULT true NOT NULL,
	"status" varchar(20) DEFAULT 'DRAFT' NOT NULL,
	"published_revision_id" uuid,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "page_translations_page_id_locale_pk" PRIMARY KEY("page_id","locale"),
	CONSTRAINT "page_translations_status_check" CHECK ("page_translations"."status" IN ('DRAFT','IN_REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED'))
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_type" varchar(30) NOT NULL,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"lock_version" integer DEFAULT 0 NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_page_type_check" CHECK ("pages"."page_type" IN ('HOMEPAGE','STANDARD','LANDING','SYSTEM'))
);
--> statement-breakpoint
CREATE TABLE "partner_translations" (
	"partner_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	CONSTRAINT "partner_translations_partner_id_locale_pk" PRIMARY KEY("partner_id","locale")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"logo_media_id" uuid,
	"website_url" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"portrait_media_id" uuid,
	"public_email" varchar(320),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "people_translations" (
	"person_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"position_title" varchar(255),
	"slug" varchar(200),
	"biography" jsonb,
	CONSTRAINT "people_translations_person_id_locale_pk" PRIMARY KEY("person_id","locale")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(150) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "public_routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" varchar(16) NOT NULL,
	"path" text NOT NULL,
	"target_type" varchar(20) NOT NULL,
	"page_id" uuid,
	"content_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "public_routes_target_type_check" CHECK ("public_routes"."target_type" IN ('PAGE','CONTENT')),
	CONSTRAINT "public_routes_exactly_one_target_check" CHECK (("public_routes"."target_type" = 'PAGE' AND "public_routes"."page_id" IS NOT NULL AND "public_routes"."content_id" IS NULL)
        OR ("public_routes"."target_type" = 'CONTENT' AND "public_routes"."content_id" IS NOT NULL AND "public_routes"."page_id" IS NULL))
);
--> statement-breakpoint
CREATE TABLE "redirects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" varchar(16),
	"source_path" text NOT NULL,
	"destination_path" text NOT NULL,
	"status_code" smallint DEFAULT 301 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"notes" text,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "redirects_status_code_check" CHECK ("redirects"."status_code" IN (301,302,307,308)),
	CONSTRAINT "redirects_source_not_destination_check" CHECK ("redirects"."source_path" <> "redirects"."destination_path")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_id_pk" PRIMARY KEY("role_id","permission_id")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(150) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"updated_by" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag_translations" (
	"tag_id" uuid NOT NULL,
	"locale" varchar(16) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(200) NOT NULL,
	CONSTRAINT "tag_translations_tag_id_locale_pk" PRIMARY KEY("tag_id","locale")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tags_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_role_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identity_subject" varchar(255) NOT NULL,
	"email" varchar(320),
	"display_name" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_identity_subject_unique" UNIQUE("identity_subject")
);
--> statement-breakpoint
ALTER TABLE "academic_program_translations" ADD CONSTRAINT "academic_program_translations_program_id_academic_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."academic_programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academic_program_translations" ADD CONSTRAINT "academic_program_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_category_assignments" ADD CONSTRAINT "content_category_assignments_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_category_assignments" ADD CONSTRAINT "content_category_assignments_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_featured_media_id_media_assets_id_fk" FOREIGN KEY ("featured_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_revisions" ADD CONSTRAINT "content_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tag_assignments" ADD CONSTRAINT "content_tag_assignments_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_tag_assignments" ADD CONSTRAINT "content_tag_assignments_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "content_translations_og_image_id_media_assets_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_translations" ADD CONSTRAINT "fk_content_translation_published_revision" FOREIGN KEY ("published_revision_id","content_id","locale") REFERENCES "public"."content_revisions"("id","content_id","locale") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_translations" ADD CONSTRAINT "media_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_parent_id_menu_items_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."menu_items"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_revisions" ADD CONSTRAINT "page_revisions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_section_translations" ADD CONSTRAINT "page_section_translations_section_id_page_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."page_sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_section_translations" ADD CONSTRAINT "page_section_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "page_translations_og_image_id_media_assets_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_translations" ADD CONSTRAINT "fk_page_translation_published_revision" FOREIGN KEY ("published_revision_id","page_id","locale") REFERENCES "public"."page_revisions"("id","page_id","locale") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pages" ADD CONSTRAINT "pages_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_translations" ADD CONSTRAINT "partner_translations_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_translations" ADD CONSTRAINT "partner_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_media_id_media_assets_id_fk" FOREIGN KEY ("logo_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people" ADD CONSTRAINT "people_portrait_media_id_media_assets_id_fk" FOREIGN KEY ("portrait_media_id") REFERENCES "public"."media_assets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_translations" ADD CONSTRAINT "people_translations_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "people_translations" ADD CONSTRAINT "people_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_routes" ADD CONSTRAINT "public_routes_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_routes" ADD CONSTRAINT "public_routes_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "public_routes" ADD CONSTRAINT "public_routes_content_id_content_items_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."content_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "redirects" ADD CONSTRAINT "redirects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag_translations" ADD CONSTRAINT "tag_translations_locale_locales_code_fk" FOREIGN KEY ("locale") REFERENCES "public"."locales"("code") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role_assignments" ADD CONSTRAINT "user_role_assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_audit_occurred_at" ON "audit_logs" USING btree ("occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_logs" USING btree ("actor_user_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_audit_entity" ON "audit_logs" USING btree ("entity_type","entity_id","occurred_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_categories_parent_order" ON "categories" USING btree ("parent_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_category_translations_locale_slug" ON "category_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_content_primary_category" ON "content_category_assignments" USING btree ("content_id") WHERE "content_category_assignments"."is_primary" = true;--> statement-breakpoint
CREATE INDEX "idx_content_category_assignments_category" ON "content_category_assignments" USING btree ("category_id","content_id");--> statement-breakpoint
CREATE INDEX "idx_content_items_type_active" ON "content_items" USING btree ("type") WHERE "content_items"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "idx_content_tag_assignments_tag" ON "content_tag_assignments" USING btree ("tag_id","content_id");--> statement-breakpoint
CREATE INDEX "idx_content_translation_public_feed" ON "content_translations" USING btree ("locale","published_at") WHERE "content_translations"."status" = 'PUBLISHED';--> statement-breakpoint
CREATE INDEX "idx_content_scheduler" ON "content_translations" USING btree ("scheduled_at") WHERE "content_translations"."status" = 'SCHEDULED';--> statement-breakpoint
CREATE INDEX "idx_events_start_at" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_locales_default" ON "locales" USING btree ("is_default") WHERE "locales"."is_default" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_media_assets_bucket_storage_key" ON "media_assets" USING btree ("bucket","storage_key");--> statement-breakpoint
CREATE INDEX "idx_menu_items_tree" ON "menu_items" USING btree ("menu_id","parent_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_public_routes_locale_path" ON "public_routes" USING btree ("locale","path");--> statement-breakpoint
CREATE INDEX "idx_public_routes_page" ON "public_routes" USING btree ("page_id") WHERE "public_routes"."page_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_public_routes_content" ON "public_routes" USING btree ("content_id") WHERE "public_routes"."content_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_tag_translations_locale_slug" ON "tag_translations" USING btree ("locale","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_user_role_assignment" ON "user_role_assignments" USING btree ("user_id","role_id");