/* Real-time 3D heroes for the sample sites (three.js). Each scene is drag-to-spin, follows the pointer / phone tilt, and pauses off-screen. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const loader = new THREE.TextureLoader();
loader.setCrossOrigin('anonymous');
const tex = url => { const t = loader.load(url); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const v3 = hex => { const n = parseInt(hex.replace('#', ''), 16); return new THREE.Vector3((n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255); };

function stage(canvas, { z = 8, fov = 35, env = false, exposure = 1 } = {}) {
  const host = canvas.closest('[data-stage]') || canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(fov, 1, 0.1, 100);
  camera.position.z = z;
  if (env) { const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; pm.dispose(); }

  const st = { px: 0, py: 0, tx: 0, ty: 0, spin: 0, vel: 0, scroll: scrollY, down: false, lx: 0, w: 1, h: 1, narrow: false };
  let fit = null;
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
    st.w = w; st.h = h; st.narrow = w / h < 0.85;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (fit) fit(w, h, st);
  }
  new ResizeObserver(resize).observe(canvas);

  canvas.addEventListener('pointerdown', e => { st.down = true; st.lx = e.clientX; });
  addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    if (e.pointerType !== 'touch') { st.tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)); st.ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2)); }
    if (st.down) { const dx = e.clientX - st.lx; st.lx = e.clientX; st.vel = dx * 0.012; }
  }, { passive: true });
  addEventListener('pointerup', () => (st.down = false));
  addEventListener('pointercancel', () => (st.down = false));
  addEventListener('scroll', () => (st.scroll = scrollY), { passive: true });
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    st.tx = Math.max(-1, Math.min(1, e.gamma / 25));
    st.ty = Math.max(-1, Math.min(1, (e.beta - 50) / 25));
  }, { passive: true });

  let vis = true, raf = 0, tick = () => {};
  const clock = new THREE.Clock();
  function run() {
    cancelAnimationFrame(raf); clock.getDelta();
    const step = () => {
      if (!vis || document.hidden) return;
      const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
      st.px += (st.tx - st.px) * 0.05; st.py += (st.ty - st.py) * 0.05;
      st.spin += st.vel; st.vel *= 0.94;
      tick(dt, t, st);
      renderer.render(scene, camera);
      if (!reduce) raf = requestAnimationFrame(step);
    };
    step();
  }
  new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) run(); }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
  return {
    renderer, scene, camera, st,
    onFit(f) { fit = f; resize(); },
    start(f) { tick = f; resize(); run(); host.classList.add('ready'); },
  };
}
const lights = (scene, warm = 0xffffff) => {
  scene.add(new THREE.AmbientLight(0xffffff, 0.45));
  const d = new THREE.DirectionalLight(warm, 1.8); d.position.set(3, 5, 4); scene.add(d);
  const r = new THREE.DirectionalLight(0xffffff, 0.6); r.position.set(-4, -2, 3); scene.add(r);
};
const softShadow = (opacity = 0.35) => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, `rgba(0,0,0,${opacity})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; return m;
};

/* ---------- Shop: floating grocery boxes wrapped in photos ---------- */
export function boxes(canvas, { images, colors }) {
  const s = stage(canvas, { z: 10, env: true });
  lights(s.scene);
  const geo = new RoundedBoxGeometry(1.7, 1.7, 1.7, 5, 0.24);
  const group = new THREE.Group(); s.scene.add(group);
  const spots = [[-2.5, 1.9, 0], [2.6, 2.3, -1.2], [-2.7, -1.6, -0.6], [2.4, -1.5, 0.6], [0.2, 3.6, -3], [-0.2, -3.7, -2.4]];
  const items = images.map((url, i) => {
    const face = new THREE.MeshStandardMaterial({ map: tex(url), roughness: 0.45, metalness: 0.05 });
    const side = new THREE.MeshPhysicalMaterial({ color: colors[i % colors.length], roughness: 0.25, clearcoat: 1 });
    const m = new THREE.Mesh(geo, [face, face, side, side, face, face]);
    const [x, y, z] = spots[i % spots.length];
    m.position.set(x, y, z);
    m.rotation.set(i * 1.3, i * 0.7, i * 0.4);
    m.scale.setScalar(0.8 + (i % 3) * 0.14);
    m.userData = { y, sp: 0.18 + (i % 4) * 0.08, ph: i * 1.7 };
    group.add(m); return m;
  });
  s.onFit((w, h, st) => group.scale.setScalar(st.narrow ? 0.74 : 1));
  s.start((dt, t, st) => {
    items.forEach(m => {
      const u = m.userData;
      m.position.y = u.y + Math.sin(t * 0.8 + u.ph) * 0.28;
      m.rotation.x += dt * u.sp + st.vel * 0.4;
      m.rotation.y += dt * u.sp * 0.8 + st.vel;
    });
    group.rotation.y = st.px * 0.3 + st.spin * 0.25;
    group.rotation.x = st.py * 0.18 + Math.min(st.scroll, 900) * 0.0007;
  });
}

/* ---------- Gym: chrome + rubber hex dumbbell ---------- */
export function dumbbell(canvas, { color = '#1f48ff' } = {}) {
  const s = stage(canvas, { z: 9, env: true, exposure: 1.05 });
  lights(s.scene);
  const g = new THREE.Group(); s.scene.add(g);
  const chrome = new THREE.MeshStandardMaterial({ color: '#e6e9ee', metalness: 1, roughness: 0.16 });
  const rubber = new THREE.MeshPhysicalMaterial({ color, metalness: 0.05, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.25 });
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 2.4, 48), chrome);
  handle.rotation.z = Math.PI / 2; g.add(handle);
  for (let i = -5; i <= 5; i++) {
    const r = new THREE.Mesh(new THREE.TorusGeometry(0.172, 0.012, 8, 40), chrome);
    r.rotation.y = Math.PI / 2; r.position.x = i * 0.1; g.add(r);
  }
  [-1, 1].forEach(sd => {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.92, 6), rubber);
    head.rotation.z = Math.PI / 2; head.position.x = sd * 1.62; g.add(head);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.94, 48), chrome);
    cap.rotation.z = Math.PI / 2; cap.position.x = sd * 1.62; g.add(cap);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.18, 32), chrome);
    collar.rotation.z = Math.PI / 2; collar.position.x = sd * 1.08; g.add(collar);
  });
  const sh = softShadow(0.45); sh.scale.set(5.5, 1.6, 1); sh.position.y = -2.1; s.scene.add(sh);
  s.onFit((w, h, st) => { const k = st.narrow ? 0.62 : 1; g.scale.setScalar(k); sh.scale.set(5.5 * k, 1.6 * k, 1); });
  s.start((dt, t, st) => {
    g.rotation.y = t * 0.45 + st.spin + st.px * 0.5;
    g.rotation.x = 0.35 + st.py * 0.25 + Math.sin(t * 0.7) * 0.08;
    g.rotation.z = -0.28 + Math.min(st.scroll, 1200) * 0.0012;
    g.position.y = Math.sin(t * 1.1) * 0.18;
    sh.material.opacity = 0.8 - g.position.y * 0.6;
  });
}

/* ---------- Restaurant: brass thali plate with real food photo + steam ---------- */
export function thali(canvas, { image }) {
  const s = stage(canvas, { z: 8.5, env: true });
  lights(s.scene, 0xfff1d6);
  const brass = new THREE.MeshStandardMaterial({ color: '#cfa64e', metalness: 1, roughness: 0.26 });
  const tilt = new THREE.Group(); s.scene.add(tilt);
  const spin = new THREE.Group(); tilt.add(spin);
  spin.add(new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.02, 0.16, 128), brass));
  const rim = new THREE.Mesh(new THREE.TorusGeometry(2.28, 0.075, 16, 128), brass);
  rim.rotation.x = Math.PI / 2; rim.position.y = 0.09; spin.add(rim);
  const food = new THREE.Mesh(new THREE.CircleGeometry(2.14, 128), new THREE.MeshStandardMaterial({ map: tex(image), roughness: 0.75 }));
  food.rotation.x = -Math.PI / 2; food.position.y = 0.083; spin.add(food);
  // steam
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,.6)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const smap = new THREE.CanvasTexture(c);
  const puffs = Array.from({ length: 16 }, (_, i) => {
    const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smap, transparent: true, depthWrite: false, opacity: 0 }));
    m.userData = { o: i / 16, x: (Math.random() - 0.5) * 2.4, z: (Math.random() - 0.5) * 1.2 };
    s.scene.add(m); return m;
  });
  let k = 1;
  s.onFit((w, h, st) => { k = st.narrow ? 0.72 : 1; tilt.scale.setScalar(k); });
  s.start((dt, t, st) => {
    tilt.rotation.x = 0.9 + st.py * 0.15 - Math.min(st.scroll, 700) * 0.0007;
    tilt.rotation.z = st.px * -0.12;
    spin.rotation.y = t * 0.12 + st.spin;
    tilt.position.y = Math.sin(t * 0.9) * 0.08 - 0.2;
    puffs.forEach(p => {
      const l = (t * 0.16 + p.userData.o) % 1;
      p.position.set(p.userData.x * k + Math.sin(t + p.userData.o * 9) * 0.15, (0.1 + l * 2.8) * k, p.userData.z + 1);
      p.scale.setScalar((0.7 + l * 1.6) * k);
      p.material.opacity = Math.sin(l * Math.PI) * 0.32;
    });
  });
}

/* ---------- Salon: spinning barber pole with glass + brass ---------- */
export function pole(canvas, { stripes = ['#e23b3f', '#ffffff', '#2b5ad6', '#ffffff'] } = {}) {
  const s = stage(canvas, { z: 9.5, env: true });
  lights(s.scene);
  const c = document.createElement('canvas'); c.width = c.height = 384; const x = c.getContext('2d');
  const bw = 48;
  for (let k = -384, i = 0; k < 768; k += bw, i++) {
    x.fillStyle = stripes[i % stripes.length];
    x.beginPath(); x.moveTo(k, 0); x.lineTo(k + bw, 0); x.lineTo(k + bw + 384, 384); x.lineTo(k + 384, 384); x.closePath(); x.fill();
  }
  const stripeTex = new THREE.CanvasTexture(c); stripeTex.colorSpace = THREE.SRGBColorSpace;
  stripeTex.wrapS = stripeTex.wrapT = THREE.RepeatWrapping; stripeTex.repeat.set(1, 1.3);
  const g = new THREE.Group(); s.scene.add(g);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 3.2, 64, 1, true), new THREE.MeshStandardMaterial({ map: stripeTex, roughness: 0.35 })));
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.56, 3.2, 64, 1, true), new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: 0.22, roughness: 0.04, clearcoat: 1, side: THREE.DoubleSide }));
  g.add(glass);
  const brass = new THREE.MeshStandardMaterial({ color: '#cda45e', metalness: 1, roughness: 0.22 });
  const ring = (y, r, hgt) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, hgt, 48), brass); m.position.y = y; g.add(m); };
  ring(1.68, 0.66, 0.18); ring(1.86, 0.5, 0.2); ring(-1.68, 0.66, 0.18); ring(-1.86, 0.5, 0.2);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), brass); dome.position.y = 1.96; g.add(dome);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.16, 32, 16), brass); knob.position.y = 2.55; g.add(knob);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 48), brass); tip.rotation.x = Math.PI; tip.position.y = -2.26; g.add(tip);
  s.onFit((w, h, st) => g.scale.setScalar(st.narrow ? 0.82 : 1));
  s.start((dt, t, st) => {
    stripeTex.offset.y -= dt * (0.28 + Math.abs(st.vel) * 4);
    g.rotation.y = st.spin + st.px * 0.4;
    g.rotation.z = -0.12 + st.px * -0.06;
    g.rotation.x = st.py * 0.12;
    g.position.y = Math.sin(t * 0.8) * 0.08;
  });
}

/* ---------- Clinic + parlour: living blob (heartbeat or pearl shimmer) ---------- */
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+10.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 105.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;
const BLOB_VS = NOISE + `
uniform float uTime; uniform float uAmp; uniform float uFreq; uniform float uBeat;
varying vec3 vN; varying vec3 vV; varying float vD;
vec3 orth(vec3 v){return normalize(abs(v.x)>abs(v.z)?vec3(-v.y,v.x,0.0):vec3(0.0,-v.z,v.y));}
float field(vec3 p){return snoise(p*uFreq+vec3(0.0,uTime*0.22,uTime*0.14))*uAmp+snoise(p*uFreq*2.2-uTime*0.18)*uAmp*0.3;}
void main(){
  vec3 n=normalize(normal); vec3 t=orth(n); vec3 b=normalize(cross(n,t)); float e=0.015;
  vec3 p0=position+n*field(position);
  vec3 q1=position+t*e; vec3 p1=q1+n*field(q1);
  vec3 q2=position+b*e; vec3 p2=q2+n*field(q2);
  vec3 nn=normalize(cross(p1-p0,p2-p0)); if(dot(nn,n)<0.0) nn=-nn;
  vD=field(position)/max(uAmp,0.0001);
  p0*=1.0+uBeat;
  vec4 mv=modelViewMatrix*vec4(p0,1.0);
  vV=normalize(-mv.xyz); vN=normalize(normalMatrix*nn);
  gl_Position=projectionMatrix*mv;
}`;
const BLOB_FS = `
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform float uMode;
varying vec3 vN; varying vec3 vV; varying float vD;
void main(){
  vec3 n=normalize(vN); vec3 v=normalize(vV);
  float fr=pow(1.0-max(dot(n,v),0.0),2.0);
  vec3 col=mix(uA,uB,smoothstep(-0.9,0.9,vD));
  if(uMode>0.5){ vec3 iri=0.5+0.5*cos(6.28318*(vec3(0.0,0.33,0.67)+fr*1.3+vD*0.22)); col=mix(col,iri,0.45*fr+0.12); }
  col=mix(col,uC,fr*0.8);
  vec3 L=normalize(vec3(0.5,0.9,0.7)); vec3 H=normalize(L+v);
  float spec=pow(max(dot(n,H),0.0),70.0);
  col=col*(0.7+0.3*max(dot(n,L),0.0))+spec*0.6;
  gl_FragColor=vec4(col,1.0);
}`;
export function blob(canvas, { colors = ['#0f766e', '#67e8f9', '#ffffff'], pearl = false, heartbeat = false, amp = 0.28, freq = 0.9, orbit = 0 } = {}) {
  const s = stage(canvas, { z: 7.5, env: orbit > 0 });
  const uni = { uTime: { value: 0 }, uAmp: { value: amp }, uFreq: { value: freq }, uBeat: { value: 0 }, uA: { value: v3(colors[0]) }, uB: { value: v3(colors[1]) }, uC: { value: v3(colors[2]) }, uMode: { value: pearl ? 1 : 0 } };
  const mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.55, 28), new THREE.ShaderMaterial({ uniforms: uni, vertexShader: BLOB_VS, fragmentShader: BLOB_FS }));
  s.scene.add(mesh);
  const pearls = [];
  if (orbit) {
    lights(s.scene);
    const mat = new THREE.MeshPhysicalMaterial({ color: '#fff3ee', roughness: 0.12, iridescence: 1, iridescenceIOR: 1.35, clearcoat: 1 });
    for (let i = 0; i < orbit; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.13 + (i % 3) * 0.06, 32, 16), mat); p.userData = { r: 2.2 + (i % 3) * 0.35, sp: 0.35 + i * 0.07, ph: i * 2.1, tilt: (i - orbit / 2) * 0.25 }; s.scene.add(p); pearls.push(p); }
  }
  const beat = t => { const p = t % 1.05; return Math.exp(-Math.pow((p - 0.08) / 0.045, 2)) * 0.07 + Math.exp(-Math.pow((p - 0.28) / 0.06, 2)) * 0.045; };
  s.onFit((w, h, st) => { const k = st.narrow ? 0.8 : 1; mesh.scale.setScalar(k); pearls.forEach(p => (p.userData.k = k)); });
  s.start((dt, t, st) => {
    uni.uTime.value = t + Math.min(st.scroll, 2000) * 0.002;
    uni.uBeat.value = heartbeat ? beat(t) : 0;
    uni.uAmp.value = amp + Math.min(Math.abs(st.vel) * 2, 0.25);
    mesh.rotation.y = t * 0.15 + st.spin + st.px * 0.4;
    mesh.rotation.x = st.py * 0.3;
    pearls.forEach(p => {
      const u = p.userData, a = t * u.sp + u.ph + st.spin * 0.5, k = u.k || 1;
      p.position.set(Math.cos(a) * u.r * k, Math.sin(a * 1.3) * 0.6 * k + u.tilt, Math.sin(a) * u.r * k * 0.6);
    });
  });
}

/* ---------- Hotel: curved room photos floating in a slow ring ---------- */
export function ring(canvas, { images, fog = '#121631', glow = '#ffb547' }) {
  const s = stage(canvas, { z: 10.5, fov: 40 });
  s.scene.fog = new THREE.Fog(fog, 7.5, 16.5);
  const R = 4.6, W = 2.7, H = 1.8, N = images.length;
  const g = new THREE.Group(); s.scene.add(g);
  images.forEach((url, i) => {
    const geo = new THREE.PlaneGeometry(W, H, 24, 1);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) { const a = pos.getX(k) / R; pos.setX(k, Math.sin(a) * R); pos.setZ(k, Math.cos(a) * R - R); }
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex(url), side: THREE.DoubleSide, fog: true }));
    m.position.z = R;
    const pivot = new THREE.Group(); pivot.rotation.y = (i / N) * Math.PI * 2; pivot.position.y = (i % 2 ? 0.35 : -0.35);
    pivot.add(m); g.add(pivot);
  });
  // warm window lights drifting behind
  const n = 360, pts = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pts[i * 3] = (Math.random() - 0.5) * 26; pts[i * 3 + 1] = (Math.random() - 0.5) * 14; pts[i * 3 + 2] = -4 - Math.random() * 10; }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  const dots = new THREE.Points(pg, new THREE.PointsMaterial({ color: glow, size: 0.07, transparent: true, opacity: 0.8, fog: false }));
  s.scene.add(dots);
  s.onFit((w, h, st) => { s.camera.position.z = st.narrow ? 14 : 10.5; });
  s.start((dt, t, st) => {
    g.rotation.y = t * 0.09 + st.spin * 0.7 + st.px * 0.2;
    g.rotation.x = 0.1 + st.py * 0.06;
    s.camera.position.y = -Math.min(st.scroll, 800) * 0.0015;
    dots.rotation.y = st.px * 0.05; dots.position.x = Math.sin(t * 0.05) * 0.6;
  });
}

/* auto-start: <canvas class="scene" data-scene="boxes" data-opts='{"...":...}'> */
document.querySelectorAll('canvas[data-scene]').forEach(cv => {
  const fn = { boxes, dumbbell, thali, pole, blob, ring }[cv.dataset.scene];
  try { fn && fn(cv, JSON.parse(cv.dataset.opts || '{}')); }
  catch (e) { (cv.closest('[data-stage]') || cv.parentElement).classList.add('no-3d'); console.warn('3D off:', e); }
});
