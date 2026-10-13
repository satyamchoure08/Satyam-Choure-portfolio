/* ==========================================================================
   Boot. Decides between the 3D experience and the simple page, then loads
   whatever that needs. The decision itself is made in the <head> (data-3d):
     on       WebGL works and motion is allowed  -> load the 3D scripts
     reduced  your device asks for less motion   -> simple page + an opt-in button
     short    the window is very short (a phone on its side) -> simple page, 3D returns when it grows
     off      you chose "Simple view"            -> simple page + a way back
     nogl     no WebGL                           -> simple page
   Add ?no3d to the address to see the simple page, ?motion=on to force 3D.
   ========================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  const mode = root.getAttribute("data-3d") || "off";
  const openGate = () => { if (window.__introGate) window.__introGate.open(); };
  const store = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };

  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = resolve;
    s.onerror = () => reject(new Error("Could not load " + src));
    document.head.appendChild(s);
  });

  const backToSimple = (err) => {
    console.error("[3D] falling back to the simple page:", err);
    try { sessionStorage.setItem("no3d", "1"); } catch (e) { /* ignore */ }
    location.reload();
  };

  if (mode === "on") {
    const v = "?v=4";
    Promise.all([
      "assets/vendor/three.min.js?v=160",
      "scene.js" + v, "scene2.js" + v, "scene3.js" + v,
      "stage.js" + v, "stage2.js" + v, "stage3.js" + v
    ].map(load))
      .then(() => window.Stage.start())
      .then(() => {
        const cv = document.getElementById("gl");
        cv.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setTimeout(() => { if (window.World && window.World.lost !== false) backToSimple("context lost"); }, 2500);
          window.World.lost = true;
        });
        cv.addEventListener("webglcontextrestored", () => { window.World.lost = false; });
        // a window that becomes very short (phone turned on its side) cannot hold the 3D layout
        let rt;
        window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (innerHeight < 460) location.reload(); }, 500); });
        openGate();
      })
      .catch((err) => { openGate(); backToSimple(err); });
    return;
  }

  /* Simple page: the lighter GSAP scroll animations */
  load("assets/vendor/ScrollTrigger.min.js")
    .then(() => load("motion.js?v=2"))
    .catch(() => { /* the page already works without it */ });
  openGate();

  if (mode === "short") {
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (innerHeight >= 460) location.reload(); }, 500); });
  }

  if (mode === "reduced" || mode === "off") {
    const bar = document.createElement("div");
    bar.className = "motion-banner";
    let slow = false;
    try { slow = sessionStorage.getItem("slow3d") === "1"; } catch (e) { /* ignore */ }
    const note = mode === "reduced" ? "Motion is turned down on your device." : slow ? "Switched to the lighter page so scrolling stays smooth." : "You are viewing the simple page.";
    bar.innerHTML = "<span>" + note + "</span><button type=\"button\" data-play>Play the 3D version</button>" +
      "<button type=\"button\" class=\"motion-banner__x\" data-x aria-label=\"Dismiss\">&times;</button>";
    bar.querySelector("[data-x]").addEventListener("click", () => { bar.remove(); try { sessionStorage.setItem("banner", "0"); } catch (e) { /* ignore */ } });
    bar.querySelector("[data-play]").addEventListener("click", () => {
      store("motion", "on");
      try { sessionStorage.removeItem("no3d"); sessionStorage.removeItem("slow3d"); } catch (e) { /* ignore */ }
      // ?no3d in the address would keep forcing the simple page, so drop it
      const u = new URL(location.href);
      if (u.searchParams.has("no3d")) { u.searchParams.delete("no3d"); location.replace(u.toString()); }
      else location.reload();
    });
    let hidden = false;
    try { hidden = sessionStorage.getItem("banner") === "0"; } catch (e) { /* ignore */ }
    const show = () => { if (!hidden) document.body.appendChild(bar); };
    if (document.readyState === "complete") show(); else window.addEventListener("load", show, { once: true });
  }
})();
