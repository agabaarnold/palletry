import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;

const whiteSpaceRegex = /\s/u;

export const passwordSchema = z
	.string()
	.min(
		PASSWORD_MIN_LENGTH,
		`Password must be at least ${PASSWORD_MIN_LENGTH} characters`
	)
	.max(128, "Password must not exceed 128 characters")
	.regex(/[A-Z]/u, "Password must contain at least one uppercase letter")
	.regex(/[a-z]/u, "Password must contain at least one lowercase letter")
	.regex(/[0-9]/u, "Password must contain at least one number")
	.regex(
		/[^A-Za-z0-9\s]/u,
		"Password must contain at least one special character"
	)
	.refine(
		(v) => !whiteSpaceRegex.test(v),
		"Password must not contain whitespace"
	);

export const loginSchema = z.object({
	email: z.email(),
	password: z.string().min(1, "Password is required"),
	rememberMe: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;
