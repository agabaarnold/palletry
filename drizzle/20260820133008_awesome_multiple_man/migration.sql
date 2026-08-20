ALTER TABLE "lot_stock_levels" DROP CONSTRAINT "lot_stock_levels_lot_id_lots_id_fkey";--> statement-breakpoint
ALTER TABLE "lot_stock_levels" DROP CONSTRAINT "lot_stock_levels_product_variant_id_product_variants_id_fkey";--> statement-breakpoint
ALTER TABLE "storage_locations" DROP CONSTRAINT "storage_locations_parent_id_storage_locations_id_fkey";--> statement-breakpoint
CREATE UNIQUE INDEX "lots_id_product_variant_id_uidx" ON "lots" ("id","product_variant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "storage_locations_id_warehouse_id_uidx" ON "storage_locations" ("id","warehouse_id");--> statement-breakpoint
ALTER TABLE "lot_stock_levels" ADD CONSTRAINT "lot_stock_levels_lot_variant_fk" FOREIGN KEY ("lot_id","product_variant_id") REFERENCES "lots"("id","product_variant_id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_parent_warehouse_fk" FOREIGN KEY ("parent_id","warehouse_id") REFERENCES "storage_locations"("id","warehouse_id") ON DELETE RESTRICT;