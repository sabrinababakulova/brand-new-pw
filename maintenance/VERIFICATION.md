# Bubblegum scene verification

Current implementation: `bubblegum-contact.js`, `gum-contact.js`, `gum-layout.js`
and `gum-idle.js`. The 12-bubble results below are the historical solver baseline;
the current scene has 24 bubbles, with the idle update recorded separately below.

- 12 bubbles, with lower-resolution meshes for smaller bubbles.
- Unit tests: 10 contact + 4 material + 3 layout + 6 legacy tests passed.
- Original portfolio: 18 tests passed; no app source/config changes.
- New regression tests failed before the material fix, then passed.
- Closed-mesh volume stays within 1% of rest volume across sampled loads.
- Sampled mesh triangles do not fold; all tested coordinates/normals stay finite.
- Browser directional tests: 4/4 passed with fixed centers and far caps.
- Hover is weaker than pressing; pull is capped and releases monotonically.
- Real phone touch, reduced motion, and all five social icons passed.
- 320px and 390px layouts have no horizontal overflow.

## Browser measurements (isolated preview)

| Direction | Contact pull / radius | Volume change (%) | Opposite cap movement | Center fixed |
|---|---:|---:|---:|---|
| right | 0.0965 | 0.008 | 0 | True |
| left | 0.1034 | 0.041 | 0 | True |
| up | 0.0930 | 0.021 | 0 | True |
| down | 0.0930 | 0.021 | 0 | True |

These measurements use the same 100–110 CSS-pixel gestures as the earlier
prototype. Reduced response, rather than 1:1 cursor tracking, is intentional.
The contact target soft-saturates at 0.12 radius for hover and 0.22 for pressing.
A bounded shoulder correction conserves volume without translating the object
or pulling the far cap outward.

## Deployment verification

All 13 packaged public files are included in the standalone build. A real pointer
replay on the live site confirmed 12 bubbles, restrained contact motion, stable
volume, finite normals, and unchanged centers/far caps. Independent review found
no blocking solver or geometry issue.

## Full-viewport layout checks

Desktop browser checks at 1440, 1920 and 2560 CSS pixels confirmed 12 bubbles,
with 5 centers in the left third, 3 in the center third and 4 in the right third.
Phone checks at 390px and 320px retained the original composition without overflow.
A scaled left-side bubble retained directional squish, fixed center/far cap and
stable volume. The material solver was not changed by this layout update.

## 24-bubble density update

The scene now contains 24 bubbles, with desktop centers distributed 9/8/7 across
the left/center/right thirds. Existing bubble positions and material settings are
unchanged; smaller foreground bubbles add density without intersecting the large
bubble surfaces. Browser checks at 320x740, 390x844, 1440x1000 and 2560x1080
confirmed all 24 meshes, finite normals and no horizontal overflow. All five
social links remain visible on both phone sizes. All 23 standalone tests pass.

## Slow idle float

The new idle module adds bounded, phase-offset XY movement to each bubble, without
changing its geometry, depth or rotation. Centers freeze during contact and skin
recovery; unrelated bubbles continue floating. The contact solver is unchanged.

- 29 standalone tests and 18 original-portfolio tests pass.
- Six idle tests cover hold/release continuity, disabled motion, invalid dt,
  bounded speed/range, independent phases and frame-rate independence.
- Initial idle, pause and invalid-dt regressions failed before their implementations.
- Standalone packaging includes the new module: 14 explicit public files.
- Preview at 1440x1000: all 24 unhandled bubbles changed position; no overflow.
- A real 75px press gesture kept the center fixed while deforming the skin:
  maximum strain 0.074865 radius, volume ratio 1.000220, far-cap displacement 0.
- The handled bubble resumed floating after release and elastic recovery.
- Space paused every center and resumed the same phase; reduced motion froze all
  bubbles, could not be overridden by Resume, and was static on a fresh load.
- Phone previews at 320x740 and 390x844: all 24 idle transforms advanced, no
  horizontal overflow, all five social controls visible and real clicks passed.
- Real touch input froze the contacted bubble and released normally.
- Ultrawide 2560x1080: all 24 moved, with centers distributed 9/8/7 across thirds.
- A background browser tab held idle clocks at zero until brought to the foreground.

The deployed HTTPS scene was also checked with real pointer input: all 24 bubbles
float on desktop and a 320px phone viewport, contact centers and far caps remain
fixed while the skin stretches, and pause/reduced-motion controls stop movement.
All five phone links remain visible and no JavaScript errors were recorded. Every
one of the 14 deployed public files matched the clean build byte-for-byte; the
apex, www host and gated deep link returned HTTP 200 with no-store caching.

The preview shader compiler exceeded a browser helper's short default timeout on
one reload; retrying with a longer CDP response timeout verified the loaded scene.
This is not a claim about frame rate on visitors' devices.

## Re-running

Run `npm --prefix maintenance test` and `npm --prefix maintenance run build`.
Follow the acceptance checklist in README.md with the read-only `?verify-gum`
inspector. Recorded browser measurements are not an automated GitHub CI claim.
Private agent/session artifacts are not included in the repository.

This is a stylized, approximately volume-preserving elastic surface, not a full
material-science or fluid simulation.
