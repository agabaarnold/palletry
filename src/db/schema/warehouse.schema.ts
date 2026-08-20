import { sql } from "drizzle-orm";
import { foreignKey, index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";

export const warehouses = snakeCase.table(
	"warehouses",
	(t) => ({
		address: t.text(),
		archivedAt: t.timestamp(),
		code: t.text().notNull(),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(),
	}),
	(table) => [
		uniqueIndex("warehouses_code_uidx")
			.on(table.code)
			.where(sql`${table.archivedAt} IS NULL`),
	]
);

export const storageLocations = snakeCase.table(
	"storage_locations",
	(t) => ({
		archivedAt: t.timestamp(),
		code: t.text().notNull(),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(),
		// Self-reference for the location hierarchy (design doc §2.1/§2.3,
		// v0.2). Composite FK (parentId, warehouseId) -> (id, warehouseId)
		// enforces that a parent belongs to the same warehouse as the child.
		parentId: t.uuid(),
		warehouseId: t
			.uuid()
			.notNull()
			.references(() => warehouses.id, { onDelete: "restrict" }),
	}),
	(table) => [
		foreignKey({
			columns: [table.parentId, table.warehouseId],
			foreignColumns: [table.id, table.warehouseId],
			name: "storage_locations_parent_warehouse_fk",
		}).onDelete("restrict"),
		uniqueIndex("storage_locations_id_warehouse_id_uidx").on(
			table.id,
			table.warehouseId
		),
		uniqueIndex("storage_locations_warehouse_id_code_uidx").on(
			table.warehouseId,
			table.code
		),
		index("storage_locations_parent_id_idx").on(table.parentId),
	]
);
