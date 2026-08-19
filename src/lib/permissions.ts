import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statements = {
	...defaultStatements,
	adjustment: ["create", "read", "post"],
	catalog: ["create", "read", "update", "archive"],
	customer: ["create", "read", "update", "archive"],
	goods_receipt: ["create", "read"],
	lot: ["read", "update"], // update = correct expiry/flag for recall
	purchase_order: ["create", "read", "update", "submit", "cancel"],
	sales_fulfillment: ["create", "read"],
	sales_order: ["create", "read", "update", "cancel"],
	stock: ["read"], // stock levels + movement ledger, read-only
	stock_issue: ["create", "read", "post"],
	supplier: ["create", "read", "update", "archive"],
	transfer: ["create", "read", "post"],
	valuation: ["read"],
	warehouse: ["create", "read", "update", "archive"],
} as const;

export const ac = createAccessControl(statements);

const superAdminRole = ac.newRole({
	...adminAc.statements,
	adjustment: ["create", "read", "post"],
	catalog: ["create", "read", "update", "archive"],
	customer: ["create", "read", "update", "archive"],
	goods_receipt: ["create", "read"],
	lot: ["read", "update"],
	purchase_order: ["create", "read", "update", "submit", "cancel"],
	sales_fulfillment: ["create", "read"],
	sales_order: ["create", "read", "update", "cancel"],
	stock: ["read"],
	stock_issue: ["create", "read", "post"],
	supplier: ["create", "read", "update", "archive"],
	transfer: ["create", "read", "post"],
	user: [...adminAc.statements.user, "impersonate-admins"],
	valuation: ["read"],
	warehouse: ["create", "read", "update", "archive"],
});

const adminRole = ac.newRole({
	...adminAc.statements,
	adjustment: ["create", "read", "post"],
	catalog: ["create", "read", "update", "archive"],
	customer: ["create", "read", "update", "archive"],
	goods_receipt: ["create", "read"],
	lot: ["read", "update"],
	purchase_order: ["create", "read", "update", "submit", "cancel"],
	sales_fulfillment: ["create", "read"],
	sales_order: ["create", "read", "update", "cancel"],
	stock: ["read"],
	stock_issue: ["create", "read", "post"],
	supplier: ["create", "read", "update", "archive"],
	transfer: ["create", "read", "post"],
	valuation: ["read"],
	warehouse: ["create", "read", "update", "archive"],
});

export const inventoryManager = ac.newRole({
	adjustment: ["create", "read", "post"],
	catalog: ["create", "read", "update", "archive"],
	customer: ["read"],
	goods_receipt: ["read"],
	lot: ["read", "update"],
	purchase_order: ["read"],
	sales_order: ["read"],
	stock: ["read"],
	stock_issue: ["create", "read", "post"],
	supplier: ["read"],
	transfer: ["create", "read", "post"],
	valuation: ["read"],
	warehouse: ["create", "read", "update", "archive"],
});

export const warehouseStaff = ac.newRole({
	adjustment: ["create", "read", "post"],
	catalog: ["read"],
	goods_receipt: ["create", "read"],
	lot: ["read"],
	sales_fulfillment: ["create", "read"],
	stock: ["read"],
	stock_issue: ["create", "read", "post"],
	transfer: ["create", "read", "post"],
	warehouse: ["read"],
});

export const purchasing = ac.newRole({
	catalog: ["read"],
	goods_receipt: ["read"],
	purchase_order: ["create", "read", "update", "submit", "cancel"],
	stock: ["read"],
	supplier: ["create", "read", "update", "archive"],
});

export const sales = ac.newRole({
	catalog: ["read"],
	customer: ["create", "read", "update", "archive"],
	sales_fulfillment: ["create", "read"],
	sales_order: ["create", "read", "update", "cancel"],
	stock: ["read"],
});

export const viewer = ac.newRole({
	adjustment: ["read"],
	catalog: ["read"],
	customer: ["read"],
	goods_receipt: ["read"],
	lot: ["read"],
	purchase_order: ["read"],
	sales_fulfillment: ["read"],
	sales_order: ["read"],
	stock: ["read"],
	stock_issue: ["read"],
	supplier: ["read"],
	transfer: ["read"],
	valuation: ["read"],
	warehouse: ["read"],
});

export const roles = {
	admin: adminRole,
	"inventory-manager": inventoryManager,
	purchasing,
	sales,
	"super-admin": superAdminRole,
	viewer,
	"warehouse-staff": warehouseStaff,
} as const;
