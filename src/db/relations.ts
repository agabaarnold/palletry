import { defineRelations, defineRelationsPart } from "drizzle-orm";
import { schema } from "./schema";
import { accounts, sessions, users, verifications } from "./schema/auth.schema";

export const mainRelations = defineRelations(schema, (r) => ({}));

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
