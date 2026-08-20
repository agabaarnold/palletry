import { sql } from "drizzle-orm";
import { snakeCase } from "drizzle-orm/pg-core";
import { lotStockLevels } from "./lots.schema";

// Design doc §3.4 (v0.2): "how much of variant X do we have at location Y,
// regardless of lot" is answered by summing a handful of indexed
// lot_stock_levels rows — cheap enough that this stays a plain view rather
// than a second cache table that could drift out of sync with the first.
//
// NOTE: the exact `.view(...).as(...)` builder API is the one piece of
// this schema I haven't cross-checked against the installed drizzle-kit
// 1.0-rc version specifically (view builders are less commonly used than
// table builders). Worth confirming this generates the expected
// `CREATE VIEW` on `drizzle-kit generate` before relying on it — if the
// API differs, the fallback is a hand-written SQL migration for the view
// plus a matching `pgView`/`snakeCase.view` declaration only for
// query-typing purposes.
export const stockLevels = snakeCase.view("stock_levels").as((qb) =>
	qb
		.select({
			productVariantId: lotStockLevels.productVariantId,
			quantity: sql<string>`sum(${lotStockLevels.quantity})`.as("quantity"),
			storageLocationId: lotStockLevels.storageLocationId,
		})
		.from(lotStockLevels)
		.groupBy(lotStockLevels.productVariantId, lotStockLevels.storageLocationId)
);
