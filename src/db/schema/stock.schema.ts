import { sql } from "drizzle-orm";
import { check, foreignKey, index, snakeCase } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { productVariants } from "./catalog.schema";
import {
	adjustmentReasonEnum,
	adjustmentStatusEnum,
	stockIssueReasonEnum,
	stockIssueStatusEnum,
	transferStatusEnum,
} from "./enums";
import { lots } from "./lots.schema";
import { goodsReceiptLines } from "./purchasing.schema";
import { salesFulfillmentLines } from "./sales.schema";
import { storageLocations } from "./warehouse.schema";

// THE LEDGER. Append-only at the application layer — no update/delete
// grants, no status column. Corrections are new "reversal" rows, never
// edits. Design doc §2.3/§2.8.
export const stockMovements = snakeCase.table(
	"stock_movements",
	(t) => ({
		adjustmentLineId: t.uuid(),
		createdAt: t.timestamp().defaultNow().notNull(),
		// Signed: positive = in, negative = out.
		deltaQty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		// Replaced polymorphic sourceType/sourceId with typed nullable FKs.
		// Exactly one must be non-null — enforced by
		// stock_movements_source_exclusive_chk.
		goodsReceiptLineId: t.uuid(),
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
		reversalMovementId: t.uuid(),
		salesFulfillmentLineId: t.uuid(),
		stockIssueLineId: t.uuid(),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		transferLineId: t.uuid(),
	}),
	(table) => [
		check("stock_movements_delta_qty_nonzero_chk", sql`${table.deltaQty} <> 0`),
		check(
			"stock_movements_source_exclusive_chk",
			sql`(
				CASE WHEN ${table.goodsReceiptLineId} IS NOT NULL THEN 1 ELSE 0 END
				+ CASE WHEN ${table.stockIssueLineId} IS NOT NULL THEN 1 ELSE 0 END
				+ CASE WHEN ${table.transferLineId} IS NOT NULL THEN 1 ELSE 0 END
				+ CASE WHEN ${table.adjustmentLineId} IS NOT NULL THEN 1 ELSE 0 END
				+ CASE WHEN ${table.salesFulfillmentLineId} IS NOT NULL THEN 1 ELSE 0 END
				+ CASE WHEN ${table.reversalMovementId} IS NOT NULL THEN 1 ELSE 0 END
			) = 1`
		),
		// FKs for the typed nullable source columns.
		foreignKey({
			columns: [table.goodsReceiptLineId],
			foreignColumns: [goodsReceiptLines.id],
			name: "stock_movements_goods_receipt_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.stockIssueLineId],
			foreignColumns: [stockIssueLines.id],
			name: "stock_movements_stock_issue_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.transferLineId],
			foreignColumns: [transferLines.id],
			name: "stock_movements_transfer_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.adjustmentLineId],
			foreignColumns: [adjustmentLines.id],
			name: "stock_movements_adjustment_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.salesFulfillmentLineId],
			foreignColumns: [salesFulfillmentLines.id],
			name: "stock_movements_sales_fulfillment_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.reversalMovementId],
			foreignColumns: [table.id],
			name: "stock_movements_reversal_movement_id_fkey",
		}).onDelete("restrict"),
		// lotStockLevels composite FK is defined in lots.schema.ts (same
		// file as the table definition).
		index("stock_movements_variant_location_created_idx").on(
			table.productVariantId,
			table.storageLocationId,
			table.createdAt
		),
		index("stock_movements_lot_created_idx").on(table.lotId, table.createdAt),
		index("stock_movements_goods_receipt_line_id_idx").on(
			table.goodsReceiptLineId
		),
		index("stock_movements_stock_issue_line_id_idx").on(table.stockIssueLineId),
		index("stock_movements_transfer_line_id_idx").on(table.transferLineId),
		index("stock_movements_adjustment_line_id_idx").on(table.adjustmentLineId),
		index("stock_movements_sales_fulfillment_line_id_idx").on(
			table.salesFulfillmentLineId
		),
		index("stock_movements_reversal_movement_id_idx").on(
			table.reversalMovementId
		),
	]
);

// Non-sale outbound stock (damage, samples, internal use, write-off).
// Sales go through sales_fulfillments instead (sales.schema.ts).
export const stockIssues = snakeCase.table("stock_issues", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	reason: stockIssueReasonEnum("reason").notNull(),
	status: stockIssueStatusEnum("status").notNull().default("draft"),
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
		check("stock_issue_lines_qty_positive_chk", sql`${table.qty} > 0`),
		index("stock_issue_lines_stock_issue_id_idx").on(table.stockIssueId),
	]
);

export const transfers = snakeCase.table("transfers", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	status: transferStatusEnum("status").notNull().default("draft"),
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
		check("transfer_lines_qty_positive_chk", sql`${table.qty} > 0`),
		index("transfer_lines_transfer_id_idx").on(table.transferId),
	]
);

export const adjustments = snakeCase.table("adjustments", (t) => ({
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	postedAt: t.timestamp(),
	postedBy: t.text().references(() => users.id, { onDelete: "restrict" }),
	status: adjustmentStatusEnum("status").notNull().default("draft"),
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
		reasonCode: adjustmentReasonEnum("reason_code").notNull(),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
	}),
	(table) => [
		check(
			"adjustment_lines_delta_qty_nonzero_chk",
			sql`${table.deltaQty} <> 0`
		),
		index("adjustment_lines_adjustment_id_idx").on(table.adjustmentId),
	]
);

// NOTE: lots.adjustmentLineId -> adjustment_lines.id FK cannot be defined
// at the DB level due to a circular dependency between lots.schema.ts and
// stock.schema.ts.  The lots_origin_exclusive_chk CHECK constraint plus
// application-layer enforcement ensures referential integrity.
