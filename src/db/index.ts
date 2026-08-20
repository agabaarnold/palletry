import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "#/env.ts";
import { authRelations, mainRelations } from "./relations";

const pool = new Pool({ connectionString: env.DATABASE_URL });

const allRelations = {
	...mainRelations,
	...authRelations,
	users: { ...mainRelations.users, ...authRelations.users },
};

export const db = drizzle({
	client: pool,
	relations: allRelations,
});
