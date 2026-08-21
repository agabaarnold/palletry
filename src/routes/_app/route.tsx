import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "#/features/auth/functions/index.ts";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ location }) => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/sign-in", search: { redirect: location.href } });
		}

		return { user: session.user };
	},
	component: AppLayout,
});

function AppLayout() {
	return <div>Hello "/_app"!</div>;
}
