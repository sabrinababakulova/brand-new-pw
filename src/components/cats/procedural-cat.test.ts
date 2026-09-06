import { AnimationMixer, SkinnedMesh, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import { CAT_CONFIG } from "./cat-config";
import {
	createCatInstance,
	disposeSource,
	getAssetWalkClip,
	hasSkeleton,
} from "./cat-model";
import { createProceduralCat } from "./procedural-cat";

describe("procedural cat", () => {
	it("builds an optimized monochrome skinned asset without textures or an external model", () => {
		const asset = createProceduralCat();
		expect(hasSkeleton(asset.scene)).toBe(true);
		let triangles = 0;
		let meshes = 0;
		asset.scene.traverse((node) => {
			if (!(node instanceof SkinnedMesh)) return;
			meshes++;
			triangles += (node.geometry.index?.count ?? 0) / 3;
			const weights = node.geometry.getAttribute("skinWeight");
			const indices = node.geometry.getAttribute("skinIndex");
			for (let vertex = 0; vertex < weights.count; vertex++) {
				expect(
					weights.getX(vertex) +
						weights.getY(vertex) +
						weights.getZ(vertex) +
						weights.getW(vertex),
				).toBeCloseTo(1);
				expect(indices.getX(vertex)).toBeLessThan(node.skeleton.bones.length);
				expect(indices.getY(vertex)).toBeLessThan(node.skeleton.bones.length);
			}
		});
		expect(meshes).toBeLessThanOrEqual(9);
		expect(triangles).toBeLessThan(35_000);
		const clone = createCatInstance(asset.scene);
		for (const material of clone.materials) {
			expect(material.map).toBeNull();
			expect(material.color.r).toBe(material.color.g);
			expect(material.color.g).toBe(material.color.b);
		}
		clone.dispose();
		disposeSource(asset.scene);
	});

	it("animates weighted vertices independently and loops without a bone jump", () => {
		const asset = createProceduralCat();
		const left = createCatInstance(asset.scene);
		const right = createCatInstance(asset.scene);
		const walk = getAssetWalkClip(asset);
		if (!walk) throw new Error("Missing procedural walk");
		const mixer = new AnimationMixer(left.skeletonRoot);
		mixer.clipAction(walk).play();
		const pose = (time: number) => {
			mixer.setTime(time);
			left.model.updateMatrixWorld(true);
			const mesh = left.skeletonRoot.getObjectByName("cat_fur") as SkinnedMesh;
			mesh.skeleton.update();
			const position = mesh.geometry.getAttribute("position");
			const result: Vector3[] = [];
			for (let index = 0; index < position.count; index += 50) {
				result.push(
					mesh.applyBoneTransform(
						index,
						new Vector3().fromBufferAttribute(position, index),
					),
				);
			}
			return result;
		};
		const first = pose(0);
		const mid = pose(0.7);
		const loop = pose(walk.duration);
		expect(
			Math.max(...first.map((point, index) => point.distanceTo(mid[index]))),
		).toBeGreaterThan(0.05);
		expect(
			Math.max(...first.map((point, index) => point.distanceTo(loop[index]))),
		).toBeLessThan(0.00001);
		expect(
			right.skeletonRoot.getObjectByName("fore_left_0")?.quaternion.w,
		).toBe(1);
		mixer.stopAllAction();
		mixer.uncacheRoot(left.skeletonRoot);
		left.dispose();
		right.dispose();
		disposeSource(asset.scene);
	});

	it("keeps procedural playback independent of a future GLB clip override", () => {
		const asset = createProceduralCat();
		const old = CAT_CONFIG.model.walkClip;
		try {
			CAT_CONFIG.model.walkClip = "Custom Blender Take";
			expect(getAssetWalkClip(asset)?.name).toBe("Editorial_Runway_Walk");
		} finally {
			CAT_CONFIG.model.walkClip = old;
			disposeSource(asset.scene);
		}
	});
});
