(() => {
  "use strict";

  /* Scroll animations. Needs GSAP + ScrollTrigger (assets/vendor).
     Skipped for visitors who ask their device to reduce motion; the page
     then uses the simple fade-ins from script.js and style.css. */
  const root = document.documentElement;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.gsap || !window.ScrollTrigger) return;

  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  gsap.registerPlugin(ScrollTrigger);
  root.classList.add("gsap-on");

  /* Split a heading into words so each one can rise out of a mask ---------- */
  const splitWords = (el) => {
    const walk = (node, gradient) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const mask = document.createElement("span");
            mask.className = "w";
            mask.setAttribute("aria-hidden", "true");
            const word = document.createElement("span");
            word.className = "wi" + (gradient ? " is-grad" : "");
            word.textContent = part;
            mask.appendChild(word);
            frag.appendChild(mask);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child, gradient || child.tagName === "EM");
        }
      });
    };
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walk(el, false);
    return $$(".wi", el);
  };

  $$(".section__title, .contact__title, .about__lead").forEach((el) => {
    const words = splitWords(el);
    gsap.set(words, { yPercent: 118, rotate: 5, transformOrigin: "0% 100%" });
    ScrollTrigger.create({
      trigger: el,
      start: "top 90%",
      once: true,
      onEnter: () => gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.15, ease: "power4.out", stagger: 0.07 }),
    });
  });

  /* Small text blocks glide up as they arrive ------------------------------ */
  $$(".eyebrow, .section__intro, .about__text, .contact__lead, .contact__actions, .socials, .work-group").forEach((el) => {
    gsap.set(el, { y: 34, opacity: 0 });
    ScrollTrigger.create({
      trigger: el,
      start: "top 92%",
      once: true,
      onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.12 }),
    });
  });

  /* Hero: entrance after the intro screen, then it drifts away on scroll --- */
  const heroIn = () => {
    const frame = $(".portrait__frame");
    const img = $(".portrait__frame img");
    const chip = $(".chip");
    if (frame) {
      gsap.fromTo(frame,
        { clipPath: "inset(100% 0% 0% 0% round 999px 999px 36px 36px)" },
        { clipPath: "inset(0% 0% 0% 0% round 999px 999px 36px 36px)", duration: 1.6, ease: "power4.inOut", clearProps: "clipPath" });
    }
    if (img) gsap.fromTo(img, { scale: 1.45 }, { scale: 1, duration: 2.2, ease: "power3.out" });
    if (chip) gsap.fromTo(chip, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 1.2 });
  };
  if (root.classList.contains("is-loading")) window.addEventListener("intro:done", heroIn, { once: true });
  else heroIn();

  gsap.to(".hero__copy", {
    yPercent: -12, opacity: 0.1, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 15%", scrub: true },
  });
  gsap.to(".portrait__frame", {
    yPercent: -7, scale: 0.84, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* Marquee band: drifts on its own and speeds up with your scroll --------- */
  const track = $(".marquee__track");
  if (track) {
    track.innerHTML += track.innerHTML;
    let x = 0;
    let boost = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => { boost = gsap.utils.clamp(-60, 60, self.getVelocity() / 60); },
    });
    gsap.ticker.add(() => {
      boost *= 0.92;
      const half = track.scrollWidth / 2;
      x -= 1.1 + boost * 0.35;
      if (-x >= half) x += half;
      if (x > 0) x -= half;
      gsap.set(track, { x });
    });
  }

  /* Project cards: rise in with depth, tilt toward the pointer ------------- */
  const cards = $$(".card");
  gsap.set(cards, { y: 90, scale: 0.92, rotationX: 10, opacity: 0, transformPerspective: 900 });
  ScrollTrigger.batch(cards, {
    start: "top 94%",
    once: true,
    onEnter: (batch) => gsap.to(batch, { y: 0, scale: 1, rotationX: 0, opacity: 1, duration: 1.1, ease: "power3.out", stagger: 0.1 }),
  });

  $$(".cover--shot img").forEach((img) => {
    gsap.fromTo(img, { yPercent: -7, scale: 1.14 }, {
      yPercent: 7, ease: "none",
      scrollTrigger: { trigger: img.closest(".cover"), start: "top bottom", end: "bottom top", scrub: true },
    });
  });

  /* About rows slide in; skill pills fly up as you scroll ------------------ */
  const rows = $$(".path li");
  if (rows.length) {
    gsap.from(rows, {
      x: 90, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.14,
      scrollTrigger: { trigger: ".path", start: "top 88%", once: true },
    });
  }

  const skills = $$(".skill");
  skills.forEach((skill, i) => {
    gsap.set(skill, { transformPerspective: 900 });
    gsap.fromTo(skill,
      { y: 150, rotate: i % 2 ? 5 : -5, scale: 0.86, opacity: 0 },
      { y: 0, rotate: 0, scale: 1, opacity: 1, ease: "none",
        scrollTrigger: { trigger: skill, start: "top 108%", end: "top 68%", scrub: 0.7 } });
  });

  /* Contact panel grows into place ----------------------------------------- */
  const panel = $(".contact__panel");
  if (panel) {
    gsap.fromTo(panel, { scale: 0.86, y: 70, borderRadius: 90 }, {
      scale: 1, y: 0, borderRadius: 44, ease: "none",
      scrollTrigger: { trigger: panel, start: "top 112%", end: "top 38%", scrub: 0.6 },
    });
  }

  /* Pointer effects (mouse only) ------------------------------------------- */
  if (fine) {
    $$(".card:not(.card--soon), .skill").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      const ty = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (event) => {
        const box = el.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width - 0.5;
        const py = (event.clientY - box.top) / box.height - 0.5;
        ry(px * 9);
        rx(-py * 9);
        ty(-7);
      });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); ty(0); });
    });

    // Buttons lean toward the pointer.
    $$(".btn--lg, .header-cta").forEach((btn) => {
      const mx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
      const my = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
      btn.addEventListener("pointermove", (event) => {
        const box = btn.getBoundingClientRect();
        mx((event.clientX - (box.left + box.width / 2)) * 0.28);
        my((event.clientY - (box.top + box.height / 2)) * 0.4);
      });
      btn.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  /* Menu: one white pill slides to the section you are in ------------------ */
  const list = $(".nav__list");
  if (list) {
    const pill = document.createElement("li");
    pill.className = "nav__pill";
    pill.setAttribute("aria-hidden", "true");
    list.prepend(pill);
    gsap.set(pill, { opacity: 0 });
    const move = () => {
      const current = $('a[aria-current="true"]', list);
      if (!current) { gsap.to(pill, { opacity: 0, duration: 0.3 }); return; }
      gsap.to(pill, { opacity: 1, x: current.offsetLeft, width: current.offsetWidth, duration: 0.65, ease: "power3.out" });
    };
    new MutationObserver(move).observe(list, { attributes: true, subtree: true, attributeFilter: ["aria-current"] });
  }

  /* Thin progress line at the top of the page ------------------------------ */
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  gsap.to(bar, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
