"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { BrandMark } from "./icons";
import LegalModals, { type ModalType } from "./LegalModals";

// #solutions and #subsidy don't exist on this page; links point to the sections that cover them.
const offeringLinks = [
  { label: "Home Rooftop Solar", href: "#calculator" },
  { label: "Housing Society Systems", href: "#systems" },
  { label: "Commercial & Industrial EPC", href: "#systems" },
];

const systemLinks = [
  { label: "On-Grid Net-Metered Systems", href: "#systems" },
  { label: "Hybrid Solar with Battery", href: "#systems" },
  { label: "Standalone Off-Grid Plants", href: "#systems" },
  { label: "PM Surya Ghar Subsidy Slabs", href: "#calculator" },
];

export default function Footer() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-navy text-white/70">
        <div className="site-container py-14 md:py-16">
          {/* Trust Compliance Badge Bar */}
          <div data-reveal className="flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <BrandMark className="h-[30px] w-auto shrink-0" />
              <span className="text-[18px] font-bold text-white">{brand.name}</span>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[13px] font-medium text-white/90">
              MNRE & DISCOM Empanelled Vendor — Reg / GST: {brand.registrationNo}
            </div>
          </div>

          {/* 3 Clean Columns Layout */}
          <div data-reveal-stagger className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {/* Column 1: Offerings */}
            <div>
              <h3 className="t-label text-white">Offerings</h3>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {offeringLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block transition-[color,translate] duration-200 hover:translate-x-1 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Systems */}
            <div>
              <h3 className="t-label text-white">Systems</h3>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                {systemLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="inline-block transition-[color,translate] duration-200 hover:translate-x-1 hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div>
              <h3 className="t-label text-white">Contact & Support</h3>
              <ul className="mt-4 space-y-2.5 text-[14px]">
                <li className="text-white/80">{brand.address}</li>
                <li>
                  <a
                    href={`tel:${brand.phone.replace(/\s/g, "")}`}
                    className="tabular transition-colors duration-150 hover:text-white"
                  >
                    {brand.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${brand.whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-150 hover:text-white"
                  >
                    WhatsApp Us Directly
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${brand.email}`}
                    className="transition-colors duration-150 hover:text-white"
                  >
                    {brand.email}
                  </a>
                </li>
                <li className="pt-1 text-[13px] text-white/50">
                  Mon–Sat: 9:30 AM – 7:00 PM
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal Links Bar */}
        <div className="border-t border-white/10">
          <div className="site-container flex flex-col items-center justify-between gap-4 py-6 text-[13px] text-white/55 sm:flex-row">
            <span>© {currentYear} {brand.name}. All rights reserved.</span>
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="transition-colors duration-150 hover:text-white"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="transition-colors duration-150 hover:text-white"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("warranty")}
                className="transition-colors duration-150 hover:text-white"
              >
                Warranty Terms
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Accessible Modals */}
      <LegalModals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}
