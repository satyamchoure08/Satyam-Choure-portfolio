/* ==========================================================================
   3D world, part 1: renderer, star field, camera path, hero scene, project ring.
   Part 2 (scene2.js) adds About, Skills and Contact.

   The camera flies forward through space as you scroll. Each chapter of the
   page (hero, work, about, skills, contact) sits at its own spot along the way.
   Everything here is a pure function of the scroll position, so scrolling
   backwards plays everything backwards.
   ========================================================================== */
(() => {
  "use strict";
  const T = window.THREE;
  if (!T) return;

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));

  // Where the camera rests in each chapter, and how far it creeps forward inside it.
  const ANCH = [8, -28, -64, -100, -136, -136];
  const DRIFT = [-1.6, 0, -2.2, -1.6, -5.5];
  // How far into a chapter the camera starts flying to the next one (0..1).
  const D0 = [0.55, 0.93, 0.78, 0.78, 1];

  const SDF = "float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r; }";

  const listeners = {};
  const World = {
    modules: [],
    ready: false,
    paused: false,
    mouse: { x: 0, y: 0, sx: 0, sy: 0 },
    P0: 0.035,
    P1: 0.925,
    boost: 0,
    chapters: [],
    v: 0,
    p: [0, 0, 0, 0, 0],
    hover: null,
    uiHover: false,
    intro: 0,
    pulse: 0,
    projectColors: [],
    getPortraitRect: () => null,
    register(m) { this.modules.push(m); },
    on(e, fn) { (listeners[e] = listeners[e] || []).push(fn); },
    emit(e, d) { (listeners[e] || []).forEach((fn) => fn(d)); },
    setChapters(list) { this.chapters = list; }
  };
  window.World = World;

  const ctx = {
    T, clamp, lerp, smooth, damp, SDF, ANCH, DRIFT, D0, world: World,
    scene: null, camera: null, renderer: null,
    t: 0, dt: 0.016, v: 0, p: [0, 0, 0, 0, 0], w: [1, 0, 0, 0, 0],
    dep: [0, 0, 0, 0, 0], arr: [1, 0, 0, 0, 0],
    mouse: World.mouse, mobile: false, warp: 0, camZ: 8, dpr: 1,
    size: { w: 1, h: 1 }, aspect: 1,
    layout: { lookY: 0, narrow: false }
  };
  World.ctx = ctx;

  const texLoader = new T.TextureLoader();
  ctx.loadTexture = (src, fallback) => new Promise((resolve) => {
    const done = (tex) => { tex.anisotropy = 4; resolve(tex); };
    texLoader.load(src, done, undefined, () => {
      if (fallback) texLoader.load(fallback, done, undefined, () => resolve(null));
      else resolve(null);
    });
  });

  /* A glassy "fresnel" material: glows at the edges, used on the floating shapes. */
  ctx.fresnel = (a, b, c) => new T.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 }, uOpacity: { value: 0 },
      uA: { value: new T.Color(a) }, uB: { value: new T.Color(b) }, uC: { value: new T.Color(c) }
    },
    vertexShader: `
      varying vec3 vN; varying vec3 vV;
      void main(){
        vN = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform float uTime; uniform float uOpacity; uniform vec3 uA; uniform vec3 uB; uniform vec3 uC;
      varying vec3 vN; varying vec3 vV;
      void main(){
        float f = pow(1.0 - max(dot(normalize(vN), normalize(vV)), 0.0), 2.0);
        vec3 col = mix(uA, uB, clamp(f + 0.25 * sin(uTime * 0.8 + vN.y * 3.0), 0.0, 1.0));
        col = mix(col, uC, smoothstep(0.72, 1.0, f) * 0.6);
        col = col * (0.35 + f * 1.15) + f * 0.25;
        gl_FragColor = vec4(col, uOpacity * (0.5 + 0.5 * f));
      }`
  });

  let renderer, scene, camera, stars, streaks, raycaster;
  const ndc = new T.Vector2(-5, -5);
  let last = 0, smoothY = 0, prevCamZ = 8, fpsT = 0, fpsN = 0;
  const tints = [[0.6, 0.72, 1], [0.45, 0.85, 1], [0.76, 0.6, 1], [1, 0.58, 0.9], [0.6, 0.68, 1]];

  /* Stars and warp streaks --------------------------------------------------- */
  function buildStars() {
    const count = ctx.mobile ? 4200 : 9000;
    const streakCount = ctx.mobile ? 900 : 2200;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const seed = new Float32Array(count);
    const palette = [[1, 1, 1], [0.62, 0.74, 1], [0.78, 0.62, 1], [0.55, 0.9, 1]];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 96;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 72;
      pos[i * 3 + 2] = 26 - Math.random() * 256;
      const c = palette[(Math.random() * palette.length) | 0];
      col.set(c, i * 3);
      size[i] = 0.6 + Math.random() * 1.9;
      seed[i] = Math.random();
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.BufferAttribute(pos, 3));
    g.setAttribute("aColor", new T.BufferAttribute(col, 3));
    g.setAttribute("aSize", new T.BufferAttribute(size, 1));
    g.setAttribute("aSeed", new T.BufferAttribute(seed, 1));
    stars = new T.Points(g, new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixel: { value: ctx.dpr }, uTint: { value: new T.Color(1, 1, 1) }, uPulse: { value: 0 } },
      vertexShader: `
        attribute vec3 aColor; attribute float aSize; attribute float aSeed;
        uniform float uTime; uniform float uPixel; uniform vec3 uTint; uniform float uPulse;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * 0.21 + aSeed * 40.0) * 0.45;
          p.y += cos(uTime * 0.17 + aSeed * 31.0) * 0.45;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          gl_PointSize = clamp(aSize * uPixel * (48.0 / max(dist, 0.5)) * (1.0 + uPulse * 1.8), 0.0, 26.0);
          float fade = smoothstep(105.0, 22.0, dist) * smoothstep(0.4, 4.0, dist);
          float tw = 0.62 + 0.38 * sin(uTime * 1.4 + aSeed * 60.0);
          vAlpha = fade * tw * (1.0 + uPulse * 0.9);
          vColor = mix(aColor, uTint, 0.38);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, a * a * vAlpha);
        }`
    }));
    stars.frustumCulled = false;
    scene.add(stars);

    const sPos = new Float32Array(streakCount * 6);
    const sCol = new Float32Array(streakCount * 6);
    const sEnd = new Float32Array(streakCount * 2);
    const sSeed = new Float32Array(streakCount * 2);
    for (let i = 0; i < streakCount; i++) {
      for (let k = 0; k < 2; k++) {
        const o = (i * 2 + k);
        sPos[o * 3] = pos[i * 3]; sPos[o * 3 + 1] = pos[i * 3 + 1]; sPos[o * 3 + 2] = pos[i * 3 + 2];
        sCol[o * 3] = col[i * 3]; sCol[o * 3 + 1] = col[i * 3 + 1]; sCol[o * 3 + 2] = col[i * 3 + 2];
        sEnd[o] = k; sSeed[o] = seed[i];
      }
    }
    const sg = new T.BufferGeometry();
    sg.setAttribute("position", new T.BufferAttribute(sPos, 3));
    sg.setAttribute("aColor", new T.BufferAttribute(sCol, 3));
    sg.setAttribute("aEnd", new T.BufferAttribute(sEnd, 1));
    sg.setAttribute("aSeed", new T.BufferAttribute(sSeed, 1));
    streaks = new T.LineSegments(sg, new T.ShaderMaterial({
      transparent: true, depthWrite: false, blending: T.AdditiveBlending,
      uniforms: { uWarp: { value: 0 }, uTint: { value: new T.Color(1, 1, 1) } },
      vertexShader: `
        attribute vec3 aColor; attribute float aEnd; attribute float aSeed;
        uniform float uWarp; uniform vec3 uTint;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          vec3 p = position;
          p.z += aEnd * uWarp * (7.0 + aSeed * 18.0);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          vAlpha = smoothstep(110.0, 14.0, dist) * smoothstep(0.4, 3.0, dist) * (1.0 - aEnd * 0.9) * uWarp;
          vColor = mix(aColor, uTint, 0.4);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vAlpha;
        void main(){ gl_FragColor = vec4(vColor, vAlpha * 0.95); }`
    }));
    streaks.frustumCulled = false;
    streaks.visible = false;
    scene.add(streaks);
  }

  /* Camera path ---------------------------------------------------------------- */
  // Each chapter owns a stretch of scroll. Inside it the camera creeps forward a little,
  // then (from D0 onward) flies on to the next chapter's resting place.
  function camPath() {
    let k = 4;
    for (let i = 0; i < 4; i++) { if (ctx.p[i] < 1) { k = i; break; } }
    const at = ANCH[k] + DRIFT[k] * smooth(0, D0[k], ctx.p[k]);
    return k < 4 ? lerp(at, ANCH[k + 1], ctx.dep[k]) : at;
  }

  function computeProgress(y) {
    const ch = World.chapters;
    if (!ch.length) { ctx.v = 0; return; }
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const c = ch[i];
      const p = c ? clamp((y - c.start) / Math.max(1, c.end - c.start), 0, 1) : 0;
      ctx.p[i] = p;
      World.p[i] = p;
      ctx.dep[i] = i < 4 ? smooth(D0[i], 1, p) : 0;
      if (p > 0) v = i + p;
    }
    ctx.v = v;
    World.v = v;
    for (let i = 0; i < 5; i++) {
      const a = i === 0 ? 1 : smooth(0.3, 0.8, ctx.dep[i - 1]);
      const l = i === 4 ? 0 : smooth(0.5, 0.92, ctx.dep[i]);
      ctx.arr[i] = i === 0 ? 1 : smooth(0.1, 1, ctx.dep[i - 1]);
      ctx.w[i] = a * (1 - l);
    }
  }

  function setHover(hit) {
    const a = World.hover, b = hit;
    const same = (!a && !b) || (a && b && a.module === b.module && a.index === b.index);
    World.hover = b;
    if (b && a && same) { a.uv = b.uv; return; }
    if (!same) World.emit("hover", b);
  }

  function pickAll() {
    raycaster.setFromCamera(ndc, camera);
    for (const m of World.modules) {
      if (!m.pick) continue;
      const h = m.pick(ctx, raycaster);
      if (h) return h;
    }
    return null;
  }

  World.pickAt = (x, y) => {
    ndc.set((x / innerWidth) * 2 - 1, -((y / innerHeight) * 2 - 1));
    return pickAll();
  };
  World.click = (x, y) => {
    const hit = World.pickAt(x, y);
    if (hit) {
      const m = World.modules.find((mod) => mod.name === hit.module);
      if (m && m.click) m.click(ctx, hit);
      World.pulse = 1;
    }
    if (!matchMedia("(hover: hover)").matches) ndc.set(-5, -5);
    return !!hit;
  };

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.size.w = w; ctx.size.h = h; ctx.aspect = w / h;
    renderer.setSize(w, h, true);
    camera.aspect = ctx.aspect;
    camera.updateProjectionMatrix();
    const narrow = w < 900 || ctx.aspect < 1.05;
    const L = ctx.layout;
    L.narrow = narrow;
    L.lookY = 0;
    if (stars) stars.material.uniforms.uPixel.value = ctx.dpr;
    World.modules.forEach((m) => m.resize && m.resize(ctx));
  }
  World.resize = resize;
  World.setDpr = (v) => {
    ctx.dpr = v;
    renderer.setPixelRatio(v);
    renderer.setSize(ctx.size.w, ctx.size.h, false);
    if (stars) stars.material.uniforms.uPixel.value = v;
    World.modules.forEach((m) => m.resize && m.resize(ctx));
  };
  // Visible height / width of the camera view at a given distance.
  ctx.viewH = (d) => 2 * Math.tan((45 * Math.PI) / 360) * d;
  ctx.viewW = (d) => ctx.viewH(d) * ctx.aspect;

  function frame(now) {
    requestAnimationFrame(frame);
    if (World.paused) { last = now; return; }
    const raw = ((now - last) || 16) / 1000;
    const dt = Math.min(World.dtMax || 0.05, raw);
    last = now;
    // Adaptive resolution: soften the picture a little on slow graphics, sharpen it when there is room
    if (World.adaptive && raw < 0.5) {
      fpsT += raw; fpsN++;
      if (fpsT > 1.4) {
        const avg = fpsT / fpsN;
        fpsT = 0; fpsN = 0;
        if (avg > 1 / 36 && ctx.dpr > 0.55) World.setDpr(Math.max(0.55, ctx.dpr * 0.85));
        else if (avg < 1 / 54 && ctx.dpr < ctx.dprMax) World.setDpr(Math.min(ctx.dprMax, ctx.dpr * 1.12));
      }
    }
    ctx.t += dt; ctx.dt = dt;
    const m = World.mouse;
    m.sx = damp(m.sx, m.x, 4, dt);
    m.sy = damp(m.sy, m.y, 4, dt);
    World.pulse = damp(World.pulse, 0, 3, dt);

    const y = window.scrollY;
    smoothY = Math.abs(y - smoothY) < 0.2 ? y : damp(smoothY, y, 9, dt);
    computeProgress(smoothY);

    const v = ctx.v;
    const base = camPath();
    const z = base + (1 - World.intro) * 18;
    const vel = (base - prevCamZ) / Math.max(dt, 0.001);
    prevCamZ = base;
    const warpTarget = Math.max(clamp(Math.abs(vel) / 70, 0, 1), (1 - World.intro) * 1.1, World.boost || 0);
    ctx.warp = damp(ctx.warp, warpTarget, 6, dt);
    ctx.camZ = z;
    camera.position.set(m.sx * 0.5, m.sy * 0.3, z);
    camera.lookAt(m.sx * 0.25, m.sy * 0.12 + ctx.layout.lookY, z - 10);

    // Star colour drifts from chapter to chapter
    const i0 = Math.min(4, Math.floor(v)), i1 = Math.min(4, i0 + 1), f = smooth(0.5, 1, v - i0);
    const tint = stars.material.uniforms.uTint.value;
    tint.setRGB(lerp(tints[i0][0], tints[i1][0], f), lerp(tints[i0][1], tints[i1][1], f), lerp(tints[i0][2], tints[i1][2], f));
    streaks.material.uniforms.uTint.value.copy(tint);
    stars.material.uniforms.uTime.value = ctx.t;
    stars.material.uniforms.uPulse.value = World.pulse;
    streaks.material.uniforms.uWarp.value = ctx.warp;
    streaks.visible = ctx.warp > 0.03;
    World.emit("tick", ctx);

    for (const mod of World.modules) mod.update(ctx);

    if (!World.uiHover && ndc.x > -2) setHover(pickAll()); else setHover(null);

    renderer.render(scene, camera);
  }

  World.init = async function (opts) {
    ctx.mobile = !!opts.mobile;
    renderer = new T.WebGLRenderer({ canvas: opts.canvas, antialias: !ctx.mobile, alpha: true, powerPreference: "high-performance" });
    renderer.setClearColor(0x000000, 0);
    ctx.dprMax = Math.min(window.devicePixelRatio || 1, ctx.mobile ? 1.5 : 2);
    const fixed = /[?&]dpr=([\d.]+)/.exec(location.search);
    World.adaptive = !fixed;
    ctx.dpr = fixed ? clamp(parseFloat(fixed[1]), 0.3, 3) : ctx.dprMax;
    renderer.setPixelRatio(ctx.dpr);
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(45, 1, 0.1, 400);
    ctx.scene = scene; ctx.camera = camera; ctx.renderer = renderer;
    raycaster = new T.Raycaster();
    buildStars();
    for (const mod of World.modules) await mod.build(ctx, opts);
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType === "touch") return;
      World.mouse.x = (e.clientX / innerWidth) * 2 - 1;
      World.mouse.y = -((e.clientY / innerHeight) * 2 - 1);
      ndc.set(World.mouse.x, World.mouse.y);
      World.uiHover = !!(e.target.closest && e.target.closest("a, button, input, textarea, .work3d__info, .skills3d__desc"));
    }, { passive: true });
    document.addEventListener("pointerleave", () => ndc.set(-5, -5));
    smoothY = window.scrollY;
    requestAnimationFrame(frame);
    World.ready = true;
  };

  /* ==========================================================================
     Module: hero. A 3D arch portrait with floating shapes around it.
     ========================================================================== */
  function archGeometry(W, H, c) {
    const w = W / 2, h = H / 2;
    const s = new T.Shape();
    s.moveTo(-w, -h + c);
    s.quadraticCurveTo(-w, -h, -w + c, -h);
    s.lineTo(w - c, -h);
    s.quadraticCurveTo(w, -h, w, -h + c);
    s.lineTo(w, h - w);
    s.absarc(0, h - w, w, 0, Math.PI, false);
    s.lineTo(-w, -h + c);
    const g = new T.ShapeGeometry(s, 48);
    const pa = g.attributes.position, uv = g.attributes.uv;
    for (let i = 0; i < pa.count; i++) uv.setXY(i, (pa.getX(i) + w) / W, (pa.getY(i) + h) / H);
    return g;
  }

  World.register({
    name: "hero",
    async build(ctx, opts) {
      const tex = await ctx.loadTexture(opts.portrait.webp, opts.portrait.jpg);
      const AW = 3.2, AH = 4.0;
      this.group = new T.Group();
      ctx.scene.add(this.group);

      this.archMat = new T.ShaderMaterial({
        transparent: true,
        uniforms: {
          uMap: { value: tex }, uLoaded: { value: tex ? 1 : 0 }, uTime: { value: 0 }, uOpacity: { value: 0 },
          uShine: { value: -1 }, uMouse: { value: new T.Vector2(0.5, 0.5) }
        },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform sampler2D uMap; uniform float uLoaded, uTime, uOpacity, uShine; uniform vec2 uMouse;
          void main(){
            vec3 col = mix(vec3(0.08, 0.08, 0.11), texture2D(uMap, vUv).rgb, uLoaded);
            col *= 0.9 + 0.1 * smoothstep(0.0, 0.5, vUv.y);
            float diag = vUv.x * 0.7 + vUv.y * 0.5;
            float band = exp(-pow((diag - uShine) * 6.0, 2.0));
            col += vec3(0.4, 0.5, 1.0) * band * 0.32;
            float m = exp(-pow(distance(vUv, uMouse) * 3.2, 2.0));
            col += vec3(0.25, 0.3, 0.7) * m * 0.16;
            gl_FragColor = vec4(col, uOpacity);
          }`
      });
      const arch = new T.Mesh(archGeometry(AW, AH, 0.34), this.archMat);
      this.group.add(arch);

      this.frameMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `
          varying vec2 vUv; uniform float uTime, uOpacity;
          void main(){
            float k = clamp(vUv.y * 0.9 + vUv.x * 0.4 + 0.2 * sin(uTime * 0.7 + vUv.x * 4.0), 0.0, 1.0);
            vec3 col = mix(vec3(0.2, 0.42, 1.0), vec3(0.66, 0.36, 1.0), k);
            gl_FragColor = vec4(col, uOpacity * 0.85);
          }`
      });
      const frame = new T.Mesh(archGeometry(AW, AH, 0.34), this.frameMat);
      frame.scale.set(1.065, 1.05, 1);
      frame.position.set(0.04, -0.02, -0.07);
      this.group.add(frame);
      this.frame = frame;

      // floating shapes around the portrait
      this.knotMat = ctx.fresnel(0x2e52ff, 0x9e5bff, 0xffa05a);
      this.knot = new T.Mesh(new T.TorusKnotGeometry(0.6, 0.19, 200, 28, 2, 3), this.knotMat);
      this.knot.position.set(-2.05, -1.55, 1.1);
      this.group.add(this.knot);

      this.wireMat = new T.LineBasicMaterial({ color: 0x8aa2ff, transparent: true, opacity: 0 });
      this.wire = new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(1.05, 1)), this.wireMat);
      this.wire.position.set(1.85, 1.6, -0.6);
      this.group.add(this.wire);

      this.haloMat = new T.MeshBasicMaterial({ color: 0x8aa2ff, transparent: true, opacity: 0, depthWrite: false });
      this.halo = new T.Mesh(new T.TorusGeometry(2.7, 0.012, 8, 220), this.haloMat);
      this.halo.rotation.set(1.15, 0.2, 0);
      this.group.add(this.halo);

      this.orbMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      this.orbs = [0, 1, 2].map(() => {
        const o = new T.Mesh(new T.SphereGeometry(0.075, 12, 12), this.orbMat);
        this.halo.add(o);
        return o;
      });

      this.floatMat = new T.LineBasicMaterial({ color: 0xa28bff, transparent: true, opacity: 0 });
      this.floaters = [];
      const shapes = [new T.OctahedronGeometry(0.28), new T.TetrahedronGeometry(0.3), new T.BoxGeometry(0.34, 0.34, 0.34), new T.IcosahedronGeometry(0.26, 0)];
      for (let i = 0; i < 10; i++) {
        const mesh = new T.LineSegments(new T.EdgesGeometry(shapes[i % shapes.length]), this.floatMat);
        const a = (Math.random() * 2 - 1) * 1.2, r = 3.0 + Math.random() * 2.6;
        mesh.userData = { a, r, y: (Math.random() - 0.5) * 5.2, z: -1.5 + Math.random() * 3, s: 0.6 + Math.random() * 0.9, sp: 0.2 + Math.random() * 0.5 };
        this.group.add(mesh);
        this.floaters.push(mesh);
      }
    },
    update(ctx) {
      const w = ctx.w[0];
      this.group.visible = w > 0.002;
      if (!this.group.visible) return;
      const t = ctx.t, m = ctx.mouse, pr = ctx.p[0], intro = World.intro;
      const vis = w * intro;

      // glue the 3D arch to the empty portrait box in the page layout
      const rect = World.getPortraitRect();
      const dist = Math.max(2, ctx.camZ - 0);
      const visH = 2 * Math.tan((45 * Math.PI) / 360) * dist;
      let wx = 2.6, wy = 0, s = 1;
      if (rect) {
        wx = ((rect.left + rect.width / 2 - ctx.size.w / 2) / ctx.size.h) * visH;
        wy = -((rect.top + rect.height / 2 - ctx.size.h / 2) / ctx.size.h) * visH;
        s = ((rect.height / ctx.size.h) * visH) / 4;
      }
      const g = this.group;
      g.position.set(wx, wy - (1 - intro) * 2.6 + pr * 0.6, pr * 1.8);
      g.scale.setScalar(s * (1 - 0.32 * pr) * (0.86 + 0.14 * intro));
      g.rotation.set(-m.sy * 0.2 + pr * 0.25, m.sx * 0.42 + pr * Math.PI * 0.92 + (1 - intro) * 1.5, m.sx * -0.04);

      const u = this.archMat.uniforms;
      u.uTime.value = t;
      u.uOpacity.value = vis;
      u.uShine.value = -0.5 + ((t * 0.17) % 1) * 2.2;
      u.uMouse.value.set(0.5 + m.sx * 0.35, 0.5 + m.sy * 0.35);
      this.frameMat.uniforms.uTime.value = t;
      this.frameMat.uniforms.uOpacity.value = vis;
      this.knotMat.uniforms.uTime.value = t;
      this.knotMat.uniforms.uOpacity.value = vis;
      this.wireMat.opacity = vis * 0.7;
      this.haloMat.opacity = vis * 0.55;
      this.orbMat.opacity = vis;
      this.floatMat.opacity = vis * 0.6;

      this.knot.rotation.set(t * 0.5 + m.sy * 0.8, t * 0.7 + m.sx * 0.8, 0);
      this.knot.position.set(-2.05 + m.sx * 0.35, -1.55 + Math.sin(t * 0.9) * 0.14 + m.sy * 0.2, 1.1);
      this.wire.rotation.set(t * 0.24, t * 0.33 + pr * 4, 0);
      this.wire.position.y = 1.6 + Math.sin(t * 0.7) * 0.12;
      this.halo.rotation.z = t * 0.18 + pr * 3;
      this.orbs.forEach((o, i) => {
        const a = t * (0.6 + i * 0.17) + i * 2.1;
        o.position.set(Math.cos(a) * 2.7, Math.sin(a) * 2.7, 0);
      });
      this.floaters.forEach((f, i) => {
        const d = f.userData;
        const a = d.a + Math.sin(t * d.sp * 0.6 + i) * 0.4 + pr * 1.4;
        f.position.set(Math.cos(a) * d.r + m.sx * 0.5 * d.s, d.y + Math.sin(t * d.sp + i) * 0.3 + m.sy * 0.4 * d.s, d.z + Math.sin(a) * 1.2);
        f.rotation.set(t * d.sp, t * d.sp * 1.3, 0);
        f.scale.setScalar(d.s);
      });
    }
  });

  /* ==========================================================================
     Module: work. Your projects on a ring of cards you scroll through.
     ========================================================================== */
  const wrapD = (d, n) => ((d + n / 2) % n + n) % n - n / 2;

  World.register({
    name: "work",
    idx: 0,
    active: 0,
    async build(ctx, opts) {
      const items = opts.items;
      this.n = items.length;
      this.group = new T.Group();
      ctx.scene.add(this.group);
      this.cards = [];
      this.loaded = [];
      const geo = new T.PlaneGeometry(3.9, 2.4375);
      items.forEach((it, i) => {
        const mat = new T.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: {
            uMap: { value: null }, uLoaded: { value: 0 }, uOpacity: { value: 0 }, uActive: { value: 0 },
            uHover: { value: 0 }, uTime: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uPar: { value: 0 }
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            varying vec2 vUv; uniform sampler2D uMap; uniform float uLoaded, uOpacity, uActive, uHover, uTime, uPar; uniform vec2 uMouse;
            ${SDF}
            void main(){
              vec2 uv = vUv;
              float d = distance(uv, uMouse);
              float ripple = sin(d * 30.0 - uTime * 5.0) * exp(-d * 5.5) * 0.013 * uHover;
              uv += normalize(uv - uMouse + vec2(0.0001)) * ripple;
              uv = (uv - 0.5) * 0.94 + 0.5 + vec2(0.0, uPar * 0.035);
              vec3 tex = texture2D(uMap, uv).rgb;
              vec3 col = mix(vec3(0.07, 0.07, 0.1), tex, uLoaded);
              col *= mix(0.42, 1.0, uActive) + uHover * 0.08;
              col += vec3(0.25, 0.32, 0.8) * exp(-pow(d * 2.6, 2.0)) * 0.12 * uHover;
              vec2 p = (vUv - 0.5) * vec2(1.6, 1.0);
              float sd = sdBox(p, vec2(0.8, 0.5), 0.07);
              float a = 1.0 - smoothstep(-0.004, 0.004, sd);
              float edge = smoothstep(0.014, 0.0, abs(sd));
              col += vec3(0.45, 0.55, 1.0) * edge * (0.3 + uActive * 0.7);
              gl_FragColor = vec4(col, a * uOpacity);
            }`
        });
        const mesh = new T.Mesh(geo, mat);
        mesh.userData.index = i;
        this.group.add(mesh);
        this.cards.push(mesh);
      });

      // rails and tick marks give the ring a sense of motion
      this.railMat = new T.MeshBasicMaterial({ color: 0x6f8bff, transparent: true, opacity: 0, depthWrite: false });
      const R = Math.max(11, this.n * 0.66);
      this.R = R;
      [-2.5, 2.5].forEach((y) => {
        const rail = new T.Mesh(new T.TorusGeometry(R, 0.012, 6, 240), this.railMat);
        rail.rotation.x = Math.PI / 2;
        rail.position.y = y;
        this.group.add(rail);
      });
      const tickCount = 120;
      this.tickMat = new T.MeshBasicMaterial({ color: 0xa9b8ff, transparent: true, opacity: 0, depthWrite: false });
      this.ticks = new T.InstancedMesh(new T.BoxGeometry(0.025, 0.2, 0.025), this.tickMat, tickCount * 2);
      this.tickCount = tickCount;
      this.group.add(this.ticks);
      this._m = new T.Object3D();

      const avg = (img) => {
        try {
          const c = document.createElement("canvas"); c.width = c.height = 8;
          const g = c.getContext("2d"); g.drawImage(img, 0, 0, 8, 8);
          const d = g.getImageData(0, 0, 8, 8).data; let r = 0, gg = 0, b = 0;
          for (let k = 0; k < d.length; k += 4) { r += d[k]; gg += d[k + 1]; b += d[k + 2]; }
          const n = d.length / 4; r /= n; gg /= n; b /= n;
          const m = Math.max(r, gg, b, 1), k = 215 / m;
          return [Math.round(r * k), Math.round(gg * k), Math.round(b * k)];
        } catch (e) { return [90, 130, 255]; }
      };
      const load = (i) => ctx.loadTexture(items[i].webp, items[i].jpg).then((tex) => {
        if (!tex) return;
        this.cards[i].material.uniforms.uMap.value = tex;
        this.loaded[i] = true;
        World.projectColors[i] = avg(tex.image);
        World.emit("color", i);
      });
      await Promise.all([0, 1, 2].map(load));
      for (let i = 3; i < items.length; i++) load(i);
    },
    // Place the ring so the active card fills a sensible share of the screen.
    resize(ctx) {
      if (!this.R) return;
      const L = ctx.layout, asp = ctx.aspect, R = this.R, slot = World.slot;
      let f = L.narrow ? 0.8 : asp < 1.45 ? 0.46 : 0.42;
      // phones: fit the card (1.6 : 1) into the free band between the heading and the info panel
      if (L.narrow && slot) f = clamp((slot.h * 0.84 * 1.6) / ctx.size.w, 0.5, 0.8);
      const dA = clamp(6.5 / (f * asp), 8.5, 28);
      const H = ctx.viewH(dA), W = ctx.viewW(dA);
      this.pos = {
        x: L.narrow ? 0 : 0.2 * W,
        y: L.narrow ? (slot ? (0.5 - slot.cy / ctx.size.h) * H : 0.2 * H) : 0,
        z: -(dA - 0.82 * R)
      };
    },
    update(ctx) {
      const w = ctx.w[1];
      const vis = w > 0.002;
      this.group.visible = vis;
      if (!vis) return;
      const n = this.n, step = (Math.PI * 2) / n, R = this.R, t = ctx.t, m = ctx.mouse;
      const arr = ctx.arr[1];
      const p = ctx.p[1];
      const target = clamp((p - World.P0) / (World.P1 - World.P0), 0, 1) * (n - 1);
      this.idx = damp(this.idx, target, 5.5, ctx.dt);
      const act = clamp(Math.round(this.idx), 0, n - 1);
      if (act !== this.active) { this.active = act; World.emit("project", act); }

      const P = this.pos || { x: 0, y: 0, z: 0 };
      this.group.position.set(P.x, P.y, ANCH[1] + P.z);
      this.group.scale.setScalar(0.55 + 0.45 * arr);
      this.group.rotation.y = (1 - arr) * 1.4 + m.sx * 0.05;

      const hov = World.hover && World.hover.module === "work" ? World.hover : null;
      for (let i = 0; i < n; i++) {
        const mesh = this.cards[i], u = mesh.material.uniforms;
        const d = wrapD(i - this.idx, n), ad = Math.abs(d);
        const a = d * step;
        const e = 1 - smooth(0, 1.35, ad);
        const rad = R - e * R * 0.18;
        mesh.position.set(Math.sin(a) * rad, Math.sin(i * 1.3 + t * 0.7) * 0.09 + e * m.sy * 0.15, -Math.cos(a) * rad);
        mesh.rotation.set(-m.sy * 0.14 * e, -a + m.sx * 0.2 * e, 0);
        const isHover = hov && hov.index === i;
        mesh.scale.setScalar(1 + e * 0.38 + (isHover ? 0.04 : 0));
        u.uTime.value = t;
        u.uActive.value = e;
        u.uOpacity.value = w * lerp(0.22, 1, e) * (ad < 5.5 ? 1 : 0);
        u.uLoaded.value = damp(u.uLoaded.value, this.loaded[i] ? 1 : 0, 4, ctx.dt);
        u.uHover.value = damp(u.uHover.value, isHover ? 1 : 0, 8, ctx.dt);
        u.uPar.value = clamp(d * 0.6, -1, 1);
        if (isHover && hov.uv) u.uMouse.value.copy(hov.uv);
      }
      this.railMat.opacity = w * 0.3;
      this.tickMat.opacity = w * 0.55;
      const mat = this._m, per = this.tickCount, off = (this.idx * step);
      for (let k = 0; k < per; k++) {
        const a = (k / per) * Math.PI * 2 - off * 1.0;
        for (let s = 0; s < 2; s++) {
          mat.position.set(Math.sin(a) * R, s ? 2.5 : -2.5, -Math.cos(a) * R);
          mat.rotation.set(0, 0, 0);
          mat.scale.set(1, k % 5 === 0 ? 1.6 : 0.7, 1);
          mat.updateMatrix();
          this.ticks.setMatrixAt(k * 2 + s, mat.matrix);
        }
      }
      this.ticks.instanceMatrix.needsUpdate = true;
    },
    pick(ctx, raycaster) {
      if (ctx.w[1] < 0.6) return null;
      const hits = raycaster.intersectObjects(this.cards, false);
      for (const h of hits) {
        const i = h.object.userData.index;
        const ad = Math.abs(wrapD(i - this.idx, this.n));
        if (ad < 1.7) return { module: "work", index: i, uv: h.uv, active: ad < 0.55 };
      }
      return null;
    },
    click(ctx, hit) { World.emit(hit.active ? "open" : "goto", hit.index); }
  });
})();
