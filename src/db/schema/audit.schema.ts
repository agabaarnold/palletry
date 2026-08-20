import { index, snakeCase } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";
import { auditActionEnum } from "./enums";

// For everything that ISN'T inventory movement (products, categories,
// warehouses, role assignments, ...) — inventory changes are already
// fully audited via stock_movements and don't need a second trail here.
export const auditLog = snakeCase.table(
	"audit_log",
	(t) => ({
		action: auditActionEnum("action").notNull(),
		actorId: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "restrict" }),
		createdAt: t.timestamp().defaultNow().notNull(),
		diff: t.jsonb().$type<Record<string, unknown>>(),
		entityId: t.uuid().notNull(),
		entityType: t.text().notNull(),
		id: t.uuid().defaultRandom().primaryKey(),
	}),
	(table) => [
		index("audit_log_entity_idx").on(table.entityType, table.entityId),
	]
);
