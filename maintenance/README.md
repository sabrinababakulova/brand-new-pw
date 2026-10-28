# Portfolio maintenance gate

The live domain currently serves a standalone WIP page. The portfolio application,
source files, build, and running `brand-new-pw.service` remain unchanged.

## Standalone quick start

This folder is independent of the portfolio app. No npm install or app build is
required: the exact Three.js modules and fonts used by the live page are vendored.
From the repository root:

```sh
npm --prefix maintenance test
npm --prefix maintenance run build
npm --prefix maintenance run serve
```

The preview listens on `127.0.0.1:8080`. Build output is `maintenance/.site/`
(ignored by Git) with the same `index.html` + `/_wip/` layout used in production.
Deploy that output only to the separate maintenance web root; do not replace the
portfolio's `src/`, `public/`, or app build. The original nginx proxy must already
be gated as described below. Publishing this folder alone does not enable the gate.

`vendor/three-LICENSE.txt` contains the Three.js MIT license;
`vendor/SpaceGrotesk-OFL.txt` contains the font license. The packager includes both
licenses with the served assets. Earlier animation versions are retained as source,
but only the current contact-pull design is packaged.

## Files

- Editable page source: this directory (`maintenance/`).
- Public deployment: `/var/www/sabrina-wip/index.html` and `/var/www/sabrina-wip/_wip/`.
- Only `/_wip/` serves assets. All other URLs return the WIP document, including old
  routes/assets. The portfolio HTML is not sent to visitors.
- Local Three.js modules: copied from the existing installed `three/build/` directory.
- Fonts: self-hosted Space Grotesk (Google Fonts; SIL Open Font License).
- TLS, redirects, and the existing nginx security headers remain in place.
- The original app listens only on `127.0.0.1:3000`.

## Update the placeholder

Copy `bubblegum.css`, `bubblegum-contact.js`, `gum-contact.js`, `gum-layout.js`, `favicon.svg`, and
`fonts.css` to `/var/www/sabrina-wip/_wip/`, then deploy `index.html` last.
The earlier `style.css`/`scene.js` and `bubblegum.js`/`gum-physics.js` designs are
preserved but no longer loaded. The current Three.js scene uses fixed-center,
physical-material spheres, a procedural studio environment, and a light pink/purple
palette. Social icons have accessible names; Telegram opens the channel. The motion
control is keyboard-focusable but visually hidden until focused; Space also toggles
motion when the body is focused. No app build or restart is needed.

## Contact interaction and acceptance tests

The scene contains 24 bubbles. Desktop anchors span the entire viewport, with
bubbles in the left, center and right thirds even on ultrawide screens. The original
phone positions and gentle material behavior are preserved, with smaller bubbles
added around them. Layout is defined in
`gum-layout.js`; desktop positions are viewport-relative, not a right-shifted group.
A cursor contact locks one material patch; the
bubble's center and opposite cap stay anchored. Hover motion is intentionally
weak (16% input gain, capped at 0.12 radius), and pressing is only slightly firmer
(24% input gain, capped at 0.22 radius). A smooth saturation curve adds resistance
as the pull gets longer. Pressure acts inward along the rest-position radial
normal approximation, rather than always pushing along the camera axis. Moving
away without pressing releases the contact.

The mesh uses a local shoulder correction to approximately preserve its original
closed volume while leaving the contact tip and far cap unchanged. It does not
inflate to make a stretched tail. Unit tests require volume error under 1%, finite
coordinates and no folded triangles across sampled contact directions. This is a
bounded visual elasticity model, not a full material-science simulation.

Exponential viscous following uses real elapsed time, not impulse kicks. Release
monotonically restores base vertices. Normals and bounds update after deformation;
static frames do not rerender. Smaller bubbles use fewer mesh segments. Horizontal
touch gestures remain usable alongside native vertical scrolling and pinch zoom.

Run `npm --prefix maintenance test` (current contact/material suites plus legacy
physics tests). For browser acceptance, serve an isolated build and append
`?verify-gum` for read-only `window.__gumInspector.snapshot()` measurements. Use
actual pointer events. Verify 12 bubbles, directional response/reversal, hover
weaker than press, capped strain, volumeRatio within 1% of 1, finite normals, fixed
centers, unchanged far cap, monotonic release, touch, links and reduced motion.
Do not require 1:1 cursor tracking: the reduced response is intentional.
Preserve JSON measurements and compare desktop/mobile screenshots.
Ignore social links/controls and release on pointercancel, blur, resize, visibility
loss and reduced-motion changes. Keep the original portfolio and TLS gate intact.

## Restore the original portfolio

1. Inspect the active nginx config and backup for any intervening changes.
2. Restore `/etc/nginx/sites-available/sabrinababakulova.uz.before-wip-20261026`
   to `/etc/nginx/sites-available/sabrinababakulova.uz`.
3. Run `nginx -t` and, only if successful, `systemctl reload nginx`.
4. Verify HTTPS and a deep link return the original app.

Do not rerun `enable-gate.py` while the gate is already enabled: it deliberately
asserts the original proxy exists to prevent accidentally replacing the wrong block.
Existing cached copies on visitors' machines cannot be remotely erased, but the
server will not serve the original portfolio while the gate is active.
