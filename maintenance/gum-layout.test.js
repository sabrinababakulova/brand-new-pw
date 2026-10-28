import test from 'node:test';
import assert from 'node:assert/strict';
const layout=await import('./gum-layout.js').catch(()=>({}));
const definitions=Array.from({length:24},(_,id)=>[id*.2,.45-id*.1,-id*.2,.5,0xffffff,0]);

test('desktop bubble centers cover the left, center, and right thirds at wide sizes',()=>{
  assert.equal(typeof layout.getBubbleLayout,'function','full-viewport desktop layout must exist');
  for(const [width,height]of [[1024,768],[1440,1000],[1920,1080],[2560,1080]]){
    const result=layout.getBubbleLayout(width,height,definitions);
    const thirds=[0,0,0];const aspect=width/height;
    assert.equal(result.transforms.length,24);assert.equal(result.groupX,0);
    for(const item of result.transforms){
      const u=(item.position[0]+3*aspect)/(6*aspect);
      assert.ok(u>=0&&u<=1);thirds[Math.min(2,Math.floor(u*3))]++;
      assert.ok(item.position.every(Number.isFinite)&&item.scale>0);
    }
    assert.ok(thirds.every(n=>n>=3),`not enough coverage at ${width}px: ${thirds}`);
  }
});

test('phone bubble positions and scales retain the existing composition',()=>{
  assert.equal(typeof layout.getBubbleLayout,'function');
  const result=layout.getBubbleLayout(390,844,definitions);
  assert.equal(result.groupX,-.2);assert.equal(result.groupScale,.77);
  result.transforms.forEach((item,id)=>{assert.deepEqual(item.position,definitions[id].slice(0,3));assert.equal(item.scale,1);});
});

test('resizing produces a deterministic layout without modifying source definitions',()=>{
  assert.equal(typeof layout.getBubbleLayout,'function');
  const before=JSON.stringify(definitions);
  const first=layout.getBubbleLayout(1440,1000,definitions);
  layout.getBubbleLayout(390,844,definitions);
  assert.deepEqual(layout.getBubbleLayout(1440,1000,definitions),first);
  assert.equal(JSON.stringify(definitions),before);
});
