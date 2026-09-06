import type { ReactNode } from "react";
import { Component, lazy, Suspense, useEffect, useState } from "react";
import { BlenderCatLanes } from "./BlenderCatLanes";
import type { CatMode } from "./cat-config";
import { CAT_CONFIG, CAT_MODE, CAT_MODEL_URL } from "./cat-config";

// Opt-in model modes defer Three.js until after the portfolio's first paint.
const CatScenes = lazy(() => import("./CatScenes"));

export class CatSceneBoundary extends Component<
	{ children: ReactNode },
	{ failed: boolean }
> {
	state = { failed: false };

	static getDerivedStateFromError() {
		return { failed: true };
	}

	componentDidCatch(error: Error) {
		if (import.meta.env.DEV) console.warn("Cat decoration unavailable:", error);
	}

	render() {
		return this.state.failed ? null : this.props.children;
	}
}

export default function CatBackgroundLayer({
	mode = CAT_MODE,
}: {
	mode?: CatMode;
}) {
	return (
		<div
			className="cat-background-layer"
			data-cat-mode={mode}
			aria-hidden="true"
			inert
		>
			<CatSceneBoundary key={mode}>
				<Suspense fallback={null}>
					{mode === "blender" ? (
						<BlenderCatLanes />
					) : (
						<ModelCatScenes mode={mode} />
					)}
				</Suspense>
			</CatSceneBoundary>
		</div>
	);
}

function ModelCatScenes({ mode }: { mode: "glb" | "threejs" }) {
	const [source, setSource] = useState<ArrayBuffer | "threejs" | null>(null);

	useEffect(() => {
		setSource(null);
		const controller = new AbortController();
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const load = async () => {
			if (mode === "threejs") {
				setSource("threejs");
				return;
			}
			timeout = setTimeout(() => controller.abort(), 15_000);
			try {
				const response = await fetch(CAT_MODEL_URL, {
					signal: controller.signal,
				});
				if (!response.ok) throw new Error(`Model request: ${response.status}`);
				const length = Number(response.headers.get("content-length"));
				if (length > CAT_CONFIG.model.maxBytes)
					throw new Error("GLB exceeds 25 MB");
				const data = await response.arrayBuffer();
				// Also reject hosts that return the portfolio's HTML for missing assets.
				if (
					data.byteLength < 20 ||
					data.byteLength > CAT_CONFIG.model.maxBytes ||
					new DataView(data).getUint32(0, true) !== 0x46546c67
				)
					throw new Error("Expected a binary glTF model");
				if (!controller.signal.aborted) setSource(data);
			} catch (error) {
				if (import.meta.env.DEV && !controller.signal.aborted) {
					console.info(
						`Cat lanes stay empty until ${CAT_MODEL_URL} is available.`,
						error,
					);
				}
			} finally {
				clearTimeout(timeout);
			}
		};
		// Defer decorative work until after the normal page has painted.
		const idle = window.requestIdleCallback?.(() => void load(), {
			timeout: 1500,
		});
		const fallback =
			idle === undefined ? setTimeout(() => void load(), 400) : undefined;
		return () => {
			if (idle !== undefined) window.cancelIdleCallback(idle);
			clearTimeout(fallback);
			clearTimeout(timeout);
			controller.abort();
		};
	}, [mode]);

	return source ? <CatScenes source={source} /> : null;
}
