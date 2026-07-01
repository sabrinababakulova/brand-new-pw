import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

type ThemeMode = "light" | "dark" | "auto";

type ThemeToggleProps = {
	className?: string;
};

function resolveTheme(mode: ThemeMode): "light" | "dark" {
	if (mode === "auto") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}

	return mode;
}

function applyThemeMode(mode: ThemeMode) {
	const resolved = resolveTheme(mode);

	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}

	document.documentElement.style.colorScheme = resolved;
}

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

export default function ThemeToggle({ className }: ThemeToggleProps) {
	const [mode, setMode] = useState<ThemeMode>("auto");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		applyThemeMode(mode);
		window.localStorage.setItem("theme", mode);

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const handlePreferenceChange = () => {
			if (window.localStorage.getItem("theme") === "auto") {
				applyThemeMode("auto");
			}
		};

		media.addEventListener("change", handlePreferenceChange);
		return () => media.removeEventListener("change", handlePreferenceChange);
	}, [mode, mounted]);

	const label = useMemo(() => {
		if (!mounted || mode === "auto") return "Theme: System";
		if (mode === "light") return "Theme: Light";
		return "Theme: Dark";
	}, [mode, mounted]);

	const icon =
		!mounted || mode === "auto" ? (
			<Monitor className="size-4" />
		) : mode === "light" ? (
			<Sun className="size-4" />
		) : (
			<Moon className="size-4" />
		);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className={cn(className)}
					aria-label={label}
				>
					{icon}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuLabel>Theme</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup
					value={mode}
					onValueChange={(value) => setMode(value as ThemeMode)}
				>
					<DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="auto">System</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
