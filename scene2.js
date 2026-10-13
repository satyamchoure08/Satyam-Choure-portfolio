/* ==========================================================================
   3D world, part 2: the About object and the Skills orbit.
   Needs scene.js (window.World) and THREE.
   ========================================================================== */
(() => {
  "use strict";
  const T = window.THREE, World = window.World;
  if (!T || !World) return;
  const { clamp, lerp, smooth, damp, ANCH } = World.ctx;
  const wrapD = (d, n) => ((d + n / 2) % n + n) % n - n / 2;

  /* ------------------------------------------------------------------------
     About: a glass core inside a wire cage, ringed by orbits and a particle shell.
     ------------------------------------------------------------------------ */
  World.register({
    name: "about",
    async build(ctx) {
      this.group = new T.Group();
      ctx.scene.add(this.group);
      const g = this.group;

      this.coreMat = ctx.fresnel(0x2e52ff, 0x9e5bff, 0x5ad7ff);
      this.core = new T.Mesh(new T.IcosahedronGeometry(1.45, 2), this.coreMat);
      g.add(this.core);

      this.cageMat = new T.LineBasicMaterial({ color: 0x9fb2ff, transparent: true, opacity: 0 });
      this.cage = new T.LineSegments(new T.EdgesGeometry(new T.IcosahedronGeometry(2.1, 1)), this.cageMat);
      g.add(this.cage);

      this.cage2Mat = new T.LineBasicMaterial({ color: 0xc08bff, transparent: true, opacity: 0 });
      this.cage2 = new T.LineSegments(new T.EdgesGeometry(new T.DodecahedronGeometry(2.75, 0)), this.cage2Mat);
      g.add(this.cage2);

      // three thin orbits, each with two little planets
      this.ringMat = new T.MeshBasicMaterial({ color: 0x7f9bff, transparent: true, opacity: 0, depthWrite: false });
      this.planetMat = new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
      this.rings = [3.2, 3.7, 4.2].map((r, i) => {
        const ring = new T.Mesh(new T.TorusGeometry(r, 0.012, 8, 260), this.ringMat);
        ring.rotation.set(0.5 + i * 0.9, i * 0.6, i * 1.1);
        ring.userData.r = r;
        ring.userData.planets = [0, 1].map(() => {
          const p = new T.Mesh(new T.SphereGeometry(0.07 + i * 0.02, 12, 12), this.planetMat);
          ring.add(p);
          return p;
        });
        g.add(ring);
        return ring;
      });

      // particle shell that breathes with the scroll
      const count = ctx.mobile ? 700 : 1500;
      const pos = new Float32Array(count * 3), seed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const u = Math.random() * 2 - 1, a = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        pos[i * 3] = s * Math.cos(a); pos[i * 3 + 1] = u; pos[i * 3 + 2] = s * Math.sin(a);
        seed[i] = Math.random();
      }
      const sg = new T.BufferGeometry();
      sg.setAttribute("position", new T.BufferAttribute(pos, 3));
      sg.setAttribute("aSeed", new T.BufferAttribute(seed, 1));
      this.shellMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uR: { value: 5 }, uOpacity: { value: 0 }, uPixel: { value: ctx.dpr } },
        vertexShader: `
          attribute float aSeed; uniform float uTime, uR, uPixel; varying float vA;
          void main(){
            vec3 p = position * (uR + sin(uTime * 0.9 + aSeed * 30.0) * 0.28 + aSeed * 0.9);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = clamp((1.2 + aSeed * 2.2) * uPixel * (30.0 / -mv.z), 1.0, 14.0);
            vA = 0.35 + 0.65 * aSeed;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          uniform float uOpacity; varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.62, 0.7, 1.0, smoothstep(0.5, 0.0, d) * vA * uOpacity); }`
      });
      this.shell = new T.Points(sg, this.shellMat);
      this.shell.frustumCulled = false;
      g.add(this.shell);

      // small solids drifting on the outside
      this.bits = [];
      const geos = [new T.OctahedronGeometry(0.2), new T.TetrahedronGeometry(0.24), new T.BoxGeometry(0.26, 0.26, 0.26)];
      this.bitMat = new T.LineBasicMaterial({ color: 0xffb27a, transparent: true, opacity: 0 });
      for (let i = 0; i < 9; i++) {
        const m = new T.LineSegments(new T.EdgesGeometry(geos[i % 3]), this.bitMat);
        m.userData = { a: (i / 9) * Math.PI * 2, r: 4.9 + (i % 3) * 0.5, y: (Math.random() - 0.5) * 3.4, sp: 0.15 + Math.random() * 0.25 };
        g.add(m);
        this.bits.push(m);
      }
    },
    resize(ctx) {
      const L = ctx.layout, d = L.narrow ? 17 : 12.5;
      const W = ctx.viewW(d), H = ctx.viewH(d);
      this.d = d;
      this.pos = { x: L.narrow ? 0 : -0.22 * W, y: L.narrow ? 0.24 * H : -0.1 * H };
      this.scale = L.narrow ? 0.85 : clamp(ctx.aspect / 1.9, 0.62, 1);
      this.shellMat.uniforms.uPixel.value = ctx.dpr;
    },
    update(ctx) {
      const w = ctx.w[2], g = this.group;
      g.visible = w > 0.002;
      if (!g.visible) return;
      const t = ctx.t, m = ctx.mouse, p = ctx.p[2], arr = ctx.arr[2], lev = ctx.dep[2];
      const P = this.pos || { x: 0, y: 0 };
      const camZ = ANCH[2] + World.ctx.DRIFT[2] * smooth(0, World.ctx.D0[2], p);
      g.position.set(P.x, P.y, camZ - this.d);
      g.scale.setScalar((this.scale || 1) * (0.35 + 0.65 * arr) * (1 + lev * 0.6));
      g.rotation.set(m.sy * 0.25, m.sx * 0.35, 0);

      const spin = t * 0.22 + p * Math.PI * 4;
      this.core.rotation.set(spin * 0.6, spin, 0);
      this.cage.rotation.set(-spin * 0.5, spin * 0.7, spin * 0.2);
      this.cage2.rotation.set(spin * 0.3, -spin * 0.4, 0);
      this.coreMat.uniforms.uTime.value = t;
      this.coreMat.uniforms.uOpacity.value = w * 0.95;
      const pulse = 1 + Math.sin(t * 1.6) * 0.035 + World.pulse * 0.12;
      this.core.scale.setScalar(pulse * (0.9 + 0.2 * Math.sin(p * Math.PI * 3)));
      this.cageMat.opacity = w * 0.7;
      this.cage2Mat.opacity = w * 0.45;
      this.ringMat.opacity = w * 0.55;
      this.planetMat.opacity = w;
      this.bitMat.opacity = w * 0.7;
      this.shellMat.uniforms.uOpacity.value = w * 0.9;
      this.shellMat.uniforms.uTime.value = t;
      this.shellMat.uniforms.uR.value = 4.9 + Math.sin(p * Math.PI * 2) * 0.5 + World.pulse * 0.6;
      this.shell.rotation.set(t * 0.03, -t * 0.05 - p * 2, 0);

      this.rings.forEach((r, i) => {
        r.rotation.z += ctx.dt * (0.12 + i * 0.07);
        r.userData.planets.forEach((pl, k) => {
          const a = t * (0.6 + i * 0.25) * (k ? -1 : 1) + k * Math.PI;
          pl.position.set(Math.cos(a) * r.userData.r, Math.sin(a) * r.userData.r, 0);
        });
      });
      this.bits.forEach((b, i) => {
        const d = b.userData, a = d.a + t * d.sp + p * 2.5;
        b.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * d.sp * 3 + i) * 0.3, Math.sin(a) * d.r);
        b.rotation.set(t * d.sp * 3, t * d.sp * 2, 0);
      });
    }
  });

  /* ------------------------------------------------------------------------
     Skills: five glowing pills on a tilted orbit. Scroll brings each to the front.
     ------------------------------------------------------------------------ */
  function pillTexture(s) {
    const c = document.createElement("canvas");
    c.width = 1024; c.height = 400;
    const g = c.getContext("2d");
    const r = 78, x = 6, y = 6, w = 1012, h = 388;
    const path = () => {
      g.beginPath();
      g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
      g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
    };
    path();
    const grd = g.createLinearGradient(0, 40, 1024, 360);
    grd.addColorStop(0, "#131317"); grd.addColorStop(0.3, "#131317"); grd.addColorStop(1, s.color);
    g.fillStyle = grd; g.fill();
    const hi = g.createRadialGradient(240, 20, 10, 240, 20, 520);
    hi.addColorStop(0, "rgba(255,255,255,.14)"); hi.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = hi; path(); g.fill();
    g.lineWidth = 3; g.strokeStyle = "rgba(255,255,255,.28)"; path(); g.stroke();
    g.fillStyle = "#fff"; g.textBaseline = "alphabetic";
    g.font = "600 38px Geist, system-ui, sans-serif"; g.globalAlpha = 0.6;
    g.fillText(s.idx, 70, 106); g.globalAlpha = 1;
    g.font = "700 142px Geist, system-ui, sans-serif";
    g.fillText(s.name, 62, 262);
    g.font = "400 44px Geist, system-ui, sans-serif"; g.fillStyle = "#c4c4cc";
    g.fillText(s.desc, 66, 336);
    if (s.tag) {
      const tw = g.measureText(s.desc).width;
      g.font = "500 32px Geist, system-ui, sans-serif";
      const lab = s.tag, lw = g.measureText(lab).width + 44, lx = 66 + tw + 30, ly = 301;
      g.strokeStyle = "rgba(255,255,255,.5)"; g.lineWidth = 2;
      g.beginPath(); g.roundRect ? g.roundRect(lx, ly, lw, 52, 26) : g.rect(lx, ly, lw, 52); g.stroke();
      g.fillStyle = "#fff"; g.fillText(lab, lx + 22, ly + 37);
    }
    const tex = new T.CanvasTexture(c);
    tex.anisotropy = 8;
    return tex;
  }

  World.register({
    name: "skills",
    idx: 0,
    active: 0,
    async build(ctx, opts) {
      const list = opts.skills;
      this.n = list.length;
      try { await document.fonts.load("700 120px Geist"); await document.fonts.ready; } catch (e) { /* fall through */ }
      this.group = new T.Group();
      ctx.scene.add(this.group);
      this.tilt = new T.Group();
      this.group.add(this.tilt);
      const geo = new T.PlaneGeometry(3.4, 1.328);
      this.spinA = list.map(() => 0);
      this.spinT = list.map(() => 0);
      this.pills = list.map((s, i) => {
        const col = new T.Color(s.color);
        const mat = new T.ShaderMaterial({
          transparent: true, depthWrite: false, side: T.DoubleSide,
          uniforms: {
            uMap: { value: pillTexture(s) }, uOpacity: { value: 0 }, uActive: { value: 0 }, uHover: { value: 0 },
            uTime: { value: 0 }, uMouse: { value: new T.Vector2(0.5, 0.5) }, uColor: { value: col }
          },
          vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
          fragmentShader: `
            varying vec2 vUv; uniform sampler2D uMap; uniform float uOpacity, uActive, uHover, uTime; uniform vec2 uMouse; uniform vec3 uColor;
            void main(){
              vec4 tex = texture2D(uMap, vUv);
              vec3 col = tex.rgb;
              float diag = vUv.x * 0.8 + vUv.y * 0.35;
              float band = exp(-pow((diag - (-0.3 + fract(uTime * 0.22) * 1.9)) * 7.0, 2.0));
              col += (0.35 + uColor * 0.5) * band * 0.45 * uActive;
              col += uColor * exp(-pow(distance(vUv, uMouse) * 2.8, 2.0)) * 0.28 * uHover;
              col *= mix(0.5, 1.0, uActive);
              if (!gl_FrontFacing) col = mix(vec3(0.05), uColor, 0.22) * (0.55 + 0.45 * uActive);
              gl_FragColor = vec4(col, tex.a * uOpacity);
            }`
        });
        const mesh = new T.Mesh(geo, mat);
        mesh.userData.index = i;
        this.tilt.add(mesh);
        return mesh;
      });

      // soft coloured glow behind the front pill
      this.glowMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uColor: { value: new T.Color(list[0].color) }, uOpacity: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
        fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uOpacity;
          void main(){ float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(uColor, pow(max(1.0 - d, 0.0), 2.2) * 0.55 * uOpacity); }`
      });
      this.glow = new T.Mesh(new T.PlaneGeometry(9, 5.6), this.glowMat);
      this.group.add(this.glow);
      this.colors = list.map((s) => new T.Color(s.color));

      // sparks travelling around the orbit
      const sc = ctx.mobile ? 160 : 360, sp = new Float32Array(sc * 3), ss = new Float32Array(sc);
      for (let i = 0; i < sc; i++) { ss[i] = Math.random(); sp[i * 3] = i; }
      const sgeo = new T.BufferGeometry();
      sgeo.setAttribute("position", new T.BufferAttribute(sp, 3));
      sgeo.setAttribute("aSeed", new T.BufferAttribute(ss, 1));
      this.sparkMat = new T.ShaderMaterial({
        transparent: true, depthWrite: false, blending: T.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uR: { value: 5.2 }, uPixel: { value: ctx.dpr } },
        vertexShader: `
          attribute float aSeed; uniform float uTime, uR, uPixel; varying float vA;
          void main(){
            float a = aSeed * 6.2831 + uTime * (0.25 + aSeed * 0.35);
            float r = uR + (aSeed - 0.5) * 2.4;
            vec3 p = vec3(sin(a) * r, (fract(aSeed * 97.0) - 0.5) * 3.2 + sin(uTime + aSeed * 20.0) * 0.2, cos(a) * r);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_PointSize = clamp((1.0 + aSeed * 2.4) * uPixel * (28.0 / -mv.z), 1.0, 12.0);
            vA = 0.3 + 0.7 * fract(aSeed * 13.0);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `uniform float uOpacity; varying float vA;
          void main(){ float d = length(gl_PointCoord - 0.5); gl_FragColor = vec4(0.75, 0.8, 1.0, smoothstep(0.5, 0.0, d) * vA * uOpacity); }`
      });
      this.sparks = new T.Points(sgeo, this.sparkMat);
      this.sparks.frustumCulled = false;
      this.tilt.add(this.sparks);
    },
    resize(ctx) {
      const L = ctx.layout;
      this.R = L.narrow ? 3.6 : 5.2;
      const d = L.narrow ? 15.5 : 13.2;
      this.d = d;
      this.pos = { x: 0, y: (L.narrow ? 0.12 : 0.13) * ctx.viewH(d) };
      this.sparkMat.uniforms.uR.value = this.R;
      this.sparkMat.uniforms.uPixel.value = ctx.dpr;
    },
    update(ctx) {
      const w = ctx.w[3], g = this.group;
      g.visible = w > 0.002;
      if (!g.visible) return;
      const n = this.n, step = (Math.PI * 2) / n, R = this.R || 5, t = ctx.t, m = ctx.mouse;
      const p = ctx.p[3], arr = ctx.arr[3], lev = ctx.dep[3];
      const target = clamp((p - 0.06) / 0.66, 0, 1) * (n - 1);
      this.idx = damp(this.idx, target, 5, ctx.dt);
      const act = clamp(Math.round(this.idx), 0, n - 1);
      if (act !== this.active) { this.active = act; World.emit("skill", act); }

      const P = this.pos || { x: 0, y: 0 };
      const camZ = ANCH[3] + World.ctx.DRIFT[3] * smooth(0, World.ctx.D0[3], p);
      g.position.set(P.x, P.y, camZ - this.d);
      g.scale.setScalar(0.5 + 0.5 * arr);
      g.rotation.y = (1 - arr) * -1.6 + m.sx * 0.18;
      this.tilt.rotation.set(0.32 + m.sy * 0.12 - (1 - arr) * 0.5, 0, Math.sin(t * 0.4) * 0.03 + m.sx * 0.04);

      const hov = World.hover && World.hover.module === "skills" ? World.hover : null;
      for (let i = 0; i < n; i++) {
        const mesh = this.pills[i], u = mesh.material.uniforms;
        const d = wrapD(i - this.idx, n), a = d * step, ad = Math.abs(d);
        const e = 1 - smooth(0, 1.1, ad);
        const rad = R + e * 0.9;
        this.spinA[i] = damp(this.spinA[i], this.spinT[i], 4.5, ctx.dt);
        mesh.position.set(Math.sin(a) * rad, Math.sin(t * 0.8 + i * 1.7) * 0.12, Math.cos(a) * rad);
        mesh.rotation.set(0, a + this.spinA[i], 0);
        const isHover = hov && hov.index === i;
        mesh.scale.setScalar(1 + e * 0.22 + (isHover ? 0.05 : 0));
        u.uTime.value = t;
        u.uActive.value = e;
        u.uOpacity.value = w * lerp(0.55, 1, e);
        u.uHover.value = damp(u.uHover.value, isHover ? 1 : 0, 8, ctx.dt);
        if (isHover && hov.uv) u.uMouse.value.copy(hov.uv);
      }
      // glow follows the colour of whichever pill is nearest the front
      const gi = clamp(Math.round(this.idx), 0, n - 1);
      this.glowMat.uniforms.uColor.value.lerp(this.colors[gi], 1 - Math.exp(-6 * ctx.dt));
      this.glowMat.uniforms.uOpacity.value = w * (0.8 + 0.2 * Math.sin(t * 1.5) + World.pulse * 0.6);
      this.glow.position.set(0, 0, R + 0.5);
      this.glow.scale.setScalar(1 + lev * 0.4);
      this.sparkMat.uniforms.uTime.value = t;
      this.sparkMat.uniforms.uOpacity.value = w;
    },
    pick(ctx, raycaster) {
      if (ctx.w[3] < 0.6) return null;
      const hits = raycaster.intersectObjects(this.pills, false);
      for (const h of hits) {
        const i = h.object.userData.index;
        if (Math.abs(wrapD(i - this.idx, this.n)) < 1.6) return { module: "skills", index: i, uv: h.uv, active: Math.abs(wrapD(i - this.idx, this.n)) < 0.55 };
      }
      return null;
    },
    click(ctx, hit) {
      this.spinT[hit.index] += Math.PI * 2;
      World.boost = 0.7;
      setTimeout(() => { World.boost = 0; }, 260);
      World.emit(hit.active ? "skillspin" : "skillgoto", hit.index);
    }
  });
})();
