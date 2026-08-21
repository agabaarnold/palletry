import { accounts, sessions, users, verifications } from "./auth.schema";

export const schema = {
	accounts,
	sessions,
	users,
	verifications,
} as const;
