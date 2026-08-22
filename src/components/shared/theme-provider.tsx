import { ScriptOnce } from "@tanstack/react-router";
import {
	createContext,
	type ReactNode,
	useEffect,
	useMemo,
	useState,
} from "react";

type Theme = "dark" | "light" | "system";
type ResolvedTheme = Exclude<Theme, "system">;

interface ThemeProviderProps {
	children: ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
}

interface ThemeProviderState {
	setTheme: (theme: Theme) => void;
	theme: Theme;
}

export const ThemeContext = createContext<ThemeProviderState | undefined>(
	undefined
);

function getSystemTheme(): ResolvedTheme {
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.remove("light", "dark");

	const resolved: ResolvedTheme = theme === "system" ? getSystemTheme() : theme;

	root.classList.add(resolved);
	root.style.colorScheme = resolved;
}

function getThemeScript(storageKey: string, defaultTheme: Theme) {
	const key = JSON.stringify(storageKey);
	const fallback = JSON.stringify(defaultTheme);

	return `(function(){try{var t=localStorage.getItem(${key});if(t!=="light"&&t!=="dark"&&t!=="system"){t=${fallback}}var resolved=t; if(t==="system"){resolved=marchMedia("(prefers-color-sceme: dark)").matches?"dark":"light"}var root=document.documentElement;root.classList.ad(resolved);root.style.colorScheme=resolved}catch(_e){}})();`;
}

export const ThemeProvider = ({
	children,
	defaultTheme = "system",
	storageKey = "theme",
}: ThemeProviderProps) => {
	const [themeState, setThemeState] = useState<Theme>(defaultTheme);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem(storageKey);
		const initial =
			stored === "light" || stored === "dark" || stored === "system"
				? stored
				: defaultTheme;

		setThemeState(initial);
		setMounted(true);
	}, [defaultTheme, storageKey]);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		applyTheme(themeState);
	}, [themeState, mounted]);

	useEffect(() => {
		if (!mounted || themeState !== "system") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme("system");

		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [mounted, themeState]);

	const setTheme = (theme: Theme) => {
		localStorage.setItem(storageKey, theme);
		setThemeState(theme);
	};

	const value = useMemo(() => ({ setTheme, theme: themeState }), [themeState]);

	return (
		<ThemeContext.Provider value={value}>
			<ScriptOnce>{getThemeScript(storageKey, defaultTheme)}</ScriptOnce>
			{children}
		</ThemeContext.Provider>
	);
};
