# Portfolio runway cats

## Built-in Three.js mode

The portfolio includes a cat built in Three.js from authored mesh profiles based
on the reference photos. No Blender, downloaded model, textures, or GLB is required
for this mode. It has 18,028 triangles, eight material groups, 15 bones, and an
in-place `Editorial_Runway_Walk` animation. Both lanes clone that rig and share
geometry, while their animation phases remain independent.

```bash
bun run dev:cats
# Equivalent startup flag:
VITE_CAT_MODE=threejs bun run dev

# Use the future Blender/exported GLB instead:
VITE_CAT_MODE=glb bun run dev
```

Normal `bun run dev` now shows the Blender outline animation from `public/cats/`
without a GLB or WebGL. See [the outline asset guide](../cats/README.md).
Restart when changing the flag.
`bun run build:cats` (equivalent to `VITE_CAT_MODE=threejs bun run build`) builds
the built-in cat for production. Vite embeds the flag during the build; setting
it only on `preview` cannot switch an existing build. `bun run build` defaults to
Blender outline mode. An existing `VITE_CAT_MODE` environment value takes precedence.

The reference-inspired mesh, face details, and palette live in `procedural-cat.ts`;
the custom surface helpers are in `procedural-cat-geometry.ts`. The walk in
`procedural-cat-animation.ts` uses a four-leg phase pattern, authored paw targets,
and two-segment inverse kinematics to create quaternion tracks once during setup.
Three.js AnimationMixer plays those tracks; GSAP controls only the runway approach,
reset, and photographer flashes. There is no per-frame mesh construction or leg
animation in GSAP. GLB-specific clip/facing overrides do not change the built-in cat.

## Future GLB mode — asset required

Place the final file here as **`public/models/cat.glb`**. Its public URL is
`/models/cat.glb`; change `CAT_MODEL_URL` in `src/components/cats/cat-config.ts`
if the filename changes. No GLB is bundled yet. Missing, invalid, unrigged, or
unrecognized-animation assets leave the side lanes empty without blocking the page.
The JPEG references are not automatically reconstructed into a GLB.

## Reference and art brief

Use Sabrina's four September 6 cat photographs as the primary reference: a lean
black shorthaired cat, long slender legs, compact oval torso, tall triangular ears,
tapered muzzle, pronounced whiskers, and a long controlled tail. The standing
photo is especially useful for the proportions and stern, lowered-chin expression;
the close-ups show the ears, face shape, and short fur. Do not enlarge the eyes.

Author a monochrome anime/editorial model with a serious forward gaze, narrowed
eyes, neutral mouth, upright ears, near-black fur and charcoal/gray cel highlights.
No smiling, playful proportions, green eyes, colored lighting, or low-poly faceting.
The runtime supplies grayscale toon materials and white lights; it cannot change
an unsuitable model's silhouette, expression, or anatomy into this cat.

## Export contract

- Binary glTF 2.0 with a **skinned mesh, skeleton, and looping in-place walk clip**.
- Y-up, forward **+Z**. `model.rotationY` can correct a different forward axis.
- Identity scene/root transforms are recommended. Feet at ground level. The loader
  recenters and normalizes the bind-pose height to `model.height`.
- Bake a deliberate four-legged runway gait: steady head, lowered chin, minimal
  bounce, subtle shoulders/body sway, controlled tail, paws slightly crossing the
  center line. The rig/clip must carry this motion; GSAP only moves the whole cat.
- Remove forward root translation in the DCC tool. An in-place clip is required
  to avoid double travel, drifting out of the lane, and popping at the loop seam.
- Give the clip a descriptive name containing `walk`, or set `model.walkClip` to
  its exact exported name. All clip names/durations/track counts are logged in the
  development console when loaded. An arbitrary clip is never chosen as a fallback.
- Prefer separate materials named `fur`, `iris`, `pupil`, `nose`, `mouth`, and
  `whisker`. These names control the charcoal/silver/ink material roles. Keep iris
  and pupil separate; an all-in-one face texture cannot receive separate eye values.
- Embed ordinary PNG/JPEG textures in the GLB. Use 1K textures where possible,
  roughly 15–40K triangles total, few draw calls, and ideally a **2–5 MB** asset.
  A 25 MB guard rejects oversized files. Draco, Meshopt, and KTX2 decoders are not
  configured; export without those compression extensions for drop-in loading.
- Avoid scene props: the GLB should contain only the cat. Imported cameras/lights
  are removed. Geometry and texture resources are shared between the two cloned
  skeletons, while materials and animation state stay independent.

## Settings

`src/components/cats/cat-config.ts`:

| Setting | Purpose |
| --- | --- |
| `VITE_CAT_MODE` / `CAT_MODE` | Default `blender` outline animation; opt-in `threejs` or `glb` |
| `BLENDER_CAT_LANES` | Blender animation and still-image paths |
| `CAT_MODEL_URL` | Model URL |
| `CAT_CONFIG.model.walkClip` | Exact clip override (default: inspect for a walk) |
| `CAT_CONFIG.model.height`, `rotationY` | Base normalization and facing direction |
| `CAT_LANES[].scale` | Independent cat sizes |
| `CAT_LANES[].x` | Horizontal model position inside each scene |
| `CAT_LANES[].phase` | Independent skeletal and runway phase (0–1) |
| `CAT_LANES[].cameraOffset` | Small horizontal camera offset |
| `CAT_LANES[].flashTiming` | Per-lane multiplier for randomized pauses |
| `CAT_CONFIG.walk.speed` | Skeletal playback rate |
| `CAT_CONFIG.walk.journeySeconds`, `startZ`, `endZ`, `fadeSeconds` | Whole-cat approach and hidden reset |
| `CAT_CONFIG.flashes.minPauseSeconds`, `maxPauseSeconds` | Flash frequency range |
| `CAT_CONFIG.flashes.intensity` | Local white point-light intensity |
| `CAT_CONFIG.flashes.minDurationSeconds`, `maxDurationSeconds` | 40–100 ms pulses |
| `CAT_CONFIG.flashes.doubleChance`, `doubleGapSeconds` | Occasional pair of flashes |
| `CAT_CONFIG.camera` | Low front-facing camera and framing |
| `CAT_CONFIG.performance` | DPR cap and shadow resolution |

`src/styles.css`: `--portfolio-content-width` is **1040px**, down from 1120px.
`.cat-lane--left`/`.cat-lane--right` control screen position; `.cat-lane` controls
lane width, height, and the soft fade under content. Breakpoints use the existing
768px mobile boundary plus 1200px for full desktop treatment. Medium screens use
smaller, softer cats near the edges. Mobile shows one quiet static cat without
flashes or shadows. Reduced motion freezes both desktop cats and disables flashes.

The root shell puts the two canvases at z-index 0 and the existing header/page/footer
at z-index 1. Decorative content is inert, hidden from assistive technology, and has
`pointer-events: none`. The initial portfolio render never waits for the model or
the 3D module. Hidden tabs/offscreen lanes stop the render loop and scene timelines.
No postprocessing or fullscreen flash layer is used.

## Acceptance after adding the actual asset

Run `bun --bun x tsc --noEmit`, `bun --bun run check`, `bun run test`, and
`bun --bun run build`. With the dev server running, inspect the clip inventory,
then check both themes at wide desktop, 1024px, and mobile. Watch a full 18-second
journey, verify the walk loop and resets, head/ear framing, unsynchronized phases,
grayscale eyes, restrained local flashes, and text contrast while scrolling.
Check reduced motion, switching tabs, mobile navigation, text selection, and links.
The future GLB's likeness, gait, and framing need a separate visual check when supplied.

## Integration verification

- Both production modes build successfully. Shared 3D code is deferred (about
  285 KB gzip); the authored procedural-cat module adds about 3.6 KB gzip.
- Fifteen tests pass, covering clip selection, rig validation, independent skeletons/materials,
  shared geometry, skin weight validity, vertex deformation and loop continuity,
  grayscale colors, model loading/cancellation, mode switching without a GLB
  request, reduced motion, hidden tabs, and one static mobile scene. Use
  `bun run test` without `--bun` so Vitest uses its Node runner for module mocks.
- New cat files pass Biome. Repository-wide check/lint still report existing code
  and generated Paraglide diagnostics. Typecheck still reports the existing
  optional database URL in `drizzle.config.ts` and stale `/demo/better-auth` link in
  `src/integrations/better-auth/header-user.tsx`; no cat-related type errors remain.
- Browser checked at 1440px, 1024px, and 390px: respective central widths are
  1040px, 992px, and 358px, with no horizontal overflow. Light/dark themes,
  navigation, and the mobile drawer work. The missing-asset state has no canvases,
  and the decorative wrapper is below content with pointer events disabled.
- The built-in cat renders in both themes with independent walk phases. The future
  GLB still requires its own acceptance pass when supplied.

## Files added or changed for this feature

- `package.json`
- `README.md`
- `bun.lock`
- `src/routes/__root.tsx`
- `src/styles.css`
- `src/components/cats/CatBackgroundLayer.tsx`
- `src/components/cats/CatScenes.tsx`
- `src/components/cats/SideCatScene.tsx`
- `src/components/cats/RunwayCat.tsx`
- `src/components/cats/CatLighting.tsx`
- `src/components/cats/PhotographerFlashes.tsx`
- `src/components/cats/cat-config.ts`
- `src/components/cats/cat-model.ts`
- `src/components/cats/CatBackgroundLayer.test.tsx`
- `src/components/cats/cat-model.test.ts`
- `src/components/cats/procedural-cat.ts`
- `src/components/cats/procedural-cat-geometry.ts`
- `src/components/cats/procedural-cat-animation.ts`
- `src/components/cats/procedural-cat.test.ts`
- `src/components/cats/SideCatScene.test.tsx`
- `vitest.config.ts` (isolates unit tests from the application server/SSR plugins)
- `public/models/README.md` (this handoff)

Dependencies added: `three`, `@react-three/fiber`, `@react-three/drei`, `gsap`,
plus development dependency `@types/three`. No portfolio text or page sections
were rewritten.
