import { auditLog } from "./audit.schema";
import { accounts, sessions, users, verifications } from "./auth.schema";
import {
	categories,
	products,
	productVariants,
	unitsOfMeasure,
} from "./catalog.schema";
import { lotStockLevels, lots, variantCosting } from "./lots.schema";
import {
	goodsReceiptLines,
	goodsReceipts,
	purchaseOrderLines,
	purchaseOrders,
} from "./purchasing.schema";
import {
	customers,
	salesFulfillmentLines,
	salesFulfillments,
	salesOrderLines,
	salesOrders,
} from "./sales.schema";
import {
	adjustmentLines,
	adjustments,
	stockIssueLines,
	stockIssues,
	stockMovements,
	transferLines,
	transfers,
} from "./stock.schema";
import { suppliers } from "./suppliers.schema";
import { stockLevels } from "./views.schema";
import { storageLocations, warehouses } from "./warehouse.schema";

export const schema = {
	accounts,
	adjustmentLines,
	adjustments,
	auditLog,
	categories,
	customers,
	goodsReceiptLines,
	goodsReceipts,
	lotStockLevels,
	lots,
	products,
	productVariants,
	purchaseOrderLines,
	purchaseOrders,
	salesFulfillmentLines,
	salesFulfillments,
	salesOrderLines,
	salesOrders,
	sessions,
	stockIssueLines,
	stockIssues,
	stockLevels,
	stockMovements,
	storageLocations,
	suppliers,
	transferLines,
	transfers,
	unitsOfMeasure,
	users,
	variantCosting,
	verifications,
	warehouses,
} as const;
