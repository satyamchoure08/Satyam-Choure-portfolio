/* ==========================================================================
   Stage, part 3: About, Skills and Contact content, plus effects that run
   across the whole page (magnetic buttons, letter scramble, scroll skew...).
   ========================================================================== */
(() => {
  "use strict";
  const Stage = window.Stage;
  if (!Stage) return;
  const { $, $$, clamp, smooth, touch } = Stage;
  const pad = (n) => String(n).padStart(2, "0");
  const seg = (p, a, b) => smooth(a, b, p);

  /* ------------------------------------------------------------------------
     About: heading rises, the lead sentence fills word by word, rows slide in
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const sec = Stage.sections[2];
      const title = $(".section__title", sec), lead = $(".about__lead", sec), text = $(".about__text", sec);
      const rows = $$(".path li", sec), eyebrow = $(".eyebrow", sec), path = $(".path", sec);
      sec.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
      const tw = Stage.splitWords(title);
      const lw = Stage.splitWords(lead, "fw");
      gsap.set(tw, { yPercent: 118, rotate: 5, transformOrigin: "0% 100%" });
      Stage.ticks.push((ctx, p) => {
        const p2 = p[2];
        if (Stage.o[2] < 0.005) return;
        tw.forEach((w, i) => {
          const k = seg(p2, 0.02 + i * 0.012, 0.11 + i * 0.012);
          w.style.transform = `translate3d(0,${((1 - k) * 118).toFixed(1)}%,0) rotate(${((1 - k) * 5).toFixed(2)}deg)`;
        });
        eyebrow.style.opacity = seg(p2, 0.01, 0.08).toFixed(3);
        lw.forEach((w, i) => {
          const a = 0.1 + (i / lw.length) * 0.26, k = seg(p2, a, a + 0.05);
          w.style.opacity = (0.16 + 0.84 * k).toFixed(3);
          w.style.transform = `translate3d(0,${((1 - k) * 8).toFixed(1)}px,0)`;
        });
        const kt = seg(p2, 0.36, 0.46);
        text.style.opacity = kt.toFixed(3);
        text.style.transform = `translate3d(0,${((1 - kt) * 26).toFixed(1)}px,0)`;
        rows.forEach((r, i) => {
          const k = seg(p2, 0.46 + i * 0.07, 0.57 + i * 0.07);
          r.style.opacity = k.toFixed(3);
          r.style.transform = `translate3d(${((1 - k) * 90).toFixed(1)}px,0,0)`;
        });
        path.style.setProperty("--pl", seg(p2, 0.46, 0.7).toFixed(3));
        if (Stage.bg2) Stage.bg2.style.transform = `translate3d(${(18 - p2 * 60).toFixed(1)}vw,0,0)`;
      });
    }
  });

  /* ------------------------------------------------------------------------
     Skills: a caption that follows whichever pill is at the front
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const World = Stage.world, sec = Stage.sections[3], list = Stage.skills, n = list.length;
      const title = $(".section__title", sec), eyebrow = $(".eyebrow", sec);
      sec.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
      const tw = Stage.splitWords(title);
      const ui = document.createElement("div");
      ui.className = "s3d";
      ui.innerHTML =
        '<div class="s3d__info" aria-live="polite" aria-atomic="true">' +
        `<div class="s3d__count" aria-hidden="true"><span class="s3d__num"><b data-sc>01</b></span><i></i><span>${pad(n)}</span></div>` +
        '<p class="s3d__desc"><span class="w"><span class="wi" data-sd></span></span><em class="s3d__tag" data-st></em></p>' +
        '<div class="s3d__dots" role="group" aria-label="Skills">' + list.map((s, i) => `<button type="button" data-k="${i}" aria-label="${s.name}"><i></i></button>`).join("") + "</div>" +
        "</div>" +
        '<p class="s3d__hint" aria-hidden="true">Scroll to orbit &middot; click a pill to spin it</p>';
      sec.appendChild(ui);
      const sc = $("[data-sc]", ui), sd = $("[data-sd]", ui), st = $("[data-st]", ui), dots = $$(".s3d__dots button", ui);
      let cur = -1;
      const snapGo = Stage.snapper(3, 0.06, 0.72, n);
      const show = (i) => {
        if (i === cur) return;
        const dir = i > cur ? 1 : -1, first = cur < 0;
        cur = i;
        sc.textContent = pad(i + 1);
        sd.textContent = list[i].name + " · " + list[i].desc;
        st.textContent = list[i].tag;
        st.style.display = list[i].tag ? "" : "none";
        dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
        ui.style.setProperty("--c", list[i].color);
        if (first) return;
        gsap.killTweensOf([sd, sc, st]);
        gsap.fromTo(sd, { yPercent: 110 * dir }, { yPercent: 0, duration: 0.8, ease: "power4.out" });
        gsap.fromTo(sc, { yPercent: 70 * dir, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
        gsap.fromTo(st, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(2)", delay: 0.2 });
      };
      show(0);
      World.on("skill", show);
      World.on("skillgoto", (i) => snapGo(i));
      World.on("skillspin", () => gsap.fromTo(ui.querySelector(".s3d__desc"), { scale: 1.08 }, { scale: 1, duration: 0.9, ease: "elastic.out(1, 0.5)" }));
      ui.addEventListener("click", (e) => { const b = e.target.closest(".s3d__dots button"); if (b) snapGo(+b.dataset.k); });
      window.addEventListener("keydown", (e) => {
        if (Stage.cur !== 3 || e.target.closest("input, textarea, select")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); snapGo(cur + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); snapGo(cur - 1); }
      });
      const hint = $(".s3d__hint", ui), info = $(".s3d__info", ui);
      Stage.ticks.push((ctx, p) => {
        const p3 = p[3];
        if (Stage.o[3] < 0.005) return;
        tw.forEach((w, i) => {
          const k = seg(p3, 0.02 + i * 0.015, 0.1 + i * 0.015);
          w.style.transform = `translate3d(0,${((1 - k) * 118).toFixed(1)}%,0) rotate(${((1 - k) * 5).toFixed(2)}deg)`;
        });
        eyebrow.style.opacity = seg(p3, 0.01, 0.08).toFixed(3);
        const ki = seg(p3, 0.05, 0.12);
        info.style.opacity = ki.toFixed(3);
        info.style.transform = `translate3d(0,${((1 - ki) * 40).toFixed(1)}px,0)`;
        hint.style.opacity = (seg(p3, 0.05, 0.12) * (1 - seg(p3, 0.2, 0.3))).toFixed(3);
        if (Stage.bg3) Stage.bg3.style.transform = `translate3d(${(-15 - p3 * 40).toFixed(1)}vw,0,0)`;
      });
    }
  });

  /* ------------------------------------------------------------------------
     Contact: the panel grows in, buttons pop, confetti when you copy the email
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const World = Stage.world, sec = Stage.sections[4];
      sec.querySelectorAll(".reveal").forEach((e) => e.classList.add("is-in"));
      const panel = $(".contact__panel", sec), title = $(".contact__title", sec), eyebrow = $(".eyebrow", sec);
      const lead = $(".contact__lead", sec), btns = $$(".contact__actions .btn", sec), soc = $$(".socials li", sec), foot = $(".site-footer", sec);
      const tw = Stage.splitWords(title);
      $$("[data-copy]").forEach((b) => b.addEventListener("click", () => {
        const r = b.getBoundingClientRect();
        if (World.confetti) World.confetti(r.left + r.width / 2, r.top + r.height / 2);
      }));
      Stage.ticks.push((ctx, p) => {
        const p4 = p[4];
        if (Stage.o[4] < 0.005) return;
        const kp = seg(p4, 0, 0.14);
        panel.style.translate = `0 ${((1 - kp) * 70).toFixed(1)}px`;
        panel.style.scale = (0.9 + 0.1 * kp).toFixed(4);
        panel.style.borderRadius = (90 - 46 * kp).toFixed(1) + "px";
        eyebrow.style.opacity = seg(p4, 0.05, 0.12).toFixed(3);
        tw.forEach((w, i) => {
          const k = seg(p4, 0.06 + i * 0.012, 0.18 + i * 0.012);
          w.style.transform = `translate3d(0,${((1 - k) * 118).toFixed(1)}%,0) rotate(${((1 - k) * 5).toFixed(2)}deg)`;
        });
        const kl = seg(p4, 0.18, 0.26);
        lead.style.opacity = kl.toFixed(3);
        lead.style.transform = `translate3d(0,${((1 - kl) * 20).toFixed(1)}px,0)`;
        btns.forEach((b, i) => {
          const k = seg(p4, 0.22 + i * 0.05, 0.32 + i * 0.05);
          b.style.opacity = k.toFixed(3);
          b.style.translate = `0 ${((1 - k) * 30).toFixed(1)}px`;
          b.style.scale = (0.85 + 0.15 * k).toFixed(3);
        });
        soc.forEach((s, i) => {
          const k = seg(p4, 0.34 + i * 0.05, 0.44 + i * 0.05);
          s.style.opacity = k.toFixed(3);
          s.style.transform = `translate3d(0,${((1 - k) * 20).toFixed(1)}px,0)`;
        });
        if (foot) foot.style.opacity = seg(p4, 0.55, 0.7).toFixed(3);
        if (Stage.bg4) Stage.bg4.style.transform = `translate3d(${(-10 + p4 * 14).toFixed(1)}vw,0,0)`;
      });
    }
  });

  /* ------------------------------------------------------------------------
     Effects that apply everywhere
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const World = Stage.world, main = $("main");

      // Text skews with scroll speed, like it is being pulled along
      let lastY = window.scrollY, sk = 0;
      Stage.ticks.push((ctx) => {
        const y = window.scrollY, v = (y - lastY) / Math.max(ctx.dt, 0.001);
        lastY = y;
        sk += (clamp(v / 900, -1, 1) * 5 - sk) * Math.min(1, ctx.dt * 8);
        main.style.setProperty("--sk", sk.toFixed(2));
      });

      // Any click sends a pulse through the stars
      window.addEventListener("pointerdown", () => { World.pulse = Math.max(World.pulse, 0.55); }, { passive: true });

      // One white pill slides to the section you are in
      const list = $(".nav__list");
      if (list) {
        const pill = document.createElement("li");
        pill.className = "nav__pill";
        pill.setAttribute("aria-hidden", "true");
        list.prepend(pill);
        gsap.set(pill, { opacity: 0 });
        const move = () => {
          const cur = $('a[aria-current="true"]', list);
          if (!cur) { gsap.to(pill, { opacity: 0, duration: 0.3 }); return; }
          gsap.to(pill, { opacity: 1, x: cur.offsetLeft, width: cur.offsetWidth, duration: 0.65, ease: "power3.out" });
        };
        new MutationObserver(move).observe(list, { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
      }

      // A thin light sweeps across under the header each time you arrive in a new chapter,
      // and the chapter's small label decodes itself from random letters
      const sweep = document.createElement("div");
      sweep.className = "sweep";
      sweep.setAttribute("aria-hidden", "true");
      document.body.appendChild(sweep);
      const GL2 = "abcdefghijklmnopqrstuvwxyz";
      const decode = (el) => {
        const node = [...el.childNodes].reverse().find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!node) return;
        if (el._decode) { clearInterval(el._decode.t); node.textContent = el._decode.word; }
        const word = node.textContent;
        let f = 0;
        const st = (el._decode = { word, t: setInterval(() => {
          f++;
          node.textContent = [...word].map((c, i) => (c === " " || i < f / 1.4 ? c : GL2[(Math.random() * 26) | 0])).join("");
          if (f / 1.4 >= word.length) { clearInterval(st.t); node.textContent = word; el._decode = null; }
        }, 32) });
      };
      Stage.onChapter.push((cur, prev) => {
        if (prev === undefined) return;
        const d = cur > prev ? 1 : -1;
        gsap.killTweensOf(sweep);
        gsap.timeline()
          .set(sweep, { opacity: 1, scaleX: 0, transformOrigin: d > 0 ? "0% 50%" : "100% 50%" })
          .to(sweep, { scaleX: 1, duration: 0.55, ease: "power3.inOut" })
          .set(sweep, { transformOrigin: d > 0 ? "100% 50%" : "0% 50%" })
          .to(sweep, { scaleX: 0, duration: 0.55, ease: "power3.inOut" })
          .set(sweep, { opacity: 0 });
        const eb = cur > 0 ? $(".eyebrow", Stage.sections[cur]) : null;
        if (eb) decode(eb);
      });

      // Hovering a main button sends a surge through the stars
      $$(".hero__cta .btn, .contact__actions .btn, .header-cta, .w3d__open").forEach((b) => {
        b.addEventListener("pointerenter", () => { World.surge = Math.max(World.surge, 0.55); World.pulse = Math.max(World.pulse, 0.5); });
      });

      // The "Simple view" switch hides itself on phones once you leave the hero
      const sw = $(".hud__motion");
      if (sw && Stage.narrow) Stage.ticks.push(() => { sw.style.opacity = Stage.o[0].toFixed(2); sw.style.pointerEvents = Stage.o[0] > 0.5 ? "auto" : "none"; });

      if (touch) return;

      // A soft light follows the pointer
      const glow = document.createElement("div");
      glow.className = "cglow";
      glow.setAttribute("aria-hidden", "true");
      document.body.appendChild(glow);
      let gx = innerWidth / 2, gy = innerHeight / 2, gtx = gx, gty = gy, seen = false;
      window.addEventListener("pointermove", (e) => {
        gtx = e.clientX; gty = e.clientY;
        if (!seen) { seen = true; gx = gtx; gy = gty; glow.style.opacity = 1; }
      }, { passive: true });
      document.addEventListener("pointerleave", () => { glow.style.opacity = 0; seen = false; });
      Stage.ticks.push((ctx) => {
        const a = Math.min(1, ctx.dt * 6);
        gx += (gtx - gx) * a; gy += (gty - gy) * a;
        glow.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0) translate(-50%,-50%)`;
      });

      // Glass panels light up under the pointer
      $$(".path li, .contact__panel").forEach((el) => {
        el.classList.add("spot");
        el.addEventListener("pointermove", (e) => {
          const r = el.getBoundingClientRect();
          el.style.setProperty("--sx", (e.clientX - r.left).toFixed(0) + "px");
          el.style.setProperty("--sy", (e.clientY - r.top).toFixed(0) + "px");
          el.style.setProperty("--lit", 1);
        });
        el.addEventListener("pointerleave", () => el.style.setProperty("--lit", 0));
      });

      // Buttons lean toward the pointer
      $$(".btn--lg, .header-cta, .w3d__nav, .contact__actions .btn").forEach((btn) => {
        const mx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
        const my = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
        btn.addEventListener("pointermove", (e) => {
          const r = btn.getBoundingClientRect();
          btn._mag = true;
          mx((e.clientX - (r.left + r.width / 2)) * 0.3);
          my((e.clientY - (r.top + r.height / 2)) * 0.4);
        });
        btn.addEventListener("pointerleave", () => { btn._mag = false; mx(0); my(0); });
      });

      // Menu links scramble their letters
      const GL = "abcdefghijklmnopqrstuvwxyz";
      $$(".nav__list a").forEach((a) => {
        const node = [...a.childNodes].reverse().find((n) => n.nodeType === 3);
        if (!node) return;
        const word = node.textContent;
        let timer;
        a.addEventListener("pointerenter", () => {
          clearInterval(timer);
          let f = 0;
          timer = setInterval(() => {
            f++;
            node.textContent = [...word].map((c, i) => (i < f / 2 ? c : GL[(Math.random() * 26) | 0])).join("");
            if (f / 2 >= word.length) { clearInterval(timer); node.textContent = word; }
          }, 38);
        });
      });

      // Buttons ripple their letters
      $$(".hero__cta .btn, .contact__actions .btn--primary, .w3d__open").forEach((b) => {
        const tn = [...b.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
        if (!tn) return;
        const holder = document.createElement("span");
        holder.className = "wave";
        tn.replaceWith(holder);
        holder.append(...[...tn.textContent.trim()].map((c) => { const s = document.createElement("span"); s.textContent = c === " " ? " " : c; return s; }));
        b.addEventListener("pointerenter", () => gsap.fromTo(holder.children, { y: 0 }, { y: -5, duration: 0.2, ease: "power2.out", stagger: { each: 0.025, yoyo: true, repeat: 1 }, overwrite: true }));
      });

      // Panels tilt toward the pointer
      const panel = $(".contact__panel");
      if (panel) {
        const rx = gsap.quickTo(panel, "rotationX", { duration: 0.8, ease: "power3" }), ry = gsap.quickTo(panel, "rotationY", { duration: 0.8, ease: "power3" });
        gsap.set(panel, { transformPerspective: 1100 });
        panel.addEventListener("pointermove", (e) => {
          const r = panel.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 6);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 5);
        });
        panel.addEventListener("pointerleave", () => { rx(0); ry(0); });
      }
    }
  });
})();
