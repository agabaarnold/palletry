import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "../db";
import { schema } from "../db/schema";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
	advanced: {
		database: {
			joins: true,
		},
	},
	database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
	emailAndPassword: { disableSignUp: true, enabled: true },
	plugins: [
		admin({ ac, adminRoles: ["admin", "super-admin"], roles }),
		tanstackStartCookies(),
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},
});
