import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { productVariants } from "./catalog.schema";
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
		// "draft" | "submitted" | "partially_received" | "received" |
		// "cancelled" — design doc §2.4
		status: t.text().notNull().default("draft"),
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
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		purchaseOrderId: t
			.uuid()
			.notNull()
			// Cascade is safe here: lines only exist relative to their PO,
			// and a PO can only be hard-deleted while still `draft` (app
			// rule) — once anything's been received it's cancelled, not
			// deleted, so this cascade path never actually fires against
			// a PO with real history.
			.references(() => purchaseOrders.id, { onDelete: "cascade" }),
		// Derived: denormalized sum of goods_receipt_lines against this
		// line, kept in sync transactionally at receipt-posting time only.
		// Never written to outside that flow.
		receivedQty: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		unitCost: t.numeric({ precision: 14, scale: 4 }).notNull(),
	}),
	(table) => [
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
		purchaseOrderLineId: t
			.uuid()
			.notNull()
			.references(() => purchaseOrderLines.id, { onDelete: "restrict" }),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		storageLocationId: t
			.uuid()
			.notNull()
			.references(() => storageLocations.id, { onDelete: "restrict" }),
		// What we actually paid for this batch — feeds `lots.receivedUnitCost`
		// (audit/reference) and the `variant_costing` moving-average update.
		// See lots.schema.ts for why this is NOT the same thing as per-lot
		// valuation.
		unitCost: t.numeric({ precision: 14, scale: 4 }).notNull(),
	}),
	(table) => [
		index("goods_receipt_lines_goods_receipt_id_idx").on(table.goodsReceiptId),
	]
);
