import {
	AnimationClip,
	Bone,
	Box3,
	BufferGeometry,
	DirectionalLight,
	Float32BufferAttribute,
	Group,
	MeshStandardMaterial,
	NumberKeyframeTrack,
	Skeleton,
	SkinnedMesh,
	Uint16BufferAttribute,
	Vector3,
} from "three";
import { describe, expect, it } from "vitest";
import { CAT_CONFIG } from "./cat-config";
import {
	createCatInstance,
	disposeSource,
	hasSkeleton,
	selectWalkClip,
} from "./cat-model";

const clip = (name: string) =>
	new AnimationClip(name, 2, [
		new NumberKeyframeTrack("root.position[y]", [0, 1, 2], [0, 0.1, 0]),
	]);

// A single skinned triangle exercises the asset pipeline; this is not a cat asset.
function rigFixture() {
	const scene = new Group();
	const root = new Bone();
	root.name = "root";
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		"position",
		new Float32BufferAttribute([2, 1, 0, 3, 1, 0, 2, 3, 0], 3),
	);
	geometry.setAttribute(
		"skinIndex",
		new Uint16BufferAttribute(new Array(12).fill(0), 4),
	);
	geometry.setAttribute(
		"skinWeight",
		new Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4),
	);
	const material = new MeshStandardMaterial({ color: "green" });
	material.name = "iris";
	const mesh = new SkinnedMesh(geometry, material);
	mesh.add(root);
	mesh.bind(new Skeleton([root]));
	scene.add(mesh, new DirectionalLight("green"));
	return { scene, mesh, root, material };
}

describe("cat asset contract", () => {
	it("finds descriptive walk names instead of assuming Walk or selecting the first clip", () => {
		const walk = clip("Armature|Runway_Walking_Loop");
		expect(selectWalkClip([clip("Idle"), clip("Run"), walk], null)).toBe(walk);
	});

	it("supports an exact override and refuses unrelated or empty animations", () => {
		const custom = clip("Take 003");
		expect(selectWalkClip([custom], "Take 003")).toBe(custom);
		expect(selectWalkClip([custom], "Walk")).toBeUndefined();
		expect(selectWalkClip([clip("Idle"), clip("Jump")], null)).toBeUndefined();
		expect(
			selectWalkClip([new AnimationClip("Walk", 2, [])], null),
		).toBeUndefined();
	});

	it("requires a skeleton", () => {
		const fixture = rigFixture();
		expect(hasSkeleton(new Group())).toBe(false);
		expect(hasSkeleton(fixture.scene)).toBe(true);
		disposeSource(fixture.scene);
	});

	it("clones independent bones and materials while sharing geometry", () => {
		const source = rigFixture();
		const left = createCatInstance(source.scene);
		const right = createCatInstance(source.scene);
		const leftBone = left.skeletonRoot.getObjectByName("root");
		const rightBone = right.skeletonRoot.getObjectByName("root");
		expect(leftBone).not.toBe(rightBone);
		leftBone?.position.setY(1);
		expect(rightBone?.position.y).toBe(0);
		expect(source.root.position.y).toBe(0);
		expect(left.materials[0]).not.toBe(right.materials[0]);
		expect((left.skeletonRoot.children[0] as SkinnedMesh).geometry).toBe(
			source.mesh.geometry,
		);
		left.dispose();
		right.dispose();
		disposeSource(source.scene);
	});

	it("normalizes height and grounds the model without changing the source", () => {
		const source = rigFixture();
		const cat = createCatInstance(source.scene);
		const bounds = new Box3().setFromObject(cat.model);
		expect(bounds.min.y).toBeCloseTo(0);
		expect(bounds.getCenter(new Vector3()).x).toBeCloseTo(0);
		expect(bounds.getSize(new Vector3()).y).toBeCloseTo(
			CAT_CONFIG.model.height,
		);
		expect(new Box3().setFromObject(source.mesh).min.y).toBe(1);
		cat.dispose();
		disposeSource(source.scene);
	});

	it("removes imported colored lights and uses neutral material colors", () => {
		const source = rigFixture();
		const cat = createCatInstance(source.scene);
		let lights = 0;
		cat.model.traverse((node) => {
			if ("isLight" in node) lights++;
		});
		expect(lights).toBe(0);
		const color = cat.materials[0].color;
		expect(color.r).toBe(color.g);
		expect(color.g).toBe(color.b);
		expect(source.material.color.g).toBeGreaterThan(source.material.color.r);
		cat.dispose();
		disposeSource(source.scene);
	});
});
