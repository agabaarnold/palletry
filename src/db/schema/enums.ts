import { pgEnum } from "drizzle-orm/pg-core";

export const trackingTypeEnum = pgEnum("tracking_type", ["none", "lot"]);

export const uomKindEnum = pgEnum("uom_kind", ["count", "weight", "volume"]);

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
	"draft",
	"submitted",
	"partially_received",
	"received",
	"cancelled",
]);

export const salesOrderStatusEnum = pgEnum("sales_order_status", [
	"draft",
	"confirmed",
	"fulfilled",
	"cancelled",
]);

export const stockIssueStatusEnum = pgEnum("stock_issue_status", [
	"draft",
	"posted",
]);

export const stockIssueReasonEnum = pgEnum("stock_issue_reason", [
	"damage",
	"sample",
	"internal_use",
	"write_off",
	"other",
]);

export const transferStatusEnum = pgEnum("transfer_status", [
	"draft",
	"posted",
]);

export const adjustmentStatusEnum = pgEnum("adjustment_status", [
	"draft",
	"posted",
]);

export const adjustmentReasonEnum = pgEnum("adjustment_reason", [
	"damage",
	"loss",
	"found",
	"cycle_count",
	"other",
]);

export const auditActionEnum = pgEnum("audit_action", [
	"create",
	"update",
	"delete",
	"archive",
]);
