import {
	BufferGeometry,
	CatmullRomCurve3,
	Float32BufferAttribute,
	Shape,
	ShapeGeometry,
	Uint16BufferAttribute,
	Vector3,
} from "three";

export type Section = [
	x: number,
	y: number,
	z: number,
	width: number,
	depth: number,
];
export type SkinWeights = [first: number, second: number, blend: number];

/** Sculpt a smooth surface around an authored spine; no stock sphere/cylinder parts. */
export function loft(sections: Section[], steps = 32, sides = 20) {
	const path = new CatmullRomCurve3(
		sections.map(([x, y, z]) => new Vector3(x, y, z)),
	);
	const positions: number[] = [];
	const uvs: number[] = [];
	const indices: number[] = [];
	for (let ring = 0; ring <= steps; ring++) {
		const t = ring / steps;
		const point = path.getPoint(t);
		const tangent = path.getTangent(t).normalize();
		const normal = new Vector3(1, 0, 0);
		if (Math.abs(tangent.x) > 0.95) normal.set(0, 0, 1);
		normal.addScaledVector(tangent, -normal.dot(tangent)).normalize();
		const binormal = new Vector3().crossVectors(tangent, normal).normalize();
		const progress = t * (sections.length - 1);
		const section = Math.min(Math.floor(progress), sections.length - 2);
		const blend = progress - section;
		const smooth = blend * blend * (3 - 2 * blend);
		const width =
			sections[section][3] * (1 - smooth) + sections[section + 1][3] * smooth;
		const depth =
			sections[section][4] * (1 - smooth) + sections[section + 1][4] * smooth;
		for (let side = 0; side <= sides; side++) {
			const angle = (side / sides) * Math.PI * 2;
			const vertex = point
				.clone()
				.addScaledVector(normal, Math.cos(angle) * width)
				.addScaledVector(binormal, Math.sin(angle) * depth);
			positions.push(vertex.x, vertex.y, vertex.z);
			uvs.push(side / sides, t);
			if (ring < steps && side < sides) {
				const a = ring * (sides + 1) + side;
				const b = a + sides + 1;
				indices.push(a, a + 1, b, a + 1, b + 1, b);
			}
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
	geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
	geometry.setIndex(indices);
	geometry.computeVertexNormals();
	return geometry;
}

export function patch(shape: Shape, depth: (x: number, y: number) => number) {
	const geometry = new ShapeGeometry(shape, 14);
	const position = geometry.getAttribute("position");
	for (let index = 0; index < position.count; index++) {
		position.setZ(index, depth(position.getX(index), position.getY(index)));
	}
	geometry.computeVertexNormals();
	return geometry;
}

export function oval(x: number, y: number, width: number, height: number) {
	const shape = new Shape();
	shape.absellipse(x, y, width, height, 0, Math.PI * 2, false, 0);
	return shape;
}

export function weightGeometry(
	geometry: BufferGeometry,
	weights: number | ((point: Vector3) => SkinWeights),
) {
	const position = geometry.getAttribute("position");
	const indices: number[] = [];
	const influences: number[] = [];
	for (let index = 0; index < position.count; index++) {
		const point = new Vector3().fromBufferAttribute(position, index);
		const [first, second, blend] =
			typeof weights === "number" ? [weights, weights, 0] : weights(point);
		indices.push(first, second, 0, 0);
		influences.push(1 - blend, blend, 0, 0);
	}
	geometry.setAttribute("skinIndex", new Uint16BufferAttribute(indices, 4));
	geometry.setAttribute(
		"skinWeight",
		new Float32BufferAttribute(influences, 4),
	);
	return geometry;
}
