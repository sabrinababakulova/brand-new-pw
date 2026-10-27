# Twelve-bubble material verification

Current implementation: `bubblegum-contact.js` + `gum-contact.js`.

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

## Re-running

Run `npm --prefix maintenance test` and `npm --prefix maintenance run build`.
Follow the acceptance checklist in README.md with the read-only `?verify-gum`
inspector. Recorded browser measurements are not an automated GitHub CI claim.
Private agent/session artifacts are not included in the repository.

This is a stylized, approximately volume-preserving elastic surface, not a full
material-science or fluid simulation.
