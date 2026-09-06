import type { KeyframeTrack } from "three";
import {
	AnimationClip,
	Euler,
	NumberKeyframeTrack,
	Quaternion,
	QuaternionKeyframeTrack,
	Vector3,
} from "three";

export interface CatLeg {
	name: string;
	hip: Vector3;
	knee: Vector3;
	foot: Vector3;
	phase: number;
	hind: boolean;
	bones: [number, number, number];
}

/** Solve the two leg segments offline, then let AnimationMixer interpolate the clip. */
function legPose(leg: CatLeg, phase: number) {
	const t = (phase + leg.phase) % 1;
	const swing = Math.max(0, (t - 0.62) / 0.38);
	const smooth = swing * swing * (3 - 2 * swing);
	const stride = leg.hind ? 0.28 : 0.34;
	const target = leg.foot.clone();
	target.z += t < 0.62 ? stride * (0.5 - t / 0.62) : stride * (smooth - 0.5);
	target.y += Math.sin(swing * Math.PI) ** 2 * 0.13;
	target.x *= 1 - Math.sin(swing * Math.PI) * 0.24;
	const upperRest = leg.knee.clone().sub(leg.hip);
	const lowerRest = leg.foot.clone().sub(leg.knee);
	const a = upperRest.length();
	const b = lowerRest.length();
	const direction = target.clone().sub(leg.hip);
	const distance = Math.min(direction.length(), a + b - 0.001);
	direction.normalize();
	const bend = new Vector3(0, 0, leg.hind ? 1 : -1);
	bend.addScaledVector(direction, -bend.dot(direction)).normalize();
	const along = (a * a - b * b + distance * distance) / (2 * distance);
	const knee = leg.hip
		.clone()
		.addScaledVector(direction, along)
		.addScaledVector(bend, Math.sqrt(Math.max(0, a * a - along * along)));
	const upper = new Quaternion().setFromUnitVectors(
		upperRest.normalize(),
		knee.clone().sub(leg.hip).normalize(),
	);
	const lowerWorld = new Quaternion().setFromUnitVectors(
		lowerRest.normalize(),
		target.clone().sub(knee).normalize(),
	);
	const lower = upper.clone().invert().multiply(lowerWorld);
	const paw = lowerWorld.clone().invert();
	return [upper, lower, paw];
}

export function createRunwayWalk(legs: CatLeg[]) {
	const duration = 2.5;
	const frames = 48;
	const times = Array.from(
		{ length: frames + 1 },
		(_, frame) => (frame / frames) * duration,
	);
	const tracks: KeyframeTrack[] = [];
	for (const leg of legs) {
		const values: number[][] = [[], [], []];
		for (let frame = 0; frame <= frames; frame++) {
			const poses = legPose(leg, (frame % frames) / frames);
			for (let joint = 0; joint < 3; joint++)
				values[joint].push(...poses[joint].toArray());
		}
		for (let joint = 0; joint < 3; joint++) {
			tracks.push(
				new QuaternionKeyframeTrack(
					`${leg.name}_${joint}.quaternion`,
					times,
					values[joint],
				),
			);
		}
	}
	const rotationTrack = (name: string, pose: (phase: number) => Euler) => {
		const values = times.flatMap((_, frame) =>
			new Quaternion()
				.setFromEuler(pose((frame / frames) * Math.PI * 2))
				.toArray(),
		);
		tracks.push(
			new QuaternionKeyframeTrack(`${name}.quaternion`, times, values),
		);
	};
	rotationTrack(
		"cat_spine",
		(t) => new Euler(0, Math.sin(t) * 0.012, Math.sin(t) * 0.012),
	);
	rotationTrack(
		"cat_head",
		(t) => new Euler(0.018, -Math.sin(t) * 0.012, -Math.sin(t) * 0.012),
	);
	rotationTrack(
		"cat_tail",
		(t) => new Euler(Math.sin(t + 0.4) * 0.035, Math.sin(t) * 0.065, 0),
	);
	tracks.push(
		new NumberKeyframeTrack(
			"cat_spine.position[y]",
			times,
			times.map((_, frame) => Math.sin((frame / frames) * Math.PI * 4) * 0.006),
		),
	);
	return new AnimationClip("Editorial_Runway_Walk", duration, tracks);
}
