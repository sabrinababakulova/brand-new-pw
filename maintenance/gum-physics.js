// Real, non-affine surface stretch: the tips pull farther than the middle.
export function deformGum(base, output, directionX, directionY, amount, radius) {
  const length = Math.hypot(directionX, directionY) || 1;
  const nx = directionX / length, ny = directionY / length;
  const strength = Math.max(-.15, Math.min(.5, amount));
  const transverse = 1 / Math.sqrt(1 + strength);
  for (let i = 0; i < base.length; i += 3) {
    const x = base[i], y = base[i + 1], z = base[i + 2];
    const along = x * nx + y * ny;
    const side = Math.min(1, Math.abs(along) / radius);
    const stretched = along * (1 + strength * (.5 + .5 * side * side));
    output[i] = (x - along * nx) * transverse + stretched * nx;
    output[i + 1] = (y - along * ny) * transverse + stretched * ny;
    output[i + 2] = z * transverse;
  }
}

// Fixed centers: surface deformation, not translation, provides the interaction.
export function bubblePose(t, { x, y, z, phase, squash }) {
  const breathe = Math.sin(t * .65 + phase) * .012;
  const squish = Math.max(-.01, Math.min(.01, squash.x * .02));
  return {
    position: [x, y, z],
    scale: [(1 + breathe) * (1 + squish), (1 - breathe) / (1 + squish), 1],
    rotation: [0, 0, 0]
  };
}

// Damped, underdamped spring. Fixed substeps keep deformation stable on slow frames.
export function kickSpring(state, x, y) {
  state.vx += x * .55;
  state.vy += y * .55;
  const speed = Math.hypot(state.vx, state.vy);
  if (speed > 5) { state.vx *= 5 / speed; state.vy *= 5 / speed; }
}
export function stepSpring(state, dt, targetX = 0, targetY = 0) {
  const duration = Math.max(0, Math.min(dt, .05));
  const steps = Math.max(1, Math.ceil(duration / (1 / 120)));
  const h = duration / steps;
  for (let i = 0; i < steps; i++) {
    state.vx += ((targetX - state.x) * 62 - state.vx * 9.8) * h;
    state.vy += ((targetY - state.y) * 62 - state.vy * 9.8) * h;
    state.x += state.vx * h;
    state.y += state.vy * h;
  }
  return state;
}
