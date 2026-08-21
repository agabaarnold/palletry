import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/_auth")({
	beforeLoad: async () => {
		const { session } = await getSession();
		if (session) {
			throw redirect({ to: "/", replace: true });
		}
	},
});
