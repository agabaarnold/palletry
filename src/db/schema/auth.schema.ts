import { index, snakeCase, uniqueIndex } from "drizzle-orm/pg-core";

export const users = snakeCase.table("users", (t) => ({
	banExpires: t.timestamp(),
	banned: t.boolean().default(false),
	banReason: t.text(),
	createdAt: t.timestamp().defaultNow().notNull(),
	email: t.text().notNull().unique(),
	emailVerified: t.boolean().default(false).notNull(),
	id: t.text().primaryKey(),
	image: t.text(),
	name: t.text().notNull(),
	role: t.text(),
	updatedAt: t
		.timestamp()
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
}));

export const sessions = snakeCase.table(
	"sessions",
	(t) => ({
		createdAt: t.timestamp().defaultNow().notNull(),
		expiresAt: t.timestamp().notNull(),
		id: t.text().primaryKey(),
		impersonatedBy: t.text(),
		ipAddress: t.text(),
		token: t.text().notNull().unique(),
		updatedAt: t
			.timestamp()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userAgent: t.text(),
		userId: t
			.text()
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	}),
	(table) => [index("sessions_userId_idx").on(table.userId)]
);

export const accounts = snakeCase.table(
	"accounts",
	(t) => ({
		accessToken: t.text(),
		accessTokenExpiresAt: t.timestamp(),
		accountId: t.text().notNull(),
		createdAt: t.timestamp().defaultNow().notNull(),
		id: t.text().primaryKey(),
		idToken: t.text(),
		issuer: t.text().notNull(),
		password: t.text(),
		providerId: t.text().notNull(),
		refreshToken: t.text(),
		refreshTokenExpiresAt: t.timestamp(),
		scope: t.text(),
		updatedAt: t
			.timestamp()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userId: t
			.text()
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
		createdAt: t.timestamp().defaultNow().notNull(),
		expiresAt: t.timestamp().notNull(),
		id: t.text().primaryKey(),
		identifier: t.text().notNull(),
		updatedAt: t
			.timestamp()
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		value: t.text().notNull(),
	}),
	(table) => [index("verifications_identifier_idx").on(table.identifier)]
);
