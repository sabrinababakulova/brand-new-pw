// @vitest-environment jsdom
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import CatBackgroundLayer from "./CatBackgroundLayer";

vi.mock("./CatScenes", () => ({
	default: ({ source }: { source: ArrayBuffer | "threejs" }) => (
		<div
			data-testid="cat-scenes"
			data-source={typeof source === "string" ? source : "glb"}
		/>
	),
}));

beforeEach(() => {
	vi.useFakeTimers();
	vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

it("keeps the portfolio available when the model is missing", async () => {
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(new Response(null, { status: 404 })),
	);
	const view = render(
		<>
			<CatBackgroundLayer mode="glb" />
			<main>
				<a href="#contact">Contact</a>
			</main>
		</>,
	);
	expect(view.getByRole("link", { name: "Contact" })).toBeTruthy();
	await act(() => vi.advanceTimersByTimeAsync(500));
	expect(view.container.querySelector("canvas")).toBeNull();
	expect(view.getByRole("main")).toBeTruthy();
	expect(
		view.container
			.querySelector(".cat-background-layer")
			?.getAttribute("aria-hidden"),
	).toBe("true");
});

it("rejects HTML fallback responses instead of attempting to create a 3D scene", async () => {
	vi.stubGlobal(
		"fetch",
		vi
			.fn()
			.mockResolvedValue(
				new Response("<!doctype html><html><body>Portfolio</body></html>"),
			),
	);
	const view = render(<CatBackgroundLayer mode="glb" />);
	await act(() => vi.advanceTimersByTimeAsync(500));
	expect(view.container.querySelector("canvas")).toBeNull();
	expect(console.info).toHaveBeenCalled();
});

it("aborts model loading and clears pending work on unmount", async () => {
	let signal: AbortSignal | undefined;
	vi.stubGlobal(
		"fetch",
		vi.fn((_url: string, options: RequestInit) => {
			signal = options.signal ?? undefined;
			return new Promise<Response>(() => {});
		}),
	);
	const view = render(<CatBackgroundLayer mode="glb" />);
	await act(() => vi.advanceTimersByTimeAsync(500));
	expect(signal?.aborted).toBe(false);
	view.unmount();
	expect(signal?.aborted).toBe(true);
	expect(vi.getTimerCount()).toBe(0);
});

it("loads Three.js mode without requesting a GLB and can switch back to GLB mode", async () => {
	vi.useRealTimers();
	const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
	vi.stubGlobal("fetch", fetch);
	const view = render(<CatBackgroundLayer mode="threejs" />);
	const scenes = await view.findByTestId("cat-scenes");
	expect(fetch).not.toHaveBeenCalled();
	expect(scenes.getAttribute("data-source")).toBe("threejs");
	view.rerender(<CatBackgroundLayer mode="glb" />);
	await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
	expect(view.queryByTestId("cat-scenes")).toBeNull();
});
