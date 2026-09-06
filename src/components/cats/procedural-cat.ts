import {
	Bone,
	type BufferGeometry,
	ExtrudeGeometry,
	Group,
	MeshStandardMaterial,
	Shape,
	Skeleton,
	SkinnedMesh,
	Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { CatAsset } from "./cat-model";
import type { CatLeg } from "./procedural-cat-animation";
import { createRunwayWalk } from "./procedural-cat-animation";
import type { Section, SkinWeights } from "./procedural-cat-geometry";
import { loft, oval, patch, weightGeometry } from "./procedural-cat-geometry";

// Authored from the supplied references: tall ears, tapered face, long limbs,
// compact shorthaired torso, narrowed eyes, and a long restrained tail.
const PALETTE = {
	fur: "#252525",
	ink: "#0c0c0c",
	ear: "#373737",
	iris: "#898989",
	pupil: "#080808",
	whisker: "#777777",
	highlight: "#444444",
	glint: "#d6d6d6",
};
type Tone = keyof typeof PALETTE;

const HEAD: Section[] = [
	[0, 1.32, 0.91, 0.035, 0.025],
	[0, 1.4, 0.84, 0.16, 0.15],
	[0, 1.55, 0.71, 0.33, 0.28],
	[0, 1.72, 0.63, 0.405, 0.29],
	[0, 1.88, 0.57, 0.34, 0.26],
	[0, 1.97, 0.53, 0.2, 0.15],
	[0, 2.0, 0.51, 0.005, 0.005],
];

function faceDepth(x: number, y: number, inset = 0.012) {
	let index = HEAD.findIndex((section) => section[1] >= y);
	index = Math.max(1, index === -1 ? HEAD.length - 1 : index);
	const lower = HEAD[index - 1];
	const upper = HEAD[index];
	const blend = Math.max(
		0,
		Math.min(1, (y - lower[1]) / (upper[1] - lower[1])),
	);
	const radius = lower[3] * (1 - blend) + upper[3] * blend;
	const depth = lower[4] * (1 - blend) + upper[4] * blend;
	const center = lower[2] * (1 - blend) + upper[2] * blend;
	return (
		center + depth * Math.sqrt(Math.max(0.04, 1 - (x / radius) ** 2)) + inset
	);
}

export function createProceduralCat(): CatAsset {
	const scene = new Group();
	scene.name = "Reference_Cat";
	scene.userData.proceduralCat = true;
	const bones: Bone[] = [];
	const bone = (name: string, point: Vector3, parent?: number) => {
		const node = new Bone();
		node.name = name;
		node.position.copy(point);
		if (parent === undefined) scene.add(node);
		else {
			const parentWorld = bones[parent].getWorldPosition(new Vector3());
			node.position.sub(parentWorld);
			bones[parent].add(node);
		}
		scene.updateMatrixWorld(true);
		bones.push(node);
		return bones.length - 1;
	};
	const spine = bone("cat_spine", new Vector3());
	const head = bone("cat_head", new Vector3(0, 1.48, 0.51), spine);
	const tail = bone("cat_tail", new Vector3(0, 1.22, -0.82), spine);
	const buckets = new Map<Tone, BufferGeometry[]>();
	const add = (
		geometry: BufferGeometry,
		tone: Tone,
		weights: number | ((point: Vector3) => SkinWeights),
	) => {
		weightGeometry(geometry, weights);
		if (!geometry.index)
			geometry.setIndex(
				Array.from(
					{ length: geometry.getAttribute("position").count },
					(_, index) => index,
				),
			);
		const bucket = buckets.get(tone) ?? [];
		bucket.push(geometry);
		buckets.set(tone, bucket);
	};
	const stroke = (
		points: [number, number, number][],
		radius: number,
		tone: Tone,
		joint: number,
	) => {
		add(
			loft(
				points.map(([x, y, z], index) => [
					x,
					y,
					z,
					index === points.length - 1 ? radius * 0.15 : radius,
					radius,
				]),
				points.length * 4,
				5,
			),
			tone,
			joint,
		);
	};

	add(
		loft(
			[
				[0, 1.21, -0.91, 0.025, 0.03],
				[0, 1.24, -0.67, 0.29, 0.3],
				[0, 1.26, -0.3, 0.3, 0.285],
				[0, 1.32, 0.1, 0.28, 0.31],
				[0, 1.39, 0.38, 0.28, 0.34],
				[0, 1.48, 0.59, 0.2, 0.24],
				[0, 1.55, 0.67, 0.025, 0.03],
			],
			40,
			28,
		),
		"fur",
		spine,
	);
	add(
		loft(
			[
				[0, 1.18, 0.35, 0.08, 0.11],
				[0, 1.36, 0.44, 0.22, 0.23],
				[0, 1.58, 0.51, 0.245, 0.235],
				[0, 1.76, 0.55, 0.16, 0.18],
			],
			24,
			24,
		),
		"fur",
		spine,
	);
	add(loft(HEAD, 42, 32), "fur", head);

	for (const side of [-1, 1]) {
		const ear = new Shape();
		ear.moveTo(side * 0.13, 1.85);
		ear.bezierCurveTo(side * 0.2, 2.05, side * 0.3, 2.28, side * 0.405, 2.4);
		ear.bezierCurveTo(
			side * 0.445,
			2.34,
			side * 0.455,
			2.04,
			side * 0.415,
			1.86,
		);
		ear.quadraticCurveTo(side * 0.29, 1.8, side * 0.13, 1.85);
		const geometry = new ExtrudeGeometry(ear, {
			depth: 0.08,
			bevelEnabled: true,
			bevelThickness: 0.018,
			bevelSize: 0.016,
			bevelSegments: 3,
			steps: 1,
			curveSegments: 12,
		});
		geometry.translate(0, 0, 0.48);
		add(geometry, "fur", head);
		const inner = new Shape();
		inner.moveTo(side * 0.22, 1.94);
		inner.quadraticCurveTo(side * 0.3, 2.16, side * 0.391, 2.31);
		inner.quadraticCurveTo(side * 0.418, 2.12, side * 0.379, 1.96);
		inner.quadraticCurveTo(side * 0.29, 1.94, side * 0.22, 1.94);
		add(
			patch(inner, () => 0.586),
			"ear",
			head,
		);
		stroke(
			[
				[side * 0.25, 1.98, 0.592],
				[side * 0.31, 2.13, 0.592],
				[side * 0.38, 2.29, 0.59],
			],
			0.004,
			"highlight",
			head,
		);

		const eye = new Shape();
		eye.moveTo(side * 0.078, 1.712);
		eye.bezierCurveTo(
			side * 0.14,
			1.774,
			side * 0.265,
			1.79,
			side * 0.337,
			1.777,
		);
		eye.bezierCurveTo(
			side * 0.286,
			1.716,
			side * 0.173,
			1.691,
			side * 0.078,
			1.712,
		);
		add(
			patch(eye, (x, y) => faceDepth(x, y, 0.027)),
			"iris",
			head,
		);
		add(
			patch(oval(side * 0.205, 1.74, 0.015, 0.034), (x, y) =>
				faceDepth(x, y, 0.035),
			),
			"pupil",
			head,
		);
		add(
			patch(oval(side * 0.194, 1.759, 0.007, 0.008), (x, y) =>
				faceDepth(x, y, 0.038),
			),
			"glint",
			head,
		);
		stroke(
			[
				[side * 0.078, 1.722, faceDepth(side * 0.078, 1.722, 0.04)],
				[side * 0.2, 1.787, faceDepth(side * 0.2, 1.787, 0.03)],
				[side * 0.34, 1.786, faceDepth(side * 0.34, 1.786, 0.022)],
			],
			0.013,
			"ink",
			head,
		);
		stroke(
			[
				[side * 0.12, 1.824, faceDepth(side * 0.12, 1.824, 0.012)],
				[side * 0.2, 1.875, faceDepth(side * 0.2, 1.875, 0.012)],
				[side * 0.275, 1.905, faceDepth(side * 0.275, 1.905, 0.012)],
			],
			0.007,
			"highlight",
			head,
		);
		for (let whisker = 0; whisker < 3; whisker++) {
			const y = 1.44 + whisker * 0.035;
			stroke(
				[
					[side * 0.16, y, 0.995],
					[side * 0.33, y + (whisker - 1) * 0.014, 1.0],
					[side * 0.52, y + (whisker - 1) * 0.04, 0.94],
					[side * 0.65, y + (whisker - 1) * 0.07, 0.88],
				],
				0.0022,
				"whisker",
				head,
			);
		}
		stroke(
			[
				[side * 0.1, 1.395, 1.001],
				[side * 0.06, 1.403, 1.025],
				[0, 1.412, 1.034],
			],
			0.004,
			"ink",
			head,
		);
	}
	const nose = new Shape();
	nose.moveTo(-0.083, 1.524);
	nose.quadraticCurveTo(0, 1.544, 0.083, 1.524);
	nose.quadraticCurveTo(0.038, 1.466, 0, 1.45);
	nose.quadraticCurveTo(-0.038, 1.466, -0.083, 1.524);
	add(
		patch(nose, (x) => 1.047 - Math.abs(x) * 0.24),
		"ink",
		head,
	);
	stroke(
		[
			[-0.048, 1.523, 1.04],
			[0, 1.529, 1.05],
			[0.04, 1.522, 1.04],
		],
		0.004,
		"highlight",
		head,
	);
	stroke(
		[
			[0, 1.453, 1.048],
			[0, 1.425, 1.043],
			[0, 1.412, 1.037],
		],
		0.005,
		"ink",
		head,
	);

	const legs: CatLeg[] = [];
	for (const hind of [false, true]) {
		for (const side of [-1, 1]) {
			const name = `${hind ? "hind" : "fore"}_${side < 0 ? "left" : "right"}`;
			const hip = new Vector3(
				side * (hind ? 0.265 : 0.24),
				hind ? 1.24 : 1.31,
				hind ? -0.64 : 0.36,
			);
			const knee = new Vector3(
				side * 0.25,
				hind ? 0.7 : 0.72,
				hind ? -0.34 : 0.25,
			);
			const foot = new Vector3(side * 0.24, 0.105, hind ? -0.6 : 0.47);
			const upper = bone(`${name}_0`, hip, spine);
			const lower = bone(`${name}_1`, knee, upper);
			const paw = bone(`${name}_2`, foot, lower);
			const leg: CatLeg = {
				name,
				hip,
				knee,
				foot,
				hind,
				phase: hind ? (side < 0 ? 0.75 : 0.25) : side < 0 ? 0 : 0.5,
				bones: [upper, lower, paw],
			};
			legs.push(leg);
			add(
				loft(
					[
						[hip.x, hip.y + 0.08, hip.z, 0.02, 0.025],
						[
							hip.x,
							hip.y - 0.1,
							hip.z,
							hind ? 0.155 : 0.12,
							hind ? 0.21 : 0.14,
						],
						[knee.x, knee.y + 0.12, knee.z, 0.091, 0.12],
						[knee.x, knee.y, knee.z, 0.078, 0.094],
						[foot.x, foot.y + 0.18, foot.z - 0.04, 0.052, 0.069],
						[foot.x, foot.y, foot.z, 0.061, 0.075],
					],
					32,
					16,
				),
				"fur",
				(point) => {
					if (point.y < foot.y + 0.12)
						return [
							lower,
							paw,
							Math.max(0, Math.min(1, (foot.y + 0.12 - point.y) / 0.12)),
						];
					return [
						upper,
						lower,
						Math.max(0, Math.min(1, (knee.y + 0.14 - point.y) / 0.28)),
					];
				},
			);
			add(
				loft(
					[
						[foot.x, 0.085, foot.z - 0.08, 0.01, 0.012],
						[foot.x, 0.094, foot.z - 0.025, 0.088, 0.085],
						[foot.x, 0.09, foot.z + 0.1, 0.105, 0.073],
						[foot.x, 0.072, foot.z + 0.17, 0.077, 0.047],
						[foot.x, 0.07, foot.z + 0.185, 0.005, 0.005],
					],
					18,
					16,
				),
				"fur",
				paw,
			);
			for (const toe of [-1, 1])
				stroke(
					[
						[foot.x + toe * 0.036, 0.142, foot.z + 0.07],
						[foot.x + toe * 0.037, 0.132, foot.z + 0.14],
						[foot.x + toe * 0.033, 0.092, foot.z + 0.171],
					],
					0.003,
					"ink",
					paw,
				);
		}
	}
	add(
		loft(
			[
				[0, 1.24, -0.82, 0.09, 0.095],
				[0.06, 1.4, -1.03, 0.084, 0.082],
				[0.26, 1.71, -1.16, 0.07, 0.07],
				[0.49, 1.95, -1.12, 0.058, 0.058],
				[0.58, 2.09, -0.94, 0.045, 0.045],
				[0.55, 2.12, -0.79, 0.005, 0.005],
			],
			36,
			14,
		),
		"fur",
		tail,
	);

	scene.updateMatrixWorld(true);
	const skeleton = new Skeleton(bones);
	for (const [tone, geometries] of buckets) {
		const geometry = mergeGeometries(geometries);
		for (const part of geometries) part.dispose();
		if (!geometry) throw new Error(`Could not merge cat ${tone} geometry`);
		const material = new MeshStandardMaterial({
			color: PALETTE[tone],
			roughness: 0.9,
		});
		material.name = tone;
		const mesh = new SkinnedMesh(geometry, material);
		mesh.name = `cat_${tone}`;
		scene.add(mesh);
		mesh.bind(skeleton);
	}
	scene.updateMatrixWorld(true);
	return { scene, animations: [createRunwayWalk(legs)] };
}
