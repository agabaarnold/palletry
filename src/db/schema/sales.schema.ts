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
import { salesOrderStatusEnum } from "./enums";
import { lots } from "./lots.schema";
import { storageLocations } from "./warehouse.schema";

export const customers = snakeCase.table("customers", (t) => ({
	archivedAt: t.timestamp(),
	contactEmail: t.text(),
	contactPhone: t.text(),
	createdAt: t.timestamp().defaultNow().notNull(),
	id: t.uuid().defaultRandom().primaryKey(),
	name: t.text().notNull(),
}));

export const salesOrders = snakeCase.table(
	"sales_orders",
	(t) => ({
		createdAt: t.timestamp().defaultNow().notNull(),
		createdBy: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		customerId: t
			.uuid()
			.notNull()
			.references(() => customers.id, { onDelete: "restrict" }),
		id: t.uuid().defaultRandom().primaryKey(),
		orderNumber: t.text().notNull(),
		status: salesOrderStatusEnum("status").notNull().default("draft"),
	}),
	(table) => [
		uniqueIndex("sales_orders_order_number_uidx").on(table.orderNumber),
		index("sales_orders_customer_id_idx").on(table.customerId),
		index("sales_orders_status_idx").on(table.status),
	]
);

export const salesOrderLines = snakeCase.table(
	"sales_order_lines",
	(t) => ({
		// Derived: denormalized sum of fulfillment lines against this line,
		// same pattern as purchase_order_lines.receivedQty.
		fulfilledQty: t.numeric({ precision: 14, scale: 4 }).notNull().default("0"),
		id: t.uuid().defaultRandom().primaryKey(),
		productVariantId: t
			.uuid()
			.notNull()
			.references(() => productVariants.id, { onDelete: "restrict" }),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		salesOrderId: t
			.uuid()
			.notNull()
			.references(() => salesOrders.id, { onDelete: "cascade" }),
		// Basic revenue visibility only — no tax/discount/pricing engine.
		// Nullable: not every business wants price captured at this layer.
		unitPrice: t.numeric({ precision: 14, scale: 4 }),
	}),
	(table) => [
		check(
			"sales_order_lines_fulfilled_qty_bounds_chk",
			sql`${table.fulfilledQty} >= 0 AND ${table.fulfilledQty} <= ${table.qty}`
		),
		check(
			"sales_order_lines_unit_price_nonneg_chk",
			sql`${table.unitPrice} >= 0`
		),
		index("sales_order_lines_sales_order_id_idx").on(table.salesOrderId),
	]
);

export const salesFulfillments = snakeCase.table(
	"sales_fulfillments",
	(t) => ({
		// Posted-once and immutable, mirroring goods_receipts — no status
		// column, corrections go through stock_issues/adjustments instead.
		fulfilledAt: t.timestamp().defaultNow().notNull(),
		fulfilledBy: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		id: t.uuid().defaultRandom().primaryKey(),
		salesOrderId: t
			.uuid()
			.notNull()
			.references(() => salesOrders.id, { onDelete: "restrict" }),
	}),
	(table) => [
		index("sales_fulfillments_sales_order_id_idx").on(table.salesOrderId),
	]
);

export const salesFulfillmentLines = snakeCase.table(
	"sales_fulfillment_lines",
	(t) => ({
		id: t.uuid().defaultRandom().primaryKey(),
		lotId: t.uuid().references(() => lots.id, { onDelete: "restrict" }),
		qty: t.numeric({ precision: 14, scale: 4 }).notNull(),
		salesFulfillmentId: t.uuid().notNull(),
		salesOrderLineId: t.uuid().notNull(),
		storageLocationId: t.uuid().notNull(),
	}),
	(table) => [
		foreignKey({
			columns: [table.salesFulfillmentId],
			foreignColumns: [salesFulfillments.id],
			name: "sales_fulfillment_lines_sales_fulfillment_id_fkey",
		}).onDelete("cascade"),
		foreignKey({
			columns: [table.salesOrderLineId],
			foreignColumns: [salesOrderLines.id],
			name: "sales_fulfillment_lines_sales_order_line_id_fkey",
		}).onDelete("restrict"),
		foreignKey({
			columns: [table.storageLocationId],
			foreignColumns: [storageLocations.id],
			name: "sales_fulfillment_lines_storage_location_id_fkey",
		}).onDelete("restrict"),
		check("sales_fulfillment_lines_qty_positive_chk", sql`${table.qty} > 0`),
		index("sales_fulfillment_lines_sales_fulfillment_id_idx").on(
			table.salesFulfillmentId
		),
		index("sales_fulfillment_lines_sales_order_line_id_idx").on(
			table.salesOrderLineId
		),
	]
);
