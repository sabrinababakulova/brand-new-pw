import * as THREE from '/_wip/three.module.min.js';

const canvas = document.querySelector('#flow');
const button = document.querySelector('#motion');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let renderer, material, scene, camera, raf = 0, time = 0, previous = 0;
const pointer = new THREE.Vector2(0.5, 0.5);
const target = pointer.clone();
function updateButton() {
  document.body.classList.toggle('paused', paused);
  if (button) {
    button.setAttribute('aria-pressed', String(paused));
    button.innerHTML = paused ? 'RESUME MOTION <span>▷</span>' : 'PAUSE MOTION <span>Ⅱ</span>';
  }
}
updateButton();
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  scene = new THREE.Scene();
  camera = new THREE.Camera();
  material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uResolution: { value: new THREE.Vector2() }, uPointer: { value: pointer } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.0);}`,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uPointer;
      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      void main(){
        vec2 uv=vUv;
        vec2 p=(uv-.5)*vec2(uResolution.x/uResolution.y,1.0);
        p+= (uPointer-.5)*.075;
        float t=uTime*.11;
        vec3 col=vec3(.045,.035,.029);
        // Layered interference sheets: a slow, sculptural silk current.
        for(int i=0;i<4;i++){
          float fi=float(i);
          vec2 q=rot(-.56+fi*.16)*p;
          float bend=.23*sin(q.x*2.9+t+fi*.9)+.12*sin(q.x*5.0-t*.7+fi);
          float y=q.y+bend-.02-fi*.045;
          float envelope=exp(-pow(y*3.2,2.0));
          float threads=pow(.5+.5*sin(y*185.0+sin(q.x*3.2+t)*9.0+fi*2.0),18.0);
          float broad=pow(.5+.5*sin(y*21.0+q.x*1.7+fi*1.7),5.0);
          float shimmer=.65+.35*sin(q.x*4.0-t*1.5+fi);
          vec3 copper=mix(vec3(.65,.21,.065),vec3(1.0,.68,.32),shimmer);
          if(i==2) copper=mix(vec3(.22,.16,.36),vec3(.67,.32,.24),shimmer);
          col+=copper*envelope*(threads*.24+broad*.06);
          float edge=exp(-abs(y+.13)*55.0);
          col+=copper*edge*.22;
        }
        vec2 r=p-vec2(.52,.20);
        float halo=exp(-dot(r,r)*2.1);
        col+=vec3(.095,.043,.021)*halo;
        col*=1.0-.32*length(uv-.5);
        col=pow(col,vec3(.86));
        gl_FragColor=vec4(col,1.0);
      }`
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    material.uniforms.uResolution.value.set(innerWidth, innerHeight);
    renderer.render(scene, camera);
  }
  function frame(now) {
    raf = 0;
    if (document.hidden || paused) { previous = 0; return; }
    if (previous && now - previous < 32) { raf = requestAnimationFrame(frame); return; }
    time += previous ? Math.min((now - previous) / 1000, .1) : 0;
    previous = now;
    pointer.lerp(target, .035);
    material.uniforms.uTime.value = time;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !paused && !document.hidden) raf = requestAnimationFrame(frame); }
  addEventListener('resize', resize, { passive: true });
  addEventListener('pointermove', e => target.set(e.clientX / innerWidth, 1 - e.clientY / innerHeight), { passive: true });
  document.addEventListener('visibilitychange', start);
  button?.addEventListener('click', () => { paused = !paused; previous = 0; updateButton(); start(); });
  addEventListener('keydown', e => {
    if (e.code === 'Space' && e.target === document.body) {
      e.preventDefault(); paused = !paused; previous = 0; updateButton(); start();
    }
  });
  reducedMotion.addEventListener('change', e => { paused = e.matches; previous = 0; updateButton(); start(); });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; canvas.style.opacity = '0'; });
  resize(); start();
} catch (error) {
  // The CSS composition remains complete on devices without WebGL.
  canvas.style.display = 'none';
  if (button) button.hidden = true;
  console.warn('Using the static WIP backdrop.', error);
}
