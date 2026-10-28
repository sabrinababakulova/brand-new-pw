import * as THREE from '/_wip/three.module.min.js';
import { deformContact, followContact, contactTarget, createContactMaterial, signedVolume } from '/_wip/gum-contact.js';
import { getBubbleLayout } from '/_wip/gum-layout.js';

const canvas = document.querySelector('#flow');
const motionButton = document.querySelector('#motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches, raf = 0, last = 0;
function updateMotion() {
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume background animation' : 'Pause background animation';
}
updateMotion();
try {
  const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true, powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.setClearColor(0x000000,0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5,5,3,-3,.1,100);
  camera.position.z = 12;
  const studio = document.createElement('canvas'); studio.width=1024; studio.height=512;
  const ctx=studio.getContext('2d');
  const gradient=ctx.createLinearGradient(0,0,0,512);
  gradient.addColorStop(0,'#fff7ff');gradient.addColorStop(.5,'#b98cdb');gradient.addColorStop(1,'#573d75');
  ctx.fillStyle=gradient;ctx.fillRect(0,0,1024,512);ctx.filter='blur(16px)';
  ctx.fillStyle='#ffffff';ctx.fillRect(180,70,180,190);
  ctx.fillStyle='#ffe6f6';ctx.fillRect(720,100,100,230);
  const texture=new THREE.CanvasTexture(studio);texture.colorSpace=THREE.SRGBColorSpace;
  texture.mapping=THREE.EquirectangularReflectionMapping;
  const pmrem=new THREE.PMREMGenerator(renderer), environment=pmrem.fromEquirectangular(texture);
  scene.environment=environment.texture;texture.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff4ff,0x8b579b,2));
  const key=new THREE.DirectionalLight(0xfff5fc,3.2);key.position.set(-3,5,7);scene.add(key);
  const fill=new THREE.PointLight(0xdcc0ff,40,20);fill.position.set(4,-1,4);scene.add(fill);
  const group=new THREE.Group();scene.add(group);
  const definitions=[
    [1,.45,-.7,1.55,0xf4a4d5,.2],[2.25,1.95,-1.5,1.22,0xc29aef,1.7],
    [2.5,-1.55,-.2,1.38,0xeab1ee,3.4],[-.05,-1.6,-1.4,.77,0xd88ed3,4.6],
    [3.5,.15,-1.7,.8,0xf5b7d5,5.5],[.15,2.45,-2,.46,0xe8b1f4,2.5],
    [-.75,1.55,-2.4,.56,0xf3c1e5,.9],[3.45,1.65,-2.7,.45,0xd7b3ef,3.1],
    [0,-2.75,-2.2,.46,0xe1b8f3,1.2],[1.3,2.82,-2.6,.38,0xf6c2db,4.2],
    [-.95,-.3,-2.7,.35,0xd7b8f2,2.1],[3.25,-2.65,-2.5,.52,0xf3bbdf,5.2],
    [-1,2.7,2,.27,0xf6c4df,.7],[.1,1.45,2,.25,0xdac1f3,1.4],
    [1.5,2.7,2,.3,0xe3b4f2,2.2],[2,.65,2,.24,0xf4b6db,3.2],
    [-.8,.45,2,.34,0xf5c2e0,4.1],[-.2,2.1,2,.29,0xd5b3ed,5.3],
    [.8,1.2,2,.24,0xf6bad8,.4],[.8,-1.8,2,.29,0xd8b5f2,1.8],
    [-1.05,-2.2,2,.26,0xf1b1d6,2.6],[-.2,-2.35,2,.33,0xdcc1f4,3.7],
    [1.2,-2.7,2,.24,0xf7c7df,4.8],[2,-.7,2,.3,0xe3b6ee,5.9]
  ];
  const bubbles=definitions.map(([x,y,z,radius,color,phase],id)=>{
    const geometry=new THREE.SphereGeometry(radius,radius>=.7?48:32,radius>=.7?32:24), positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const px=positions.getX(i),py=positions.getY(i),pz=positions.getZ(i);
      const d=1+.055*Math.sin(py*2.1+phase)*Math.cos(px*1.7+pz);
      positions.setXYZ(i,px*d,py*d,pz*d);
    }
    geometry.computeVertexNormals();positions.setUsage(THREE.DynamicDrawUsage);
    const material=new THREE.MeshPhysicalMaterial({color,roughness:.19,metalness:.05,clearcoat:1,clearcoatRoughness:.1,sheen:.4,sheenColor:new THREE.Color(0xffd4ed),iridescence:.22,iridescenceIOR:1.3,envMapIntensity:.85});
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);
    const base=new Float32Array(positions.array),contact=new THREE.Vector3(radius,0,0);
    return {id,mesh,radius,base,contact,elastic:createContactMaterial(base,geometry.index.array,contact,radius),contactIndex:0,pull:new THREE.Vector3(),goal:new THREE.Vector3(),lastPull:new THREE.Vector3(),dirty:false};
  });
  const meshes=bubbles.map(b=>b.mesh), byMesh=new Map(bubbles.map(b=>[b.mesh,b]));
  const raycaster=new THREE.Raycaster(), ndc=new THREE.Vector2();
  const plane=new THREE.Plane(new THREE.Vector3(0,0,1),0), scratch=new THREE.Vector3();
  let active=null,renderNeeded=true;
  function allowed(e){return !paused && !e.target.closest?.('a,button,input,textarea,select');}
  function ray(e){ndc.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);raycaster.setFromCamera(ndc,camera);}
  function cursorOnContactPlane(e,bubble){
    ray(e);
    bubble.mesh.localToWorld(scratch.copy(bubble.contact));plane.constant=-scratch.z;
    if(!raycaster.ray.intersectPlane(plane,scratch))return null;
    return bubble.mesh.worldToLocal(scratch);
  }
  function release(){
    if(active)active.bubble.goal.set(0,0,0);
    active=null;
  }
  function begin(e,pressed=false){
    ray(e);const hit=raycaster.intersectObjects(meshes,false)[0];
    if(!hit)return false;
    const bubble=byMesh.get(hit.object);
    release();
    // Lock a material patch once. Never recompute its normal from cursor angle.
    if(bubble.pull.length()<bubble.radius*.01){
      const local=hit.point.clone();bubble.mesh.worldToLocal(local);
      const p=bubble.mesh.geometry.attributes.position;
      let nearest=0,min=Infinity;
      for(let i=0;i<p.count;i++){
        const d=(p.getX(i)-local.x)**2+(p.getY(i)-local.y)**2+(p.getZ(i)-local.z)**2;
        if(d<min){min=d;nearest=i;}
      }
      bubble.contactIndex=nearest;
      bubble.contact.fromArray(bubble.base,nearest*3);
      bubble.elastic=createContactMaterial(bubble.base,bubble.mesh.geometry.index.array,bubble.contact,bubble.radius);
      bubble.dirty=true;
    }
    const point=cursorOnContactPlane(e,bubble);
    if(!point)return false;
    active={bubble,pointerId:e.pointerId,pressed,origin:point.clone(),pointerType:e.pointerType};
    updateContact(e);
    return true;
  }
  function updateContact(e){
    if(!active || e.pointerId!==active.pointerId)return;
    const {bubble,origin,pressed}=active;
    const point=cursorOnContactPlane(e,bubble);
    if(!point)return;
    const delta=point.clone().sub(origin);
    // Leaving the contact neighbourhood releases the skin, never drags the object.
    if(!pressed && delta.length()>bubble.radius*.8){release();return;}
    const target=contactTarget(delta,bubble.radius,bubble.contact,pressed);
    bubble.goal.set(target.x,target.y,target.z);
  }
  function draw(dt=0){
    for(const bubble of bubbles){
      const {mesh,pull,goal,lastPull,base}=bubble;
      if(dt)followContact(pull,goal,dt,active?.bubble===bubble?12:10);
      if(pull.length()<.00005 && goal.lengthSq()===0)pull.set(0,0,0);
      if(pull.distanceToSquared(lastPull)>.0000000025 || bubble.dirty){
        const p=mesh.geometry.attributes.position;
        deformContact(base,p.array,bubble.contact,pull,bubble.radius,bubble.elastic);
        p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
        lastPull.copy(pull);bubble.dirty=false;
        renderNeeded=true;
      }
    }
    if(renderNeeded){renderer.render(scene,camera);renderNeeded=false;}
  }
  function resize(){
    release();
    const aspect=innerWidth/innerHeight;
    camera.left=-3*aspect;camera.right=3*aspect;camera.updateProjectionMatrix();
    const layout=getBubbleLayout(innerWidth,innerHeight,definitions);
    group.position.x=layout.groupX;group.scale.setScalar(layout.groupScale);
    bubbles.forEach((bubble,id)=>{
      bubble.mesh.position.set(...layout.transforms[id].position);
      bubble.mesh.scale.setScalar(layout.transforms[id].scale);
    });
    renderer.setSize(innerWidth,innerHeight);renderNeeded=true;draw();
  }
  function frame(now){
    raf=0;if(paused||document.hidden){last=0;return;}
    if(last && now-last<30){raf=requestAnimationFrame(frame);return;}
    const dt=last?Math.min((now-last)/1000,.5):0;last=now;draw(dt);
    raf=requestAnimationFrame(frame);
  }
  function start(){if(!raf&&!paused&&!document.hidden)raf=requestAnimationFrame(frame);}
  addEventListener('pointermove',e=>{
    if(!allowed(e)){release();return;}
    if(active){updateContact(e);return;}
    if(e.pointerType!=='touch')begin(e);
  },{passive:true});
  addEventListener('pointerdown',e=>{
    if(!allowed(e)||!e.isPrimary||e.button!==0)return;
    if(active && active.pointerId===e.pointerId){active.pressed=true;updateContact(e);}
    else begin(e,true);
  },{passive:true});
  addEventListener('pointerup',e=>{if(e.pointerId===active?.pointerId)release();});
  addEventListener('pointercancel',e=>{if(e.pointerId===active?.pointerId)release();});
  addEventListener('blur',release);document.addEventListener('pointerleave',release);
  addEventListener('resize',resize,{passive:true});
  function setPaused(value){release();paused=value;last=0;updateMotion();start();}
  motionButton.addEventListener('click',()=>setPaused(!paused));
  addEventListener('keydown',e=>{if(e.code==='Space'&&e.target===document.body){e.preventDefault();setPaused(!paused);}});
  preference.addEventListener('change',e=>setPaused(e.matches));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){release();last=0;}else start();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);raf=0;release();canvas.hidden=true;});

  // Read-only acceptance-test snapshots, enabled only on an explicit test URL.
  if(new URLSearchParams(location.search).has('verify-gum')){
    window.__gumInspector={snapshot:()=>({paused,active:active?.bubble.id??null,bubbles:bubbles.map(b=>{
      const p=b.mesh.geometry.attributes.position,at=b.contactIndex*3;
      const current=new THREE.Vector3().fromArray(p.array,at),rest=new THREE.Vector3().fromArray(b.base,at);
      const screen=b.mesh.localToWorld(current.clone()).project(camera);
      let maximum=0,back=0;
      for(let i=0;i<p.count;i++){
        const dx=p.getX(i)-b.base[i*3],dy=p.getY(i)-b.base[i*3+1],dz=p.getZ(i)-b.base[i*3+2];
        const displacement=Math.hypot(dx,dy,dz);maximum=Math.max(maximum,displacement);
        const restPoint=new THREE.Vector3().fromArray(b.base,i*3);
        if(restPoint.clone().normalize().dot(b.contact.clone().normalize())<-.8)back=Math.max(back,displacement);
      }
      return {id:b.id,radius:b.radius,center:b.mesh.position.toArray(),pull:b.pull.toArray(),goal:b.goal.toArray(),contact:b.contact.toArray(),contactDisplacement:current.sub(rest).toArray(),contactScreen:[(screen.x+1)*innerWidth/2,(1-screen.y)*innerHeight/2],maxDeformation:maximum,backDeformation:back,volumeRatio:signedVolume(p.array,b.mesh.geometry.index.array)/b.elastic.restVolume,normalsFinite:Array.from(b.mesh.geometry.attributes.normal.array).every(Number.isFinite)};
    })})};
  }
  resize();start();
}catch(error){canvas.hidden=true;motionButton.hidden=true;console.error('Bubblegum scene could not initialize.',error);}
