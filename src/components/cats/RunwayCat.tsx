import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import type { Group } from "three";
import { AnimationMixer, LoopRepeat } from "three";
import type { CatLaneSettings } from "./cat-config";
import { CAT_CONFIG } from "./cat-config";
import type { CatAsset } from "./cat-model";
import { createCatInstance, getAssetWalkClip } from "./cat-model";

export function RunwayCat({
	asset,
	settings,
	active,
	still,
	compact,
}: {
	asset: CatAsset;
	settings: CatLaneSettings;
	active: boolean;
	still: boolean;
	compact: boolean;
}) {
	const group = useRef<Group>(null);
	const [instance, setInstance] = useState<ReturnType<
		typeof createCatInstance
	> | null>(null);
	const animation = useRef<{
		mixer: AnimationMixer;
		timeline: gsap.core.Timeline;
		appearance: { opacity: number };
	} | null>(null);
	const invalidate = useThree((state) => state.invalidate);

	useEffect(() => {
		const cat = createCatInstance(asset.scene);
		setInstance(cat);
		return () => cat.dispose();
	}, [asset]);

	useEffect(() => {
		if (!instance || !group.current) return;
		const clip = getAssetWalkClip(asset);
		if (!clip) return;
		const mixer = new AnimationMixer(instance.skeletonRoot);
		const action = mixer.clipAction(clip);
		action.setLoop(LoopRepeat, Infinity).play();
		action.time = clip.duration * settings.phase;
		mixer.update(0);
		mixer.timeScale = CAT_CONFIG.walk.speed;
		const appearance = { opacity: 1 };
		const { journeySeconds, startZ, endZ, fadeSeconds } = CAT_CONFIG.walk;
		const timeline = gsap.timeline({ paused: true, repeat: -1 });
		// Only whole-model translation/visibility belongs to GSAP; all bones use the GLB clip.
		timeline.fromTo(
			group.current.position,
			{ z: startZ },
			{ z: endZ, duration: journeySeconds, ease: "none" },
			0,
		);
		timeline.fromTo(
			appearance,
			{ opacity: 0 },
			{ opacity: 1, duration: fadeSeconds, ease: "sine.out" },
			0,
		);
		timeline.to(
			appearance,
			{ opacity: 0, duration: fadeSeconds, ease: "sine.in" },
			journeySeconds - fadeSeconds,
		);
		timeline.totalTime(journeySeconds * settings.phase);
		animation.current = { mixer, timeline, appearance };
		invalidate();
		return () => {
			animation.current = null;
			timeline.kill();
			mixer.stopAllAction();
			mixer.uncacheRoot(instance.skeletonRoot);
		};
	}, [asset, instance, settings.phase, invalidate]);

	useEffect(() => {
		if (still && instance && group.current) {
			group.current.position.z = 0;
			for (const material of instance.materials) {
				material.opacity = material.userData.baseOpacity;
			}
		}
		// Demand rendering needs a frame when the static pose becomes visible.
		if (active) invalidate();
	}, [active, still, instance, invalidate]);

	useFrame((_, delta) => {
		const current = animation.current;
		if (!current || !instance || !group.current || !active) return;
		if (still) {
			group.current.position.z = 0;
			for (const material of instance.materials)
				material.opacity = material.userData.baseOpacity;
			return;
		}
		// Paused GSAP timelines are advanced by the scene: no background ticker/timer work.
		const step = Math.min(delta, 1 / 20);
		current.mixer.update(step);
		current.timeline.totalTime(current.timeline.totalTime() + step);
		for (const material of instance.materials) {
			material.opacity =
				material.userData.baseOpacity * current.appearance.opacity;
		}
	});

	return (
		<group
			ref={group}
			position={[settings.x, 0, 0]}
			scale={settings.scale * (compact ? 0.83 : 1)}
		>
			{instance && <primitive object={instance.model} dispose={null} />}
		</group>
	);
}
