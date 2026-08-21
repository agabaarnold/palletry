import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	emptyStringAsUndefined: true,
	runtimeEnv: process.env,
	server: {
		BETTER_AUTH_SECRET: z.string(),
		BETTER_AUTH_URL: z.url(),
		DATABASE_URL: z.url(),
		NODE_ENV: z.enum(["development", "production"]).default("production"),
		SMTP_FROM: z.string().min(1),
		SMTP_HOST: z.string(),
		SMTP_PASS: z.string(),
		SMTP_PORT: z.coerce.number(),
		SMTP_USER: z.string(),
	},
});
