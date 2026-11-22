import { brand } from "@/config/brand";
import {
  AlertTriangle,
  ArrowsVertical,
  CheckCircle,
  Hammer,
  Shield,
  SteelFrame,
  Wind,
  XCircle,
} from "./icons";

const iconSize = { width: 16, height: 16 };

export default function RoofEngineeringDiagram() {
  return (
    <section id="roof-safety" className="site-section bg-white">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-eyebrow">
            Terrace Protection Guarantee
          </span>
          <h2 className="t-h2 mt-3">
            Zero Terrace Damage. 100% Usable Rooftop Space.
          </h2>
          <p className="t-body mx-auto mt-2 text-[15px]">
            Homeowners fear roof leaks and lost terrace area. See the visual engineering difference between cheap local installations and our elevated structure.
          </p>
        </div>

        {/* Visual Comparison Grid */}
        <div data-reveal-stagger className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Card 1: Cheap Local Competitors */}
          <div className="rounded-2xl border border-red-200 bg-red-50/30 p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-red-200/60 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded bg-red-100 px-2.5 py-1 text-[12px] font-bold text-red-700">
                <XCircle width={14} height={14} />
                STANDARD CHEAP INSTALLATION
              </span>
              <span className="text-[12px] font-medium text-red-600">High Leakage Risk</span>
            </div>

            {/* Visual Schematic Box */}
            <div className="mt-5 rounded-xl border border-red-200 bg-white p-4">
              <div className="flex flex-col gap-3 font-mono text-[12px]">
                <div className="rounded bg-red-50 p-3 text-red-800">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle {...iconSize} className="shrink-0" />
                    <span>Low Clearance (2–3 Feet)</span>
                  </div>
                  <p className="font-sans text-[13px] text-red-700 mt-1">
                    Cramped panels block terrace access. You can no longer walk, host guests, or dry clothes.
                  </p>
                </div>

                <div className="rounded bg-red-50 p-3 text-red-800">
                  <div className="font-bold flex items-center gap-2">
                    <Hammer {...iconSize} className="shrink-0" />
                    <span>Concrete Slab Hammer Drilling</span>
                  </div>
                  <p className="font-sans text-[13px] text-red-700 mt-1">
                    Masonry drill punctures the waterproof waterproofing membrane, causing ceiling dampness in monsoons.
                  </p>
                </div>

                <div className="rounded bg-red-50 p-3 text-red-800">
                  <div className="font-bold flex items-center gap-2">
                    <Wind {...iconSize} className="shrink-0" />
                    <span>Hollow Lightweight Pipe Structure</span>
                  </div>
                  <p className="font-sans text-[13px] text-red-700 mt-1">
                    Rusts within 3–4 years; risks flying off during high-wind desert squalls.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 text-[13px] font-semibold text-red-800">
              Result: Permanent slab cracks + costly civil waterproofing repairs.
            </div>
          </div>

          {/* Card 2: Our Engineered Elevated Structure */}
          <div className="rounded-2xl border-2 border-emerald-500 bg-emerald-50/20 p-6 sm:p-8 shadow-xs transition-shadow duration-300 hover:shadow-[0_18px_40px_-22px_rgba(21,128,61,0.45)]">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-2.5 py-1 text-[12px] font-bold text-savings">
                <CheckCircle width={14} height={14} />
                {brand.shortName.toUpperCase()} ELEVATED ENGINEERING
              </span>
              <span className="text-[12px] font-bold text-savings">100% Slab Warranty</span>
            </div>

            {/* Visual Schematic Box */}
            <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
              <div className="flex flex-col gap-3 font-mono text-[12px]">
                <div className="rounded bg-emerald-50/80 p-3 text-emerald-900">
                  <div className="font-bold flex items-center gap-2 text-savings">
                    <ArrowsVertical {...iconSize} className="shrink-0" />
                    <span>Full 7.5 Ft Walking Clearance (Elevated Lounge)</span>
                  </div>
                  <p className="font-sans text-[13px] text-slate-700 mt-1">
                    100% usable terrace. Walk freely underneath, set up rooftop seating, or plant terrace gardens.
                  </p>
                </div>

                <div className="rounded bg-emerald-50/80 p-3 text-emerald-900">
                  <div className="font-bold flex items-center gap-2 text-savings">
                    <Shield {...iconSize} className="shrink-0" />
                    <span>Non-Penetrative Chemical Resin Anchors</span>
                  </div>
                  <p className="font-sans text-[13px] text-slate-700 mt-1">
                    Zero slab piercing. Heavy chemical bonding anchors with UV-resistant elastomer water seals.
                  </p>
                </div>

                <div className="rounded bg-emerald-50/80 p-3 text-emerald-900">
                  <div className="font-bold flex items-center gap-2 text-savings">
                    <SteelFrame {...iconSize} className="shrink-0" />
                    <span>Hot-Dip Galvanized Iron (HDGI 80-Micron)</span>
                  </div>
                  <p className="font-sans text-[13px] text-slate-700 mt-1">
                    Heavy-gauge steel tested for 150 km/h wind speeds. Backed by 25-year structural warranty.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between text-[13px] font-bold text-savings">
              <span>Result: Dry ceilings + beautiful solar pergola terrace.</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px]">25-YR WARRANTY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
