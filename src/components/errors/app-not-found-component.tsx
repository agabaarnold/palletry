import {
	IconArrowLeft,
	IconCompassOff,
	IconHome,
	IconSearch,
} from "@tabler/icons-react";
import {
	Link,
	type NotFoundRouteProps,
	useRouter,
} from "@tanstack/react-router";
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

const AppNotFoundComponent = ({ routeId }: NotFoundRouteProps) => {
	const router = useRouter();

	const handleBack = () => {
		router.history.back();
	};

	return (
		<main className="flex min-h-screen items-center justify-center px-6 py-12">
			<div className="w-full max-w-2xl">
				<Card>
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
							<IconCompassOff
								aria-hidden="true"
								className="size-8 text-muted-foreground"
							/>
						</div>

						<p className="font-semibold text-muted-foreground text-sm uppercase tracking-widest">
							404
						</p>

						<CardTitle className="text-3xl">Page not found</CardTitle>

						<CardDescription className="mx-auto max-w-lg">
							The page you're looking for doesn't exist, may have moved, or the
							address may be incorrect.
						</CardDescription>
					</CardHeader>

					<CardContent className="space-y-5">
						<div className="rounded-lg border bg-muted/50 p-4">
							<div className="flex items-start gap-3">
								<IconSearch
									aria-hidden="true"
									className="mt-0.5 size-5 shrink-0 text-muted-foreground"
								/>

								<div className="min-w-0">
									<p className="font-medium text-sm">Check the address</p>

									<p className="mt-1 break-all text-muted-foreground text-sm">
										Make sure the URL is correct and try again.
									</p>
								</div>
							</div>
						</div>

						{import.meta.env.DEV
							? routeId && (
									<>
										<Separator />

										<div className="text-center text-muted-foreground text-xs">
											Handled by route:{" "}
											<code className="rounded bg-muted px-1 py-0.5">
												{routeId}
											</code>
										</div>
									</>
								)
							: null}
					</CardContent>

					<CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
						<Button onClick={handleBack} type="button" variant="outline">
							<IconArrowLeft />
							Go back
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

export default AppNotFoundComponent;
