import type { CSSProperties } from "react";
import Image from "next/image";
import { brand } from "@/config/brand";
import { heroImage } from "@/config/visuals";
import { Bolt, Star, Sun } from "./icons";

/** Stagger delay for the one-time load-in sequence (see .hero-in in globals.css). */
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function Hero() {
  return (
    <section id="top" className="site-section bg-white pt-8 sm:pt-12">
      <div className="site-container grid items-center gap-10 md:grid-cols-[54fr_46fr]">
        {/* Left Column: Eyebrow, H1, Subtext, CTA, Trust Badges */}
        <div>
          {/* Eyebrow */}
          <div
            className="hero-in inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-tint px-3.5 py-1 text-[12px] font-bold text-brand"
            style={delay(0)}
          >
            <span className="inline-flex items-center gap-1.5">
              <Sun width={14} height={14} className="text-amber-500" />
              PM Surya Ghar Approved Vendor
            </span>
            <span className="text-border-hover">•</span>
            <span>{brand.yearsInBusiness}</span>
          </div>

          {/* H1: Punchy, zero fluff */}
          <h1
            className="hero-in t-h1 mt-4 text-[32px] sm:text-[44px] lg:text-[48px] font-bold tracking-tight text-heading leading-[1.15]"
            style={delay(90)}
          >
            Cut Your Electricity Bill by up to 90%.
          </h1>

          {/* Subtext: Max 2 lines */}
          <p
            className="hero-in mt-4 text-[16px] sm:text-[17px] leading-relaxed text-body max-w-xl"
            style={delay(180)}
          >
            Engineered rooftop solar with 7.5ft elevated leak-proof structures, direct DISCOM net-metering, and up to ₹78,000 direct bank subsidy across {brand.city} & Rajasthan.
          </p>

          {/* Action Buttons */}
          <div className="hero-in mt-7 flex flex-wrap items-center gap-3" style={delay(270)}>
            <a href="#how-solar-works" className="btn-primary">
              See How It Works (Diagram) <span className="btn-arrow-down">↓</span>
            </a>
            <a href="#calculator" className="btn-secondary">
              Calculate Savings <span className="btn-arrow">→</span>
            </a>
          </div>

          {/* Trust Strip & Client Logos */}
          <div className="hero-in mt-8 border-t border-border-hairline pt-5" style={delay(360)}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
              <span className="inline-flex items-center gap-1 font-bold text-heading">
                <Star className="text-[#F59E0B]" />
                <span className="tabular">{brand.googleRating} Google Rating</span>
              </span>
              <span>•</span>
              <span className="font-semibold">{brand.reviewCount}</span>
              <span>•</span>
              <span className="font-semibold text-savings">15+ Years of Solar Engineering</span>
            </div>

            {/* Industrial Client Trust Strip */}
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Built for:</span>
              {brand.majorClients.slice(0, 4).map((client) => (
                <span
                  key={client}
                  className="rounded border border-border-hairline bg-subtle px-2 py-0.5 text-slate-700 transition-colors duration-200 hover:border-brand/30 hover:text-brand"
                >
                  {client}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Photo card with a very slow drift so it never feels static */}
        <div className="hero-in relative" style={delay(150)}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border-hairline bg-subtle shadow-sm">
            <Image
              src={heroImage}
              placeholder="blur"
              alt="Engineered rooftop solar installation on a modern home terrace"
              fill
              priority
              sizes="(min-width: 768px) 540px, 100vw"
              className="kenburns object-cover"
            />
            {/* Overlay Visual Badges */}
            <div className="hero-badge-l absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-lg border border-border-hairline bg-white/95 px-3 py-1.5 text-[11px] font-bold text-heading shadow-xs backdrop-blur-xs">
              <Bolt width={13} height={13} className="text-amber-500" />
              7.5ft Elevated Structure · 100% Terrace Usable
            </div>
            <div className="hero-badge-r absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-savings px-3 py-1.5 text-[11px] font-bold text-white shadow-xs">
              <span className="live-dot text-white" aria-hidden="true" />
              ₹78,000 Direct DBT Subsidy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
