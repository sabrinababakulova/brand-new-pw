import { useEffect, useState } from "react";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { CatSceneBoundary } from "./CatBackgroundLayer";
import { CAT_LANES, CAT_MODEL_URL } from "./cat-config";
import type { CatAsset } from "./cat-model";
import { disposeSource, getAssetWalkClip, hasSkeleton } from "./cat-model";
import { SideCatScene } from "./SideCatScene";

export default function CatScenes({
	source,
}: {
	source: ArrayBuffer | "threejs";
}) {
	const [asset, setAsset] = useState<CatAsset | null>(null);
	useEffect(() => {
		let cancelled = false;
		let loaded: CatAsset | undefined;
		const base = new URL(".", new URL(CAT_MODEL_URL, window.location.href))
			.href;
		const load = async () =>
			source === "threejs"
				? (await import("./procedural-cat")).createProceduralCat()
				: new GLTFLoader().parseAsync(source, base);
		void load()
			.then((gltf) => {
				loaded = gltf;
				if (cancelled) {
					disposeSource(gltf.scene);
					return;
				}
				if (import.meta.env.DEV) {
					console.table(
						gltf.animations.map((clip) => ({
							name: clip.name,
							seconds: clip.duration,
							tracks: clip.tracks.length,
						})),
					);
				}
				if (!hasSkeleton(gltf.scene))
					throw new Error("The cat GLB needs a skinned mesh and skeleton");
				if (!getAssetWalkClip(gltf)) {
					throw new Error(
						"No walk clip identified. Set CAT_CONFIG.model.walkClip from the clip inventory.",
					);
				}
				setAsset(gltf);
			})
			.catch((error: unknown) => {
				if (loaded) disposeSource(loaded.scene);
				loaded = undefined;
				if (import.meta.env.DEV && !cancelled)
					console.warn("Cat asset unavailable:", error);
			});
		return () => {
			cancelled = true;
			if (loaded) disposeSource(loaded.scene);
		};
	}, [source]);

	if (!asset) return null;
	return CAT_LANES.map((settings) => (
		<CatSceneBoundary key={settings.side}>
			<SideCatScene asset={asset} {...settings} />
		</CatSceneBoundary>
	));
}
