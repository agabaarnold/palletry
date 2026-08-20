import { sql } from "drizzle-orm";
import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";
import { productVariants } from "./catalog.schema";
import { storageLocations } from "./warehouse.schema";

// Design doc §2.2/§3.4 (v0.2). Lots handle traceability (which batch,
// expiry, FEFO picking); variant_costing handles valuation (a single
// moving average per variant). Deliberately NOT the same table — see the
// design doc for why conflating them was a v0.1 mistake.

export const lots = snakeCase.table(
	"lots",
	(t) => ({
		createdAt: t.timestamp().defaultNow().notNull(),
		expiryDate: t.date(),
		id: t.uuid().defaultRandom().primaryKey(),
		// Populated only when the variant's trackingType is "lot"; every
		// receipt still creates a lot row regardless (see catalog.schema.ts).
		lotNumber: t.text(),
		originId: t.uuid().notNull(),
		// "goods_receipt_line" | "adjustment_line" — polymorphic origin,
		// no FK (the two possible parents don't share a table).
		originType: t.text().notNull(),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		// Audit/reference only — what we paid for THIS batch. Not used for
		// ongoing valuation; see variant_costing below.
		receivedUnitCost: t.numeric({ precision: 14, scale: 4 }),
	}),
	(table) => [
		// Partial unique index: lot numbers are unique per variant only
		// when present — multiple NULLs must NOT be treated as duplicates.
		uniqueIndex("lots_variant_id_lot_number_uidx")
			.on(table.productVariantId, table.lotNumber)
			.where(sql`${table.lotNumber} IS NOT NULL`),
		index("lots_variant_id_expiry_date_idx").on(
			table.productVariantId,
			table.expiryDate
		),
	]
);

// The finest-grained authoritative stock balance. This — not a
// (variant, location) table — is the one mutable balance table in the
// system; `stock_levels` (views.schema.ts) is a read-only rollup over it.
export const lotStockLevels = snakeCase.table(
	"lot_stock_levels",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		lotId: t
			.uuid()
			.notNull()
			.references(() => lots.id, { onDelete: "restrict" }),
		// Denormalized from lotId — deliberate, for query/index convenience
		// (avoids a join on every "how much of variant X" read).
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		quantity: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		updatedAt: t.timestamp().defaultNow().notNull(),
		// quantity >= 0 unless the variant's allowBackorder flag is set —
		// cross-table condition, not expressible as a plain CHECK; enforce
		// at the application layer within the same transaction that takes
		// the row lock on this row during posting (design doc §2.7).
	}),
	(table) => [
		uniqueIndex("lot_stock_levels_lot_id_location_id_uidx").on(
			table.lotId,
			table.storageLocationId
		),
		index("lot_stock_levels_variant_id_location_id_idx").on(
			table.productVariantId,
			table.storageLocationId
		),
	]
);

// The single moving-average unit cost per variant, org-wide (per your
// confirmation — not per-location). Updated only at goods-receipt posting
// time, using the standard weighted-average formula; untouched by issues,
// transfers, or negative adjustments (those change quantity, not cost).
// Current on-hand quantity for valuation reads comes from summing
// lot_stock_levels at query time, not duplicated here.
export const variantCosting = snakeCase.table("variant_costing", (t) => ({
	avgUnitCost: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
	productVariantId: t
		.uuid()
		.primaryKey()
		.references(() => productVariants.id, { onDelete: "restrict" }),
	updatedAt: t.timestamp().defaultNow().notNull(),
}));
