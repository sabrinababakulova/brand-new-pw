// A localized material contact, not a whole-object scale or a mirrored axis.
export function deformContact(base, output, contact, pull, radius) {
  const magnitude = Math.hypot(pull.x, pull.y, pull.z);
  const limit = radius * 1.1;
  const bounded = magnitude > limit ? limit / magnitude : 1;
  const px = pull.x * bounded, py = pull.y * bounded, pz = pull.z * bounded;
  const length = Math.hypot(px, py, pz);
  const nx = length ? px / length : 0, ny = length ? py / length : 0, nz = length ? pz / length : 0;
  const pinch = Math.min(length / radius, 1) * .16;
  for (let i = 0; i < base.length; i += 3) {
    const x = base[i], y = base[i + 1], z = base[i + 2];
    const dx = x - contact.x, dy = y - contact.y, dz = z - contact.z;
    const t = Math.max(0, 1 - Math.hypot(dx, dy, dz) / (radius * 1.65));
    const anchor = Math.min(1, Math.hypot(x, y, z) / (radius * .65));
    const weight = t * t * (3 - 2 * t) * anchor * anchor;
    if (!weight || !length) {
      output[i] = x; output[i + 1] = y; output[i + 2] = z;
      continue;
    }
    const along = dx * nx + dy * ny + dz * nz;
    output[i] = x + weight * (px - (dx - along * nx) * pinch);
    output[i + 1] = y + weight * (py - (dy - along * ny) * pinch);
    output[i + 2] = z + weight * (pz - (dz - along * nz) * pinch);
  }
}

// Viscous following: independent of frame rate, monotonic, no spring overshoot.
export function followContact(state, target, dt, rate = 12) {
  const alpha = 1 - Math.exp(-rate * Math.max(0, Math.min(dt, .5)));
  state.x += (target.x - state.x) * alpha;
  state.y += (target.y - state.y) * alpha;
  state.z += (target.z - state.z) * alpha;
  return state;
}
