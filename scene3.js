/* ==========================================================================
   3D world, part 3: nebula clouds, the Contact tunnel, spark bursts.
   Needs scene.js (window.World) and THREE.
   ========================================================================== */
(() => {
  "use strict";
  const T = window.THREE, World = window.World;
  if (!T || !World) return;
  const { clamp, lerp, smooth, damp, ANCH } = World.ctx;

  /* ------------------------------------------------------------------------
     Nebula: big soft clouds spread along the flight path, tinted per chapter.
     ------------------------------------------------------------------------ */
  World.register({
    name: "nebula",
    async build(ctx) {
      this.group = new T.Group();
      ctx.scene.add(this.group);
      const spots = [
        [4, 2, -4, 0x2a46ff, 0x7a4bff], [-6, -2, -34, 0x1d8cff, 0x6c3bff], [5, 3, -62, 0x7a3bff, 0xff4fa8],
        [-5, -2, -92, 0x00a8ff, 0x3b4bff], [4, 1, -118, 0xb23bff, 0x2b6bff], [-4, 0, -150, 0x3b6bff, 0xff6fb0]
      ];
      this.clouds = spots.map((s, i) => {
        const mat = new T.ShaderMaterial({
          transparent: true, depthWrite: false, blending: T.AdditiveBlending,
          uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uA: { value: new T.Color(s[3]) }, uB: { value: new T.Color(s[4]) }, uSeed: { value: i * 7.3 } },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            varying vec2 vUv; uniform float uTime, uOpacity, uSeed; uniform vec3 uA, uB;
            float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
            float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
              return mix(mix(h(i), h(i + vec2(1.0, 0.0)), f.x), mix(h(i + vec2(0.0, 1.0)), h(i + vec2(1.0, 1.0)), f.x), f.y); }
            float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 3; i++) { v += a * n(p); p = p * 2.03 + 7.1; a *= 0.5; } return v; }
            void main(){
              vec2 uv = vUv - 0.5;
              float d = length(uv * vec2(1.0, 1.55));
              float f = fbm(uv * 3.2 + uSeed + vec2(uTime * 0.018, -uTime * 0.012));
              float f2 = n(uv * 7.0 - uSeed + vec2(-uTime * 0.026, uTime * 0.01)) * 0.75 + 0.12;
              float m = smoothstep(0.62, 0.0, d) * (f * 0.95 + f2 * 0.55 - 0.42);
              gl_FragColor = vec4(mix(uA, uB, f2), clamp(m, 0.0, 1.0) * uOpacity);
            }`
        });
        const mesh = new T.Mesh(new T.PlaneGeometry(78, 50), mat);
        mesh.position.set(s[0], s[1], s[2] - 24);
        mesh.rotation.z = (i - 2) * 0.35;
        this.group.add(mesh);
        return mesh;
      });
    },
    update(ctx) {
      const cz = ctx.camZ;
      this.clouds.forEach((c, i) => {
        const dist = cz - c.position.z;
        const vis = smooth(10, 24, dist) * (1 - smooth(46, 70, dist));
        c.visible = vis > 0.01 && !World.lite;
        if (!c.visible) return;
        c.material.uniforms.uTime.value = ctx.t;
        c.material.uniforms.uOpacity.value = vis * 0.5;
        c.rotation.z += ctx.dt * 0.004 * (i % 2 ? 1 : -1);
      });
    }
  });

  /* ------------------------------------------------------------------------
     Contact: a tunnel of glowing rings that pulse toward a bright portal.
     ------------------------------------------------------------------------ */
  World.register({
    name: "contact",
    async build(ctx) {
      this.group = new T.Group();
      ctx.scene.add(this.group);
      const N = 20, seg = 96;
      this.N = N;
      this.rings = [];
      const c1 = new T.Color(0x4c7dff), c2 = new T.Color(0xb86bff), c3 = new T.Color(0xff6fb0);
      for (let i = 0; i < N; i++) {
        const sides = i % 3 === 0 ? 6 : seg;
        const pts = [];
        for (let k = 0; k < sides; k++) { const a = (k / sides) * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a), Math.sin(a), 0)); }
        const color = c1.clone().lerp(c2, i / (N * 0.7)).lerp(c3, Math.max(0, (i - N * 0.7) / (N * 0.3)));
        const mat = new T.LineBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false });
        const ring = new T.LineLoop(new T.BufferGeometry().setFromPoints(pts), mat);
        ring.position.z = -i * 3.4;
        ring.userData = { i, base: 3.2 + (i % 3 === 0 ? 0.5 : 0), sp: (0.05 + (i % 5) * 0.03) * (i % 2 ? 1 : -1) };
        this.group.add(ring);
        this.rings.push(ring);
      }
      // dust streaming through the tunnel
      const count = ctx.mobile ? 500 : 1100, pos = new Float32Array(count * 3), seed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, r = 1.2 + Math.random() * 3.6;
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r; pos[i * 3 + 2] = -Math.random() * N * 3.4;
        seed[i] = Math.random();
      }
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(pos, 3));
      g.setAttribute("aSeed", new T.BufferAttribute(seed, 1));
      this.dustMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uLen: { value: N * 3.4 }, uPixel: { value: ctx.dpr } },
        vertexShader: `
          attribute float aSeed; uniform float uTime, uLen, uPixel; varying float vA;
          void main(){
            vec3 p = position;
            p.z = mod(p.z + uTime * (3.0 + aSeed * 5.0), uLen) - uLen + 4.0;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = clamp((1.0 + aSeed * 2.0) * uPixel * (26.0 / -mv.z), 1.0, 10.0);
            vA = smoothstep(uLen * 0.95, 8.0, -p.z) * (0.4 + 0.6 * aSeed);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `uniform float uOpacity; varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.7, 0.75, 1.0, smoothstep(0.5, 0.0, d) * vA * uOpacity); }`
      });
      this.dust = new T.Points(g, this.dustMat);
      this.dust.frustumCulled = false;
      this.group.add(this.dust);

      // the portal at the end
      this.coreMat = ctx.fresnel(0x4c7dff, 0xff6fb0, 0xffffff);
      this.core = new T.Mesh(new T.IcosahedronGeometry(1.4, 3), this.coreMat);
      this.core.position.z = -N * 3.4 - 2;
      this.group.add(this.core);
      this.haloMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uOpacity: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform float uOpacity;
          void main(){ float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(0.55, 0.5, 1.0, pow(max(1.0 - d, 0.0), 2.0) * 0.8 * uOpacity); }`
      });
      this.halo = new T.Mesh(new T.PlaneGeometry(16, 16), this.haloMat);
      this.halo.position.z = -N * 3.4 - 2.4;
      this.group.add(this.halo);
    },
    resize(ctx) { this.dustMat.uniforms.uPixel.value = ctx.dpr; },
    update(ctx) {
      const w = ctx.w[4], g = this.group;
      g.visible = w > 0.002;
      if (!g.visible) return;
      const t = ctx.t, p = ctx.p[4], arr = ctx.arr[4], m = ctx.mouse;
      const camZ = ANCH[4] + World.ctx.DRIFT[4] * smooth(0, 1, p);
      g.position.set(m.sx * -0.6, m.sy * -0.4, camZ - 6);
      g.rotation.z = (1 - arr) * 0.9 + p * 0.5;
      this.rings.forEach((r, k) => {
        const d = r.userData;
        const wave = 1 + 0.09 * Math.sin(t * 1.6 - k * 0.55) + World.pulse * 0.18 * Math.exp(-k * 0.12);
        r.scale.setScalar(d.base * wave * (0.65 + 0.35 * arr));
        r.rotation.z += ctx.dt * d.sp * 2.2;
        const fade = Math.pow(1 - k / this.N, 0.7);
        r.material.opacity = w * (0.2 + 0.8 * fade) * (k < 2 ? smooth(0, 1, p * 3) : 1) * 0.9;
      });
      this.dustMat.uniforms.uTime.value = t;
      this.dustMat.uniforms.uOpacity.value = w;
      this.dust.visible = !World.lite;
      this.coreMat.uniforms.uTime.value = t;
      this.coreMat.uniforms.uOpacity.value = w;
      this.core.rotation.set(t * 0.4, t * 0.6, 0);
      this.core.scale.setScalar(1 + 0.12 * Math.sin(t * 2) + World.pulse * 0.4 + p * 0.8);
      this.haloMat.uniforms.uOpacity.value = w * (0.75 + 0.25 * Math.sin(t * 1.3));
    }
  });

  /* ------------------------------------------------------------------------
     Sparks: confetti when you copy the email, a glittering trail behind the mouse.
     ------------------------------------------------------------------------ */
  World.register({
    name: "sparks",
    async build(ctx) {
      const N = ctx.mobile ? 260 : 520;
      this.N = N;
      this.pos = new Float32Array(N * 3); this.vel = new Float32Array(N * 3);
      this.col = new Float32Array(N * 3); this.life = new Float32Array(N);
      this.size = new Float32Array(N); this.age = new Float32Array(N).fill(1e9); this.ttl = new Float32Array(N).fill(1);
      this.grav = new Float32Array(N);
      this.next = 0;
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.BufferAttribute(this.pos, 3).setUsage(T.DynamicDrawUsage));
      g.setAttribute("aColor", new T.BufferAttribute(this.col, 3).setUsage(T.DynamicDrawUsage));
      g.setAttribute("aLife", new T.BufferAttribute(this.life, 1).setUsage(T.DynamicDrawUsage));
      g.setAttribute("aSize", new T.BufferAttribute(this.size, 1));
      this.mat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uPixel: { value: ctx.dpr } },
        vertexShader: `
          attribute vec3 aColor; attribute float aLife; attribute float aSize; uniform float uPixel;
          varying vec3 vC; varying float vL;
          void main(){
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = clamp(aSize * uPixel * aLife * (60.0 / max(-mv.z, 0.5)), 0.0, 40.0);
            vC = aColor; vL = aLife;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `varying vec3 vC; varying float vL;
          void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vC, a * a * vL * 1.4); }`
      });
      this.points = new T.Points(g, this.mat);
      this.points.frustumCulled = false;
      ctx.scene.add(this.points);
      this.geo = g;
      this.ray = new T.Raycaster();
      this.v = new T.Vector2();
      this.palette = ["#6f9bff", "#b18cff", "#ff8a3d", "#2fbf84", "#ffffff", "#ff5ab0", "#5ad7ff"].map((c) => new T.Color(c));

      const emitAt = (sx, sy, dist, n, speed, ttl, size, grav, spread) => {
        this.v.set((sx / ctx.size.w) * 2 - 1, -((sy / ctx.size.h) * 2 - 1));
        this.ray.setFromCamera(this.v, ctx.camera);
        const o = this.ray.ray.origin, d = this.ray.ray.direction;
        for (let k = 0; k < n; k++) {
          const i = this.next; this.next = (this.next + 1) % this.N;
          this.pos[i * 3] = o.x + d.x * dist; this.pos[i * 3 + 1] = o.y + d.y * dist; this.pos[i * 3 + 2] = o.z + d.z * dist;
          const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), sp = speed * (0.35 + Math.random() * 0.65);
          this.vel[i * 3] = Math.sin(ph) * Math.cos(th) * sp * spread;
          this.vel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp * spread + sp * 0.35;
          this.vel[i * 3 + 2] = Math.cos(ph) * sp * 0.6;
          const c = this.palette[(Math.random() * this.palette.length) | 0];
          this.col[i * 3] = c.r; this.col[i * 3 + 1] = c.g; this.col[i * 3 + 2] = c.b;
          this.size[i] = size * (0.6 + Math.random() * 0.8);
          this.age[i] = 0; this.ttl[i] = ttl * (0.7 + Math.random() * 0.6); this.grav[i] = grav;
        }
        this.geo.attributes.aSize.needsUpdate = true;
      };
      World.confetti = (sx, sy) => { emitAt(sx, sy, 9, 150, 7, 2.2, 3.2, 5.5, 1); World.pulse = 1; };
      let lx = -99, ly = -99;
      World.sparkle = (sx, sy) => {
        if (Math.hypot(sx - lx, sy - ly) < 14) return;
        lx = sx; ly = sy;
        emitAt(sx, sy, 10, 2, 0.9, 1.1, 1.5, -0.25, 1);
      };
    },
    resize(ctx) { this.mat.uniforms.uPixel.value = ctx.dpr; },
    update(ctx) {
      const dt = ctx.dt, N = this.N;
      let any = false;
      for (let i = 0; i < N; i++) {
        const a = this.age[i] += dt;
        if (a >= this.ttl[i]) { if (this.life[i] !== 0) { this.life[i] = 0; any = true; } continue; }
        any = true;
        this.vel[i * 3 + 1] -= this.grav[i] * dt;
        const drag = Math.exp(-1.4 * dt);
        this.vel[i * 3] *= drag; this.vel[i * 3 + 1] *= drag; this.vel[i * 3 + 2] *= drag;
        this.pos[i * 3] += this.vel[i * 3] * dt; this.pos[i * 3 + 1] += this.vel[i * 3 + 1] * dt; this.pos[i * 3 + 2] += this.vel[i * 3 + 2] * dt;
        const k = 1 - a / this.ttl[i];
        this.life[i] = k * k;
      }
      this.points.visible = any;
      if (any) {
        this.geo.attributes.position.needsUpdate = true;
        this.geo.attributes.aLife.needsUpdate = true;
        this.geo.attributes.aColor.needsUpdate = true;
      }
    }
  });
})();
