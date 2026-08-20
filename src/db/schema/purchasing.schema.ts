import { sql } from "drizzle-orm";
import {
	check,
	foreignKey,
	index,
	snakeCase,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { productVariants } from "./catalog.schema";
import { purchaseOrderStatusEnum } from "./enums";
import { suppliers } from "./suppliers.schema";
import { storageLocations } from "./warehouse.schema";

export const purchaseOrders = snakeCase.table(
	"purchase_orders",
	(t) => ({
		createdAt: t.timestamp().defaultNow().notNull(),
		createdBy: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		id: t.uuid().defaultRandom().primaryKey(),
		orderNumber: t.text().notNull(),
		status: purchaseOrderStatusEnum("status").notNull().default("draft"),
		supplierId: t
			.uuid()
			.notNull()
			.references(() => suppliers.id, { onDelete: "restrict" }),
	}),
	(table) => [
		uniqueIndex("purchase_orders_order_number_uidx").on(table.orderNumber),
		index("purchase_orders_supplier_id_idx").on(table.supplierId),
		index("purchase_orders_status_idx").on(table.status),
	]
);

export const purchaseOrderLines = snakeCase.table(
	"purchase_order_lines",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		orderedQty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		productVariantId: t.uuid().notNull(),
		purchaseOrderId: t
			.uuid()
			.notNull()
			.references(() => purchaseOrders.id, { onDelete: "cascade" }),
		// Derived: denormalized sum of goods_receipt_lines against this
		// line, kept in sync transactionally at receipt-posting time only.
		// Never written to outside that flow.
		receivedQty: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		unitCost: t.numeric({ precision: 14, scale: 4 }).notNull(),
	}),
	(table) => [
		foreignKey({
			columns: [table.productVariantId],
			foreignColumns: [productVariants.id],
			name: "purchase_order_lines_product_variant_id_fkey",
		}).onDelete("restrict"),
		check(
			"purchase_order_lines_received_qty_bounds_chk",
			sql`${table.receivedQty} >= 0 AND ${table.receivedQty} <= ${table.orderedQty}`
		),
		check(
			"purchase_order_lines_unit_cost_nonneg_chk",
			sql`${table.unitCost} >= 0`
		),
		index("purchase_order_lines_purchase_order_id_idx").on(
			table.purchaseOrderId
		),
	]
);

export const goodsReceipts = snakeCase.table(
	"goods_receipts",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		purchaseOrderId: t
			.uuid()
			.notNull()
			.references(() => purchaseOrders.id, { onDelete: "restrict" }),
		// Receipts are posted-once and immutable — no status column, no
		// update path. A correction is a new adjustment, never an edit
		// here (design doc §2.4).
		receivedAt: t.timestamp().defaultNow().notNull(),
		receivedBy: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		referenceNumber: t.text(),
	}),
	(table) => [
		index("goods_receipts_purchase_order_id_idx").on(table.purchaseOrderId),
	]
);

export const goodsReceiptLines = snakeCase.table(
	"goods_receipt_lines",
	(t) => ({
		goodsReceiptId: t
			.uuid()
			.notNull()
			.references(() => goodsReceipts.id, { onDelete: "cascade" }),
		id: t.uuid().defaultRandom().primaryKey(),
		purchaseOrderLineId: t.uuid().notNull(),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		storageLocationId: t.uuid().notNull(),
		// What we actually paid for this batch — feeds `lots.receivedUnitCost`
		// (audit/reference) and the `variant_costing` moving-average update.
		// See lots.schema.ts for why this is NOT the same thing as per-lot
		// valuation.
		unitCost: t.numeric({ precision: 14, scale: 4 }).notNull(),
	}),
	(table) => [
		foreignKey({
			columns: [table.purchaseOrderLineId],
			foreignColumns: [purchaseOrderLines.id],
			name: "goods_receipt_lines_purchase_order_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.storageLocationId],
			foreignColumns: [storageLocations.id],
			name: "goods_receipt_lines_storage_location_id_fkey",
		}).onDelete("restrict"),
		check("goods_receipt_lines_qty_positive_chk", sql`${table.qty} > 0`),
		check(
			"goods_receipt_lines_unit_cost_nonneg_chk",
			sql`${table.unitCost} >= 0`
		),
		index("goods_receipt_lines_goods_receipt_id_idx").on(table.goodsReceiptId),
		index("goods_receipt_lines_purchase_order_line_id_idx").on(
			table.purchaseOrderLineId
		),
	]
);
