"use client";

import { useId, useState } from "react";
import { brand, getWhatsAppQuoteUrl } from "@/config/brand";
import {
  BILL_DEFAULT,
  BILL_MAX,
  BILL_MIN,
  BILL_STEP,
  calculateSolarEstimate,
  clampBill,
  formatInr,
  type Segment,
} from "@/lib/solar";
import AnimatedNumber from "./AnimatedNumber";
import { Check, WhatsApp } from "./icons";

const segmentOptions: { id: Segment; label: string }[] = [
  { id: "residential", label: "Residential" },
  { id: "commercial", label: "Commercial" },
];

const formatKw = (n: number) => `${n} kW`;
const formatSqFt = (n: number) => `${n.toLocaleString("en-IN")} sq. ft.`;

interface ResultItem {
  label: string;
  /** Numeric results roll to their new value; text results swap as-is. */
  value: number | string;
  format?: (n: number) => string;
  highlight?: boolean;
}

export default function Calculator() {
  const [segment, setSegment] = useState<Segment>("residential");
  const [billValue, setBillValue] = useState<number>(BILL_DEFAULT);
  const [billInputString, setBillInputString] = useState<string>(String(BILL_DEFAULT));
  const [pincode, setPincode] = useState<string>("");
  const [pincodeTouched, setPincodeTouched] = useState<boolean>(false);

  const sliderId = useId();
  const numInputId = useId();
  const pincodeId = useId();
  const pincodeErrId = useId();

  const estimate = calculateSolarEstimate(billValue, segment);
  const sliderPercentage = ((billValue - BILL_MIN) / (BILL_MAX - BILL_MIN)) * 100;
  
  // Clean Indian 6-digit postal code validation
  const isPincodeValid = /^[1-9]\d{5}$/.test(pincode);
  const isPincodeEmpty = pincode.trim() === "";
  const shouldShowPincodeError = pincodeTouched && !isPincodeValid && !isPincodeEmpty;

  const handleSliderChange = (newVal: number) => {
    setBillValue(newVal);
    setBillInputString(String(newVal));
  };

  const handleBillInputChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "").slice(0, 6);
    setBillInputString(digitsOnly);
    const parsed = Number(digitsOnly);
    if (digitsOnly && parsed >= BILL_MIN && parsed <= BILL_MAX) {
      setBillValue(parsed);
    }
  };

  const handleBillInputBlur = () => {
    const clamped = clampBill(Number(billInputString) || BILL_MIN);
    setBillValue(clamped);
    setBillInputString(String(clamped));
  };

  // WhatsApp prefilled message
  const whatsappMessage = [
    `Hello ${brand.name} team,`,
    "I calculated my rooftop solar savings online and want an exact verified proposal.",
    `• Property Type: ${segment === "residential" ? "Residential" : "Commercial"}`,
    `• Average Monthly Bill: ${formatInr(billValue)}`,
    `• Recommended System: ${estimate.kw} kW`,
    `• Estimated Annual Savings: ${formatInr(estimate.annualSavings)}`,
    estimate.subsidyAmount ? `• PM Surya Ghar Subsidy: ${formatInr(estimate.subsidyAmount)}` : null,
    `• Net Estimated Cost: ${formatInr(estimate.netEffectiveCost)}`,
    isPincodeValid ? `• Pincode / Locality: ${pincode}` : null,
    "",
    "Please let me know when an engineer can visit for a site survey.",
  ]
    .filter(Boolean)
    .join("\n");

  const resultsGrid: ResultItem[] = [
    {
      label: "Recommended Sizing",
      value: estimate.kw,
      format: formatKw,
    },
    {
      label: "Annual Electricity Savings",
      value: estimate.annualSavings,
      format: formatInr,
    },
    segment === "residential"
      ? {
          label: "PM Surya Ghar Subsidy",
          value: estimate.subsidyAmount ?? 0,
          format: formatInr,
        }
      : {
          label: "Commercial Tax Benefit",
          value: "40% Accelerated Depr.",
        },
    {
      label: "Net Effective Cost",
      value: estimate.netEffectiveCost,
      format: formatInr,
      highlight: true,
    },
    {
      label: "Roof Area Needed",
      value: estimate.roofAreaSqFt,
      format: formatSqFt,
    },
    {
      label: "Estimated Payback",
      value: estimate.paybackPeriod,
    },
  ];

  return (
    <section id="calculator" className="site-section bg-subtle">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-eyebrow">
            Instant Solar Sizing
          </span>
          <h2 className="t-h2 mt-3">Solar savings & subsidy calculator</h2>
          <p className="t-body mx-auto mt-3">
            Adjust the slider to your average monthly power bill. Calculations use benchmark grid tariffs of ₹8.5/unit.
          </p>
        </div>

        {/* Calculator Main Card */}
        <div data-reveal className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-10 rounded-2xl border border-border-hairline bg-white p-6 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.05)] md:grid-cols-2 md:gap-12 md:p-12">
          {/* Left Column: User Inputs */}
          <div>
            {/* Segmented Toggle with a sliding pill */}
            <div
              role="radiogroup"
              aria-label="Property Type"
              className="relative grid grid-cols-2 rounded-[10px] border border-border-hairline bg-subtle p-1"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-[7px] border border-border-hairline bg-white shadow-xs transition-transform duration-300 ease-out"
                style={{ transform: segment === "commercial" ? "translateX(100%)" : "translateX(0)" }}
              />
              {segmentOptions.map((opt) => {
                const isActive = segment === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setSegment(opt.id)}
                    className={`relative z-10 h-10 rounded-[7px] text-[15px] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(11,59,140,0.12)] ${
                      isActive ? "text-heading" : "text-muted hover:text-heading"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Monthly Bill Input & Slider */}
            <div className="mt-8">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor={sliderId} className="t-label text-heading">
                  Monthly Electricity Bill
                </label>
                <div className="relative w-[140px]">
                  <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] font-semibold text-muted">
                    ₹
                  </span>
                  <input
                    id={numInputId}
                    type="text"
                    inputMode="numeric"
                    aria-label="Monthly bill amount in rupees"
                    className="form-control tabular pl-8 text-right font-semibold"
                    value={billInputString ? Number(billInputString).toLocaleString("en-IN") : ""}
                    onChange={(e) => handleBillInputChange(e.target.value)}
                    onBlur={handleBillInputBlur}
                    onKeyDown={(e) => e.key === "Enter" && handleBillInputBlur()}
                  />
                </div>
              </div>

              {/* Range Slider */}
              <input
                id={sliderId}
                type="range"
                className="calculator-range mt-5"
                min={BILL_MIN}
                max={BILL_MAX}
                step={BILL_STEP}
                value={billValue}
                onChange={(e) => handleSliderChange(Number(e.target.value))}
                style={{ ["--slider-fill" as string]: `${sliderPercentage}%` }}
                aria-valuetext={formatInr(billValue)}
              />

              <div className="tabular mt-2 flex justify-between text-[13px] text-muted">
                <span>{formatInr(BILL_MIN)}</span>
                <span>{formatInr(BILL_MAX)}</span>
              </div>
            </div>

            {/* 6-Digit Pincode / Locality Input with Inline Verification */}
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <label htmlFor={pincodeId} className="t-label text-heading">
                  Pincode / Locality
                </label>
                <span className="text-[12px] text-muted">6-digit postal code</span>
              </div>
              <input
                id={pincodeId}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="e.g. 302022"
                maxLength={6}
                className="form-control tabular mt-2"
                value={pincode}
                aria-invalid={shouldShowPincodeError}
                aria-describedby={shouldShowPincodeError ? pincodeErrId : undefined}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onBlur={() => setPincodeTouched(true)}
              />

              {/* Subtle Green Confirmation Badge on Valid 6-digit Pincode */}
              {isPincodeValid && (
                <div className="anim-swap mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#F0FDF4] px-2.5 py-1 text-[13px] font-semibold text-savings">
                  <Check width={14} height={14} />
                  <span>Free rooftop survey available in your area</span>
                </div>
              )}

              {shouldShowPincodeError && (
                <p id={pincodeErrId} className="anim-swap mt-2 text-[13px] font-medium text-[#B91C1C]">
                  Please enter a valid 6-digit Indian postal code.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Live Auto-Updating Output */}
          <div
            aria-live="polite"
            className="flex min-w-0 flex-col rounded-xl border border-border-hairline bg-subtle p-6"
          >
            <div className="t-label text-muted">Estimated Monthly Savings</div>
            <div className="tabular mt-1 text-[32px] font-bold leading-tight tracking-[-0.02em] text-savings">
              <AnimatedNumber value={estimate.monthlySavings} format={formatInr} />
            </div>
            <div className="tabular mt-1 text-[14px] text-muted">
              ≈ <AnimatedNumber value={estimate.annualSavings} format={formatInr} /> savings per year
            </div>

            {/* Sizing & Net Effective Cost Grid */}
            <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border-hairline pt-6">
              {resultsGrid.map((item) => (
                <div key={item.label} className={item.highlight ? "col-span-2 rounded-lg border border-border-hairline bg-white p-3" : ""}>
                  <dt className="text-[12px] font-medium text-muted">{item.label}</dt>
                  <dd className={`tabular mt-0.5 text-[16px] font-bold ${item.highlight ? "text-savings text-[18px]" : "text-heading"}`}>
                    {typeof item.value === "number" ? (
                      <AnimatedNumber value={item.value} format={item.format} />
                    ) : (
                      <span key={item.value} className="anim-swap inline-block">{item.value}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Dynamic WhatsApp CTA Button */}
            <div className="mt-auto pt-8">
              <a
                href={getWhatsAppQuoteUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full"
              >
                <WhatsApp />
                Get Exact Quote on WhatsApp
              </a>
              <p className="mt-2.5 text-center text-[12px] text-muted">
                Final solar capacity verified during free on-site shadow assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
