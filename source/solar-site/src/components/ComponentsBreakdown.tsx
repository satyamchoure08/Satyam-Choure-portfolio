import Image from "next/image";
import { visuals, type VisualKey } from "@/config/visuals";

interface ComponentItem {
  visual: VisualKey;
  name: string;
  rating: string;
  detail: string;
  spec: string;
}

const componentsList: ComponentItem[] = [
  {
    visual: "topconModules",
    name: "Tier-1 TopCon Modules",
    rating: "550W+ Bi-Facial",
    detail: "Generates power from both top and bottom reflected sunlight. 30-year linear performance warranty.",
    spec: "22.4% Efficiency · PID Free",
  },
  {
    visual: "inverter",
    name: "Smart Solar Inverter",
    rating: "98.6% Peak Efficiency",
    detail: "Dual MPPT tracking converts every ray of sun into usable AC current with mobile app monitoring.",
    spec: "Pure Sine Wave · IP65 Outdoor",
  },
  {
    visual: "elevatedStructure",
    name: "7.5ft Elevated HDGI",
    rating: "80-Micron Hot Dip",
    detail: "Elevated structure keeps your terrace 100% usable. Tested for high wind gusts up to 150 km/h.",
    spec: "Zero Rust · 25-Yr Structural",
  },
  {
    visual: "netMeter",
    name: "Bi-Directional Net Meter",
    rating: "DISCOM Approved",
    detail: "Dual-register digital smart meter tracks power imported vs. exported back to the state grid.",
    spec: "Govt. Calibrated · Auto Credits",
  },
  {
    visual: "lightningEarthing",
    name: "Dual Chemical Earthing",
    rating: "Pure Copper Arrester",
    detail: "Safeguards your valuable appliances against electrical surges and direct lightning strikes.",
    spec: "Class B+C Protection · Zero Hazard",
  },
  {
    visual: "stepUpTransformer",
    name: "Solar Inverter Transformers",
    rating: "Up to 20 MVA, 36 kV",
    detail: "Specialized step-up transformers for high-capacity solar plants and HT industrial grid lines.",
    spec: "NABL Type Tested · In-House Plant",
  },
];

export default function ComponentsBreakdown() {
  return (
    <section id="components" className="site-section bg-subtle">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-eyebrow">
            Engineering Bill of Materials
          </span>
          <h2 className="t-h2 mt-3">
            Only Tier-1 Hardware. Zero Cheap Compromises.
          </h2>
          <p className="t-body mx-auto mt-2 text-[15px]">
            Every system is built with pre-tested industrial-grade components designed to perform for 25+ years without degradation.
          </p>
        </div>

        {/* 6-Card Visual Component Grid: photo fades into the card, text sits on the fade */}
        <div data-reveal-stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {componentsList.map((comp) => (
            <article
              key={comp.name}
              className="group flex flex-col overflow-hidden rounded-xl border border-border-hairline bg-white shadow-xs transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_18px_36px_-20px_rgba(15,23,42,0.3)]"
            >
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={visuals[comp.visual].src}
                  alt={visuals[comp.visual].alt}
                  fill
                  placeholder="blur"
                  sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                  className="feather-b object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                />
                <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2.5 py-1 text-[11px] font-bold text-brand shadow-xs backdrop-blur-sm">
                  {comp.rating}
                </span>
              </div>

              <div className="relative -mt-6 flex flex-1 flex-col px-5 pb-5">
                <h3 className="text-[16px] font-bold text-heading">
                  {comp.name}
                </h3>

                <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-body">
                  {comp.detail}
                </p>

                <div className="mt-4 border-t border-border-hairline/80 pt-3 text-[12px] font-semibold text-muted">
                  <span className="text-heading">Spec:</span> {comp.spec}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
