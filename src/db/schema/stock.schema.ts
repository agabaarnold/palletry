import { sql } from "drizzle-orm";
import { check, index, snakeCase } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { productVariants } from "./catalog.schema";
import { lots } from "./lots.schema";
import { storageLocations } from "./warehouse.schema";

// THE LEDGER. Append-only at the application layer — no update/delete
// grants, no status column. Corrections are new "reversal" rows, never
// edits. Design doc §2.3/§2.8.
export const stockMovements = snakeCase.table(
	"stock_movements",
	(t) => ({
		createdAt: t.timestamp().defaultNow().notNull(),
		// Signed: positive = in, negative = out.
		deltaQty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		lotId: t
			.uuid()
			.notNull()
			.references(() => lots.id, { onDelete: "restrict" }),
		performedBy: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		// Balance for this (variant, location) immediately after this
		// movement — lets "what was the balance on date X" reads avoid
		// re-summing the whole history.
		resultingQty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		sourceId: t.uuid().notNull(), // the specific *line* that caused this
		// "goods_receipt" | "stock_issue" | "transfer" | "adjustment" |
		// "sales_fulfillment" | "reversal"
		sourceType: t.text().notNull(),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
	}),
	(table) => [
		check("stock_movements_delta_qty_nonzero_chk", sql`${table.deltaQty} <> 0`),
		index("stock_movements_variant_location_created_idx").on(
			table.productVariantId,
			table.storageLocationId,
			table.createdAt
		),
		index("stock_movements_source_idx").on(table.sourceType, table.sourceId),
		index("stock_movements_lot_created_idx").on(table.lotId, table.createdAt),
	]
);

// Non-sale outbound stock (damage, samples, internal use, write-off).
// Sales go through sales_fulfillments instead (sales.schema.ts).
export const stockIssues = snakeCase.table("stock_issues", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	reason: t.text().notNull(), // "damage" | "sample" | "internal_use" | "write_off" | "other"
	status: t.text().notNull().default("draft"), // "draft" | "posted"
}));

export const stockIssueLines = snakeCase.table(
	"stock_issue_lines",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		// Nullable until posting: explicit for tracking_type="lot" variants
		// (user picks), system-selected (FIFO) for "none" variants — either
		// way it's set by the time the line is posted.
		lotId: t.uuid().references(() => lots.id, { onDelete: "restrict" }),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		stockIssueId: t
			.uuid()
			.notNull()
			.references(() => stockIssues.id, { onDelete: "cascade" }),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
	}),
	(table) => [
		index("stock_issue_lines_stock_issue_id_idx").on(table.stockIssueId),
	]
);

export const transfers = snakeCase.table("transfers", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	status: t.text().notNull().default("draft"),
}));

export const transferLines = snakeCase.table(
	"transfer_lines",
	(t) => ({
		fromLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		id: t.uuid().defaultRandom().primaryKey(),
		lotId: t.uuid().references(() => lots.id, { onDelete: "restrict" }),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		toLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		transferId: t
			.uuid()
			.notNull()
			.references(() => transfers.id, { onDelete: "cascade" }),
	}),
	(table) => [
		check(
			"transfer_lines_locations_differ_chk",
			sql`${table.fromLocationId} <> ${table.toLocationId}`
		),
		index("transfer_lines_transfer_id_idx").on(table.transferId),
	]
);

export const adjustments = snakeCase.table("adjustments", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	status: t.text().notNull().default("draft"),
}));

export const adjustmentLines = snakeCase.table(
	"adjustment_lines",
	(t) => ({
		adjustmentId: t
			.uuid()
			.notNull()
			.references(() => adjustments.id, { onDelete: "cascade" }),
		deltaQty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		// Null on insert for a POSITIVE adjustment creating a brand-new lot
		// (e.g. "found stock" with no prior record) — a lot row is created
		// and linked at posting time. Required for negative adjustments,
		// which must consume an existing lot.
		lotId: t.uuid().references(() => lots.id, { onDelete: "restrict" }),
		notes: t.text(),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		reasonCode: t.text().notNull(), // "damage" | "loss" | "found" | "cycle_count" | "other"
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
	}),
	(table) => [
		index("adjustment_lines_adjustment_id_idx").on(table.adjustmentId),
	]
);
