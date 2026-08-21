import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { type ComponentProps, useState } from "react";
import { Button } from "./button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";

type PasswordInputProps = ComponentProps<"input">;

const PasswordInput = ({ ...props }: PasswordInputProps) => {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<InputGroup>
			<InputGroupInput {...props} type={showPassword ? "text" : "password"} />

			<InputGroupAddon align="inline-end">
				<Button
					aria-label={showPassword ? "Hide password" : "Show password"}
					aria-pressed={showPassword}
					onClick={() => setShowPassword((show) => !show)}
					size="icon-sm"
					type="button"
				>
					{showPassword ? <IconEyeOff /> : <IconEye />}
				</Button>
			</InputGroupAddon>
		</InputGroup>
	);
};

export default PasswordInput;
