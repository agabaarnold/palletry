import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import LoginForm from "#/features/auth/components/login-form.tsx";

export const Route = createFileRoute("/_auth/sign-in")({
	component: SignInPage,
	validateSearch: z.object({
		redirect: z
			.string()
			.refine(
				(value) =>
					value.startsWith("/") &&
					!value.startsWith("//") &&
					!value.includes("\\"),
				"Invalid redirect path"
			)
			.optional(),
	}),
});

function SignInPage() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<LoginForm />
		</div>
	);
}
