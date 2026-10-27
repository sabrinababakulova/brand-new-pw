export const CONTACT_LIMITS = Object.freeze({ hover: .12, pressed: .22, inward: .08 });

// A weak brush on hover, a slightly firmer press, and increasing resistance.
// The target is a fraction of cursor travel, never a 1:1 skin drag.
export function contactTarget(delta, radius, surfaceNormal, pressed = false) {
  const normalLength = Math.hypot(surfaceNormal.x, surfaceNormal.y, surfaceNormal.z) || 1;
  const nx = surfaceNormal.x / normalLength, ny = surfaceNormal.y / normalLength, nz = surfaceNormal.z / normalLength;
  const gain = pressed ? .24 : .16;
  const depth = radius * (pressed ? .035 : .012);
  let x = delta.x * gain - nx * depth;
  let y = delta.y * gain - ny * depth;
  let z = delta.z * gain - nz * depth;
  const inward = x * nx + y * ny + z * nz;
  if (inward < -radius * CONTACT_LIMITS.inward) {
    const correction = -radius * CONTACT_LIMITS.inward - inward;
    x += nx * correction; y += ny * correction; z += nz * correction;
  }
  const length = Math.hypot(x, y, z);
  const limit = radius * (pressed ? CONTACT_LIMITS.pressed : CONTACT_LIMITS.hover);
  const resistance = length ? limit * Math.tanh(length / limit) / length : 1;
  return { x: x * resistance, y: y * resistance, z: z * resistance };
}

export function signedVolume(positions, indices) {
  let volume = 0;
  for (let k = 0; k < indices.length; k += 3) {
    const a = indices[k] * 3, b = indices[k + 1] * 3, c = indices[k + 2] * 3;
    volume += positions[a] * (positions[b + 1] * positions[c + 2] - positions[b + 2] * positions[c + 1])
      + positions[a + 1] * (positions[b + 2] * positions[c] - positions[b] * positions[c + 2])
      + positions[a + 2] * (positions[b] * positions[c + 1] - positions[b + 1] * positions[c]);
  }
  return volume / 6;
}

export function createContactMaterial(base, indices, contact, radius) {
  const basis = new Float32Array(base.length);
  const length = Math.hypot(contact.x, contact.y, contact.z) || 1;
  const cx = contact.x / length, cy = contact.y / length, cz = contact.z / length;
  for (let i = 0; i < base.length; i += 3) {
    const r = Math.hypot(base[i], base[i + 1], base[i + 2]) || 1;
    const nx = base[i] / r, ny = base[i + 1] / r, nz = base[i + 2] / r;
    const t = Math.max(0, Math.min(1, (nx * cx + ny * cy + nz * cz - .12) / .88));
    // A soft shoulder around the contact: zero at both tip and opposite cap.
    const shoulder = 16 * t * t * (1 - t) * (1 - t);
    basis[i] = nx * shoulder; basis[i + 1] = ny * shoulder; basis[i + 2] = nz * shoulder;
  }
  return { indices, basis, restVolume: signedVolume(base, indices), radius };
}

function shiftShoulder(output, basis, amount) {
  for (let i = 0; i < output.length; i++) output[i] += basis[i] * amount;
}

function restoreVolume(output, material) {
  const { indices, basis, restVolume, radius } = material;
  if (Math.abs(restVolume) < 1e-10) return;
  let correction = 0;
  const epsilon = radius * .002;
  for (let step = 0; step < 3; step++) {
    const volume = signedVolume(output, indices);
    const error = restVolume - volume;
    if (Math.abs(error) < Math.abs(restVolume) * .0005) break;
    shiftShoulder(output, basis, epsilon);
    const slope = (signedVolume(output, indices) - volume) / epsilon;
    shiftShoulder(output, basis, -epsilon);
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-10) break;
    const wanted = Math.max(-radius * .14, Math.min(radius * .14, correction + error / slope));
    const change = wanted - correction;
    if (Math.abs(change) < radius * 1e-7) break;
    shiftShoulder(output, basis, change);
    correction = wanted;
  }
}

// Local skin motion with an anchored far side; the core never translates.
export function deformContact(base, output, contact, pull, radius, material) {
  const magnitude = Math.hypot(pull.x, pull.y, pull.z);
  const limit = radius * CONTACT_LIMITS.pressed;
  const bounded = magnitude > limit ? limit / magnitude : 1;
  let px = pull.x * bounded, py = pull.y * bounded, pz = pull.z * bounded;
  const contactLength = Math.hypot(contact.x, contact.y, contact.z) || 1;
  const cx = contact.x / contactLength, cy = contact.y / contactLength, cz = contact.z / contactLength;
  const inward = px * cx + py * cy + pz * cz;
  if (inward < -radius * CONTACT_LIMITS.inward) {
    const correction = -radius * CONTACT_LIMITS.inward - inward;
    px += cx * correction; py += cy * correction; pz += cz * correction;
  }
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
  if (material && length > 1e-8) restoreVolume(output, material);
}

// Viscous following is frame-independent and cannot overshoot its target.
export function followContact(state, target, dt, rate = 12) {
  const alpha = 1 - Math.exp(-rate * Math.max(0, Math.min(dt, .5)));
  state.x += (target.x - state.x) * alpha;
  state.y += (target.y - state.y) * alpha;
  state.z += (target.z - state.z) * alpha;
  return state;
}
