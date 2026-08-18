import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "../db";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: "pg", usePlural: true }),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin({ ac, roles }), tanstackStartCookies()],
});
