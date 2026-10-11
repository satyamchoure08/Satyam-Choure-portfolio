/* ============================================================
   KOHINOOR ESTATES — single lazy WebGL moment.
   Loads Three.js from CDN only when: desktop width, no reduced
   motion, no save-data, element visible. If anything fails the
   page shows a CSS orbit fallback instead — content never blocks.
   ============================================================ */
(function () {
  "use strict";
  function init() {
    var wrap = document.getElementById("hero3d");
    if (!wrap) return;
    var KE = window.KE;
    var eligible =
      window.innerWidth > 900 &&
      !KE.reduced &&
      !(navigator.connection && navigator.connection.saveData) &&
      !document.documentElement.hasAttribute("data-no3d");
    if (!eligible) { wrap.classList.add("fallback"); return; }

    /* probe WebGL before downloading the library */
    try {
      var probe = document.createElement("canvas");
      if (!(probe.getContext && (probe.getContext("webgl") || probe.getContext("experimental-webgl")))) {
        wrap.classList.add("fallback"); return;
      }
    } catch (e) { wrap.classList.add("fallback"); return; }

    var s = document.createElement("script");
    s.src = "https://unpkg.com/three@0.160.0/build/three.min.js";
    s.async = true;
    s.onerror = function () { wrap.classList.add("fallback"); };
    s.onload = function () { start(wrap); };
    document.head.appendChild(s);
  }

  function start(wrap) {
    var THREE = window.THREE;
    if (!THREE) { wrap.classList.add("fallback"); return; }
    try {
      var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      wrap.appendChild(renderer.domElement);

      var scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      cam.position.set(0, 0, 8);

      var accent = getComputedStyle(document.documentElement).getPropertyValue("--acc").trim() || "#002fa7";

      /* wire torus-knot = sculptural "floor plan" object */
      var knot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(2.1, 0.55, 140, 18, 2, 3),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), wireframe: true, transparent: true, opacity: 0.5 })
      );
      scene.add(knot);

      /* sparse point halo */
      var geo = new THREE.BufferGeometry();
      var N = 320, pos = new Float32Array(N * 3);
      for (var i = 0; i < N; i++) {
        var r = 3.1 + Math.random() * 1.4, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
        pos[i * 3 + 2] = r * Math.cos(ph);
      }
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      var pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: new THREE.Color(accent), size: 0.02, transparent: true, opacity: 0.7 }));
      scene.add(pts);

      var running = false, raf = 0, t = 0;
      function frame() {
        if (!running) return;
        t += 0.0045;
        knot.rotation.x = t * 0.7;
        knot.rotation.y = t;
        pts.rotation.y = -t * 0.4;
        var sy = window.scrollY / Math.max(1, window.innerHeight);
        cam.position.y = -sy * 0.6;
        renderer.render(scene, cam);
        raf = requestAnimationFrame(frame);
      }
      function on()  { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
      function off() { running = false; cancelAnimationFrame(raf); }

      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? on() : off(); });
      }, { threshold: 0.05 }).observe(wrap);
      document.addEventListener("visibilitychange", function () {
        document.hidden ? off() : (wrap.getBoundingClientRect().top < window.innerHeight && on());
      });
      window.addEventListener("resize", function () {
        renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      });
      on();
    } catch (e) {
      wrap.classList.add("fallback");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
