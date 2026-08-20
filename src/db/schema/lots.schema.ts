import { sql } from "drizzle-orm";
import {
	check,
	foreignKey,
	index,
	snakeCase,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { productVariants } from "./catalog.schema";
import { goodsReceiptLines } from "./purchasing.schema";
import { storageLocations } from "./warehouse.schema";

// Design doc §2.2/§3.4 (v0.2). Lots handle traceability (which batch,
// expiry, FEFO picking); variant_costing handles valuation (a single
// moving average per variant). Deliberately NOT the same table — see the
// design doc for why conflating them was a v0.1 mistake.

export const lots = snakeCase.table(
	"lots",
	(t) => ({
		// FK to adjustment_lines is defined in stock.schema.ts (which already
		// imports lots) to avoid a circular dependency between lots.schema and
		// stock.schema.  The CHECK constraint below plus app-layer enforcement
		//保证 that the reference is valid.
		adjustmentLineId: t.uuid(),
		createdAt: t.timestamp().defaultNow().notNull(),
		expiryDate: t.date(),
		// Replaced polymorphic originType/originId with typed nullable FKs.
		// Exactly one must be non-null — enforced by lots_origin_exclusive_chk.
		goodsReceiptLineId: t
			.uuid()
			.references(() => goodsReceiptLines.id, { onDelete: "restrict" }),
		id: t.uuid().defaultRandom().primaryKey(),
		// Populated only when the variant's trackingType is "lot"; every
		// receipt still creates a lot row regardless (see catalog.schema.ts).
		lotNumber: t.text(),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		// Audit/reference only — what we paid for THIS batch. Not used for
		// ongoing valuation; see variant_costing below.
		receivedUnitCost: t.numeric({ precision: 14, scale: 4 }),
	}),
	(table) => [
		check(
			"lots_origin_exclusive_chk",
			sql`(
				(${table.goodsReceiptLineId} IS NOT NULL AND ${table.adjustmentLineId} IS NULL)
				OR
				(${table.goodsReceiptLineId} IS NULL AND ${table.adjustmentLineId} IS NOT NULL)
			)`
		),
		check(
			"lots_received_unit_cost_nonneg_chk",
			sql`${table.receivedUnitCost} >= 0`
		),
		uniqueIndex("lots_id_product_variant_id_uidx").on(
			table.id,
			table.productVariantId
		),
		// Partial unique index: lot numbers are unique per variant only
		// when present — multiple NULLs must NOT be treated as duplicates.
		uniqueIndex("lots_variant_id_lot_number_uidx")
			.on(table.productVariantId, table.lotNumber)
			.where(sql`${table.lotNumber} IS NOT NULL`),
		index("lots_variant_id_expiry_date_idx").on(
			table.productVariantId,
			table.expiryDate
		),
		index("lots_goods_receipt_line_id_idx").on(table.goodsReceiptLineId),
		index("lots_adjustment_line_id_idx").on(table.adjustmentLineId),
	]
);

// The finest-grained authoritative stock balance. This — not a
// (variant, location) table — is the one mutable balance table in the
// system; `stock_levels` (views.schema.ts) is a read-only rollup over it.
export const lotStockLevels = snakeCase.table(
	"lot_stock_levels",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		lotId: t.uuid().notNull(),
		// Denormalized from lotId — deliberate, for query/index convenience
		// (avoids a join on every "how much of variant X" read).
		productVariantId: t.uuid().notNull(),
		quantity: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		updatedAt: t.timestamp().defaultNow().notNull(),
	}),
	(table) => [
		foreignKey({
			columns: [table.lotId, table.productVariantId],
			foreignColumns: [lots.id, lots.productVariantId],
			name: "lot_stock_levels_lot_variant_fk",
		}).onDelete("restrict"),
		uniqueIndex("lot_stock_levels_lot_id_location_id_uidx").on(
			table.lotId,
			table.storageLocationId
		),
		index("lot_stock_levels_variant_id_location_id_idx").on(
			table.productVariantId,
			table.storageLocationId
		),
		index("lot_stock_levels_variant_location_qty_idx").on(
			table.productVariantId,
			table.storageLocationId,
			table.quantity
		),
	]
);

// The single moving-average unit cost per variant, org-wide (per your
// confirmation — not per-location). Updated only at goods-receipt posting
// time, using the standard weighted-average formula; untouched by issues,
// transfers, or negative adjustments (those change quantity, not cost).
// Current on-hand quantity for valuation reads comes from summing
// lot_stock_levels at query time, not duplicated here.
export const variantCosting = snakeCase.table(
	"variant_costing",
	(t) => ({
		avgUnitCost: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		productVariantId: t
			.uuid()
			.primaryKey()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		updatedAt: t.timestamp().defaultNow().notNull(),
	}),
	(table) => [
		check(
			"variant_costing_avg_unit_cost_nonneg_chk",
			sql`${table.avgUnitCost} >= 0`
		),
	]
);
