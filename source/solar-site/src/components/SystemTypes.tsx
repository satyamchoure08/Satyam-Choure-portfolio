"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import { brand, getWhatsAppQuoteUrl } from "@/config/brand";
import { visuals, type VisualKey } from "@/config/visuals";

type SystemTypeId = "on-grid" | "hybrid" | "commercial-transformers";

interface FlowStep {
  label: string;
  visual: VisualKey;
}

interface SystemTypeInfo {
  id: SystemTypeId;
  tabLabel: string;
  badge: string;
  headline: string;
  summary: string;
  flowSteps: FlowStep[];
  bestFor: string;
  subsidy: string;
  payback: string;
}

const systemTypes: SystemTypeInfo[] = [
  {
    id: "on-grid",
    tabLabel: "1. On-Grid Solar (Most Popular)",
    badge: "90% Bill Reduction",
    headline: "On-Grid Net-Metered Solar Architecture",
    summary: "Lowest upfront cost with maximum return on investment. Excess day generation is exported to DISCOM for automatic monthly bill deductions.",
    flowSteps: [
      { label: "Panels Generate DC", visual: "sunPanels" },
      { label: "Inverter Converts to AC", visual: "inverter" },
      { label: "Powers Home First", visual: "homeLoads" },
      { label: "Net Meter Exports Excess", visual: "netMeter" },
      { label: "₹78k Bank Subsidy", visual: "subsidyCredit" },
    ],
    bestFor: "Homes, villas, and housing societies with reliable 24x7 grid power.",
    subsidy: "Up to ₹78,000 Direct Bank Transfer (PM Surya Ghar)",
    payback: "~3.0 – 3.8 Years (Highest ROI)",
  },
  {
    id: "hybrid",
    tabLabel: "2. Hybrid Solar + Battery",
    badge: "Zero Blackouts",
    headline: "Hybrid Solar with Lithium Battery Backup",
    summary: "Guarantees uninterrupted power 24 hours a day. Charges high-density LiFePO4 lithium batteries while keeping grid net-metering active.",
    flowSteps: [
      { label: "Solar Powers Home", visual: "sunPanels" },
      { label: "Charges Lithium Pack", visual: "lithiumBattery" },
      { label: "Zero-Second Switchover", visual: "switchover" },
      { label: "Night Backup", visual: "nightBackup" },
      { label: "Exports Extra Units", visual: "netMeter" },
    ],
    bestFor: "Areas with evening power cuts, hospitals, clinics, and smart homes.",
    subsidy: "Central subsidy eligible on solar modules & bi-directional inverter",
    payback: "~4.2 – 5.0 Years",
  },
  {
    id: "commercial-transformers",
    tabLabel: "3. Commercial & Solar Transformers",
    badge: "Industrial MW Scale",
    headline: "MW Solar EPC & Step-Up Inverter Transformers",
    summary: "Specialized high-tension engineering: multi-winding solar inverter transformers up to 20 MVA stepping up generated power to 11 kV / 33 kV for transmission.",
    flowSteps: [
      { label: "MW Solar Array", visual: "solarFarm" },
      { label: "Solar Inverters", visual: "inverter" },
      { label: "Step-Up Transformer (33kV)", visual: "stepUpTransformer" },
      { label: "Compact Substation", visual: "compactSubstation" },
      { label: "High-Tension Evacuation", visual: "htLines" },
    ],
    bestFor: "Solar EPC contractors, manufacturing plants, and heavy industrial facilities.",
    subsidy: "40% Accelerated Depreciation + Duty Exemptions",
    payback: "~2.8 – 3.5 Years",
  },
];

export default function SystemTypes() {
  const [activeTab, setActiveTab] = useState<SystemTypeId>("on-grid");

  const activeIndex = Math.max(0, systemTypes.findIndex((s) => s.id === activeTab));
  const currentSystem = systemTypes[activeIndex];

  const waPrompt = `Hi ${brand.shortName}, I want a spec consultation on your ${currentSystem.tabLabel} for my property.`;

  return (
    <section id="systems" className="site-section bg-white">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-eyebrow">
            Architecture Options
          </span>
          <h2 className="t-h2 mt-3">
            Choose the Right System Architecture
          </h2>
          <p className="t-body mx-auto mt-2 text-[15px]">
            Compare the power flow of on-grid net-metering, lithium battery hybrids, and commercial high-tension step-up transformers.
          </p>
        </div>

        {/* 3-Tab Segmented Selector with a sliding pill */}
        <div data-reveal className="mx-auto mt-10 max-w-3xl">
          <div
            role="tablist"
            aria-label="Solar System Types"
            className="relative grid grid-cols-1 gap-1.5 rounded-xl border border-border-hairline bg-subtle p-1.5 sm:grid-cols-3"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1.5 left-1.5 hidden rounded-lg border border-border-hairline bg-white shadow-xs transition-transform duration-300 ease-out sm:block"
              style={{
                width: "calc((100% - 1.5rem) / 3)",
                transform: `translateX(calc(${activeIndex} * (100% + 0.375rem)))`,
              }}
            />
            {systemTypes.map((sys) => {
              const isSelected = activeTab === sys.id;
              return (
                <button
                  key={sys.id}
                  type="button"
                  role="tab"
                  id={`tab-${sys.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${sys.id}`}
                  onClick={() => setActiveTab(sys.id)}
                  className={`relative z-10 h-11 rounded-lg border px-3 text-[13px] font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,59,140,0.12)] ${
                    isSelected
                      ? "border-border-hairline bg-white text-heading shadow-xs sm:border-transparent sm:bg-transparent sm:shadow-none"
                      : "border-transparent text-muted hover:text-heading"
                  }`}
                >
                  {sys.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Architecture Box */}
        <div
          id={`panel-${currentSystem.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${currentSystem.id}`}
          data-reveal
          className="mx-auto mt-8 max-w-4xl rounded-2xl border border-border-hairline bg-subtle p-6 sm:p-8"
        >
          <div key={currentSystem.id} className="anim-swap">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-hairline pb-4">
              <div>
                <span className="rounded bg-brand-tint px-2.5 py-1 text-[11px] font-bold text-brand uppercase tracking-wider">
                  {currentSystem.badge}
                </span>
                <h3 className="mt-2 text-[20px] font-bold text-heading">
                  {currentSystem.headline}
                </h3>
              </div>
              <a
                href={getWhatsAppQuoteUrl(waPrompt)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-savings text-[13px] font-bold"
              >
                Get Engineering Quote <span className="btn-arrow">→</span>
              </a>
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-body">
              {currentSystem.summary}
            </p>

            {/* Visual Power Flow Route: photo per stage, current pulses stage to stage */}
            <div className="mt-6 rounded-xl border border-border-hairline bg-white p-4 sm:p-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-4">
                Visual Power Flow Route:
              </span>
              <ol data-reveal-stagger className="grid grid-cols-1 gap-3 sm:grid-cols-5">
                {currentSystem.flowSteps.map((step, idx) => {
                  const isLast = idx === currentSystem.flowSteps.length - 1;
                  return (
                    <li
                      key={step.label}
                      className="group flex items-center gap-3 sm:flex-col sm:items-stretch sm:gap-0 sm:text-center"
                      style={{ "--i": idx } as CSSProperties}
                    >
                      <div className="relative h-16 w-24 shrink-0 sm:aspect-[4/3] sm:h-auto sm:w-full">
                        <div className="absolute inset-0 overflow-hidden rounded-lg">
                          <Image
                            src={visuals[step.visual].src}
                            alt=""
                            fill
                            placeholder="blur"
                            sizes="(min-width: 640px) 160px, 96px"
                            className="feather object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
                          />
                        </div>
                        {!isLast && (
                          <span
                            aria-hidden="true"
                            className="flow-link absolute left-[86%] top-1/2 z-10 hidden h-[2px] w-[calc(28%+0.75rem)] -translate-y-1/2 sm:block"
                          />
                        )}
                      </div>
                      <div className="sm:mt-1.5">
                        <span className="block text-[10px] font-bold tracking-wider text-muted">STAGE {idx + 1}</span>
                        <span className="mt-0.5 block text-[12.5px] font-bold leading-snug text-heading">{step.label}</span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Key Specs Strip */}
            <div className="mt-6 grid gap-4 border-t border-border-hairline pt-4 sm:grid-cols-3 text-[13px]">
              <div>
                <span className="text-muted block text-[11px] uppercase font-bold">Best Suited For</span>
                <span className="font-semibold text-heading mt-0.5 block">{currentSystem.bestFor}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px] uppercase font-bold">Government Subsidy</span>
                <span className="font-semibold text-savings mt-0.5 block">{currentSystem.subsidy}</span>
              </div>
              <div>
                <span className="text-muted block text-[11px] uppercase font-bold">Estimated Payback</span>
                <span className="font-semibold text-heading mt-0.5 block">{currentSystem.payback}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
