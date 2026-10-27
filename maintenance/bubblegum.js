import * as THREE from '/_wip/three.module.min.js';
import { stepSpring, kickSpring, bubblePose, deformGum } from '/_wip/gum-physics.js';

const canvas = document.querySelector('#flow');
const motionButton = document.querySelector('#motion');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
let paused = preference.matches;
let raf = 0;
let last = 0;
let elapsed = 0;
function updateMotion() {
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.textContent = paused ? 'Resume background animation' : 'Pause background animation';
}
updateMotion();
try {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 100);
  camera.position.z = 12;

  // Self-contained studio reflections: softbox highlights, no external HDR fetch.
  const studio = document.createElement('canvas');
  studio.width = 1024; studio.height = 512;
  const context = studio.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 0, 512);
  gradient.addColorStop(0, '#fff7ff'); gradient.addColorStop(.5, '#b98cdb'); gradient.addColorStop(1, '#573d75');
  context.fillStyle = gradient; context.fillRect(0, 0, 1024, 512);
  context.filter = 'blur(16px)';
  context.fillStyle = '#ffffff'; context.fillRect(180, 70, 180, 190);
  context.fillStyle = '#ffe6f6'; context.fillRect(720, 100, 100, 230);
  const texture = new THREE.CanvasTexture(studio);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromEquirectangular(texture);
  scene.environment = environment.texture;
  texture.dispose(); pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xfff4ff, 0x8b579b, 2));
  const key = new THREE.DirectionalLight(0xfff5fc, 3.2); key.position.set(-3, 5, 7); scene.add(key);
  const fill = new THREE.PointLight(0xdcc0ff, 40, 20); fill.position.set(4, -1, 4); scene.add(fill);

  const group = new THREE.Group();
  scene.add(group);
  const definitions = [
    [1.0, .45, -.7, 1.55, 0xf4a4d5, .2],
    [2.25, 1.95, -1.5, 1.22, 0xc29aef, 1.7],
    [2.5, -1.55, -.2, 1.38, 0xeab1ee, 3.4],
    [-.05, -1.6, -1.4, .77, 0xd88ed3, 4.6],
    [3.5, .15, -1.7, .8, 0xf5b7d5, 5.5],
    [.15, 2.45, -2, .46, 0xe8b1f4, 2.5]
  ];
  const bubbles = definitions.map(([x, y, z, radius, color, phase]) => {
    const geometry = new THREE.SphereGeometry(radius, 48, 32);
    // Gently irregular gum, rather than perfect rigid billiard balls.
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const px = positions.getX(i), py = positions.getY(i), pz = positions.getZ(i);
      const distortion = 1 + .055 * Math.sin(py * 2.1 + phase) * Math.cos(px * 1.7 + pz);
      positions.setXYZ(i, px * distortion, py * distortion, pz * distortion);
    }
    geometry.computeVertexNormals();
    const material = new THREE.MeshPhysicalMaterial({ color, roughness: .19, metalness: .05, clearcoat: 1, clearcoatRoughness: .1, sheen: .4, sheenColor: new THREE.Color(0xffd4ed), iridescence: .22, iridescenceIOR: 1.3, envMapIntensity: .85 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    group.add(mesh);
    return { mesh, x, y, z, phase, radius,
      basePositions: new Float32Array(positions.array),
      direction: new THREE.Vector2(1, 0),
      targetDirection: new THREE.Vector2(1, 0),
      lastStretch: NaN,
      squash: { x: 0, y: 0, vx: 0, vy: 0 }
    };
  });
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const worldPoint = new THREE.Vector3();
  let pressed = null, activePointer = null, hovered = null;
  let previousPointer = null, lastPoke = 0;
  const meshes = bubbles.map(b => b.mesh);
  const byMesh = new Map(bubbles.map(b => [b.mesh, b]));
  function interactive(event) {
    return !paused && !event.target.closest?.('a,button,input,textarea,select');
  }
  function pick(event) {
    ndc.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(meshes, false)[0];
    return hit ? byMesh.get(hit.object) : null;
  }
  function localPointer(event, bubble) {
    ndc.set(event.clientX / innerWidth * 2 - 1, 1 - event.clientY / innerHeight * 2);
    raycaster.setFromCamera(ndc, camera);
    bubble.mesh.getWorldPosition(worldPoint);
    plane.constant = -worldPoint.z;
    if (!raycaster.ray.intersectPlane(plane, worldPoint)) return null;
    return group.worldToLocal(worldPoint);
  }
  function poke(bubble, event, power = 1) {
    const point = localPointer(event, bubble);
    if (!point) return;
    const dx = point.x - bubble.x;
    const dy = point.y - bubble.y;
    if (Math.hypot(dx, dy) > .1) bubble.targetDirection.set(dx, dy).normalize();
    if (power) kickSpring(bubble.squash, .25 * power, 0);
  }
  function release() {
    pressed = null; activePointer = null; hovered = null;
    document.body.style.cursor = '';
    previousPointer = null;
  }
  function pose(t, dt = 0) {
    for (const bubble of bubbles) {
      const { mesh, squash } = bubble;
      if (dt) {
        stepSpring(squash, dt, pressed === bubble ? .42 : hovered === bubble ? .26 : 0, 0);
      }
      const oldDirection = bubble.direction.clone();
      bubble.direction.lerp(bubble.targetDirection, .18).normalize();
      if (!Number.isFinite(bubble.lastStretch) || Math.abs(squash.x - bubble.lastStretch) > .0002 || oldDirection.distanceToSquared(bubble.direction) > .000001) {
        const positions = mesh.geometry.attributes.position;
        deformGum(bubble.basePositions, positions.array, bubble.direction.x, bubble.direction.y, squash.x, bubble.radius);
        positions.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
        mesh.geometry.computeBoundingSphere();
        bubble.lastStretch = squash.x;
      }
      const pose = bubblePose(t, bubble);
      mesh.position.set(...pose.position);
      mesh.scale.set(...pose.scale);
      mesh.rotation.set(...pose.rotation);
    }
    renderer.render(scene, camera);
  }
  function resize() {
    const aspect = innerWidth / innerHeight;
    camera.left = -3 * aspect; camera.right = 3 * aspect;
    camera.updateProjectionMatrix();
    group.position.x = innerWidth < 700 ? -.2 : aspect * .65;
    group.scale.setScalar(innerWidth < 700 ? .77 : 1);
    renderer.setSize(innerWidth, innerHeight);
    pose(elapsed);
  }
  function frame(now) {
    raf = 0;
    if (paused || document.hidden) { last = 0; return; }
    if (last && now - last < 32) { raf = requestAnimationFrame(frame); return; }
    const dt = last ? Math.min((now - last) / 1000, .05) : 0;
    elapsed += dt;
    last = now;
    pose(elapsed, dt);
    raf = requestAnimationFrame(frame);
  }
  function start() { if (!raf && !paused && !document.hidden) raf = requestAnimationFrame(frame); }
  function toggle() { release(); paused = !paused; last = 0; updateMotion(); start(); }
  motionButton.addEventListener('click', toggle);
  addEventListener('keydown', event => { if (event.code === 'Space' && event.target === document.body) { event.preventDefault(); toggle(); } });
  addEventListener('pointermove', event => {
    if (!interactive(event)) { hovered = null; return; }
    if (pressed && event.pointerId === activePointer) { poke(pressed, event, 0); return; }
    const hit = pick(event);
    const now = performance.now();
    if (hit) poke(hit, event, 0);
    if (hit && (hit !== hovered || now - lastPoke > 220)) {
      const speed = previousPointer ? Math.hypot(event.clientX - previousPointer.x, event.clientY - previousPointer.y) : 0;
      poke(hit, event, Math.min(1.3, .6 + speed / 100));
      lastPoke = now;
    }
    hovered = hit;
    previousPointer = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  addEventListener('pointerdown', event => {
    if (!interactive(event) || !event.isPrimary || event.button !== 0 || pressed) return;
    const hit = pick(event);
    if (!hit) return;
    poke(hit, event, 1.4);
    pressed = hit; activePointer = event.pointerId;
    // Shape-only press: no dragging, pointer capture, or cancelled scrolling.
  }, { passive: true });
  addEventListener('pointerup', event => { if (event.pointerId === activePointer) release(); });
  addEventListener('pointercancel', event => { if (event.pointerId === activePointer) release(); });
  addEventListener('blur', release);
  document.addEventListener('pointerleave', release);
  addEventListener('resize', () => { release(); resize(); }, { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { last = 0; release(); } else start(); });
  preference.addEventListener('change', e => { release(); paused = e.matches; last = 0; updateMotion(); start(); });
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; canvas.hidden = true; });
  resize(); start();
} catch (error) {
  canvas.hidden = true;
  motionButton.hidden = true;
  console.warn('Using the pastel fallback background.', error);
}
