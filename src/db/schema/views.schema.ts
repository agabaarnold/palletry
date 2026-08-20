import { sql } from "drizzle-orm";
import { snakeCase } from "drizzle-orm/pg-core";
import { lotStockLevels } from "./lots.schema";

// Design doc §3.4 (v0.2): "how much of variant X do we have at location Y,
// regardless of lot" is answered by summing a handful of indexed
// lot_stock_levels rows — cheap enough that this stays a plain view rather
// than a second cache table that could drift out of sync with the first.
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
