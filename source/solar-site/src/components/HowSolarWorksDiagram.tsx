"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import { visuals, type VisualKey } from "@/config/visuals";
import { Pause, Play } from "./icons";

interface FlowNode {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  role: string;
  spec: string;
  visual: VisualKey;
}

const flowNodes: FlowNode[] = [
  {
    id: "sunlight",
    number: "01",
    title: "High-Efficiency PV Panels",
    subtitle: "Terrace Rooftop Array",
    role: "Absorbs sunlight photons and generates clean Direct Current (DC) electricity.",
    spec: "550W+ Bi-facial TopCon (22.4% Module Efficiency)",
    visual: "sunPanels",
  },
  {
    id: "dcbox",
    number: "02",
    title: "DC Protection & Isolator",
    subtitle: "Surge Protection Box (DCDB)",
    role: "Shields your electronics against high-voltage lightning surges and spikes.",
    spec: "Type-II Surge Protection Devices (SPD) + 1000V DC Fuses",
    visual: "dcProtection",
  },
  {
    id: "inverter",
    number: "03",
    title: "Smart Solar Inverter",
    subtitle: "The System's Brain",
    role: "Instantly converts raw DC power into synchronized 230V/415V AC power.",
    spec: "98.6% Peak Efficiency · Pure Sine Wave · IoT Mobile Monitoring",
    visual: "inverter",
  },
  {
    id: "appliances",
    number: "04",
    title: "Home & Factory Loads",
    subtitle: "Priority Self-Consumption",
    role: "Runs your ACs, lights, refrigerators, and heavy machines at zero electricity cost.",
    spec: "Instant Priority Power: Draws solar first, zero grid units billed",
    visual: "homeLoads",
  },
  {
    id: "netmeter",
    number: "05",
    title: "Bi-Directional Net Meter",
    subtitle: "DISCOM Smart Meter",
    role: "Records every extra unit sent to the grid and subtracts it from your monthly bill.",
    spec: "Dual-Register: Export Credits Recorded 24x7",
    visual: "netMeter",
  },
  {
    id: "grid",
    number: "06",
    title: "Utility Grid & DBT Credit",
    subtitle: "DISCOM & Govt. Subsidy",
    role: "Acts as virtual battery: exports earn credits + ₹78,000 direct bank subsidy.",
    spec: "PM Surya Ghar Approved · Direct Bank Transfer (DBT)",
    visual: "utilityGrid",
  },
];

/** How long the auto-tour stays on each stage, and how long one stage-to-stage glide takes. */
const STAGE_MS = 5200;
const GLIDE_MS = 750;
const LAST = flowNodes.length - 1;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function HowSolarWorksDiagram() {
  // `pos` is a continuous position on the 01→06 scale (0…5). Photos, rail and dots all
  // follow it, so dragging the slider or running the tour blends smoothly between stages.
  const [pos, setPos] = useState(0);
  const [gliding, setGliding] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tourOn, setTourOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);

  const posRef = useRef(0);
  const frameRef = useRef(0);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Only tour while the diagram is actually on screen.
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  const place = (value: number) => {
    posRef.current = value;
    setPos(value);
  };

  /** Glide the slider (and everything tied to it) to a stage. */
  const glideTo = (target: number) => {
    cancelAnimationFrame(frameRef.current);
    const from = posRef.current;
    const distance = Math.abs(target - from);
    if (reducedMotion || distance < 0.001) {
      place(target);
      setGliding(false);
      return;
    }
    const duration = Math.min(1400, GLIDE_MS * Math.max(0.6, Math.sqrt(distance)));
    const start = performance.now();
    setGliding(true);
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      place(from + (target - from) * easeInOut(t));
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else setGliding(false);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const activeIndex = Math.round(pos);
  const active = flowNodes[activeIndex];
  const touring = tourOn && !reducedMotion;
  const running = touring && inView && !hovering && !focused && !dragging;

  // A visitor choosing a stage takes over from the tour.
  const selectStage = (index: number) => {
    setTourOn(false);
    glideTo(index);
  };
  const advanceTour = () => glideTo(activeIndex === LAST ? 0 : activeIndex + 1);

  const toggleTour = () => {
    if (tourOn) {
      setTourOn(false);
      return;
    }
    setTourOn(true);
    glideTo(activeIndex === LAST ? 0 : activeIndex + 1);
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = activeIndex === LAST ? 0 : activeIndex + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = activeIndex === 0 ? LAST : activeIndex - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LAST;
    if (next === null) return;
    e.preventDefault();
    selectStage(next);
    tabRefs.current[next]?.focus();
  };

  // Slider: free drag while held, then settles on the nearest stage.
  const onSliderInput = (value: number) => {
    cancelAnimationFrame(frameRef.current);
    setGliding(false);
    setTourOn(false);
    setDragging(true);
    place(value);
  };
  const settleSlider = () => {
    setDragging(false);
    glideTo(Math.round(posRef.current));
  };
  const onSliderKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(LAST, activeIndex + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, activeIndex - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = LAST;
    if (next === null) return;
    e.preventDefault();
    selectStage(next);
  };

  const fillPercent = (pos / LAST) * 100;

  return (
    <section id="how-solar-works" className="site-section bg-subtle">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-eyebrow">
            Visual Architecture
          </span>
          <h2 className="t-h2 mt-3">
            How Rooftop Solar Generates & Exports Power
          </h2>
          <p className="t-body mx-auto mt-2 text-[15px]">
            Zero confusion. Slide through the stages below to see exactly what happens from rooftop photon absorption to direct bank subsidy.
          </p>
        </div>

        {/* Interactive Schematic Diagram Canvas */}
        <div
          ref={canvasRef}
          data-reveal
          className="mt-10 rounded-2xl border border-border-hairline bg-white p-5 shadow-xs sm:p-8"
        >
          {/* Tour control */}
          {!reducedMotion && (
            <div className="mb-4 flex items-center justify-end">
              <button
                type="button"
                onClick={toggleTour}
                aria-pressed={tourOn}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border-hairline bg-white px-3 py-1 text-[12px] font-semibold text-muted transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <span key={tourOn ? "pause" : "play"} className="anim-icon inline-flex">
                  {tourOn ? <Pause width={12} height={12} /> : <Play width={12} height={12} />}
                </span>
                {tourOn ? "Pause tour" : "Play tour"}
              </button>
            </div>
          )}

          {/* Power rail (desktop): current flows from the panels to the grid */}
          <div aria-hidden="true" className="relative mb-4 hidden h-4 lg:block">
            <div
              className="flow-track absolute top-1/2 h-[3px] -translate-y-1/2"
              style={{ left: "calc((100% - 2.5rem) / 12)", right: "calc((100% - 2.5rem) / 12)" }}
            >
              <div className="absolute inset-y-0 left-0 rounded-full bg-brand" style={{ width: `${fillPercent}%` }} />
            </div>
            <div className="absolute inset-0 grid grid-cols-6 gap-2">
              {flowNodes.map((node, i) => (
                <span key={node.id} className="flex items-center justify-center">
                  <span
                    className={`h-3 w-3 rounded-full border-2 transition-[background-color,border-color,box-shadow,scale] duration-300 ${
                      i <= pos + 0.02 ? "border-brand bg-brand" : "border-slate-300 bg-white"
                    } ${i === activeIndex ? "scale-125 shadow-[0_0_0_5px_rgba(11,59,140,0.14)]" : ""}`}
                  />
                </span>
              ))}
            </div>
          </div>

          {/* Tiles + detail: the tour holds still while the visitor reads or tabs through here */}
          <div
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            onFocus={(e) => {
              if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
            }}
          >
            {/* Stage tiles: photo + step number + name */}
            <div
              role="tablist"
              aria-label="Solar power flow stages"
              onKeyDown={onTabKeyDown}
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-2"
            >
              {flowNodes.map((node, i) => {
                const isSelected = i === activeIndex;
                return (
                  <button
                    key={node.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`stage-tab-${node.id}`}
                    aria-selected={isSelected}
                    aria-controls="stage-panel"
                    tabIndex={isSelected ? 0 : -1}
                    onClick={() => selectStage(i)}
                    className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-[border-color,background-color,box-shadow,translate] duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:scale-[0.98] ${
                      isSelected
                        ? "border-brand bg-brand-tint/60 shadow-sm"
                        : "border-border-hairline bg-white hover:-translate-y-0.5 hover:border-border-hover hover:shadow-sm"
                    }`}
                  >
                    <span className="relative block aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={visuals[node.visual].src}
                        alt=""
                        fill
                        placeholder="blur"
                        sizes="(min-width: 1024px) 180px, (min-width: 640px) 30vw, 46vw"
                        className={`feather object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] ${
                          isSelected ? "scale-[1.06]" : ""
                        }`}
                      />
                      <span
                        className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold tracking-wider shadow-xs transition-colors duration-300 ${
                          isSelected ? "bg-brand text-white" : "bg-white/90 text-muted"
                        }`}
                      >
                        STEP {node.number}
                      </span>
                    </span>
                    <span className="px-3 pb-3.5 pt-1 text-[13px] font-bold leading-snug text-heading">
                      {node.title}
                    </span>

                    {/* Tour timer: when it fills, the slider glides to the next stage */}
                    {isSelected && touring && !gliding && !dragging && (
                      <span
                        key={`timer-${activeIndex}`}
                        aria-hidden="true"
                        className="step-timer absolute inset-x-0 bottom-0 h-[3px] bg-brand"
                        data-paused={running ? undefined : ""}
                        style={{ "--dur": `${STAGE_MS}ms` } as CSSProperties}
                        onAnimationEnd={advanceTour}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Active Stage Detail: photos crossfade continuously with the slider position */}
            <div
              id="stage-panel"
              role="tabpanel"
              aria-labelledby={`stage-tab-${active.id}`}
              className="mt-8 overflow-hidden rounded-xl border border-border-hairline bg-subtle"
            >
              <div className="grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[290px]">
                  {flowNodes.map((node, i) => {
                    const presence = Math.max(0, 1 - Math.abs(pos - i));
                    return (
                      <Image
                        key={node.id}
                        src={visuals[node.visual].src}
                        alt={i === activeIndex ? visuals[node.visual].alt : ""}
                        aria-hidden={i === activeIndex ? undefined : true}
                        fill
                        placeholder="blur"
                        sizes="(min-width: 768px) 480px, 100vw"
                        className="feather-b object-cover md:feather-r"
                        style={{ opacity: presence, scale: `${1.05 - presence * 0.05}` }}
                      />
                    );
                  })}
                </div>

                <div className="relative z-10 -mt-8 flex flex-col justify-center p-5 sm:p-6 md:mt-0 md:-ml-12 md:py-8 md:pr-8">
                  <div key={active.id} className="anim-swap">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-heading px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
                        STAGE {active.number}
                      </span>
                      <span className="text-[13px] font-semibold text-muted">
                        {active.subtitle}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[20px] font-bold text-heading">
                      {active.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-body">
                      {active.role}
                    </p>

                    {/* Engineering Spec Callout */}
                    <div className="mt-4 rounded-lg border border-border-hairline bg-white/90 px-4 py-3 backdrop-blur-sm">
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted">
                        Engineering Spec
                      </span>
                      <span className="mt-0.5 block text-[13px] font-bold text-brand">
                        {active.spec}
                      </span>
                    </div>
                  </div>

                  {/* Stage slider 01 → 06 (replaces the prev/next arrows) */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-muted">
                      <label htmlFor="stage-slider">Slide through the stages</label>
                      <span className="tabular text-heading">
                        {active.number} / 0{flowNodes.length}
                      </span>
                    </div>
                    <input
                      id="stage-slider"
                      type="range"
                      min={0}
                      max={LAST}
                      step={0.01}
                      value={pos}
                      className="calculator-range stage-range mt-2"
                      style={{ ["--slider-fill" as string]: `${fillPercent}%` }}
                      aria-valuetext={`Stage ${active.number}: ${active.title}`}
                      onChange={(e) => onSliderInput(Number(e.target.value))}
                      onPointerUp={settleSlider}
                      onTouchEnd={settleSlider}
                      onBlur={() => dragging && settleSlider()}
                      onKeyDown={onSliderKeyDown}
                    />
                    {/* Tick labels sit exactly under the thumb's stop positions (thumb is 22px wide) */}
                    <div className="relative mt-1 h-4">
                      {flowNodes.map((node, i) => (
                        <button
                          key={node.id}
                          type="button"
                          tabIndex={-1}
                          aria-hidden="true"
                          onClick={() => selectStage(i)}
                          style={{ left: `calc(11px + (100% - 22px) * ${i / LAST})` }}
                          className={`tabular absolute top-0 -translate-x-1/2 text-[11px] font-bold transition-colors duration-300 hover:text-brand ${
                            i === activeIndex ? "text-brand" : i < pos ? "text-heading/70" : "text-muted/70"
                          }`}
                        >
                          {node.number}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Minimal 3-Point Flow Legend */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border-hairline pt-4 text-[13px] text-muted sm:grid-cols-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span><strong>Day Generation:</strong> Direct self-consumption</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
              <span><strong>Surplus Export:</strong> Units fed to DISCOM meter</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span><strong>Night Grid:</strong> Zero rupee offset bills</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
