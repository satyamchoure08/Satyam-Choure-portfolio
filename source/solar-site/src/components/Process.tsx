import type { CSSProperties } from "react";
import Image from "next/image";
import { visuals, type VisualKey } from "@/config/visuals";

interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
  visual: VisualKey;
}

const steps: ProcessStep[] = [
  {
    stepNumber: "01",
    title: "Free Rooftop Survey",
    description: "Engineer visits your home to inspect shadow-free area and sanctioned load.",
    visual: "survey",
  },
  {
    stepNumber: "02",
    title: "3D Design & Clear Quote",
    description: "Get exact panel layout, pricing, and subsidy breakdown with zero hidden costs.",
    visual: "design",
  },
  {
    stepNumber: "03",
    title: "1-Day Clean Installation",
    description: "Certified crew installs your system with zero roof damage and files DISCOM paperwork.",
    visual: "installation",
  },
  {
    stepNumber: "04",
    title: "Switch On & Save",
    description: "Net meter goes live, subsidy credits to your bank, and bills drop immediately.",
    visual: "switchOnFamily",
  },
];

export default function Process() {
  return (
    <section id="process" className="site-section bg-subtle">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="max-w-2xl">
          <span className="pill-eyebrow">
            Engineering Workflow
          </span>
          <h2 className="t-h2 mt-3">From survey to savings in four steps</h2>
          <p className="t-body mt-3">
            A single dedicated engineering team manages every phase from roof measurement to net metering approval.
          </p>
        </div>

        {/* 4-Step Timeline: photo, then a numbered badge on its faded edge, then the words */}
        <ol data-reveal-stagger className="mt-12 grid gap-y-10 md:mt-14 md:grid-cols-4 md:gap-x-6 md:gap-y-0">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <li
                key={step.stepNumber}
                className="group relative"
                style={{ "--i": index } as CSSProperties}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={visuals[step.visual].src}
                    alt={visuals[step.visual].alt}
                    fill
                    placeholder="blur"
                    sizes="(min-width: 768px) 270px, 100vw"
                    className="feather-b object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </div>

                <div className="relative -mt-6 flex items-center">
                  <span className="process-badge tabular relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-brand text-[15px] font-bold text-white shadow-sm">
                    {step.stepNumber}
                  </span>
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="process-line ml-3 hidden h-[2px] flex-1 rounded-full bg-brand/35 md:-mr-6 md:block"
                    />
                  )}
                </div>

                <h3 className="t-h3 mt-4">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-body">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
