import { auditLog } from "./audit.schema";
import { accounts, sessions, users, verifications } from "./auth.schema";
import {
	categories,
	products,
	productVariants,
	unitsOfMeasure,
} from "./catalog.schema";
import {
	adjustmentReasonEnum,
	adjustmentStatusEnum,
	auditActionEnum,
	purchaseOrderStatusEnum,
	salesOrderStatusEnum,
	stockIssueReasonEnum,
	stockIssueStatusEnum,
	trackingTypeEnum,
	transferStatusEnum,
	uomKindEnum,
} from "./enums";
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
	adjustmentReasonEnum,
	adjustmentStatusEnum,
	adjustments,
	auditActionEnum,
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
	purchaseOrderStatusEnum,
	purchaseOrders,
	salesFulfillmentLines,
	salesFulfillments,
	salesOrderLines,
	salesOrderStatusEnum,
	salesOrders,
	sessions,
	stockIssueLines,
	stockIssueReasonEnum,
	stockIssueStatusEnum,
	stockIssues,
	stockLevels,
	stockMovements,
	storageLocations,
	suppliers,
	trackingTypeEnum,
	transferLines,
	transferStatusEnum,
	transfers,
	unitsOfMeasure,
	uomKindEnum,
	users,
	variantCosting,
	verifications,
	warehouses,
} as const;
