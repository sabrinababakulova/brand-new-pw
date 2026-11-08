import test from 'node:test';
import assert from 'node:assert/strict';
import { createIdleMotion, stepIdleMotion } from './gum-idle.js';

test('idle time advances only when the bubble is not being handled', () => {
  const state = createIdleMotion(1.5, .7);
  assert.deepEqual([state.x, state.y, state.time], [0, 0, 0]);
  stepIdleMotion(state, 1 / 30);
  assert.ok(Math.hypot(state.x, state.y) > 0, 'idle bubble should start floating');
  const held = structuredClone(state);
  stepIdleMotion(state, 2, { held: true });
  assert.deepEqual(state, held, 'contact must freeze the existing position, not snap to its anchor');
  stepIdleMotion(state, 1 / 30);
  assert.ok(state.time > held.time, 'release resumes from the frozen phase');
  assert.ok(Math.hypot(state.x-held.x, state.y-held.y) < .002 * state.radius);
});

test('disabled motion preserves position and phase for pause and reduced motion', () => {
  const state = createIdleMotion(1, 2);
  stepIdleMotion(state, 3);
  const frozen = structuredClone(state);
  assert.equal(stepIdleMotion(state, 60, { enabled: false }), false);
  assert.deepEqual(state, frozen);
});

test('invalid elapsed time cannot poison the animation state', () => {
  const state = createIdleMotion(1, 1);
  for (const dt of [-1, NaN, Infinity, -Infinity, 0]) {
    assert.equal(stepIdleMotion(state, dt), false);
    assert.deepEqual([state.time, state.x, state.y], [0, 0, 0]);
  }
});

test('drift stays small and slow throughout many unsynchronised cycles', () => {
  for (const phase of [.2, 1.7, 3.4, 4.6, 5.9]) {
    const state = createIdleMotion(1.55, phase);
    for (let i = 0; i < 3600; i++) {
      const { x, y } = state;
      stepIdleMotion(state, .5);
      assert.ok(Math.hypot(state.x, state.y) <= .15 * state.radius + 1e-12);
      assert.ok(Math.hypot(state.x-x, state.y-y) / .5 < .018 * state.radius);
    }
  }
});

test('different phases do not make the bubbles sway as a single group', () => {
  const a = createIdleMotion(1, .2), b = createIdleMotion(1, 3.4);
  stepIdleMotion(a, 8);stepIdleMotion(b, 8);
  assert.ok(Math.hypot(a.x-b.x, a.y-b.y) > .01);
});

test('the same elapsed active time has the same position at different frame rates', () => {
  const a = createIdleMotion(1, 1.7), b = createIdleMotion(1, 1.7);
  for (let i = 0; i < 300; i++) stepIdleMotion(a, 1 / 30);
  for (let i = 0; i < 600; i++) stepIdleMotion(b, 1 / 60);
  assert.ok(Math.hypot(a.x-b.x, a.y-b.y) < 1e-10);
});
