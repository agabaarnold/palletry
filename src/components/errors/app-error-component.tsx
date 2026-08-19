/** biome-ignore-all lint/style/noNestedTernary: For simplicity */

import {
	IconAlertTriangle,
	IconArrowLeft,
	IconBug,
	IconHome,
	IconRefresh,
} from "@tabler/icons-react";
import {
	type ErrorComponentProps,
	Link,
	useRouter,
} from "@tanstack/react-router";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button, buttonVariants } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";

const AppErrorComponent = ({ error, reset, info }: ErrorComponentProps) => {
	const router = useRouter();

	const message =
		error instanceof Error
			? error.message
			: typeof error === "string"
				? error
				: "An unexpected error occurred";

	const handleRetry = () => {
		// biome-ignore lint/complexity/noVoid: Ignore
		void router.invalidate();
		reset();
	};

	const handleBack = () => {
		router.history.back();
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-6 py-12">
			<div className="w-full max-w-2xl">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
							<IconAlertTriangle
								aria-hidden="true"
								className="size-7 text-destructive"
							/>
						</div>

						<CardTitle className="text-2xl">Something went wrong</CardTitle>

						<CardDescription className="mx-auto max-w-lg">
							We couldn't complete this request. You can try again or return to
							a previous page.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-6">
						<Alert variant="destructive">
							<IconBug aria-hidden="true" className="size-4" />

							<AlertTitle>Unexpected error</AlertTitle>

							<AlertDescription>
								{import.meta.env.DEV
									? message
									: "An unexpected error occurred while loading this page."}
							</AlertDescription>
						</Alert>

						{import.meta.env.DEV ? (
							<div className="space-y-3">
								<div className="flex items-center gap-2 font-medium text-sm">
									<IconBug className="size-4" />
									Development details
								</div>

								<Separator />

								<div className="overflow-auto rounded-md bg-muted p-4">
									<pre className="wrap-break-word whitespace-pre-wrap text-xs">
										{error instanceof Error
											? (error.stack ?? error.message)
											: JSON.stringify(error, null, 2)}
									</pre>
								</div>

								{info?.componentStack ? (
									<>
										<div className="font-medium text-sm">Component stack</div>

										<div className="overflow-auto rounded-md bg-muted p-4">
											<pre className="wrap-break-word whitespace-pre-wrap text-xs">
												{info.componentStack}
											</pre>
										</div>
									</>
								) : null}
							</div>
						) : null}
					</CardContent>

					<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
						<Button onClick={handleBack} type="button" variant="outline">
							<IconArrowLeft />
							Go back
						</Button>

						<Button onClick={handleRetry} type="button" variant="outline">
							<IconRefresh />
							Try again
						</Button>

						<Link className={buttonVariants()} to="/">
							<IconHome />
							Go home
						</Link>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
};

export default AppErrorComponent;
