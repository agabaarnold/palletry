import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";

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
	(table) => [uniqueIndex("warehouses_code_uidx").on(table.code)]
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
		// v0.2). INVARIANT (not expressible as a plain FK, enforce at the
		// application layer or via trigger): a location's parent must
		// belong to the same warehouseId as the child.
		parentId: t.uuid().references((): AnyPgColumn => storageLocations.id, {
			onDelete: "restrict",
		}),
		warehouseId: t
			.uuid()
			.notNull()
			.references(() => warehouses.id, { onDelete: "restrict" }),
	}),
	(table) => [
		uniqueIndex("storage_locations_warehouse_id_code_uidx").on(
			table.warehouseId,
			table.code
		),
		index("storage_locations_parent_id_idx").on(table.parentId),
	]
);
