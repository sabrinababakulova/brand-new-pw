import test from 'node:test';
import assert from 'node:assert/strict';
import * as legacy from './gum-physics.js';
const gum = await import('./gum-contact.js').catch(() => ({}));

// Reproduce the rejected implementation: it stretches the opposite side too.
test('the replacement pulls only the contacted side, not a mirrored axis', () => {
  assert.equal(typeof gum.deformContact, 'function', 'localized contact deformation must exist');
  const base = new Float32Array([1,0,0, -1,0,0, 0,1,0, 0,0,0]);
  const output = new Float32Array(base.length);
  gum.deformContact(base, output, {x:1,y:0,z:0}, {x:.6,y:0,z:0}, 1);
  assert.ok(output[0] > 1.55, 'contact point follows the cursor right');
  assert.equal(output[3], -1, 'opposite side must remain anchored');
  assert.deepEqual([...output.slice(9)], [0,0,0], 'the interior anchor cannot translate');
});

for (const [name,contact,pull,axis,sign] of [
  ['right',{x:1,y:0,z:0},{x:.6,y:0,z:0},0,1],
  ['left',{x:-1,y:0,z:0},{x:-.6,y:0,z:0},0,-1],
  ['up',{x:0,y:1,z:0},{x:0,y:.6,z:0},1,1],
  ['down',{x:0,y:-1,z:0},{x:0,y:-.6,z:0},1,-1]
]) test(`contact follows cursor ${name} without mirror deformation`, () => {
  assert.equal(typeof gum.deformContact, 'function');
  const base = new Float32Array([contact.x,contact.y,contact.z,-contact.x,-contact.y,-contact.z]);
  const output = new Float32Array(6);
  gum.deformContact(base, output, contact, pull, 1);
  assert.ok((output[axis]-base[axis])*sign > .55);
  for(let i=3;i<6;i++) assert.equal(output[i],base[i]);
  gum.deformContact(base, output, contact, {x:0,y:0,z:0},1);
  assert.deepEqual(output,base,'release restores the rest shape exactly');
});

test('soft following settles without oscillating or overshooting', () => {
  assert.equal(typeof gum.followContact, 'function');
  const state={x:0,y:0,z:0};
  let previous=0;
  for(let i=0;i<90;i++) {
    gum.followContact(state,{x:.7,y:0,z:0},1/60);
    assert.ok(state.x>=previous && state.x<=.7);
    previous=state.x;
  }
  assert.ok(state.x>.699);
  for(let i=0;i<120;i++) gum.followContact(state,{x:0,y:0,z:0},1/60);
  assert.ok(Math.abs(state.x)<.00001);
});

test('cursor following uses real elapsed time even on a slow frame',()=>{
  assert.equal(typeof gum.followContact,'function');
  const state={x:0,y:0,z:0};
  gum.followContact(state,{x:1,y:0,z:0},.5);
  assert.ok(state.x>.98,'a slow renderer must not make the skin lag far behind the cursor');
});

test('contact can reverse direction without migrating or flipping the opposite side',()=>{
  const base=new Float32Array([1,0,0,-1,0,0]);
  const output=new Float32Array(6);const contact={x:1,y:0,z:0};
  gum.deformContact(base,output,contact,{x:0,y:.4,z:0},1);
  assert.ok(output[1]>.39);assert.equal(output[4],0);
  gum.deformContact(base,output,contact,{x:0,y:-.4,z:0},1);
  assert.ok(output[1]<-.39);assert.equal(output[4],0);
  assert.deepEqual(contact,{x:1,y:0,z:0});
});

test('following agrees at 30, 60 and 120 frames per second',()=>{
  const results=[30,60,120].map(hz=>{
    const state={x:0,y:0,z:0};
    for(let i=0;i<hz;i++)gum.followContact(state,{x:.6,y:-.3,z:.1},1/hz);
    for(let i=0;i<hz;i++)gum.followContact(state,{x:0,y:0,z:0},1/hz);
    return state;
  });
  for(const state of results)for(const axis of ['x','y','z'])assert.ok(Math.abs(state[axis]-results[0][axis])<.00001);
});

test('extreme pulls are bounded and remain finite',()=>{
  assert.equal(typeof gum.deformContact,'function');
  const base=new Float32Array([1,0,0,-1,0,0]); const output=new Float32Array(6);
  gum.deformContact(base,output,{x:1,y:0,z:0},{x:1000,y:-1000,z:0},1);
  assert.ok([...output].every(Number.isFinite));
  assert.ok(Math.hypot(output[0]-1,output[1],output[2])<=1.1001);
});
