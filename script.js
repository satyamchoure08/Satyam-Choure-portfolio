(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  // The 3D version (see choreo.js) sets this class in the <head> and drives scrolling itself.
  // A visitor who asked for less motion only gets it after choosing "Play the 3D version".
  const is3d = root.classList.contains("engine3d");
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches && !is3d;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (is3d && !window.__introGate) {
    let open;
    const promise = new Promise((resolve) => { open = resolve; });
    window.__introGate = { promise, open };
  }

  /* Footer year ----------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* Intro screen ----------------------------------------------------------- */
  // The name shows on black, then the screen lifts away and the hero animates in.
  const loader = $("[data-loader]");
  const finishIntro = () => {
    if (!root.classList.contains("is-loading")) return;
    if (loader) loader.classList.add("is-done");
    root.classList.remove("is-loading");
    window.dispatchEvent(new Event("intro:done"));
    if (loader) setTimeout(() => loader.remove(), 1200);
  };
  if (loader && !prefersReducedMotion) {
    const minimum = new Promise((resolve) => setTimeout(resolve, 1700));
    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    const gate = window.__introGate ? window.__introGate.promise : null;
    Promise.all([minimum, loaded, gate]).then(finishIntro);
    setTimeout(finishIntro, gate ? 12000 : 4000);
  } else {
    finishIntro();
  }

  /* Custom cursor ---------------------------------------------------------- */
  const cursor = $("[data-cursor]");
  if (cursor && canHover && !prefersReducedMotion) {
    root.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, raf = 0;
    const loop = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", (event) => {
      x = event.clientX;
      y = event.clientY;
      cursor.classList.add("is-on");
      if (!raf) loop();
    }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
    const label = $(".cursor__label", cursor);
    document.addEventListener("pointerover", (event) => {
      if (is3d) { cursor.classList.toggle("is-big", !!event.target.closest("a, button")); return; }
      const card = event.target.closest(".card:not(.card--soon)");
      cursor.classList.toggle("is-label", !!card);
      if (label && card) label.textContent = "Open";
      cursor.classList.toggle("is-big", !card && !!event.target.closest("a, button"));
    });
  }

  /* Mobile menu ------------------------------------------------------------ */
  const menuButton = $("[data-menu-toggle]");
  const nav = $("#primary-nav");

  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    if (!menuButton) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && root.classList.contains("menu-open")) {
        setMenu(false);
        menuButton.focus();
      }
    });
    matchMedia("(min-width: 900px)").addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  /* Header + back-to-top state -------------------------------------------- */
  const header = $("[data-header]");
  const topButton = $("#topBtn");
  let ticking = false;

  const onScroll = () => {
    if (is3d) { ticking = false; return; }
    const y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (topButton) topButton.classList.toggle("is-visible", y > 700);
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  if (topButton && !is3d) {
    topButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* Reveal on scroll ------------------------------------------------------- */
  const revealTargets = $$(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  }

  /* Active section in the nav --------------------------------------------- */
  const navLinks = $$(".nav__list a");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length && !is3d) {
    const setCurrent = (id) => {
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    };
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setCurrent(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((section) => spy.observe(section));

    // Clear the highlight when back in the hero.
    const hero = $("[data-hero]");
    if (hero) {
      new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) setCurrent("");
      }, { rootMargin: "-45% 0px -50% 0px" }).observe(hero);
    }
  }

  /* Pointer spotlight (hero + cards) -------------------------------------- */
  if (canHover && !prefersReducedMotion) {
    $$("[data-spotlight]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${event.clientX - rect.left}px`);
        card.style.setProperty("--y", `${event.clientY - rect.top}px`);
      });
    });

    const hero = $("[data-hero]");
    if (hero) {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        hero.style.setProperty("--my", `${event.clientY - rect.top}px`);
        hero.classList.add("is-lit");
      });
      hero.addEventListener("pointerleave", () => hero.classList.remove("is-lit"));
    }
  }

  /* Copy email ------------------------------------------------------------- */
  const copyStatus = $("[data-copy-status]");

  $$("[data-copy]").forEach((button) => {
    const label = $("[data-copy-label]", button);
    const original = label ? label.textContent : "";
    let timer;

    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        // Clipboard unavailable (e.g. insecure context): fall back to the mail app.
        window.location.href = `mailto:${value}`;
        return;
      }
      button.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      if (copyStatus) copyStatus.textContent = "Email address copied to clipboard";
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.classList.remove("is-copied");
        if (label) label.textContent = original;
        if (copyStatus) copyStatus.textContent = "";
      }, 2200);
    });
  });
})();
