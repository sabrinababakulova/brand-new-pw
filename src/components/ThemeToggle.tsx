import { useEffect, useMemo, useState } from "react"

type ThemeMode = "light" | "dark" | "auto"

type ThemeToggleProps = {
	className?: string
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
	if (mode === "auto") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
	}
	return mode
}

function applyThemeMode(mode: ThemeMode) {
	const resolved = resolveTheme(mode)
	document.documentElement.classList.remove("light", "dark")
	document.documentElement.classList.add(resolved)
	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme")
	} else {
		document.documentElement.setAttribute("data-theme", mode)
	}
	document.documentElement.style.colorScheme = resolved
}

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto"
	}
	const stored = window.localStorage.getItem("theme")
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored
	}
	return "auto"
}

const modeCycle: ThemeMode[] = ["light", "dark", "auto"]

export default function ThemeToggle({ className }: ThemeToggleProps) {
	const [mode, setMode] = useState<ThemeMode>("auto")
	const [isBouncing, setIsBouncing] = useState(false)

	useEffect(() => {
		const initial = getInitialMode()
		setMode(initial)
		applyThemeMode(initial)

		const media = window.matchMedia("(prefers-color-scheme: dark)")
		const handler = () => {
			if (window.localStorage.getItem("theme") === "auto") {
				applyThemeMode("auto")
			}
		}
		media.addEventListener("change", handler)
		return () => media.removeEventListener("change", handler)
	}, [])

	function toggleMode() {
		const index = modeCycle.indexOf(mode)
		const nextMode = modeCycle[(index + 1) % modeCycle.length]
		setMode(nextMode)
		window.localStorage.setItem("theme", nextMode)
		applyThemeMode(nextMode)

		setIsBouncing(true)
		window.setTimeout(() => setIsBouncing(false), 380)
	}

	const label = useMemo(() => {
		if (mode === "light") return "Theme: Light mode. Click to switch to Dark mode."
		if (mode === "dark") return "Theme: Dark mode. Click to switch to Auto mode."
		return "Theme: Auto mode. Click to switch to Light mode."
	}, [mode])

	return (
		<button
			type="button"
			onClick={toggleMode}
			aria-label={label}
			title={label}
			className={`theme-morph-toggle ${className ?? ""} ${isBouncing ? "is-bouncing" : ""}`}
		>
			<span className={`theme-icon theme-icon--sun ${mode === "light" ? "is-on" : ""}`} aria-hidden="true">
				☀
			</span>
			<span className={`theme-icon theme-icon--moon ${mode === "dark" ? "is-on" : ""}`} aria-hidden="true">
				☾
			</span>
			<span className={`theme-icon theme-icon--auto ${mode === "auto" ? "is-on" : ""}`} aria-hidden="true">
				◐
			</span>
		</button>
	)
}
