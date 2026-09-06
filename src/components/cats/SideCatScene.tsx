import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { PCFShadowMap } from "three";
import { CatLighting } from "./CatLighting";
import type { CatLaneSettings } from "./cat-config";
import { CAT_CONFIG } from "./cat-config";
import type { CatAsset } from "./cat-model";
import { PhotographerFlashes } from "./PhotographerFlashes";
import { RunwayCat } from "./RunwayCat";

function CameraFraming({ offset }: { offset: number }) {
	const camera = useThree((state) => state.camera);
	useEffect(() => {
		camera.lookAt(0, CAT_CONFIG.camera.targetY, 0);
		camera.updateProjectionMatrix();
	}, [camera]);
	return (
		<PerspectiveCamera
			makeDefault
			fov={CAT_CONFIG.camera.fov}
			position={[offset, CAT_CONFIG.camera.y, CAT_CONFIG.camera.z]}
			near={0.1}
			far={30}
		/>
	);
}

export function SideCatScene({
	asset,
	...settings
}: CatLaneSettings & { asset: CatAsset }) {
	const lane = useRef<HTMLDivElement>(null);
	const [visible, setVisible] = useState(false);
	const [inView, setInView] = useState(false);
	const [reduced, setReduced] = useState(true);
	const [mobile, setMobile] = useState(true);
	const [compact, setCompact] = useState(false);
	const [contextLost, setContextLost] = useState(false);

	useEffect(() => {
		const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
		const small = window.matchMedia("(max-width: 767px)");
		const medium = window.matchMedia("(max-width: 1199px)");
		const update = () => {
			setVisible(document.visibilityState === "visible");
			setReduced(motion.matches);
			setMobile(small.matches);
			setCompact(medium.matches);
		};
		update();
		motion.addEventListener("change", update);
		small.addEventListener("change", update);
		medium.addEventListener("change", update);
		document.addEventListener("visibilitychange", update);
		const observer = new IntersectionObserver(([entry]) =>
			setInView(entry.isIntersecting),
		);
		if (lane.current) observer.observe(lane.current);
		return () => {
			motion.removeEventListener("change", update);
			small.removeEventListener("change", update);
			medium.removeEventListener("change", update);
			document.removeEventListener("visibilitychange", update);
			observer.disconnect();
		};
	}, []);

	const active = visible && inView;
	const still = reduced || mobile;
	const renderScene = !contextLost && !(mobile && settings.side === "left");
	return (
		<div ref={lane} className={`cat-lane cat-lane--${settings.side}`}>
			{renderScene && (
				<Canvas
					dpr={[1, mobile ? 1 : CAT_CONFIG.performance.maxDpr]}
					frameloop={!active ? "never" : still ? "demand" : "always"}
					shadows={compact ? false : { type: PCFShadowMap }}
					gl={{ alpha: true, antialias: !mobile, powerPreference: "low-power" }}
					events={() => ({ enabled: false, priority: 0 })}
					style={{ pointerEvents: "none" }}
					fallback={null}
					onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
				>
					<ContextGuard onLost={() => setContextLost(true)} />
					<CameraFraming offset={settings.cameraOffset} />
					<CatLighting shadows={!compact} />
					<RunwayCat
						asset={asset}
						settings={settings}
						active={active}
						still={still}
						compact={compact}
					/>
					<PhotographerFlashes
						enabled={active && !still}
						timing={settings.flashTiming}
					/>
				</Canvas>
			)}
		</div>
	);
}

function ContextGuard({ onLost }: { onLost: () => void }) {
	const gl = useThree((state) => state.gl);
	useEffect(() => {
		const canvas = gl.domElement;
		canvas.addEventListener("webglcontextlost", onLost);
		return () => canvas.removeEventListener("webglcontextlost", onLost);
	}, [gl, onLost]);
	return null;
}
