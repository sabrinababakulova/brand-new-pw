import test from 'node:test';
import assert from 'node:assert/strict';
const physics = await import('./gum-physics.js').catch(() => ({}));

test('bubble centers stay fixed even across animation frames', () => {
  const bubble = { x: 1, y: .45, z: -.7, phase: .2, squash: { x: 0, y: 0 } };
  assert.deepEqual(physics.bubblePose(0, bubble).position, physics.bubblePose(20, bubble).position);
});

test('stretch reshapes mesh tips while keeping the center anchored', () => {
  assert.equal(typeof physics.deformGum, 'function', 'surface deformation must exist');
  const base = new Float32Array([1,0,0, -1,0,0, 0,1,0, 0,-1,0, 0,0,1, 0,0,-1]);
  const output = new Float32Array(base.length);
  physics.deformGum(base, output, 1, 0, .4, 1);
  assert.ok(output[0] > 1.3 && output[3] < -1.3, 'the mesh must visibly stretch');
  assert.ok(output[7] < 1, 'the perpendicular surface must squeeze inward');
  for (let axis=0; axis<3; axis++) {
    let sum=0; for(let i=axis;i<output.length;i+=3) sum+=output[i];
    assert.ok(Math.abs(sum)<.00001, 'deformation must not move the center');
  }
  physics.deformGum(base, output, 1, 0, 0, 1);
  assert.deepEqual(output, base, 'the mesh must relax back to its original surface');
});

test('interaction deforms a bubble without moving its center', () => {
  assert.equal(typeof physics.bubblePose, 'function', 'anchored deformation must exist');
  const base = { x: 1, y: .45, z: -.7, phase: .2, squash: { x: 0, y: 0 } };
  const rest = physics.bubblePose(3, base);
  const squished = physics.bubblePose(3, { ...base, squash: { x: .09, y: .05 }, spring: { x: 3, y: -3 } });
  assert.deepEqual(squished.position, rest.position, 'pointer input must not translate the center');
  assert.notDeepEqual(squished.scale, rest.scale, 'the shape must still stretch');
  assert.ok(Math.abs(squished.scale[0] * squished.scale[1] - rest.scale[0] * rest.scale[1]) < .00001);
});

test('a normal poke stays subtle and settles promptly', () => {
  const state = { x: 0, y: 0, vx: 0, vy: 0 };
  physics.kickSpring(state, 1.5, 0);
  let peak = 0;
  for (let i = 0; i < 120; i++) {
    physics.stepSpring(state, 1 / 120);
    peak = Math.max(peak, Math.abs(state.x));
  }
  assert.ok(peak < .07, `poke displacement ${peak} must stay gentle`);
  assert.ok(Math.abs(state.x) < .005, 'poke should settle within one second');
});

test('a displaced gum spring bounces back and settles', () => {
  assert.equal(typeof physics.stepSpring, 'function', 'gum spring physics must exist');
  const state = { x: 1, y: -.4, vx: 0, vy: 0 };
  let crossedRest = false;
  for (let i = 0; i < 600; i++) {
    physics.stepSpring(state, 1 / 120);
    if (state.x < 0) crossedRest = true;
  }
  assert.ok(crossedRest, 'gum should overshoot instead of just easing back');
  assert.ok(Math.abs(state.x) < .001 && Math.abs(state.y) < .001);
});

test('cursor impulses add bounce without unbounded velocity', () => {
  assert.equal(typeof physics.kickSpring, 'function', 'cursor impulses must exist');
  const state = { x: 0, y: 0, vx: 0, vy: 0 };
  physics.kickSpring(state, 3, -2);
  assert.ok(state.vx > 0 && state.vy < 0);
  for (let i = 0; i < 100; i++) physics.kickSpring(state, 100, -100);
  assert.ok(Math.hypot(state.vx, state.vy) <= 12.00001);
});
