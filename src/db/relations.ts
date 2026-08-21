import { defineRelations, defineRelationsPart } from "drizzle-orm";
import { schema } from "./schema";
import { accounts, sessions, users, verifications } from "./schema/auth.schema";

// NOTE on the users/accounts/sessions/verifications split: mainRelations
// defines the `users` block with domain inverse relations (e.g. the list of
// purchase orders created by this user), while authRelations defines the
// same `users` block with auth-only relations (accounts, sessions). Both
// are merged per-table in db/index.ts via a manual combine rather than a
// shallow spread, so both sets of relations coexist under `users`.
export const mainRelations = defineRelations(schema, (r) => ({
	adjustmentLines: {
		adjustment: r.one.adjustments({
			from: r.adjustmentLines.adjustmentId,
			to: r.adjustments.id,
		}),
		lot: r.one.lots({
			from: r.adjustmentLines.lotId,
			to: r.lots.id,
		}),
		productVariant: r.one.productVariants({
			from: r.adjustmentLines.productVariantId,
			to: r.productVariants.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.adjustmentLines.storageLocationId,
			to: r.storageLocations.id,
		}),
	},

	adjustments: {
		lines: r.many.adjustmentLines({
			from: r.adjustments.id,
			to: r.adjustmentLines.adjustmentId,
		}),
		postedByUser: r.one.users({
			from: r.adjustments.postedBy,
			to: r.users.id,
		}),
	},

	auditLog: {
		actorUser: r.one.users({
			from: r.auditLog.actorId,
			to: r.users.id,
		}),
	},
	categories: {
		children: r.many.categories({
			from: r.categories.id,
			to: r.categories.parentId,
		}),
		parent: r.one.categories({
			from: r.categories.parentId,
			to: r.categories.id,
		}),
		products: r.many.products({
			from: r.categories.id,
			to: r.products.categoryId,
		}),
	},

	customers: {
		salesOrders: r.many.salesOrders({
			from: r.customers.id,
			to: r.salesOrders.customerId,
		}),
	},

	goodsReceiptLines: {
		goodsReceipt: r.one.goodsReceipts({
			from: r.goodsReceiptLines.goodsReceiptId,
			to: r.goodsReceipts.id,
		}),
		lots: r.many.lots({
			from: r.goodsReceiptLines.id,
			to: r.lots.goodsReceiptLineId,
		}),
		purchaseOrderLine: r.one.purchaseOrderLines({
			from: r.goodsReceiptLines.purchaseOrderLineId,
			to: r.purchaseOrderLines.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.goodsReceiptLines.storageLocationId,
			to: r.storageLocations.id,
		}),
	},

	goodsReceipts: {
		lines: r.many.goodsReceiptLines({
			from: r.goodsReceipts.id,
			to: r.goodsReceiptLines.goodsReceiptId,
		}),
		purchaseOrder: r.one.purchaseOrders({
			from: r.goodsReceipts.purchaseOrderId,
			to: r.purchaseOrders.id,
		}),
		receivedByUser: r.one.users({
			from: r.goodsReceipts.receivedBy,
			to: r.users.id,
		}),
	},

	lotStockLevels: {
		lot: r.one.lots({
			from: r.lotStockLevels.lotId,
			to: r.lots.id,
		}),
		productVariant: r.one.productVariants({
			from: r.lotStockLevels.productVariantId,
			to: r.productVariants.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.lotStockLevels.storageLocationId,
			to: r.storageLocations.id,
		}),
	},

	lots: {
		adjustmentLine: r.one.adjustmentLines({
			from: r.lots.adjustmentLineId,
			to: r.adjustmentLines.id,
		}),
		adjustmentLines: r.many.adjustmentLines({
			from: r.lots.id,
			to: r.adjustmentLines.lotId,
		}),
		goodsReceiptLine: r.one.goodsReceiptLines({
			from: r.lots.goodsReceiptLineId,
			to: r.goodsReceiptLines.id,
		}),
		productVariant: r.one.productVariants({
			from: r.lots.productVariantId,
			to: r.productVariants.id,
		}),
		salesFulfillmentLines: r.many.salesFulfillmentLines({
			from: r.lots.id,
			to: r.salesFulfillmentLines.lotId,
		}),
		stockIssueLines: r.many.stockIssueLines({
			from: r.lots.id,
			to: r.stockIssueLines.lotId,
		}),
		stockLevels: r.many.lotStockLevels({
			from: r.lots.id,
			to: r.lotStockLevels.lotId,
		}),
		stockMovements: r.many.stockMovements({
			from: r.lots.id,
			to: r.stockMovements.lotId,
		}),
		transferLines: r.many.transferLines({
			from: r.lots.id,
			to: r.transferLines.lotId,
		}),
	},

	products: {
		category: r.one.categories({
			from: r.products.categoryId,
			to: r.categories.id,
		}),
		variants: r.many.productVariants({
			from: r.products.id,
			to: r.productVariants.productId,
		}),
	},

	productVariants: {
		adjustmentLines: r.many.adjustmentLines({
			from: r.productVariants.id,
			to: r.adjustmentLines.productVariantId,
		}),
		baseUom: r.one.unitsOfMeasure({
			from: r.productVariants.baseUomId,
			to: r.unitsOfMeasure.id,
		}),
		costing: r.one.variantCosting({
			from: r.productVariants.id,
			to: r.variantCosting.productVariantId,
		}),
		lotStockLevels: r.many.lotStockLevels({
			from: r.productVariants.id,
			to: r.lotStockLevels.productVariantId,
		}),
		lots: r.many.lots({
			from: r.productVariants.id,
			to: r.lots.productVariantId,
		}),
		product: r.one.products({
			from: r.productVariants.productId,
			to: r.products.id,
		}),
		purchaseOrderLines: r.many.purchaseOrderLines({
			from: r.productVariants.id,
			to: r.purchaseOrderLines.productVariantId,
		}),
		salesOrderLines: r.many.salesOrderLines({
			from: r.productVariants.id,
			to: r.salesOrderLines.productVariantId,
		}),
		stockIssueLines: r.many.stockIssueLines({
			from: r.productVariants.id,
			to: r.stockIssueLines.productVariantId,
		}),
		stockMovements: r.many.stockMovements({
			from: r.productVariants.id,
			to: r.stockMovements.productVariantId,
		}),
		transferLines: r.many.transferLines({
			from: r.productVariants.id,
			to: r.transferLines.productVariantId,
		}),
	},

	purchaseOrderLines: {
		goodsReceiptLines: r.many.goodsReceiptLines({
			from: r.purchaseOrderLines.id,
			to: r.goodsReceiptLines.purchaseOrderLineId,
		}),
		productVariant: r.one.productVariants({
			from: r.purchaseOrderLines.productVariantId,
			to: r.productVariants.id,
		}),
		purchaseOrder: r.one.purchaseOrders({
			from: r.purchaseOrderLines.purchaseOrderId,
			to: r.purchaseOrders.id,
		}),
	},

	purchaseOrders: {
		createdByUser: r.one.users({
			from: r.purchaseOrders.createdBy,
			to: r.users.id,
		}),
		goodsReceipts: r.many.goodsReceipts({
			from: r.purchaseOrders.id,
			to: r.goodsReceipts.purchaseOrderId,
		}),
		lines: r.many.purchaseOrderLines({
			from: r.purchaseOrders.id,
			to: r.purchaseOrderLines.purchaseOrderId,
		}),
		supplier: r.one.suppliers({
			from: r.purchaseOrders.supplierId,
			to: r.suppliers.id,
		}),
	},

	salesFulfillmentLines: {
		lot: r.one.lots({
			from: r.salesFulfillmentLines.lotId,
			to: r.lots.id,
		}),
		salesFulfillment: r.one.salesFulfillments({
			from: r.salesFulfillmentLines.salesFulfillmentId,
			to: r.salesFulfillments.id,
		}),
		salesOrderLine: r.one.salesOrderLines({
			from: r.salesFulfillmentLines.salesOrderLineId,
			to: r.salesOrderLines.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.salesFulfillmentLines.storageLocationId,
			to: r.storageLocations.id,
		}),
	},

	salesFulfillments: {
		fulfilledByUser: r.one.users({
			from: r.salesFulfillments.fulfilledBy,
			to: r.users.id,
		}),
		lines: r.many.salesFulfillmentLines({
			from: r.salesFulfillments.id,
			to: r.salesFulfillmentLines.salesFulfillmentId,
		}),
		salesOrder: r.one.salesOrders({
			from: r.salesFulfillments.salesOrderId,
			to: r.salesOrders.id,
		}),
	},

	salesOrderLines: {
		fulfillmentLines: r.many.salesFulfillmentLines({
			from: r.salesOrderLines.id,
			to: r.salesFulfillmentLines.salesOrderLineId,
		}),
		productVariant: r.one.productVariants({
			from: r.salesOrderLines.productVariantId,
			to: r.productVariants.id,
		}),
		salesOrder: r.one.salesOrders({
			from: r.salesOrderLines.salesOrderId,
			to: r.salesOrders.id,
		}),
	},

	salesOrders: {
		createdByUser: r.one.users({
			from: r.salesOrders.createdBy,
			to: r.users.id,
		}),
		customer: r.one.customers({
			from: r.salesOrders.customerId,
			to: r.customers.id,
		}),
		fulfillments: r.many.salesFulfillments({
			from: r.salesOrders.id,
			to: r.salesFulfillments.salesOrderId,
		}),
		lines: r.many.salesOrderLines({
			from: r.salesOrders.id,
			to: r.salesOrderLines.salesOrderId,
		}),
	},

	stockIssueLines: {
		lot: r.one.lots({
			from: r.stockIssueLines.lotId,
			to: r.lots.id,
		}),
		productVariant: r.one.productVariants({
			from: r.stockIssueLines.productVariantId,
			to: r.productVariants.id,
		}),
		stockIssue: r.one.stockIssues({
			from: r.stockIssueLines.stockIssueId,
			to: r.stockIssues.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.stockIssueLines.storageLocationId,
			to: r.storageLocations.id,
		}),
	},

	stockIssues: {
		lines: r.many.stockIssueLines({
			from: r.stockIssues.id,
			to: r.stockIssueLines.stockIssueId,
		}),
		postedByUser: r.one.users({
			from: r.stockIssues.postedBy,
			to: r.users.id,
		}),
	},

	stockMovements: {
		adjustmentLine: r.one.adjustmentLines({
			from: r.stockMovements.adjustmentLineId,
			to: r.adjustmentLines.id,
		}),
		goodsReceiptLine: r.one.goodsReceiptLines({
			from: r.stockMovements.goodsReceiptLineId,
			to: r.goodsReceiptLines.id,
		}),
		lot: r.one.lots({
			from: r.stockMovements.lotId,
			to: r.lots.id,
		}),
		performedByUser: r.one.users({
			from: r.stockMovements.performedBy,
			to: r.users.id,
		}),
		productVariant: r.one.productVariants({
			from: r.stockMovements.productVariantId,
			to: r.productVariants.id,
		}),
		reversalMovement: r.one.stockMovements({
			from: r.stockMovements.reversalMovementId,
			to: r.stockMovements.id,
		}),
		salesFulfillmentLine: r.one.salesFulfillmentLines({
			from: r.stockMovements.salesFulfillmentLineId,
			to: r.salesFulfillmentLines.id,
		}),
		stockIssueLine: r.one.stockIssueLines({
			from: r.stockMovements.stockIssueLineId,
			to: r.stockIssueLines.id,
		}),
		storageLocation: r.one.storageLocations({
			from: r.stockMovements.storageLocationId,
			to: r.storageLocations.id,
		}),
		transferLine: r.one.transferLines({
			from: r.stockMovements.transferLineId,
			to: r.transferLines.id,
		}),
	},

	storageLocations: {
		adjustmentLines: r.many.adjustmentLines({
			from: r.storageLocations.id,
			to: r.adjustmentLines.storageLocationId,
		}),
		children: r.many.storageLocations({
			from: r.storageLocations.id,
			to: r.storageLocations.parentId,
		}),
		goodsReceiptLines: r.many.goodsReceiptLines({
			from: r.storageLocations.id,
			to: r.goodsReceiptLines.storageLocationId,
		}),
		lotStockLevels: r.many.lotStockLevels({
			from: r.storageLocations.id,
			to: r.lotStockLevels.storageLocationId,
		}),
		parent: r.one.storageLocations({
			from: r.storageLocations.parentId,
			to: r.storageLocations.id,
		}),
		salesFulfillmentLines: r.many.salesFulfillmentLines({
			from: r.storageLocations.id,
			to: r.salesFulfillmentLines.storageLocationId,
		}),
		stockIssueLines: r.many.stockIssueLines({
			from: r.storageLocations.id,
			to: r.stockIssueLines.storageLocationId,
		}),
		stockMovements: r.many.stockMovements({
			from: r.storageLocations.id,
			to: r.stockMovements.storageLocationId,
		}),
		// Two distinct FKs from transferLines to storageLocations — named
		// distinctly on both sides, no ambiguity since `from`/`to` are
		// explicit rather than inferred.
		transfersFrom: r.many.transferLines({
			from: r.storageLocations.id,
			to: r.transferLines.fromLocationId,
		}),
		transfersTo: r.many.transferLines({
			from: r.storageLocations.id,
			to: r.transferLines.toLocationId,
		}),
		warehouse: r.one.warehouses({
			from: r.storageLocations.warehouseId,
			to: r.warehouses.id,
		}),
	},

	suppliers: {
		purchaseOrders: r.many.purchaseOrders({
			from: r.suppliers.id,
			to: r.purchaseOrders.supplierId,
		}),
	},

	transferLines: {
		fromLocation: r.one.storageLocations({
			from: r.transferLines.fromLocationId,
			to: r.storageLocations.id,
		}),
		lot: r.one.lots({
			from: r.transferLines.lotId,
			to: r.lots.id,
		}),
		productVariant: r.one.productVariants({
			from: r.transferLines.productVariantId,
			to: r.productVariants.id,
		}),
		toLocation: r.one.storageLocations({
			from: r.transferLines.toLocationId,
			to: r.storageLocations.id,
		}),
		transfer: r.one.transfers({
			from: r.transferLines.transferId,
			to: r.transfers.id,
		}),
	},

	transfers: {
		lines: r.many.transferLines({
			from: r.transfers.id,
			to: r.transferLines.transferId,
		}),
		postedByUser: r.one.users({
			from: r.transfers.postedBy,
			to: r.users.id,
		}),
	},

	unitsOfMeasure: {
		variants: r.many.productVariants({
			from: r.unitsOfMeasure.id,
			to: r.productVariants.baseUomId,
		}),
	},

	users: {
		adjustments: r.many.adjustments({
			from: r.users.id,
			to: r.adjustments.postedBy,
		}),
		auditLog: r.many.auditLog({
			from: r.users.id,
			to: r.auditLog.actorId,
		}),
		goodsReceipts: r.many.goodsReceipts({
			from: r.users.id,
			to: r.goodsReceipts.receivedBy,
		}),
		purchaseOrders: r.many.purchaseOrders({
			from: r.users.id,
			to: r.purchaseOrders.createdBy,
		}),
		salesFulfillments: r.many.salesFulfillments({
			from: r.users.id,
			to: r.salesFulfillments.fulfilledBy,
		}),
		salesOrders: r.many.salesOrders({
			from: r.users.id,
			to: r.salesOrders.createdBy,
		}),
		stockIssues: r.many.stockIssues({
			from: r.users.id,
			to: r.stockIssues.postedBy,
		}),
		stockMovements: r.many.stockMovements({
			from: r.users.id,
			to: r.stockMovements.performedBy,
		}),
		transfers: r.many.transfers({
			from: r.users.id,
			to: r.transfers.postedBy,
		}),
	},

	variantCosting: {
		productVariant: r.one.productVariants({
			from: r.variantCosting.productVariantId,
			to: r.productVariants.id,
		}),
	},

	warehouses: {
		storageLocations: r.many.storageLocations({
			from: r.warehouses.id,
			to: r.storageLocations.warehouseId,
		}),
	},
}));

export const authRelations = defineRelationsPart(
	{ accounts, sessions, users, verifications },
	(r) => ({
		accounts: {
			user: r.one.users({
				from: r.accounts.userId,
				to: r.users.id,
			}),
		},
		sessions: {
			user: r.one.users({
				from: r.sessions.userId,
				to: r.users.id,
			}),
		},
		users: {
			accounts: r.many.accounts({
				from: r.users.id,
				to: r.accounts.userId,
			}),
			sessions: r.many.sessions({
				from: r.users.id,
				to: r.sessions.userId,
			}),
		},
	})
);
