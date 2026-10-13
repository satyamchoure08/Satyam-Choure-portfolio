/* ==========================================================================
   Stage, part 2: the hero chapter and the Work chapter (project panel).
   ========================================================================== */
(() => {
  "use strict";
  const Stage = window.Stage;
  if (!Stage) return;
  const { $, $$, clamp, smooth } = Stage;
  const root = document.documentElement;
  const pad = (n) => String(n).padStart(2, "0");
  const ARROW = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const LEFT = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const RIGHT = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* Split text into per-letter spans (words stay together) */
  Stage.splitChars = (el) => {
    const chars = [];
    const walk = (node, grad) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const wd = document.createElement("span");
            wd.className = "wd";
            [...part].forEach((c) => {
              const ch = document.createElement("span");
              ch.className = "ch" + (grad ? " is-grad" : "");
              ch.setAttribute("aria-hidden", "true");
              ch.textContent = c;
              wd.appendChild(ch);
              chars.push(ch);
            });
            frag.appendChild(wd);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n, grad || n.tagName === "EM");
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el, false);
    return chars;
  };
  /* Split into words that rise out of a mask */
  Stage.splitWords = (el, cls = "wi") => {
    const out = [];
    const walk = (node, grad) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const m = document.createElement("span"); m.className = "w"; m.setAttribute("aria-hidden", "true");
            const w = document.createElement("span"); w.className = cls + (grad ? " is-grad" : ""); w.textContent = part;
            m.appendChild(w); frag.appendChild(m); out.push(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== "BR") walk(n, grad || n.tagName === "EM");
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el, false);
    return out;
  };

  /* ------------------------------------------------------------------------
     Hero
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const World = Stage.world, hero = Stage.sections[0];
      const spans = $$(".hero__title .line > span", hero);
      spans.forEach((s) => s.classList.remove("hero-in"));
      const chars = spans.flatMap((s) => Stage.splitChars(s));
      this.chars = chars;
      const measure = () => $$(".hero__title em", hero).forEach((em) => {
        const er = em.getBoundingClientRect();
        $$(".ch", em).forEach((c) => {
          c.style.backgroundSize = er.width + "px 100%";
          c.style.backgroundPosition = -(c.getBoundingClientRect().left - er.left) + "px 0";
        });
      });
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(measure);
      Stage.measureHero = measure;

      const pill = $(".pill", hero), lead = $(".hero__lead", hero), btns = $$(".hero__cta .btn", hero);
      const facts = $$(".facts > div", hero), chip = $(".chip", hero), mq = $(".marquee", hero);
      [pill, lead, chip].concat(btns, facts).forEach((e) => e && e.classList.remove("hero-in"));
      $$(".hero-in", hero).forEach((e) => e.classList.remove("hero-in"));
      gsap.set(chars, { yPercent: 135, rotateX: -85, opacity: 0, transformPerspective: 700, transformOrigin: "50% 100%" });
      gsap.set([pill, lead, chip].concat(btns, facts), { opacity: 0, y: 26 });
      if (mq) gsap.set(mq, { opacity: 0, yPercent: 60 });

      const play = () => {
        const tl = gsap.timeline();
        tl.to(World, { intro: 1, duration: 3.2, ease: "expo.out" }, 0)
          .to(pill, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.25)
          .to(chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 1.4, ease: "power4.out", stagger: 0.032 }, 0.4)
          .to(lead, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }, 1.05)
          .to(btns, { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.1 }, 1.25)
          .to(facts, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, 1.45)
          .to(chip, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 1.9)
          .to(mq, { opacity: 1, yPercent: 0, duration: 1.4, ease: "power3.out" }, 1.3);
      };
      if (root.classList.contains("is-loading")) window.addEventListener("intro:done", play, { once: true });
      else play();
      setTimeout(() => { if (World.intro < 0.02) { World.intro = 1; } }, 12000);

      // marquee: drifts on its own and surges with the warp
      const track = $(".marquee__track", hero);
      let x = 0;
      if (track) track.innerHTML += track.innerHTML;
      const copy = $(".hero__copy", hero), fig = $(".portrait", hero), hint = Stage.hint;
      Stage.ticks.push((ctx, p) => {
        const p0 = p[0];
        if (track) {
          const half = track.scrollWidth / 2;
          x -= (50 + ctx.warp * 1400) * ctx.dt;
          if (-x >= half) x += half;
          track.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
        }
        if (Stage.o[0] < 0.005) return;
        copy.style.transform = `translate3d(0,${(-p0 * 110).toFixed(1)}px,0) scale(${(1 + p0 * 0.07).toFixed(4)})`;
        copy.style.opacity = (1 - smooth(0.03, 0.36, p0)).toFixed(3);
        fig.style.opacity = (1 - smooth(0.02, 0.3, p0)).toFixed(3);
        if (Stage.bg0) Stage.bg0.style.transform = `translate3d(${(-p0 * 20).toFixed(1)}vw,0,0)`;
      });
      this.measure = measure;
    },
    resize() { if (Stage.measureHero) setTimeout(Stage.measureHero, 50); }
  });

  /* ------------------------------------------------------------------------
     Work: the project panel that sits next to the 3D ring
     ------------------------------------------------------------------------ */
  Stage.inits.push({
    build() {
      const World = Stage.world, items = Stage.items, n = items.length, sec = Stage.sections[1];
      const ui = document.createElement("div");
      ui.className = "w3d";
      ui.innerHTML =
        '<div class="w3d__glow" aria-hidden="true"></div>' +
        '<div class="w3d__info" aria-live="polite" aria-atomic="true">' +
        '<p class="w3d__group"><span data-g></span><small data-gn></small></p>' +
        `<div class="w3d__count" aria-hidden="true"><span class="w3d__num"><b data-count>01</b></span><i></i><span>${pad(n)}</span></div>` +
        '<h3 class="w3d__title" data-title></h3>' +
        '<p class="w3d__kind" data-kind></p>' +
        '<p class="w3d__text" data-text></p>' +
        '<ul class="w3d__tags" data-tags></ul>' +
        '<div class="w3d__actions">' +
        `<a class="btn btn--primary btn--lg w3d__open" data-open href="#"><span data-open-label>Open project</span> ${ARROW}</a>` +
        `<button type="button" class="w3d__nav" data-prev aria-label="Previous project">${LEFT}</button>` +
        `<button type="button" class="w3d__nav" data-next aria-label="Next project">${RIGHT}</button>` +
        "</div></div>" +
        '<div class="w3d__rail" role="group" aria-label="Projects">' + items.map((it, i) => `<button type="button" data-k="${i}" aria-label="${it.title}"><i></i></button>`).join("") + "</div>" +
        '<p class="w3d__hint" aria-hidden="true">Scroll to spin the ring &middot; click a card to open it</p>';
      sec.appendChild(ui);
      const q = (s) => $(s, ui);
      const el = { g: q("[data-g]"), gn: q("[data-gn]"), count: q("[data-count]"), title: q("[data-title]"), kind: q("[data-kind]"), text: q("[data-text]"), tags: q("[data-tags]"), open: q("[data-open]"), label: q("[data-open-label]"), glow: q(".w3d__glow"), info: q(".w3d__info") };
      const rail = $$(".w3d__rail button", ui);
      let cur = -1;

      const snapGo = Stage.snapper(1, World.P0, World.P1, n);
      const show = (i, instant) => {
        if (i === cur) return;
        const it = items[i], dir = i > cur ? 1 : -1, first = cur < 0;
        cur = i;
        const gi = it.group, grp = Stage.groups[gi] || { name: "", note: "" };
        if (el.g.textContent !== grp.name) { el.g.textContent = grp.name; el.gn.textContent = grp.note; }
        el.kind.textContent = it.kind;
        el.text.textContent = it.text;
        el.tags.innerHTML = it.tags.map((t) => `<li>${t}</li>`).join("");
        el.title.innerHTML = it.title.split(" ").map((w) => `<span class="w"><span class="wi">${w.replace(/&/g, "&amp;")}</span></span>`).join(" ");
        el.count.textContent = pad(i + 1);
        el.open.classList.toggle("is-off", it.soon);
        el.open.setAttribute("aria-disabled", it.soon ? "true" : "false");
        if (it.soon) { el.open.removeAttribute("href"); el.label.textContent = "In progress"; }
        else {
          el.open.setAttribute("href", it.href);
          el.label.textContent = it.group ? "Open project" : "Open the website";
          if (it.external) { el.open.target = "_blank"; el.open.rel = "noopener noreferrer"; } else { el.open.removeAttribute("target"); el.open.removeAttribute("rel"); }
        }
        rail.forEach((b, k) => { b.classList.toggle("is-on", k === i); b.classList.toggle("is-near", Math.abs(k - i) === 1); });
        if (first || instant) return;
        gsap.killTweensOf([el.kind, el.text, el.tags.children, el.open, el.count, $$(".wi", el.title)]);
        gsap.from($$(".wi", el.title), { yPercent: 115 * dir, rotate: 4 * dir, duration: 0.9, ease: "power4.out", stagger: 0.06 });
        gsap.from([el.kind, el.text], { y: 22 * dir, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.07 });
        gsap.from(el.tags.children, { y: 14, opacity: 0, scale: 0.9, duration: 0.6, ease: "back.out(1.8)", stagger: 0.05, delay: 0.1 });
        gsap.from(el.open, { y: 18, opacity: 0, duration: 0.7, ease: "power3.out", delay: 0.15 });
        gsap.from(el.count, { yPercent: 70 * dir, opacity: 0, duration: 0.6, ease: "power3.out" });
      };
      const tint = (i) => {
        const c = World.projectColors[i];
        if (c) gsap.to(ui, { "--acc": `${c[0]} ${c[1]} ${c[2]}`, duration: 0.9, ease: "power2.out", overwrite: "auto" });
      };
      ui.style.setProperty("--acc", "76 125 255");
      show(0, true);
      World.on("project", (i) => { show(i); tint(i); });
      World.on("color", (i) => { if (i === cur) tint(i); });
      World.on("goto", (i) => snapGo(i));

      const openItem = (i) => {
        const it = items[i];
        if (!it || it.soon || !it.href) return;
        if (it.external) { window.open(it.href, "_blank", "noopener"); return; }
        root.classList.add("is-leaving");
        World.boost = 1; World.pulse = 1;
        setTimeout(() => { location.href = it.href; }, 480);
      };
      World.on("open", openItem);
      ui.addEventListener("click", (e) => {
        if (e.target.closest("[data-prev]")) snapGo(cur - 1);
        else if (e.target.closest("[data-next]")) snapGo(cur + 1);
        const r = e.target.closest(".w3d__rail button");
        if (r) snapGo(+r.dataset.k);
        const o = e.target.closest("[data-open]");
        if (o && o.classList.contains("is-off")) e.preventDefault();
        else if (o && !items[cur].external && items[cur].href) { e.preventDefault(); openItem(cur); }
      });
      window.addEventListener("keydown", (e) => {
        if (Stage.cur !== 1 || e.target.closest("input, textarea, select")) return;
        if (e.key === "ArrowRight") { e.preventDefault(); snapGo(cur + 1); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); snapGo(cur - 1); }
      });
      // keyboard users tabbing through the hidden card links land on that project
      items.forEach((it, i) => {
        const a = $(".card__link", it.card);
        if (a) a.addEventListener("focus", () => snapGo(i));
      });

      // cursor label follows what you hover in 3D
      const cursor = $("[data-cursor]"), label = cursor && $(".cursor__label", cursor);
      World.on("hover", (hit) => {
        if (!cursor || !label) return;
        const on = !!hit;
        cursor.classList.toggle("is-label", on);
        if (on) label.textContent = hit.module === "skills" ? "Spin" : hit.active ? (items[hit.index].soon ? "Soon" : "Open") : "View";
      });

      const hint = q(".w3d__hint"), head = $(".section__head", sec);
      Stage.ticks.push((ctx, p) => {
        const p1 = p[1];
        if (Stage.o[1] < 0.005) return;
        const k = clamp((p1 - World.P0) / (World.P1 - World.P0), 0, 1);
        ui.style.setProperty("--k", k.toFixed(4));
        el.info.style.transform = `translate3d(0,${((1 - smooth(0, 0.03, p1)) * 60).toFixed(1)}px,0)`;
        hint.style.opacity = (1 - smooth(0.01, 0.07, p1)).toFixed(3);
        if (head) head.style.opacity = (1 - smooth(0.0, 0.06, p1) * 0.55).toFixed(3);
        if (Stage.bg1) Stage.bg1.style.transform = `translate3d(${(10 - k * 70).toFixed(1)}vw,0,0)`;
      });
    }
  });
})();
