import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card.tsx";
import { FieldGroup } from "#/components/ui/field.tsx";
import { useAppForm } from "#/hooks/forms/use-form.ts";
import { authClient } from "#/lib/auth-client.ts";
import { type LoginInput, loginSchema } from "../schema";

const LoginForm = () => {
	const navigate = useNavigate();
	const search = useSearch({ from: "/_auth/sign-in" });

	const defaultValues: LoginInput = {
		email: "",
		password: "",
		rememberMe: false,
	};

	const form = useAppForm({
		defaultValues,
		onSubmit: async ({ value }) => {
			await authClient.signIn.email({
				...value,
				fetchOptions: {
					onError: ({ error }) => {
						toast.error(error.message);
					},
					onSuccess: () => {
						toast.success("Welcome back!");
						navigate({ replace: true, to: search.redirect ?? "/" });
					},
				},
			});
		},
		validationLogic: revalidateLogic({
			mode: "submit",
			modeAfterSubmission: "blur",
		}),
		validators: { onSubmit: loginSchema },
	});

	return (
		<Card className="w-full max-w-sm md:max-w-md">
			<CardHeader className="text-center">
				<CardTitle className="font-semibold text-xl">Welcome back</CardTitle>
				<CardDescription>Sign in to your account to continue</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}
				>
					<FieldGroup>
						<form.AppField name="email">
							{(field) => (
								<field.FormInput
									label="Email address"
									placeholder="Enter your email address"
									type="email"
								/>
							)}
						</form.AppField>

						<form.AppField name="password">
							{(field) => (
								<field.FormPassword
									isLogin={true}
									label="Password"
									placeholder="Enter your password"
								/>
							)}
						</form.AppField>

						<form.AppField name="rememberMe">
							{(field) => <field.FormCheckbox label="Remember me" />}
						</form.AppField>

						<form.AppForm>
							<form.SubmitButton label="Login" submitLabel="Logging in" />
						</form.AppForm>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
};

export default LoginForm;
