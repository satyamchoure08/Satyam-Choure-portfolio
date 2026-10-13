/* ==========================================================================
   Stage, part 1: turns the page into five full-screen chapters on a long scroll.
   The real HTML stays in place (so it still reads well without 3D); this file
   lays it out as layers over the 3D canvas and drives it from the scroll position.
   Part 2 (stage2.js) animates each chapter's own content.
   ========================================================================== */
(() => {
  "use strict";
  const root = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const touch = matchMedia("(hover: none)").matches;
  const LABELS = ["Intro", "Work", "About", "Skills", "Contact"];

  const Stage = (window.Stage = {
    clamp, smooth, $, $$, touch,
    world: null,
    sections: [],
    items: [],
    skills: [],
    chapters: [],
    inits: [],      // chapter setup functions registered by stage2.js
    ticks: [],      // per-frame DOM updaters
    vh: innerHeight,
    vw: innerWidth,
    narrow: false,
    maxY: 1,
    tween: null
  });

  /* Read the content that the 3D world needs out of the HTML ----------------- */
  function collect() {
    Stage.items = $$(".cards .card").map((card, i) => {
      const link = $(".card__link", card), img = $("img", card), src = $("source", card);
      let webp = src ? src.getAttribute("srcset").split(" ")[0] : null;
      let jpg = img ? img.getAttribute("src") : null;
      if (!img && card.dataset.shot) { webp = card.dataset.shot + ".webp"; jpg = card.dataset.shot + ".jpg"; }
      return {
        i, webp, jpg, card,
        group: card.closest(".cards--samples") ? 0 : 1,
        title: $(".card__title", card).textContent.replace(/\(opens in a new tab\)/, "").trim(),
        kind: ($(".card__idx", card) || {}).textContent || "",
        text: ($(".card__text", card) || {}).textContent.trim(),
        tags: $$(".tags li", card).map((li) => li.textContent.trim()),
        href: link ? link.getAttribute("href") : null,
        external: !!(link && link.target === "_blank"),
        soon: card.classList.contains("card--soon")
      };
    });
    Stage.groups = $$(".work-group").map((h) => ({ name: $("span", h).textContent, note: $("small", h).textContent }));
    Stage.skills = $$(".skill").map((li) => {
      const d = $(".skill__desc", li), tag = $(".skill__tag", li);
      return {
        idx: $(".skill__idx", li).textContent.trim(),
        name: $(".skill__name", li).textContent.trim(),
        desc: d.firstChild.textContent.trim(),
        tag: tag ? tag.textContent.trim() : "",
        color: getComputedStyle(li).getPropertyValue("--c").trim() || "#7a4bff"
      };
    });
  }

  /* Move a few things so each chapter is one self-contained layer --------------- */
  function prepare() {
    Stage.sections = ["top", "work", "about", "skills", "contact"].map((id) => document.getElementById(id));
    const [hero, , , , contact] = Stage.sections;
    const mq = $(".marquee");
    if (mq) hero.appendChild(mq);
    const ft = $(".site-footer");
    if (ft) contact.appendChild(ft);
    const space = document.createElement("div");
    space.className = "scroll-space";
    space.setAttribute("aria-hidden", "true");
    document.body.appendChild(space);
    Stage.space = space;

    // giant outlined words that drift behind each chapter
    ["", "WORK", "ABOUT", "SKILLS", "HELLO"].forEach((word, i) => {
      if (!word) return;
      const el = document.createElement("div");
      el.className = "bgword";
      el.setAttribute("aria-hidden", "true");
      el.textContent = word;
      Stage.sections[i].prepend(el);
      Stage["bg" + i] = el;
    });
  }

  /* How much scroll each chapter gets. The work chapter scales with the number of projects. */
  function layout() {
    const vh = Stage.vh, n = Stage.items.length, W = Stage.world;
    Stage.narrow = Stage.vw < 900 || Stage.vw / vh < 1.05;
    const per = (Stage.narrow ? 0.4 : 0.48) * vh;
    const lens = [1.25 * vh, (per * (n - 1)) / (W.P1 - W.P0), 2.7 * vh, 2.9 * vh, 1.5 * vh];
    let y = 0;
    Stage.chapters = lens.map((len) => { const c = { start: y, len, end: y + len }; y += len; return c; });
    Stage.maxY = y;
    Stage.space.style.height = y + vh + "px";
    W.setChapters(Stage.chapters);
    // On phones the project card sits between the heading and the info panel; tell the 3D ring where
    const rem = (Stage.rem = parseFloat(getComputedStyle(root).fontSize) || 16);
    if (Stage.narrow) {
      const top = 76 + 12 + 1.9 * rem + 12, bottom = vh - 18 - 21 * rem;
      W.slot = { cy: (top + bottom) / 2, h: Math.max(80, bottom - top) };
    } else W.slot = null;
  }

  /* Scrolling helpers --------------------------------------------------------- */
  Stage.chapterY = (i, f = 0.02) => { const c = Stage.chapters[i]; return c.start + c.len * f; };
  Stage.scrollToY = (y, dur) => {
    y = clamp(y, 0, Stage.maxY);
    const from = window.scrollY, dist = Math.abs(y - from);
    if (dist < 2) return;
    if (Stage.tween) Stage.tween.kill();
    const o = { y: from };
    const d = dur || clamp(0.8 + (dist / Stage.vh) * 0.2, 0.9, 3.4);
    Stage.world.boost = clamp(dist / (Stage.vh * 7), 0.12, 0.95);
    Stage.tween = gsap.to(o, {
      y, duration: d, ease: "power3.inOut",
      onUpdate: () => window.scrollTo(0, o.y),
      onComplete: () => { Stage.tween = null; Stage.world.boost = 0; }
    });
  };
  const stopTween = () => {
    if (Stage.tween) { Stage.tween.kill(); Stage.tween = null; Stage.world.boost = 0; }
  };
  ["wheel", "touchstart", "mousedown", "keydown"].forEach((e) => window.addEventListener(e, stopTween, { passive: true }));

  // Settle on a whole step when you stop scrolling inside a stepped chapter
  Stage.snapper = (chapter, q0, q1, count) => {
    let timer, down = false;
    window.addEventListener("touchstart", () => { down = true; }, { passive: true });
    window.addEventListener("touchend", () => { down = false; }, { passive: true });
    window.addEventListener("scroll", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (down || Stage.tween) return;
        const c = Stage.chapters[chapter], p = (window.scrollY - c.start) / c.len;
        if (p < 0 || p > q1 + 0.012) return;
        const k = Math.round(clamp((p - q0) / (q1 - q0), 0, 1) * (count - 1));
        const ty = c.start + (q0 + (k / (count - 1)) * (q1 - q0)) * c.len;
        if (Math.abs(ty - window.scrollY) > 3) Stage.scrollToY(ty, 0.7);
      }, 170);
    }, { passive: true });
    return (k) => Stage.scrollToY(Stage.chapters[chapter].start + (q0 + (clamp(k, 0, count - 1) / (count - 1)) * (q1 - q0)) * Stage.chapters[chapter].len, 0.9);
  };

  /* Page chrome: section dots, progress line, scroll hint, simple-view switch ---- */
  function chrome() {
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const hud = document.createElement("div");
    hud.className = "hud";
    hud.innerHTML =
      '<nav class="dots" aria-label="Sections">' +
      LABELS.map((l, i) => `<button type="button" class="dots__b" data-go="${i}" aria-label="${l}"><span class="dots__l">${l}</span><i></i></button>`).join("") +
      "</nav>" +
      '<div class="hint" aria-hidden="true"><span>Scroll</span><i></i></div>' +
      '<button type="button" class="hud__motion" data-simple>Simple view</button>';
    document.body.appendChild(hud);
    Stage.dots = $$(".dots__b", hud);
    Stage.dotsEl = $(".dots", hud);
    Stage.hint = $(".hint", hud);
    Stage.bar = bar;
    hud.addEventListener("click", (e) => {
      const b = e.target.closest(".dots__b");
      if (b) Stage.go(+b.dataset.go);
      if (e.target.closest("[data-simple]")) { try { localStorage.setItem("motion", "off"); } catch (err) { /* ignore */ } location.reload(); }
    });
  }

  Stage.go = (i) => Stage.scrollToY(i === 0 ? 0 : Stage.chapterY(i, i === 1 ? 0.005 : 0.03));

  // In-page links glide through the 3D world instead of jumping
  function links() {
    const map = { "#top": 0, "#work": 1, "#about": 2, "#skills": 3, "#contact": 4 };
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"], .to-top');
      if (!a) return;
      const h = a.getAttribute && a.getAttribute("href");
      if (a.classList.contains("to-top") || h === "#top") { e.preventDefault(); Stage.go(0); return; }
      if (h in map) { e.preventDefault(); Stage.go(map[h]); }
    });
    const hash = location.hash;
    if (hash in map && map[hash] > 0) setTimeout(() => window.scrollTo(0, Stage.chapterY(map[hash], 0.03)), 60);
  }

  /* Per-frame work shared by every chapter ---------------------------------- */
  function onTick(ctx) {
    const p = ctx.p, y = window.scrollY;
    const o = [
      1 - smooth(0.42, 0.7, p[0]),
      smooth(0, 0.025, p[1]) * (1 - smooth(0.9, 0.95, p[1])),
      smooth(0, 0.03, p[2]) * (1 - smooth(0.72, 0.78, p[2])),
      smooth(0, 0.03, p[3]) * (1 - smooth(0.72, 0.78, p[3])),
      smooth(0, 0.04, p[4])
    ];
    Stage.o = o;
    let cur = 0;
    o.forEach((v, i) => {
      const s = Stage.sections[i];
      s.style.opacity = v.toFixed(3);
      const live = v > 0.01, act = v > 0.6;
      if (s._live !== live) { s._live = live; s.classList.toggle("is-live", live); }
      if (s._act !== act) { s._act = act; s.classList.toggle("is-active", act); }
      if (v > o[cur]) cur = i;
    });
    if (Stage.cur !== cur) {
      Stage.cur = cur;
      Stage.dots.forEach((d, i) => d.classList.toggle("is-on", i === cur));
      $$(".nav__list a").forEach((a) => {
        const on = a.getAttribute("href") === ["#top", "#work", "#about", "#skills", "#contact"][cur] && cur > 0;
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
    }
    Stage.dotsEl.style.opacity = Math.max(smooth(0.04, 0.22, p[0]), cur > 0 ? 1 : 0).toFixed(3);
    Stage.bar.style.transform = `scaleX(${clamp(y / Stage.maxY, 0, 1).toFixed(4)})`;
    Stage.hint.style.opacity = (1 - smooth(0, 0.08, p[0])) * smooth(0, 1, World_intro());
    const header = $("[data-header]"), top = $("#topBtn");
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (top) top.classList.toggle("is-visible", y > Stage.vh * 0.8 && Stage.cur < 4);
    Stage.ticks.forEach((fn) => fn(ctx, p, o));
  }
  const World_intro = () => (Stage.world ? Stage.world.intro : 0);

  function resize() {
    const w = innerWidth, h = innerHeight;
    const big = Math.abs(h - Stage.vh) > 140 || w !== Stage.vw || !touch;
    if (!big) return;
    Stage.vw = w; Stage.vh = h;
    layout();
    Stage.world.resize();
    Stage.inits.forEach((f) => f.resize && f.resize());
  }

  /* Start everything ---------------------------------------------------------- */
  Stage.start = async () => {
    const World = (Stage.world = window.World);
    collect();
    prepare();
    chrome();
    layout();
    const portrait = $(".portrait__frame");
    World.getPortraitRect = () => (portrait ? portrait.getBoundingClientRect() : null);
    const img = $(".portrait__frame source");
    await World.init({
      canvas: $("#gl"),
      mobile: touch || innerWidth < 760,
      portrait: { webp: img ? img.getAttribute("srcset").split(" ")[2] || "assets/img/satyam-860.webp" : "assets/img/satyam-860.webp", jpg: "assets/img/satyam-860.jpg" },
      items: Stage.items,
      skills: Stage.skills
    });
    Stage.inits.forEach((f) => f.build && f.build());
    World.on("tick", onTick);
    links();
    window.addEventListener("resize", resize);
    window.addEventListener("click", (e) => {
      if (e.target.closest("a, button, input, textarea, .w3d__info")) return;
      World.click(e.clientX, e.clientY);
    });
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "touch" && World.sparkle) World.sparkle(e.clientX, e.clientY);
    }, { passive: true });
    window.addEventListener("pageshow", () => root.classList.remove("is-leaving"));
    root.classList.add("stage-ready");
  };
})();
