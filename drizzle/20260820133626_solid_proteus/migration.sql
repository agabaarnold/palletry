DROP INDEX "product_variants_sku_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_uidx" ON "product_variants" ("sku") WHERE "archived_at" IS NULL;--> statement-breakpoint
DROP INDEX "units_of_measure_code_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "units_of_measure_code_uidx" ON "units_of_measure" ("code") WHERE "archived_at" IS NULL;--> statement-breakpoint
DROP INDEX "suppliers_name_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_name_uidx" ON "suppliers" ("name") WHERE "archived_at" IS NULL;--> statement-breakpoint
DROP INDEX "warehouses_code_uidx";--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_code_uidx" ON "warehouses" ("code") WHERE "archived_at" IS NULL;