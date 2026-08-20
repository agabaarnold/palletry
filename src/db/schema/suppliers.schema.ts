import { snakeCase, uniqueIndex } from "drizzle-orm/pg-core";

export const suppliers = snakeCase.table(
	"suppliers",
	(t) => ({
		archivedAt: t.timestamp(),
		contactEmail: t.text(),
		contactPhone: t.text(),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
		name: t.text().notNull(),
	}),
	(table) => [uniqueIndex("suppliers_name_uidx").on(table.name)]
);
