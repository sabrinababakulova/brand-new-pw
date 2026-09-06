import { useEffect, useRef, useState } from "react";
import { BLENDER_CAT_LANES } from "./cat-config";

export function BlenderCatLanes() {
	return BLENDER_CAT_LANES.map((lane) => (
		<BlenderCatLane key={lane.side} {...lane} />
	));
}

function BlenderCatLane({
	side,
	animation,
	poster,
}: (typeof BLENDER_CAT_LANES)[number]) {
	const lane = useRef<HTMLDivElement>(null);
	const [animate, setAnimate] = useState(false);
	const [inView, setInView] = useState(false);
	const [mobile, setMobile] = useState(true);
	const [failed, setFailed] = useState<"animation" | "all" | null>(null);

	useEffect(() => {
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const small = window.matchMedia("(max-width: 767px)");
		const update = () => {
			setMobile(small.matches);
			setAnimate(
				document.visibilityState === "visible" &&
					!motion.matches &&
					!small.matches,
			);
		};
		update();
		motion.addEventListener("change", update);
		small.addEventListener("change", update);
		document.addEventListener("visibilitychange", update);
		const observer = new IntersectionObserver(([entry]) =>
			setInView(entry.isIntersecting),
		);
		if (lane.current) observer.observe(lane.current);
		return () => {
			motion.removeEventListener("change", update);
			small.removeEventListener("change", update);
			document.removeEventListener("visibilitychange", update);
			observer.disconnect();
		};
	}, []);

	// Swapping to a still removes the animated image from hidden/reduced-motion
	// views. Native image decoding handles the loop without a canvas or RAF loop.
	const src = animate && inView && !failed ? animation : poster;
	return (
		<div ref={lane} className={`cat-lane cat-lane--${side} cat-lane--blender`}>
			{failed !== "all" && (!mobile || side === "right") && (
				<img
					className="cat-blender-image"
					src={src}
					alt=""
					width={768}
					height={1152}
					decoding="async"
					loading="lazy"
					fetchPriority="low"
					draggable={false}
					onError={() => setFailed(src === poster ? "all" : "animation")}
				/>
			)}
		</div>
	);
}
