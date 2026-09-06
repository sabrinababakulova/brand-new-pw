// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CatBackgroundLayer from "./CatBackgroundLayer";

const sceneMount = vi.fn();
vi.mock("./CatScenes", () => ({
	default: () => {
		sceneMount();
		return <canvas />;
	},
}));

const media = new Map<
	string,
	{ matches: boolean; listeners: Set<() => void> }
>();
let visibility = "visible";
let observers: Array<(entries: { isIntersecting: boolean }[]) => void> = [];
const disconnect = vi.fn();

beforeEach(() => {
	media.clear();
	observers = [];
	visibility = "visible";
	sceneMount.mockClear();
	disconnect.mockClear();
	vi.stubGlobal("fetch", vi.fn());
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
			addEventListener: (_: string, listener: () => void) =>
				state.listeners.add(listener),
			removeEventListener: (_: string, listener: () => void) =>
				state.listeners.delete(listener),
		};
	});
	vi.stubGlobal(
		"IntersectionObserver",
		class {
			constructor(callback: (entries: { isIntersecting: boolean }[]) => void) {
				observers.push(callback);
			}
			observe() {
				for (const callback of observers) callback([{ isIntersecting: true }]);
			}
			disconnect = disconnect;
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
	if (!state) throw new Error(`Unobserved preference: ${query}`);
	state.matches = matches;
	for (const listener of state.listeners) listener();
}

function sources(container: HTMLElement) {
	return Array.from(container.querySelectorAll("img"), (img) =>
		img.getAttribute("src"),
	);
}

it("uses the Blender animation by default without requesting or mounting a 3D cat", () => {
	const view = render(<CatBackgroundLayer />);
	expect(sources(view.container)).toEqual([
		"/cats/outline-cat.webp",
		"/cats/outline-cat-right.webp",
	]);
	expect(fetch).not.toHaveBeenCalled();
	expect(sceneMount).not.toHaveBeenCalled();
	expect(view.container.querySelector("canvas")).toBeNull();
	expect(view.container.firstElementChild?.getAttribute("aria-hidden")).toBe(
		"true",
	);
	expect(view.container.firstElementChild?.hasAttribute("inert")).toBe(true);
});

it("uses stills for reduced motion, hidden tabs and offscreen lanes; only one on mobile", () => {
	const view = render(<CatBackgroundLayer mode="blender" />);
	const stills = ["/cats/outline-cat.png", "/cats/outline-cat-right.png"];
	act(() => preference("(prefers-reduced-motion: reduce)", true));
	expect(sources(view.container)).toEqual(stills);
	act(() => preference("(prefers-reduced-motion: reduce)", false));
	expect(sources(view.container).every((src) => src?.endsWith(".webp"))).toBe(
		true,
	);
	act(() => {
		visibility = "hidden";
		document.dispatchEvent(new Event("visibilitychange"));
	});
	expect(sources(view.container)).toEqual(stills);
	act(() => {
		visibility = "visible";
		document.dispatchEvent(new Event("visibilitychange"));
		for (const callback of observers) callback([{ isIntersecting: false }]);
	});
	expect(sources(view.container)).toEqual(stills);
	act(() => {
		for (const callback of observers) callback([{ isIntersecting: true }]);
		preference("(max-width: 767px)", true);
	});
	expect(sources(view.container)).toEqual(["/cats/outline-cat-right.png"]);
	view.unmount();
	expect(disconnect).toHaveBeenCalledTimes(2);
	expect([...media.values()].every((state) => state.listeners.size === 0)).toBe(
		true,
	);
});

it("falls back to a still if animation fails and keeps content usable if both fail", () => {
	const view = render(
		<>
			<CatBackgroundLayer mode="blender" />
			<a href="#contact">Contact</a>
		</>,
	);
	const left = view.container.querySelector("img");
	if (!left) throw new Error("Missing left cat");
	fireEvent.error(left);
	expect(left.getAttribute("src")).toBe("/cats/outline-cat.png");
	fireEvent.error(left);
	expect(sources(view.container)).toEqual(["/cats/outline-cat-right.webp"]);
	expect(view.getByRole("link", { name: "Contact" })).toBeTruthy();
});
