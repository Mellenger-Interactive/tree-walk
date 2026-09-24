import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MapControls } from 'three/addons/controls/MapControls.js';
import { TREES } from './trees.js';

const MODEL_URL = 'models/map.glb';
const RING_RADIUS = 2.5;                       // matches the gap cut in the tour path
const OVERVIEW_PHI = 0.72;                     // overview tilt from straight down, radians
const BOUNDS = { minX: -265, maxX: 273, minZ: -219, maxZ: 231 };   // ground extent, metres
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.getElementById('stage');
const canvas = document.getElementById('map-canvas');
const labelLayer = document.getElementById('labels');
const loadingEl = document.getElementById('loading');
const loadingFill = document.getElementById('loading-fill');
const hint = document.getElementById('hint');
const list = document.getElementById('chapters');

/* ---------------- Chapters ---------------- */

const chapters = new Map();   // stop -> { li, head, body }

for (const t of TREES) {
  const li = document.createElement('li');
  li.className = 'tw-chapter';
  li.id = `stop-${t.stop}`;

  const observe = t.observe.map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('');
  const fun = t.fun.map(p => `<p>${p}</p>`).join('');
  const link = t.link ? `<p><a href="${t.link.href}" target="_blank" rel="noopener">${t.link.label}</a></p>` : '';
  const prev = TREES.find(x => x.stop === t.stop - 1);
  const next = TREES.find(x => x.stop === t.stop + 1);

  li.innerHTML = `
    <button class="tw-chapter__head" type="button" aria-expanded="false" aria-controls="body-${t.stop}">
      <span class="tw-num" aria-hidden="true">${t.stop}</span>
      <span class="tw-chapter__names">
        <span class="tw-chapter__name"><span class="tw-visually-hidden">Stop ${t.stop}: </span>${t.name}</span>
        <span class="tw-chapter__latin">${t.latin}</span>
      </span>
      <span class="tw-chevron" aria-hidden="true"></span>
    </button>
    <div class="tw-chapter__body" id="body-${t.stop}" hidden>
      <p class="tw-origin"><strong>Origin:</strong> ${t.origin}</p>
      <h3>Features to observe</h3>
      <ul class="tw-observe">${observe}</ul>
      <h3>Fun information</h3>
      ${fun}${link}
      <p class="tw-pause">Take a moment to be present and observe the tree. Is there anything interesting you can see?</p>
      <div class="tw-step">
        ${prev ? `<button type="button" class="tw-btn tw-btn--small" data-go="${prev.stop}">← Stop ${prev.stop}</button>` : ''}
        ${next ? `<button type="button" class="tw-btn tw-btn--small tw-btn--solid" data-go="${next.stop}">Next: stop ${next.stop} →</button>` : ''}
      </div>
    </div>`;

  const head = li.querySelector('.tw-chapter__head');
  const body = li.querySelector('.tw-chapter__body');
  head.addEventListener('click', () => {
    if (li.classList.contains('is-open')) closeAll();
    else select(t.stop, { scroll: true });
  });
  li.querySelectorAll('[data-go]').forEach(b =>
    b.addEventListener('click', () => select(+b.dataset.go, { scroll: true })));

  list.appendChild(li);
  chapters.set(t.stop, { li, head, body });
}

let activeStop = null;

function closeAll() {
  for (const { li, head, body } of chapters.values()) {
    li.classList.remove('is-open');
    head.setAttribute('aria-expanded', 'false');
    body.hidden = true;
  }
  activeStop = null;
  updateLabelState();
  ring.visible = false;
  requestRender();
  history.replaceState(null, '', location.pathname + location.search);
}

function select(stop, { scroll = false, fly = true } = {}) {
  const ch = chapters.get(stop);
  if (!ch) return;
  closeAll();
  activeStop = stop;
  ch.li.classList.add('is-open');
  ch.head.setAttribute('aria-expanded', 'true');
  ch.body.hidden = false;
  history.replaceState(null, '', `#stop-${stop}`);
  if (scroll) ch.li.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  updateLabelState();

  const tree = trees.get(stop);
  if (tree) {
    ring.position.set(tree.base.x, tree.groundY + 0.06, tree.base.z);
    ring.visible = true;
    if (fly) flyToTree(tree);
    requestRender();
  }
}

/* ---------------- Three.js scene ---------------- */

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) {
  loadingEl.querySelector('span').textContent = 'Sorry, this device can’t show the 3D map. The tree guide below still works.';
  throw e;
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const SKY = new THREE.Color('#e8f2f8');
scene.background = SKY;
scene.fog = new THREE.Fog(SKY, 650, 1500);

const camera = new THREE.PerspectiveCamera(40, 1, 1, 3000);

// Lighting matched to the Blender file: world colour at 0.65 strength, 3.2 sun.
const ambient = new THREE.AmbientLight(0xffffff, 0.65 * Math.PI);
ambient.color.setRGB(0.78, 0.84, 0.92);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.color.setRGB(1.0, 0.97, 0.92);
sun.position.set(-0.531, 0.745, -0.403).multiplyScalar(200);
scene.add(sun);

const controls = new MapControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.12;
controls.screenSpacePanning = false;
controls.maxPolarAngle = 1.22;      // never quite horizontal, never under the ground
controls.minDistance = 12;
controls.maxDistance = 1100;
controls.zoomToCursor = true;

// Soft glowing ring that marks the selected tree.
const ring = new THREE.Mesh(
  new THREE.PlaneGeometry(RING_RADIUS * 2, RING_RADIUS * 2).rotateX(-Math.PI / 2),
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color('#f68b1f') } },
    vertexShader: /* glsl */`
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float r = length(vUv - 0.5) * 2.0;
        float band = smoothstep(0.78, 0.86, r) * (1.0 - smoothstep(0.93, 1.0, r));
        float glow = (1.0 - smoothstep(0.2, 0.95, r)) * 0.22;
        float a = max(band * 0.95, glow);
        if (a < 0.01) discard;
        gl_FragColor = vec4(uColor, a);
        #include <colorspace_fragment>
      }`,
  }),
);
ring.visible = false;
ring.renderOrder = 2;
scene.add(ring);

/* ---------------- Render loop (renders only when something changed) ---------------- */

let needsRender = true;
function requestRender() { needsRender = true; }

let flight = null;

function frame(now) {
  requestAnimationFrame(frame);
  if (flight) stepFlight(now);
  const moved = controls.update();
  if (moved || needsRender) {
    renderer.render(scene, camera);
    placeLabels();
    needsRender = false;
  }
}

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  requestRender();
}
new ResizeObserver(resize).observe(stage);
resize();

// Keep the view over the campus.
controls.addEventListener('change', () => {
  const t = controls.target;
  const before = t.clone();
  t.x = THREE.MathUtils.clamp(t.x, BOUNDS.minX, BOUNDS.maxX);
  t.z = THREE.MathUtils.clamp(t.z, BOUNDS.minZ, BOUNDS.maxZ);
  t.y = THREE.MathUtils.clamp(t.y, 0, 40);
  camera.position.add(t.clone().sub(before));
  requestRender();
});
controls.addEventListener('start', () => {
  flight = null;
  hint.classList.add('is-gone');
});

/* ---------------- Camera moves ---------------- */

const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function flyTo(target, radius, phi, theta = null) {
  const from = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  const to = new THREE.Spherical(radius, phi, theta ?? from.theta);
  // shortest way round
  let dTheta = to.theta - from.theta;
  dTheta = Math.atan2(Math.sin(dTheta), Math.cos(dTheta));
  const f = { t0: performance.now(), dur: 1300,
    fromTarget: controls.target.clone(), toTarget: target.clone(),
    from, to, dTheta };
  if (reduceMotion) { applyFlight(f, 1); requestRender(); return; }
  flight = f;
}

function applyFlight(f, k) {
  controls.target.lerpVectors(f.fromTarget, f.toTarget, k);
  const r = Math.exp(THREE.MathUtils.lerp(Math.log(f.from.radius), Math.log(f.to.radius), k));
  const s = new THREE.Spherical(r,
    THREE.MathUtils.lerp(f.from.phi, f.to.phi, k),
    f.from.theta + f.dTheta * k);
  camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));
  camera.lookAt(controls.target);
}

function stepFlight(now) {
  const k = Math.min(1, (now - flight.t0) / flight.dur);
  applyFlight(flight, ease(k));
  if (k >= 1) flight = null;
  requestRender();
}

function flyToTree(tree) {
  const radius = THREE.MathUtils.clamp(tree.height * 2.6, 32, 90);
  flyTo(new THREE.Vector3(tree.base.x, tree.groundY + tree.height * 0.35, tree.base.z), radius, 0.95);
}

let overview = null;   // { target, radius }
function computeOverview() {
  const box = new THREE.Box3();
  for (const t of trees.values()) box.expandByPoint(t.base);
  const center = box.getCenter(new THREE.Vector3());
  // Find the closest distance at which every stop (and its label) fits in view.
  const probe = camera.clone();
  const pts = [...trees.values()].flatMap(t => [t.base, t.top]);
  const fits = r => {
    probe.position.copy(center).add(new THREE.Vector3().setFromSpherical(new THREE.Spherical(r, OVERVIEW_PHI, 0)));
    probe.lookAt(center);
    probe.updateMatrixWorld();
    return pts.every(p => {
      const q = p.clone().project(probe);
      return Math.abs(q.x) < 0.88 && q.y > -0.8 && q.y < 0.8;
    });
  };
  let lo = 50, hi = 2000;
  for (let i = 0; i < 20; i++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
  overview = { target: center, radius: hi };
}
function showOverview(animate = true) {
  computeOverview();
  if (!animate) {
    controls.target.copy(overview.target);
    camera.position.copy(overview.target).add(
      new THREE.Vector3().setFromSpherical(new THREE.Spherical(overview.radius, OVERVIEW_PHI, 0)));
    camera.lookAt(overview.target);
    requestRender();
    return;
  }
  flyTo(overview.target, overview.radius, OVERVIEW_PHI, 0);
}
document.getElementById('btn-overview').addEventListener('click', () => {
  closeAll();
  showOverview();
});

/* ---------------- Labels ---------------- */

const labels = new Map();   // stop -> button

function makeLabels() {
  for (const t of TREES) {
    if (!trees.has(t.stop)) continue;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'tw-label';
    b.setAttribute('aria-label', `Stop ${t.stop}: ${t.name}`);
    b.innerHTML = `<span>${t.stop}</span>`;
    b.addEventListener('click', () => select(t.stop, { scroll: true }));
    labelLayer.appendChild(b);
    labels.set(t.stop, b);
  }
}

function updateLabelState() {
  for (const [stop, b] of labels) b.classList.toggle('is-active', stop === activeStop);
}

const v = new THREE.Vector3();
function placeLabels() {
  const w = stage.clientWidth, h = stage.clientHeight;
  for (const [stop, b] of labels) {
    const tree = trees.get(stop);
    v.copy(tree.top).project(camera);
    const off = v.z > 1 || v.x < -1.1 || v.x > 1.1 || v.y < -1.1 || v.y > 1.2;
    b.hidden = off;
    if (!off) b.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
  }
}

/* ---------------- Tap a tree in the map ---------------- */

const raycaster = new THREE.Raycaster();
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || performance.now() - down.t > 500) return;
  const r = canvas.getBoundingClientRect();
  const p = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(p, camera);
  const hit = raycaster.intersectObjects([...trees.values()].map(t => t.object), true)[0];
  if (!hit) return;
  let o = hit.object;
  while (o && o.userData.tour_stop == null) o = o.parent;
  if (o) select(o.userData.tour_stop, { scroll: true });
});

/* ---------------- Load the model ---------------- */

const trees = new Map();   // stop -> { object, base, top, height, groundY }

new GLTFLoader().load(
  MODEL_URL,
  gltf => {
    const root = gltf.scene;
    scene.add(root);
    root.updateMatrixWorld(true);

    const treeObjects = [];
    root.traverse(o => { if (o.userData.tour_stop != null) treeObjects.push(o); });
    const isTreePart = o => { while (o) { if (o.userData.tour_stop != null) return true; o = o.parent; } return false; };

    const ground = [];
    root.traverse(o => { if (o.isMesh && !isTreePart(o) && !o.name.startsWith('BLD_')) ground.push(o); });

    for (const o of treeObjects) {
      const box = new THREE.Box3().setFromObject(o);
      const base = o.getWorldPosition(new THREE.Vector3());
      raycaster.set(new THREE.Vector3(base.x, 100, base.z), new THREE.Vector3(0, -1, 0));
      const g = raycaster.intersectObjects(ground, false)[0];
      const groundY = g ? g.point.y : 0;
      const height = box.max.y - groundY;
      trees.set(o.userData.tour_stop, {
        object: o, base, groundY, height,
        top: new THREE.Vector3(base.x, box.max.y + 1.5, base.z),
      });
    }

    // Static scene: skip per-frame matrix work.
    root.traverse(o => { o.matrixAutoUpdate = false; });

    makeLabels();
    showOverview(false);
    loadingEl.classList.add('is-done');

    const m = location.hash.match(/^#stop-(\d+)$/);
    if (m) select(+m[1], { scroll: true });
    requestRender();
  },
  xhr => {
    if (xhr.lengthComputable) loadingFill.style.width = `${(xhr.loaded / xhr.total) * 100}%`;
  },
  err => {
    console.error(err);
    loadingEl.querySelector('span').textContent = 'The map couldn’t load. The tree guide below still works.';
  },
);

requestAnimationFrame(frame);
