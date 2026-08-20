import type { AnyPgColumn } from "drizzle-orm/pg-core";
import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Design doc §3.2 (v0.1) — categories, units_of_measure, products,
// product_variants are unchanged from the original design.

export const categories = snakeCase.table(
	"categories",
	(t) => ({
		archivedAt: t.timestamp(),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(),
		// Self-reference: the explicit AnyPgColumn return type avoids a
		// TS circular-inference error on self-referencing FKs.
		parentId: t
			.uuid()
			.references((): AnyPgColumn => categories.id, { onDelete: "restrict" }),
	}),
	(table) => [
		// No duplicate sibling names under the same parent.
		uniqueIndex("categories_parent_id_name_uidx")
			.on(table.parentId, table.name)
			.where(sql`${table.parentId} IS NOT NULL`),
		// No duplicate root category names.
		uniqueIndex("categories_root_name_uidx")
			.on(table.name)
			.where(sql`${table.parentId} IS NULL`),
		index("categories_parent_id_idx").on(table.parentId),
	]
);

export const unitsOfMeasure = snakeCase.table(
	"units_of_measure",
	(t) => ({
		archivedAt: t.timestamp(),
		code: t.text().notNull(), // e.g. "EA", "BOX12"
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		// "count" | "weight" | "volume" — validated at the app layer
		// (Zod), not a Postgres enum, matching the existing convention
		// in auth.schema.ts (users.role is also plain text).
		kind: t.text().notNull(),
		name: t.text().notNull(),
	}),
	(table) => [uniqueIndex("units_of_measure_code_uidx").on(table.code).where(sql`${table.archivedAt} IS NULL`)]
);

export const products = snakeCase.table(
	"products",
	(t) => ({
		archivedAt: t.timestamp(),
		categoryId: t
			.uuid()
			.references(() => categories.id, { onDelete: "restrict" }),
		createdAt: t.timestamp().defaultNow().notNull(),
		description: t.text(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(),
	}),
	(table) => [index("products_category_id_idx").on(table.categoryId)]
);

export const productVariants = snakeCase.table(
	"product_variants",
	(t) => ({
		allowBackorder: t.boolean().notNull().default(false),
		archivedAt: t.timestamp(),
		attributes: t.jsonb().$type<Record<string, string>>(),
		baseUomId: t
			.uuid()
			.notNull()
			.references(() => unitsOfMeasure.id, { onDelete: "restrict" }),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(), // e.g. "Blue / M"
		productId: t
			.uuid()
			.notNull()
			.references(() => products.id, { onDelete: "restrict" }),
		sku: t.text().notNull(),
		// "none" | "lot" — see design doc §2.1/§2.3. Every receipt still
		// creates a `lots` row regardless of this value; this only
		// controls whether lot number/expiry are collected from the user
		// and whether outbound picking asks them to choose a lot.
		trackingType: t.text().notNull().default("none"),
	}),
	(table) => [
		uniqueIndex("product_variants_sku_uidx").on(table.sku).where(sql`${table.archivedAt} IS NULL`),
		index("product_variants_product_id_idx").on(table.productId),
	]
);
