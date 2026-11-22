"use client";

import { useEffect } from "react";
import { brand } from "@/config/brand";
import { Close } from "./icons";

export type ModalType = "privacy" | "terms" | "warranty" | null;

interface LegalModalsProps {
  activeModal: ModalType;
  onClose: () => void;
}

export default function LegalModals({ activeModal, onClose }: LegalModalsProps) {
  useEffect(() => {
    if (!activeModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeModal, onClose]);

  if (!activeModal) return null;

  return (
    <div
      className="anim-fade fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="anim-modal relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-hairline bg-white p-6 md:p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-hairline pb-4">
          <h3 className="t-h3 text-[20px] font-bold text-heading">
            {activeModal === "privacy" && "Privacy Policy"}
            {activeModal === "terms" && "Terms of Service"}
            {activeModal === "warranty" && "Standard Warranty Terms"}
          </h3>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-[background-color,color,rotate] duration-300 hover:rotate-90 hover:bg-subtle hover:text-heading"
            aria-label="Close modal"
            onClick={onClose}
          >
            <Close />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-[14px] leading-relaxed text-body">
          {activeModal === "privacy" && (
            <>
              <p>
                This Privacy Policy outlines how <strong>{brand.name}</strong> collects, stores, and protects personal contact information submitted through this website.
              </p>
              <h4 className="font-semibold text-heading">1. Information Collection</h4>
              <p>
                We only collect your name, phone/WhatsApp number, installation city/pincode, and electricity billing details for scheduling rooftop technical feasibility surveys and processing DISCOM net-metering applications.
              </p>
              <h4 className="font-semibold text-heading">2. Usage & Disclosure</h4>
              <p>
                Your details are never sold, rented, or traded to third-party telemarketers. Information is shared strictly with government DISCOM utility portals and the National Solar Subsidy Portal for PM Surya Ghar approvals.
              </p>
              <h4 className="font-semibold text-heading">3. Contact</h4>
              <p>
                For privacy inquiries or request for data deletion, reach out to {brand.email}.
              </p>
            </>
          )}

          {activeModal === "terms" && (
            <>
              <p>
                By booking a rooftop survey or submitting an inquiry with <strong>{brand.name}</strong>, you agree to these standard operational terms.
              </p>
              <h4 className="font-semibold text-heading">1. Free Feasibility Survey</h4>
              <p>
                Our on-site shadow assessment is provided at ₹0 without obligation. System sizing and generation figures are engineering estimates based on historical sun-hour irradiance in {brand.city}.
              </p>
              <h4 className="font-semibold text-heading">2. Grid-Tie & Net Metering</h4>
              <p>
                Timelines for bi-directional net meter installation are subject to DISCOM inspection and sanction approvals. {brand.name} acts as the registered EPC contractor handling all documentation.
              </p>
              <h4 className="font-semibold text-heading">3. Commercial Quotations</h4>
              <p>
                Formal quotes remain valid for 30 days from survey completion date.
              </p>
            </>
          )}

          {activeModal === "warranty" && (
            <>
              <p>
                <strong>{brand.name}</strong> provides comprehensive warranties backed by Tier-1 manufacturer guarantees and our on-site workmanship commitment.
              </p>
              <h4 className="font-semibold text-heading">1. 25-Year Linear Power Warranty</h4>
              <p>
                Tier-1 solar photovoltaic modules carry a 25-year linear generation warranty guaranteeing minimum 84.8% performance output at Year 25.
              </p>
              <h4 className="font-semibold text-heading">2. {brand.inverterWarrantyYears} Inverter Replacement</h4>
              <p>
                Grid-tied string and micro-inverters carry a direct manufacturer replacement warranty covering internal component failures.
              </p>
              <h4 className="font-semibold text-heading">3. 100% Zero-Seepage Terrace Seal</h4>
              <p>
                All rooftop mounting bases utilize industrial-grade chemical anchors coated with weatherproof sealants. Any structural water ingress resulting from mounting is fully remediated by our team.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 border-t border-border-hairline pt-4 text-right">
          <button
            type="button"
            className="btn-primary !h-10 !px-5 text-[14px]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
