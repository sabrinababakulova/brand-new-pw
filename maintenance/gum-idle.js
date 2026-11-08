// Gentle XY drift only: no rotations, depth changes or surface deformation.
// Advancing each bubble's own clock lets contact freeze it without a snap.
export function createIdleMotion(radius, phase = 0) {
  return { radius, phase, time: 0, x: 0, y: 0 };
}

export function stepIdleMotion(state, dt, { held = false, enabled = true } = {}) {
  if (!enabled || held || !Number.isFinite(dt) || dt <= 0) return false;
  state.time += dt;
  const { radius, phase, time } = state;
  state.x = radius * .045 * (Math.sin(phase + time * (2 * Math.PI / (27 + phase))) - Math.sin(phase));
  state.y = radius * .06 * (Math.sin(phase * 1.3 + time * (2 * Math.PI / (35 + phase * .5))) - Math.sin(phase * 1.3));
  return true;
}
