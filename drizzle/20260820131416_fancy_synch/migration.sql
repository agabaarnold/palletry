DROP INDEX "categories_parent_id_name_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "categories_parent_id_name_uidx" ON "categories" ("parent_id","name") WHERE "parent_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_root_name_uidx" ON "categories" ("name") WHERE "parent_id" IS NULL;