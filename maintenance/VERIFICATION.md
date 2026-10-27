# Bubblegum interaction verification

The active implementation is `bubblegum-contact.js` + `gum-contact.js`.

- Current contact unit suite: 10 passed. Legacy suite: 6 passed.
- Browser directional tests: 4/4 passed (right, left, up, down).
- Same-patch reversal and off-sphere checks: 3/3 passed.
- Fixed mesh positions and untouched opposite vertices verified.
- Release magnitude decreased monotonically to rest.
- Real touch movement, social SVG event pass-through, and reduced-motion suppression passed.
- Live HTTPS assets matched tested local source byte-for-byte.
- Live site pointer replay passed after deployment.

## Directional measurements

| Direction | Contact-to-cursor error (CSS px) | Opposite cap displacement | Center fixed |
|---|---:|---:|---|
| right | 6.24 | 0 | True |
| left | 5.74 | 0 | True |
| up | 6.81 | 0 | True |
| down | 6.92 | 0 | True |

## Re-running verification

Run `npm --prefix maintenance test` for the deterministic unit suites and
`npm --prefix maintenance run build` to package the standalone page. Browser
measurements above record the deployment acceptance checks; they are not a
claim of automated GitHub CI. Follow the browser checklist in `README.md` to
repeat them on the current scene. Local agent cache paths and raw session
artifacts are intentionally not part of this repository.

This is a localized visual elasticity model, not a fluid or material-science simulator.
