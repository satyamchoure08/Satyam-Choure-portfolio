"use client";

import { useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";
import { BrandMark, Phone } from "./icons";

// `short` keeps the desktop bar on one line; the mobile menu has room for the full label.
const navigationLinks = [
  { href: "#how-solar-works", label: "How It Works", short: "How It Works" },
  { href: "#roof-safety", label: "Roof Safety", short: "Roof Safety" },
  { href: "#systems", label: "System Architectures", short: "Systems" },
  { href: "#components", label: "Components", short: "Components" },
  { href: "#calculator", label: "Savings Calculator", short: "Calculator" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // Shadow once the page moves + scroll progress bar (JS fallback where CSS scroll timelines are missing).
  useEffect(() => {
    const cssDrivesProgress = typeof CSS !== "undefined" && CSS.supports("animation-timeline: scroll()");
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      if (!cssDrivesProgress && progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Highlight the nav link of the section currently in the middle of the screen.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (!sections.length || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 h-[72px] border-b border-border-hairline bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-[0_8px_24px_-16px_rgba(15,23,42,0.22)]" : ""
        }`}
      >
        <div className="site-container flex h-full items-center justify-between gap-4">
          {/* Brand mark (no box) + wordmark */}
          <a
            href="#top"
            className="group flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <BrandMark className="h-[26px] w-auto shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:h-[30px]" />
            <span aria-hidden="true" className="hidden h-8 w-px shrink-0 bg-border-hairline sm:block" />
            <div className="flex flex-col">
              <span className="text-[16px] font-bold tracking-tight text-heading leading-tight">
                {brand.shortName}
              </span>
              <span className="text-[11px] font-semibold text-muted tracking-wide sm:whitespace-nowrap">
                {brand.yearsInBusiness} · Jaipur, Rajasthan
              </span>
            </div>
          </a>

          {/* Desktop Navigation (hamburger below 1024px, where five links can't fit on one line) */}
          <nav aria-label="Main Navigation" className="hidden lg:block">
            <ul className="flex items-center gap-4 xl:gap-5">
              {navigationLinks.map((link) => {
                const isActive = activeId === link.href.slice(1);
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      aria-current={isActive ? "location" : undefined}
                      className={`group relative inline-block whitespace-nowrap py-1.5 text-[14px] font-semibold transition-colors duration-200 hover:text-brand ${
                        isActive ? "text-brand" : "text-body"
                      }`}
                    >
                      {link.short}
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-brand transition-[scale,opacity] duration-300 ease-out ${
                          isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-40 group-hover:scale-x-100"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Desktop Primary CTA Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href={`tel:${brand.phone}`}
              className="group hidden items-center gap-1.5 whitespace-nowrap text-[13px] font-bold text-heading transition-colors hover:text-brand xl:inline-flex"
            >
              <Phone width={15} height={15} className="text-muted transition-colors group-hover:text-brand group-hover:[animation:ring-wiggle_0.6s_ease-in-out]" />
              {brand.phone}
            </a>
            <a href="#contact" className="btn-primary text-[14px] font-bold">
              Instant Spec RFQ
            </a>
          </div>

          {/* Hamburger Toggle (visible below 1024px) */}
          <button
            type="button"
            className="-mr-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border-hairline bg-white/90 text-heading transition-colors hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="mobile-nav-dropdown"
            onClick={() => setOpen((prev) => !prev)}
          >
            {/* Three bars that turn into an X */}
            <span aria-hidden="true" className={`menu-morph ${open ? "is-open" : ""}`}>
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {/* Reading progress (sun → grid colours) */}
        <div
          ref={progressRef}
          aria-hidden="true"
          className="scroll-progress pointer-events-none absolute inset-x-0 -bottom-px h-[2px] bg-linear-to-r from-amber-400 via-brand to-brand"
        />
      </header>

      {/* Mobile Floating Dropdown (Compact, Semi-Transparent, Does NOT hide the page) */}
      {/* Always mounted so it can animate out as well as in */}
      <>
          {/* Subtle transparent overlay to close on outside tap */}
          <div
            className={`fixed inset-0 top-[72px] z-40 bg-slate-900/15 backdrop-blur-[2px] transition-[opacity,visibility] duration-300 lg:hidden ${
              open ? "visible opacity-100" : "invisible opacity-0"
            }`}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Compact Floating Card */}
          <div
            id="mobile-nav-dropdown"
            inert={!open}
            className={`fixed top-[78px] inset-x-3.5 max-w-md mx-auto z-50 origin-top transition-[opacity,translate,scale,visibility] duration-300 ease-out lg:hidden ${
              open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-2 scale-[0.98] opacity-0"
            }`}
          >
            <div className="rounded-2xl border border-slate-200/90 bg-white/95 backdrop-blur-xl p-4 shadow-xl ring-1 ring-black/5">
              <nav aria-label="Mobile Navigation">
                <ul className="flex flex-col space-y-1">
                  {navigationLinks.map((link, i) => (
                    <li
                      key={link.href}
                      className={`transition-[opacity,translate] duration-300 ease-out ${open ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"}`}
                      style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }}
                    >
                      <a
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-[15px] font-semibold text-heading transition-colors hover:bg-slate-100/70 hover:text-brand active:bg-slate-100"
                      >
                        <span>{link.label}</span>
                        <span className="text-muted text-xs transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand">→</span>
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
                  <a
                    href={`tel:${brand.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 text-[13px] font-bold text-heading hover:bg-slate-100 transition-colors"
                  >
                    <Phone width={15} height={15} className="text-muted" />
                    Call: {brand.phone}
                  </a>
                  <a
                    href="#contact"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full text-center py-2.5 text-[14px] font-bold shadow-xs"
                  >
                    Get Instant Spec RFQ
                  </a>
                </div>
              </nav>
            </div>
          </div>
      </>
    </>
  );
}
