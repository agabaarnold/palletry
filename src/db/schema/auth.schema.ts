import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";

export const users = snakeCase.table("users", (t) => ({
	banExpires: t.timestamp("ban_expires"),
	banned: t.boolean("banned").default(false),
	banReason: t.text("ban_reason"),
	createdAt: t.timestamp("created_at").defaultNow().notNull(),
	email: t.text("email").notNull().unique(),
	emailVerified: t.boolean("email_verified").default(false).notNull(),
	id: t.text("id").primaryKey(),
	image: t.text("image"),
	name: t.text("name").notNull(),
	role: t.text("role"),
	updatedAt: t
		.timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
}));

export const sessions = snakeCase.table(
	"sessions",
	(t) => ({
		createdAt: t.timestamp("created_at").defaultNow().notNull(),
		expiresAt: t.timestamp("expires_at").notNull(),
		id: t.text("id").primaryKey(),
		impersonatedBy: t.text("impersonated_by"),
		ipAddress: t.text("ip_address"),
		token: t.text("token").notNull().unique(),
		updatedAt: t
			.timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userAgent: t.text("user_agent"),
		userId: t
			.text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	}),
	(table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = snakeCase.table(
	"accounts",
	(t) => ({
		accessToken: t.text("access_token"),
		accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
		accountId: t.text("account_id").notNull(),
		createdAt: t.timestamp("created_at").defaultNow().notNull(),
		id: t.text("id").primaryKey(),
		idToken: t.text("id_token"),
		issuer: t.text("issuer").notNull(),
		password: t.text("password"),
		providerId: t.text("provider_id").notNull(),
		refreshToken: t.text("refresh_token"),
		refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
		scope: t.text("scope"),
		updatedAt: t
			.timestamp("updated_at")
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userId: t
			.text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	}),
	(table) => [
		uniqueIndex("accounts_issuer_accountId_uidx").on(
			table.issuer,
			table.accountId
		),
		index("accounts_userId_idx").on(table.userId),
	]
);

export const verifications = snakeCase.table(
	"verifications",
	(t) => ({
		createdAt: t.timestamp("created_at").defaultNow().notNull(),
		expiresAt: t.timestamp("expires_at").notNull(),
		id: t.text("id").primaryKey(),
		identifier: t.text("identifier").notNull(),
		updatedAt: t
			.timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		value: t.text("value").notNull(),
	}),
	(table) => [index("verifications_identifier_idx").on(table.identifier)]
);
