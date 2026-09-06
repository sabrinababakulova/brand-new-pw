// @vitest-environment jsdom
import { act, cleanup, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { Group } from "three";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CAT_LANES } from "./cat-config";
import { SideCatScene } from "./SideCatScene";

vi.mock("@react-three/fiber", () => {
	const state = {
		camera: { lookAt: vi.fn(), updateProjectionMatrix: vi.fn() },
		gl: { domElement: document.createElement("canvas") },
	};
	return {
		Canvas: ({
			children,
			frameloop,
		}: {
			children: ReactNode;
			frameloop: string;
		}) => (
			<div data-testid="canvas" data-loop={frameloop}>
				{children}
			</div>
		),
		useThree: (select: (value: typeof state) => unknown) => select(state),
	};
});
vi.mock("@react-three/drei", () => ({ PerspectiveCamera: () => null }));
vi.mock("./CatLighting", () => ({ CatLighting: () => null }));
vi.mock("./RunwayCat", () => ({ RunwayCat: () => null }));
vi.mock("./PhotographerFlashes", () => ({
	PhotographerFlashes: ({ enabled }: { enabled: boolean }) => (
		<div data-testid="flashes" data-enabled={enabled} />
	),
}));

const media = new Map<
	string,
	{ matches: boolean; listeners: Set<() => void> }
>();
let visibility = "visible";
beforeEach(() => {
	visibility = "visible";
	media.clear();
	vi.spyOn(document, "visibilityState", "get").mockImplementation(
		() => visibility as DocumentVisibilityState,
	);
	vi.stubGlobal("matchMedia", (query: string) => {
		const state = media.get(query) ?? {
			matches: false,
			listeners: new Set<() => void>(),
		};
		media.set(query, state);
		return {
			get matches() {
				return state.matches;
			},
			addEventListener: (_type: string, callback: () => void) =>
				state.listeners.add(callback),
			removeEventListener: (_type: string, callback: () => void) =>
				state.listeners.delete(callback),
		};
	});
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			constructor(
				private callback: (entries: { isIntersecting: boolean }[]) => void,
			) {}
			observe() {
				this.callback([{ isIntersecting: true }]);
			}
			disconnect() {}
		},
	);
});
afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

function preference(query: string, matches: boolean) {
	const state = media.get(query);
	if (!state) throw new Error(`Unobserved media query: ${query}`);
	state.matches = matches;
	for (const listener of state.listeners) listener();
}

function lanes() {
	const asset = { scene: new Group(), animations: [] };
	return render(
		CAT_LANES.map((settings) => (
			<SideCatScene key={settings.side} asset={asset} {...settings} />
		)),
	);
}

it("stops continuous rendering and flashes for reduced motion and hidden tabs", () => {
	const view = lanes();
	expect(
		view.getAllByTestId("canvas").map((node) => node.getAttribute("data-loop")),
	).toEqual(["always", "always"]);
	act(() => preference("(prefers-reduced-motion: reduce)", true));
	expect(
		view.getAllByTestId("canvas").map((node) => node.getAttribute("data-loop")),
	).toEqual(["demand", "demand"]);
	expect(
		view
			.getAllByTestId("flashes")
			.every((node) => node.getAttribute("data-enabled") === "false"),
	).toBe(true);
	act(() => {
		visibility = "hidden";
		document.dispatchEvent(new Event("visibilitychange"));
	});
	expect(
		view.getAllByTestId("canvas").map((node) => node.getAttribute("data-loop")),
	).toEqual(["never", "never"]);
	act(() => {
		visibility = "visible";
		document.dispatchEvent(new Event("visibilitychange"));
	});
	expect(
		view.getAllByTestId("canvas").map((node) => node.getAttribute("data-loop")),
	).toEqual(["demand", "demand"]);
});

it("uses only one static scene without flashes on mobile", () => {
	const view = lanes();
	act(() => {
		preference("(max-width: 767px)", true);
		preference("(max-width: 1199px)", true);
	});
	expect(view.getAllByTestId("canvas")).toHaveLength(1);
	expect(view.getByTestId("canvas").getAttribute("data-loop")).toBe("demand");
	expect(view.getByTestId("flashes").getAttribute("data-enabled")).toBe(
		"false",
	);
});
