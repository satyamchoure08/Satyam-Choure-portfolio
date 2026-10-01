(() => {
  "use strict";

  const root = document.documentElement;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Footer year ----------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* Theme ------------------------------------------------------------------ */
  // The initial theme is set by an inline script in <head> to avoid a flash.
  const themeButton = $("[data-theme-toggle]");
  const themeMeta = $('meta[name="theme-color"]');
  const themeColors = { dark: "#0B0B0C", light: "#F6F3EC" };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    if (themeMeta) themeMeta.setAttribute("content", themeColors[theme]);
    if (themeButton) {
      themeButton.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  };

  const savedTheme = () => {
    try {
      const value = localStorage.getItem("theme");
      return value === "light" || value === "dark" ? value : null;
    } catch {
      return null;
    }
  };

  applyTheme(root.dataset.theme === "light" ? "light" : "dark");

  if (themeButton) {
    themeButton.addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch { /* storage unavailable */ }
    });
  }

  // Follow the OS setting until the visitor picks a theme themselves.
  matchMedia("(prefers-color-scheme: light)").addEventListener("change", (event) => {
    if (!savedTheme()) applyTheme(event.matches ? "light" : "dark");
  });

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

  if (topButton) {
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

  if ("IntersectionObserver" in window && sections.length) {
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
