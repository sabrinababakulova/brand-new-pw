import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import type { PointLight } from "three";
import { CAT_CONFIG } from "./cat-config";

export function PhotographerFlashes({
	enabled,
	timing,
}: {
	enabled: boolean;
	timing: number;
}) {
	const light = useRef<PointLight>(null);
	const sequence = useRef<gsap.core.Timeline | null>(null);
	const countdown = useRef(0);
	useEffect(() => {
		countdown.current =
			gsap.utils.random(
				CAT_CONFIG.flashes.minPauseSeconds,
				CAT_CONFIG.flashes.maxPauseSeconds,
			) * timing;
		return () => {
			sequence.current?.kill();
			sequence.current = null;
		};
	}, [timing]);

	useEffect(() => {
		if (!enabled) {
			sequence.current?.kill();
			sequence.current = null;
			if (light.current) light.current.intensity = 0;
		}
	}, [enabled]);

	useFrame((_, delta) => {
		if (!enabled || !light.current) return;
		const step = Math.min(delta, 1 / 20);
		if (sequence.current) {
			const timeline = sequence.current;
			timeline.totalTime(timeline.totalTime() + step);
			if (timeline.progress() === 1) {
				timeline.kill();
				sequence.current = null;
				light.current.intensity = 0;
			}
			return;
		}
		countdown.current -= step;
		if (countdown.current > 0) return;
		const config = CAT_CONFIG.flashes;
		const direction = Math.random() < 0.5 ? -1 : 1;
		light.current.position.set(
			direction * gsap.utils.random(2.1, 3),
			gsap.utils.random(1.5, 2.7),
			gsap.utils.random(1.8, 3.5),
		);
		const duration = gsap.utils.random(
			config.minDurationSeconds,
			config.maxDurationSeconds,
		);
		const intensity = config.intensity * gsap.utils.random(0.75, 1);
		const timeline = gsap.timeline({ paused: true });
		const pulse = (at: number) => {
			timeline.set(light.current, { intensity }, at);
			timeline.to(
				light.current,
				{ intensity: 0, duration: duration - 0.012, ease: "power3.out" },
				at + 0.012,
			);
		};
		pulse(0);
		if (Math.random() < config.doubleChance)
			pulse(duration + config.doubleGapSeconds);
		sequence.current = timeline;
		// Show the peak on this frame, even on devices too slow to sample an 8ms rise.
		timeline.totalTime(0.0001);
		countdown.current =
			gsap.utils.random(config.minPauseSeconds, config.maxPauseSeconds) *
			timing;
	});

	return (
		<pointLight
			ref={light}
			color="#ffffff"
			intensity={0}
			distance={7}
			decay={2}
		/>
	);
}
