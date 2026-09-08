-- Drizzle's schema builder has no first-class DEFERRABLE option (checked against
-- drizzle-orm@0.45.2's UniqueConstraintBuilder), so `0000_*.sql` creates
-- `uq_page_sections_page_order` as a plain UNIQUE constraint. Design doc 05 §7.3 requires it
-- DEFERRABLE INITIALLY DEFERRED so a drag-and-drop reorder can renumber every sibling section
-- inside one transaction without tripping the constraint mid-update. Postgres's
-- `ALTER TABLE ... ALTER CONSTRAINT` only changes deferrability on foreign key constraints,
-- so a unique constraint has to be dropped and re-added with the attribute set at creation.
ALTER TABLE "page_sections" DROP CONSTRAINT "uq_page_sections_page_order";
--> statement-breakpoint
ALTER TABLE "page_sections"
  ADD CONSTRAINT "uq_page_sections_page_order" UNIQUE ("page_id", "sort_order") DEFERRABLE INITIALLY DEFERRED;
