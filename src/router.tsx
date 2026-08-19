import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import AppErrorComponent from "./components/errors/app-error-component";
import AppNotFoundComponent from "./components/errors/app-not-found-component";
import { getContext } from "./integrations/tanstack-query";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
	const context = getContext();

	const router = createTanStackRouter({
		context,
		defaultErrorComponent: ({ error, reset, info }) => (
			<AppErrorComponent error={error} info={info} reset={reset} />
		),
		defaultNotFoundComponent: ({ isNotFound, routeId, data }) => (
			<AppNotFoundComponent
				data={data}
				isNotFound={isNotFound}
				routeId={routeId}
			/>
		),
		defaultPreload: "intent",
		defaultPreloadStaleTime: 0,
		routeTree,
		scrollRestoration: true,
	});

	setupRouterSsrQueryIntegration({ queryClient: context.queryClient, router });

	return router;
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
