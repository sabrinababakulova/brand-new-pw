import { CAT_CONFIG } from "./cat-config";

export function CatLighting({ shadows }: { shadows: boolean }) {
	return (
		<>
			<ambientLight color="#ffffff" intensity={0.65} />
			<directionalLight
				color="#ffffff"
				position={[-3, 4, 5]}
				intensity={2.2}
				castShadow={shadows}
				shadow-mapSize={[
					CAT_CONFIG.performance.shadowMapSize,
					CAT_CONFIG.performance.shadowMapSize,
				]}
				shadow-camera-left={-2.5}
				shadow-camera-right={2.5}
				shadow-camera-top={3.5}
				shadow-camera-bottom={-2}
				shadow-camera-near={0.5}
				shadow-camera-far={15}
				shadow-normalBias={0.035}
			/>
			<directionalLight
				color="#ffffff"
				position={[2.5, 2.5, -2]}
				intensity={3.1}
			/>
			<directionalLight
				color="#ffffff"
				position={[-3, 1.5, -1]}
				intensity={1.3}
			/>
			{shadows && (
				<mesh
					receiveShadow
					rotation={[-Math.PI / 2, 0, 0]}
					position={[0, -0.015, 0]}
				>
					<planeGeometry args={[12, 12]} />
					<shadowMaterial
						color="#000000"
						transparent
						opacity={0.14}
						depthWrite={false}
					/>
				</mesh>
			)}
		</>
	);
}
