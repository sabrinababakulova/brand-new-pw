import type {
	AnimationClip,
	Material,
	MeshStandardMaterial,
	Object3D,
} from "three";
import {
	Box3,
	DataTexture,
	Group,
	Mesh,
	MeshToonMaterial,
	NearestFilter,
	RedFormat,
	SkinnedMesh,
	Texture,
	Vector3,
} from "three";
import { clone } from "three/addons/utils/SkeletonUtils.js";
import { CAT_CONFIG } from "./cat-config";

export interface CatAsset {
	scene: Group;
	animations: AnimationClip[];
}

export function getAssetWalkClip(asset: CatAsset) {
	return selectWalkClip(
		asset.animations,
		asset.scene.userData.proceduralCat ? null : CAT_CONFIG.model.walkClip,
	);
}

export function selectWalkClip(
	clips: AnimationClip[],
	override: string | null,
) {
	const playable = clips.filter(
		(clip) => clip.duration > 0 && clip.tracks.length > 0,
	);
	if (override) return playable.find((clip) => clip.name === override);
	// Prefer an explicit walk. Never silently substitute idle, run, or jump.
	return playable.find((clip) => /walk/i.test(clip.name));
}

export function hasSkeleton(scene: Object3D) {
	let found = false;
	scene.traverse((node) => {
		if (node instanceof SkinnedMesh && node.skeleton?.bones.length > 0)
			found = true;
	});
	return found;
}

export function createCatInstance(source: Group) {
	const skeletonRoot = clone(source);
	const oriented = new Group();
	oriented.add(skeletonRoot);
	oriented.rotation.y = source.userData.proceduralCat
		? 0
		: CAT_CONFIG.model.rotationY;
	const model = new Group();
	model.add(oriented);
	// Exported lights/cameras must not introduce color or alter our camera.
	const remove: Object3D[] = [];
	skeletonRoot.traverse((node) => {
		if ("isLight" in node || "isCamera" in node) remove.push(node);
	});
	for (const node of remove) node.removeFromParent();
	model.updateMatrixWorld(true);
	const bounds = new Box3().setFromObject(model);
	const size = bounds.getSize(new Vector3());
	if (!Number.isFinite(size.y) || size.y <= 0)
		throw new Error("Cat has no measurable geometry");
	const center = bounds.getCenter(new Vector3());
	oriented.position.set(-center.x, -bounds.min.y, -center.z);
	model.scale.setScalar(CAT_CONFIG.model.height / size.y);

	const ramp = new DataTexture(
		new Uint8Array([52, 108, 175, 235]),
		4,
		1,
		RedFormat,
	);
	ramp.minFilter = NearestFilter;
	ramp.magFilter = NearestFilter;
	ramp.generateMipmaps = false;
	ramp.needsUpdate = true;
	const materials = new Map<string, MeshToonMaterial>();
	skeletonRoot.traverse((node) => {
		if (!(node instanceof Mesh)) return;
		node.castShadow = true;
		node.receiveShadow = false;
		// Animated paws/tail can exceed bind-pose bounds.
		node.frustumCulled = false;
		const convert = (original: Material) => {
			const name = `${node.name} ${original.name}`;
			const role = /pupil|nose|mouth|ink/i.test(name)
				? "ink"
				: /iris|eye|whisker/i.test(name)
					? "silver"
					: "fur";
			const key = `${original.uuid}:${role}`;
			const cached = materials.get(key);
			if (cached) return cached;
			const sourceMaterial = original as MeshStandardMaterial;
			const material = new MeshToonMaterial({
				name: `runway-${role}-${original.name}`,
				color:
					role === "silver"
						? "#b8b8b8"
						: role === "ink"
							? "#101010"
							: "#303030",
				map: sourceMaterial.map ?? null,
				normalMap: sourceMaterial.normalMap ?? null,
				alphaMap: sourceMaterial.alphaMap ?? null,
				alphaTest: original.alphaTest,
				side: original.side,
				gradientMap: ramp,
				transparent: true,
				opacity: original.opacity,
			});
			material.userData.baseOpacity = original.opacity;
			if (source.userData.proceduralCat)
				material.color.copy(sourceMaterial.color);
			// Preserve texture detail while removing *all* hue, including green irises.
			material.onBeforeCompile = (shader) => {
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <map_fragment>",
					`#include <map_fragment>
					float catLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
					diffuseColor.rgb = vec3(catLuma);`,
				);
				// A narrow neutral rim keeps the black silhouette legible in both themes.
				shader.fragmentShader = shader.fragmentShader.replace(
					"#include <opaque_fragment>",
					`float catRim = pow(1.0 - max(0.0, dot(normalize(normal), normalize(vViewPosition))), 4.0);
					outgoingLight += vec3(catRim * 0.075);
					#include <opaque_fragment>`,
				);
			};
			material.customProgramCacheKey = () => "runway-monochrome-v2";
			materials.set(key, material);
			return material;
		};
		node.material = Array.isArray(node.material)
			? node.material.map(convert)
			: convert(node.material);
	});
	return {
		model,
		skeletonRoot,
		materials: [...materials.values()],
		dispose() {
			for (const material of materials.values()) material.dispose();
			ramp.dispose();
			skeletonRoot.traverse((node) => {
				if (node instanceof SkinnedMesh) node.skeleton.dispose();
			});
		},
	};
}

/** Called once when the shared parsed GLB is retired; clones share its geometry/textures. */
export function disposeSource(scene: Object3D) {
	const resources = new Set<{ dispose: () => void }>();
	scene.traverse((node) => {
		if (!(node instanceof Mesh)) return;
		resources.add(node.geometry);
		if (node instanceof SkinnedMesh) resources.add(node.skeleton);
		for (const material of Array.isArray(node.material)
			? node.material
			: [node.material]) {
			resources.add(material);
			for (const value of Object.values(material)) {
				if (value instanceof Texture) resources.add(value);
			}
		}
	});
	for (const resource of resources) resource.dispose();
}
