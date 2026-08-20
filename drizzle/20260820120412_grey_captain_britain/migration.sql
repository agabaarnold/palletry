CREATE TABLE "audit_log" (
	"action" text NOT NULL,
	"actor_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"diff" jsonb,
	"entity_id" uuid NOT NULL,
	"entity_type" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"id_token" text,
	"issuer" text NOT NULL,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY,
	"impersonated_by" text,
	"ip_address" text,
	"token" text NOT NULL UNIQUE,
	"updated_at" timestamp NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"ban_expires" timestamp,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY,
	"image" text,
	"name" text NOT NULL,
	"role" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY,
	"identifier" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"parent_id" uuid
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"archived_at" timestamp,
	"attributes" jsonb,
	"base_uom_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"product_id" uuid NOT NULL,
	"sku" text NOT NULL,
	"tracking_type" text DEFAULT 'none' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"archived_at" timestamp,
	"category_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"description" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units_of_measure" (
	"archived_at" timestamp,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"kind" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lot_stock_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"quantity" numeric(14,4) DEFAULT '0' NOT NULL,
	"storage_location_id" uuid NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lots" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expiry_date" date,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_number" text,
	"origin_id" uuid NOT NULL,
	"origin_type" text NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"received_unit_cost" numeric(14,4)
);
--> statement-breakpoint
CREATE TABLE "variant_costing" (
	"avg_unit_cost" numeric(14,4) DEFAULT '0' NOT NULL,
	"product_variant_id" uuid PRIMARY KEY,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goods_receipt_lines" (
	"goods_receipt_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"purchase_order_line_id" uuid NOT NULL,
	"qty" numeric(14,4) NOT NULL,
	"storage_location_id" uuid NOT NULL,
	"unit_cost" numeric(14,4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "goods_receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"purchase_order_id" uuid NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL,
	"received_by" text NOT NULL,
	"reference_number" text
);
--> statement-breakpoint
CREATE TABLE "purchase_order_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"ordered_qty" numeric(14,4) NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"received_qty" numeric(14,4) DEFAULT '0' NOT NULL,
	"unit_cost" numeric(14,4) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"supplier_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"archived_at" timestamp,
	"contact_email" text,
	"contact_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_fulfillment_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid,
	"qty" numeric(14,4) NOT NULL,
	"sales_fulfillment_id" uuid NOT NULL,
	"sales_order_line_id" uuid NOT NULL,
	"storage_location_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_fulfillments" (
	"fulfilled_at" timestamp DEFAULT now() NOT NULL,
	"fulfilled_by" text NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"sales_order_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales_order_lines" (
	"fulfilled_qty" numeric(14,4) DEFAULT '0' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"product_variant_id" uuid NOT NULL,
	"qty" numeric(14,4) NOT NULL,
	"sales_order_id" uuid NOT NULL,
	"unit_price" numeric(14,4)
);
--> statement-breakpoint
CREATE TABLE "sales_orders" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_number" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adjustment_lines" (
	"adjustment_id" uuid NOT NULL,
	"delta_qty" numeric(14,4) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid,
	"notes" text,
	"product_variant_id" uuid NOT NULL,
	"reason_code" text NOT NULL,
	"storage_location_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "adjustments" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"posted_at" timestamp,
	"posted_by" text,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_issue_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid,
	"product_variant_id" uuid NOT NULL,
	"qty" numeric(14,4) NOT NULL,
	"stock_issue_id" uuid NOT NULL,
	"storage_location_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_issues" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"posted_at" timestamp,
	"posted_by" text,
	"reason" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"delta_qty" numeric(14,4) NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid NOT NULL,
	"performed_by" text NOT NULL,
	"product_variant_id" uuid NOT NULL,
	"resulting_qty" numeric(14,4) NOT NULL,
	"source_id" uuid NOT NULL,
	"source_type" text NOT NULL,
	"storage_location_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transfer_lines" (
	"from_location_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"lot_id" uuid,
	"product_variant_id" uuid NOT NULL,
	"qty" numeric(14,4) NOT NULL,
	"to_location_id" uuid NOT NULL,
	"transfer_id" uuid NOT NULL,
	CONSTRAINT "transfer_lines_locations_differ_chk" CHECK ("from_location_id" <> "to_location_id")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"posted_at" timestamp,
	"posted_by" text,
	"status" text DEFAULT 'draft' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"archived_at" timestamp,
	"contact_email" text,
	"contact_phone" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "storage_locations" (
	"archived_at" timestamp,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"parent_id" uuid,
	"warehouse_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"address" text,
	"archived_at" timestamp,
	"code" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_issuer_accountId_uidx" ON "accounts" ("issuer","account_id");--> statement-breakpoint
CREATE INDEX "accounts_userId_idx" ON "accounts" ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_userId_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "verifications_identifier_idx" ON "verifications" ("identifier");--> statement-breakpoint
CREATE UNIQUE INDEX "categories_parent_id_name_uidx" ON "categories" ("parent_id","name");--> statement-breakpoint
CREATE INDEX "categories_parent_id_idx" ON "categories" ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "product_variants_sku_uidx" ON "product_variants" ("sku");--> statement-breakpoint
CREATE INDEX "product_variants_product_id_idx" ON "product_variants" ("product_id");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" ("category_id");--> statement-breakpoint
CREATE UNIQUE INDEX "units_of_measure_code_uidx" ON "units_of_measure" ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "lot_stock_levels_lot_id_location_id_uidx" ON "lot_stock_levels" ("lot_id","storage_location_id");--> statement-breakpoint
CREATE INDEX "lot_stock_levels_variant_id_location_id_idx" ON "lot_stock_levels" ("product_variant_id","storage_location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lots_variant_id_lot_number_uidx" ON "lots" ("product_variant_id","lot_number") WHERE "lot_number" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "lots_variant_id_expiry_date_idx" ON "lots" ("product_variant_id","expiry_date");--> statement-breakpoint
CREATE INDEX "goods_receipt_lines_goods_receipt_id_idx" ON "goods_receipt_lines" ("goods_receipt_id");--> statement-breakpoint
CREATE INDEX "goods_receipts_purchase_order_id_idx" ON "goods_receipts" ("purchase_order_id");--> statement-breakpoint
CREATE INDEX "purchase_order_lines_purchase_order_id_idx" ON "purchase_order_lines" ("purchase_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "purchase_orders_order_number_uidx" ON "purchase_orders" ("order_number");--> statement-breakpoint
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders" ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders" ("status");--> statement-breakpoint
CREATE INDEX "sales_fulfillment_lines_sales_fulfillment_id_idx" ON "sales_fulfillment_lines" ("sales_fulfillment_id");--> statement-breakpoint
CREATE INDEX "sales_fulfillments_sales_order_id_idx" ON "sales_fulfillments" ("sales_order_id");--> statement-breakpoint
CREATE INDEX "sales_order_lines_sales_order_id_idx" ON "sales_order_lines" ("sales_order_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sales_orders_order_number_uidx" ON "sales_orders" ("order_number");--> statement-breakpoint
CREATE INDEX "sales_orders_customer_id_idx" ON "sales_orders" ("customer_id");--> statement-breakpoint
CREATE INDEX "sales_orders_status_idx" ON "sales_orders" ("status");--> statement-breakpoint
CREATE INDEX "adjustment_lines_adjustment_id_idx" ON "adjustment_lines" ("adjustment_id");--> statement-breakpoint
CREATE INDEX "stock_issue_lines_stock_issue_id_idx" ON "stock_issue_lines" ("stock_issue_id");--> statement-breakpoint
CREATE INDEX "stock_movements_variant_location_created_idx" ON "stock_movements" ("product_variant_id","storage_location_id","created_at");--> statement-breakpoint
CREATE INDEX "stock_movements_source_idx" ON "stock_movements" ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "stock_movements_lot_created_idx" ON "stock_movements" ("lot_id","created_at");--> statement-breakpoint
CREATE INDEX "transfer_lines_transfer_id_idx" ON "transfer_lines" ("transfer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_name_uidx" ON "suppliers" ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "storage_locations_warehouse_id_code_uidx" ON "storage_locations" ("warehouse_id","code");--> statement-breakpoint
CREATE INDEX "storage_locations_parent_id_idx" ON "storage_locations" ("parent_id");--> statement-breakpoint
CREATE UNIQUE INDEX "warehouses_code_uidx" ON "warehouses" ("code");--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_actor_id_users_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_base_uom_id_units_of_measure_id_fkey" FOREIGN KEY ("base_uom_id") REFERENCES "units_of_measure"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lot_stock_levels" ADD CONSTRAINT "lot_stock_levels_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lot_stock_levels" ADD CONSTRAINT "lot_stock_levels_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lot_stock_levels" ADD CONSTRAINT "lot_stock_levels_storage_location_id_storage_locations_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "lots" ADD CONSTRAINT "lots_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "variant_costing" ADD CONSTRAINT "variant_costing_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_goods_receipt_id_goods_receipts_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_mEtCgTKnv5iy_fkey" FOREIGN KEY ("purchase_order_line_id") REFERENCES "purchase_order_lines"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goods_receipt_lines" ADD CONSTRAINT "goods_receipt_lines_4DbHiSm9opDc_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_purchase_order_id_purchase_orders_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "goods_receipts" ADD CONSTRAINT "goods_receipts_received_by_users_id_fkey" FOREIGN KEY ("received_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_C3kUiL9mmy9z_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_order_lines" ADD CONSTRAINT "purchase_order_lines_purchase_order_id_purchase_orders_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_suppliers_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_fulfillment_lines" ADD CONSTRAINT "sales_fulfillment_lines_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_fulfillment_lines" ADD CONSTRAINT "sales_fulfillment_lines_AhS2rsrjPEM0_fkey" FOREIGN KEY ("sales_fulfillment_id") REFERENCES "sales_fulfillments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sales_fulfillment_lines" ADD CONSTRAINT "sales_fulfillment_lines_YMgLalThUrTQ_fkey" FOREIGN KEY ("sales_order_line_id") REFERENCES "sales_order_lines"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_fulfillment_lines" ADD CONSTRAINT "sales_fulfillment_lines_p5V3p8kRob1e_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_fulfillments" ADD CONSTRAINT "sales_fulfillments_fulfilled_by_users_id_fkey" FOREIGN KEY ("fulfilled_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_fulfillments" ADD CONSTRAINT "sales_fulfillments_sales_order_id_sales_orders_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_order_lines" ADD CONSTRAINT "sales_order_lines_sales_order_id_sales_orders_id_fkey" FOREIGN KEY ("sales_order_id") REFERENCES "sales_orders"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_created_by_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "sales_orders" ADD CONSTRAINT "sales_orders_customer_id_customers_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_adjustment_id_adjustments_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "adjustments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "adjustment_lines" ADD CONSTRAINT "adjustment_lines_storage_location_id_storage_locations_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "adjustments" ADD CONSTRAINT "adjustments_posted_by_users_id_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_issue_lines" ADD CONSTRAINT "stock_issue_lines_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_issue_lines" ADD CONSTRAINT "stock_issue_lines_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_issue_lines" ADD CONSTRAINT "stock_issue_lines_stock_issue_id_stock_issues_id_fkey" FOREIGN KEY ("stock_issue_id") REFERENCES "stock_issues"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "stock_issue_lines" ADD CONSTRAINT "stock_issue_lines_storage_location_id_storage_locations_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_issues" ADD CONSTRAINT "stock_issues_posted_by_users_id_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_performed_by_users_id_fkey" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_storage_location_id_storage_locations_id_fkey" FOREIGN KEY ("storage_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_from_location_id_storage_locations_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_lot_id_lots_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_product_variant_id_product_variants_id_fkey" FOREIGN KEY ("product_variant_id") REFERENCES "product_variants"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_to_location_id_storage_locations_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "transfer_lines" ADD CONSTRAINT "transfer_lines_transfer_id_transfers_id_fkey" FOREIGN KEY ("transfer_id") REFERENCES "transfers"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_posted_by_users_id_fkey" FOREIGN KEY ("posted_by") REFERENCES "users"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_parent_id_storage_locations_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "storage_locations"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "storage_locations" ADD CONSTRAINT "storage_locations_warehouse_id_warehouses_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses"("id") ON DELETE RESTRICT;--> statement-breakpoint
CREATE VIEW "stock_levels" AS (select "product_variant_id", sum("quantity") as "quantity", "storage_location_id" from "lot_stock_levels" group by "lot_stock_levels"."product_variant_id", "lot_stock_levels"."storage_location_id");