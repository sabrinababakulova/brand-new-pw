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

Copy `bubblegum.css`, `bubblegum-contact.js`, `gum-contact.js`, `favicon.svg`, and
`fonts.css` to `/var/www/sabrina-wip/_wip/`, then deploy `index.html` last.
The earlier `style.css`/`scene.js` and `bubblegum.js`/`gum-physics.js` designs are
preserved but no longer loaded. The current Three.js scene uses fixed-center,
physical-material spheres, a procedural studio environment, and a light pink/purple
palette. Social icons have accessible names; Telegram opens the channel. The motion
control is keyboard-focusable but visually hidden until focused; Space also toggles
motion when the body is focused. No app build or restart is needed.

## Contact interaction and acceptance tests

The implementation locks one material surface patch when the cursor first touches
a bubble. That patch follows cursor displacement in mesh-local space on a fixed
camera-facing plane. A compact spatial kernel pulls the contacted cap and gently
pinches its sides; the opposite cap and object transform remain unchanged. There
is no axis scaling, mirrored inflation, whole-object drag, or repeated reanchoring.
Pulls are bounded, and exponential viscous following uses real elapsed time rather
than impulses or an underdamped spring. Release monotonically restores base vertices.
Normals and bounds are updated from the deformed positions. Static frames do not
rerender. Horizontal touch pulls work while vertical scrolling/pinch remain native.

Run `node --test maintenance/gum-contact.test.js maintenance/gum-physics.test.js`.
The contact suite is the current behavior; the physics suite preserves legacy tests.
For browser acceptance, serve an isolated copy first. Append `?verify-gum` to enable
read-only `window.__gumInspector.snapshot()` geometry measurements. Use real CDP
pointer events rather than mutating test state. Verify all four pull directions,
same-patch reversal, off-sphere bounded pulls, fixed centers, untouched opposite
vertices, monotonic release, touch movement, links, and reduced motion. Confirm
contact-to-cursor error stays within the mesh sampling tolerance (14 CSS px for the
desktop test). Preserve JSON test results and compare rest/pulled screenshots.
Ignore social links/controls and release on pointercancel, blur, resize, visibility
loss, and reduced-motion changes. Keep the original portfolio and TLS gate intact.

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
