import test from 'node:test';
import assert from 'node:assert/strict';
import { SphereGeometry } from './vendor/three.module.min.js';
import * as gum from './gum-contact.js';

test('even an extreme gesture cannot pull the skin farther than 22% of its radius',()=>{
  const base=new Float32Array([1,0,0,-1,0,0]),output=new Float32Array(6);
  gum.deformContact(base,output,{x:1,y:0,z:0},{x:1000,y:0,z:0},1);
  assert.ok(output[0]-1<=.22001,'the previous full-radius tails are too stretchy');
});

test('hover is weaker than pressing and the material progressively resists a longer pull',()=>{
  assert.equal(typeof gum.contactTarget,'function');
  const normal={x:0,y:0,z:1};
  const hover=gum.contactTarget({x:1,y:0,z:0},1,normal,false);
  const pressed=gum.contactTarget({x:1,y:0,z:0},1,normal,true);
  const long=gum.contactTarget({x:10,y:0,z:0},1,normal,true);
  assert.ok(hover.x>0 && hover.x<.13);
  assert.ok(pressed.x>hover.x && pressed.x<.22);
  assert.ok(Math.hypot(long.x,long.y,long.z)<=.220001);
  assert.ok(long.x-pressed.x<pressed.x,'strain must harden instead of tracking the cursor 1:1');
});

test('deformation preserves a closed gum mesh volume without moving the opposite cap',()=>{
  assert.equal(typeof gum.createContactMaterial,'function');
  assert.equal(typeof gum.signedVolume,'function');
  const geometry=new SphereGeometry(1,48,32);
  const base=new Float32Array(geometry.attributes.position.array),indices=geometry.index.array;
  const contact={x:1,y:0,z:0};
  const elastic=gum.createContactMaterial(base,indices,contact,1);
  for(const pull of [{x:.22,y:0,z:0},{x:-.08,y:0,z:0},{x:0,y:.22,z:0},{x:.14,y:.14,z:0}]){
    const output=new Float32Array(base.length);
    gum.deformContact(base,output,contact,pull,1,elastic);
    const ratio=gum.signedVolume(output,indices)/elastic.restVolume;
    assert.ok(Math.abs(ratio-1)<.01,`volume changed by ${((ratio-1)*100).toFixed(2)}%`);
    for(let i=0;i<base.length;i+=3){
      assert.ok(Number.isFinite(output[i])&&Number.isFinite(output[i+1])&&Number.isFinite(output[i+2]));
      if(base[i]<-.8){assert.equal(output[i],base[i]);assert.equal(output[i+1],base[i+1]);assert.equal(output[i+2],base[i+2]);}
    }
    const restored=new Float32Array(base.length);
    gum.deformContact(base,restored,contact,{x:0,y:0,z:0},1,elastic);
    assert.deepEqual(restored,base);
  }
});

test('squishy contact does not fold mesh faces across contact directions',()=>{
  const geometry=new SphereGeometry(1,32,24);
  const base=new Float32Array(geometry.attributes.position.array),indices=geometry.index.array;
  for(let i=0;i<base.length;i+=3){
    const d=1+.04*Math.sin(base[i+1]*2+.2)*Math.cos(base[i]*1.7+base[i+2]);
    base[i]*=d;base[i+1]*=d;base[i+2]*=d;
  }
  const cross=(p,a,b,c)=>{
    const x=p[b]-p[a],y=p[b+1]-p[a+1],z=p[b+2]-p[a+2];
    const u=p[c]-p[a],v=p[c+1]-p[a+1],w=p[c+2]-p[a+2];
    return [y*w-z*v,z*u-x*w,x*v-y*u];
  };
  for(const contact of [{x:1,y:0,z:0},{x:-1,y:0,z:0},{x:0,y:1,z:0},{x:0,y:-1,z:0},{x:0,y:0,z:1},{x:0,y:0,z:-1}]){
    const elastic=gum.createContactMaterial(base,indices,contact,1);
    for(const delta of [{x:3,y:0,z:0},{x:-3,y:0,z:0},{x:0,y:3,z:0},{x:0,y:-3,z:0}]){
      const output=new Float32Array(base.length);
      gum.deformContact(base,output,contact,gum.contactTarget(delta,1,contact,true),1,elastic);
      assert.ok(Math.abs(gum.signedVolume(output,indices)/elastic.restVolume-1)<.01);
      for(let k=0;k<indices.length;k+=3){
        const a=indices[k]*3,b=indices[k+1]*3,c=indices[k+2]*3;
        const before=cross(base,a,b,c),after=cross(output,a,b,c);
        if(Math.hypot(...before)<1e-9)continue;
        assert.ok(before[0]*after[0]+before[1]*after[1]+before[2]*after[2]>0,'a surface triangle folded over');
      }
    }
  }
});
