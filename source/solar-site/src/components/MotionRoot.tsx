"use client";

import { useEffect } from "react";

const SELECTOR = "[data-reveal],[data-reveal-stagger]";

/**
 * One scroll-reveal engine for the whole page (mounted once in layout).
 *
 * Mark any element with `data-reveal` (fades up as one block) or
 * `data-reveal-stagger` (its children cascade in). This sets `data-revealed`
 * when the element scrolls into view; the CSS in globals.css does the rest.
 *
 * Safe by default: nothing is hidden until this runs, anything already on
 * screen is shown without animation, and reduced-motion users get no motion.
 */
export default function MotionRoot() {
  useEffect(() => {
    const root = document.documentElement;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion || typeof IntersectionObserver === "undefined") {
      elements.forEach((el) => el.setAttribute("data-revealed", "instant"));
      return;
    }

    // Whatever the visitor can already see stays put (no flash, no re-animation).
    const viewportHeight = window.innerHeight;
    for (const el of elements) {
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight * 0.92 && rect.bottom > 0) {
        el.setAttribute("data-revealed", "instant");
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-revealed", "");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 }
    );

    const watch = (el: Element) => {
      if (!el.hasAttribute("data-revealed")) observer.observe(el);
    };
    elements.forEach(watch);
    root.setAttribute("data-motion", "");

    // Content that mounts later (tab switches, keyed panels) gets revealed too.
    const mutations = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches(SELECTOR)) watch(node);
          node.querySelectorAll(SELECTOR).forEach(watch);
        });
      }
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
      root.removeAttribute("data-motion");
    };
  }, []);

  return null;
}
