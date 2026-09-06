/** Public URL; place the actual rigged asset at public/models/cat.glb. */
export const CAT_MODEL_URL = "/models/cat.glb";

export type CatMode = "blender" | "glb" | "threejs";
/** No flag: Blender outline animation. Keep Three.js and GLB as opt-in modes. */
export const CAT_MODE: CatMode =
	import.meta.env.VITE_CAT_MODE === "threejs"
		? "threejs"
		: import.meta.env.VITE_CAT_MODE === "glb"
			? "glb"
			: "blender";

export const BLENDER_CAT_LANES = [
	{
		side: "left",
		animation: "/cats/outline-cat.webp",
		poster: "/cats/outline-cat.png",
	},
	{
		side: "right",
		// The same Blender loop, starting nine frames later for alternating steps.
		animation: "/cats/outline-cat-right.webp",
		poster: "/cats/outline-cat-right.png",
	},
] as const;

export const CAT_CONFIG = {
	model: {
		// Inspect the clip inventory in the development console, then override if needed.
		walkClip: null as string | null,
		// Asset contract: Y-up, feet on the ground, facing +Z, in-place walk.
		rotationY: 0,
		height: 2.15,
		maxBytes: 25 * 1024 * 1024,
	},
	walk: {
		speed: 0.72,
		journeySeconds: 18,
		startZ: -0.65,
		endZ: 0.2,
		fadeSeconds: 0.85,
	},
	camera: { fov: 33, y: 1.55, z: 6.5, targetY: 1.15 },
	flashes: {
		minPauseSeconds: 4.5,
		maxPauseSeconds: 11,
		intensity: 14,
		minDurationSeconds: 0.04,
		maxDurationSeconds: 0.1,
		doubleChance: 0.12,
		doubleGapSeconds: 0.24,
	},
	performance: { maxDpr: 1.5, shadowMapSize: 512 },
};

export type CatSide = "left" | "right";

export interface CatLaneSettings {
	side: CatSide;
	scale: number;
	x: number;
	/** Fraction of a skeletal walk cycle / runway journey, between 0 and 1. */
	phase: number;
	cameraOffset: number;
	flashTiming: number;
}

export const CAT_LANES: readonly CatLaneSettings[] = [
	{
		side: "left",
		scale: 1,
		x: -0.09,
		phase: 0,
		cameraOffset: 0.05,
		flashTiming: 1,
	},
	{
		side: "right",
		scale: 0.94,
		x: 0.09,
		phase: 0.43,
		cameraOffset: -0.06,
		flashTiming: 1.23,
	},
];
