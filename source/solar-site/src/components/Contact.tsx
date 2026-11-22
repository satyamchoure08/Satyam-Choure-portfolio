"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { brand, getWhatsAppQuoteUrl } from "@/config/brand";
import { Check, Phone, WhatsApp } from "./icons";

const monthlyBillOptions = [
  "Below ₹2,000",
  "₹2,000 – ₹4,000",
  "₹4,000 – ₹8,000",
  "₹8,000 – ₹15,000",
  "Above ₹15,000",
];

const checkmarkBullets = [
  "Comprehensive on-site shadow analysis and load assessment",
  "Custom 3D panel engineering layout with full subsidy breakdown",
  "Zero consultation fee, zero sales pressure, zero upfront commitment",
];

interface FormState {
  fullName: string;
  whatsappNumber: string;
  cityPincode: string;
  monthlyBill: string;
}

interface FormErrors {
  fullName?: string;
  whatsappNumber?: string;
  cityPincode?: string;
  monthlyBill?: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormState>({
    fullName: "",
    whatsappNumber: "",
    cityPincode: "",
    monthlyBill: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const validate = (data: FormState): FormErrors => {
    const errs: FormErrors = {};
    if (data.fullName.trim().length < 2) {
      errs.fullName = "Please enter your full name.";
    }
    const cleanPhone = data.whatsappNumber.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errs.whatsappNumber = "Please enter a valid 10-digit mobile number.";
    }
    if (data.cityPincode.trim().length < 3) {
      errs.cityPincode = "Please enter your city name or 6-digit pincode.";
    }
    if (!data.monthlyBill) {
      errs.monthlyBill = "Please select your average monthly bill range.";
    }
    return errs;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    const firstErrorKey = Object.keys(validationErrors)[0] as keyof FormState | undefined;
    // One gentle shake on each field that needs fixing.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      Object.keys(validationErrors).forEach((key) => {
        document.getElementById(`form-field-${key}`)?.animate(
          [
            { transform: "none" },
            { transform: "translateX(-5px)" },
            { transform: "translateX(4px)" },
            { transform: "translateX(-3px)" },
            { transform: "translateX(2px)" },
            { transform: "none" },
          ],
          { duration: 400, easing: "ease-in-out" }
        );
      });
    }
    if (firstErrorKey) {
      document.getElementById(`form-field-${firstErrorKey}`)?.focus();
      return;
    }

    // Inline submission handling (No browser alerts)
    setIsSubmitted(true);
  };

  const whatsappFollowupMessage = [
    `Hello ${brand.name},`,
    "I just requested a free rooftop solar survey via your website.",
    `• Name: ${formData.fullName.trim()}`,
    `• Phone: ${formData.whatsappNumber}`,
    `• Location: ${formData.cityPincode.trim()}`,
    `• Monthly Bill: ${formData.monthlyBill}`,
    "",
    "Please connect with me to schedule our survey visit.",
  ].join("\n");

  return (
    <section id="contact" className="site-section bg-white">
      <div className="site-container grid items-start gap-12 md:grid-cols-2 lg:gap-16">
        {/* Left Column: Heading, Value Props, Direct Contact Channels */}
        <div data-reveal className="md:pt-4">
          <span className="pill-eyebrow">
            Free Rooftop Assessment
          </span>
          <h2 className="t-h2 mt-3">Book your free rooftop survey</h2>
          <p className="t-body mt-3">
            A solar design engineer will visit your premises within 48 hours to assess terrace orientation, shadow patterns, and utility connection details.
          </p>

          <ul data-reveal-stagger className="mt-8 space-y-4">
            {checkmarkBullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-3 text-[15px] font-medium text-heading">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-savings">
                  <Check width={13} height={13} />
                </span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-border-hairline pt-8">
            <div className="t-label text-muted">Prefer an immediate conversation?</div>
            <div className="mt-3.5 flex flex-col gap-4 sm:flex-row sm:gap-8">
              <a
                href={`tel:${brand.phone.replace(/\s/g, "")}`}
                className="group tabular inline-flex items-center gap-2 text-[15px] font-semibold text-heading transition-colors duration-150 hover:text-brand"
              >
                <Phone className="text-muted transition-colors group-hover:text-brand group-hover:[animation:ring-wiggle_0.6s_ease-in-out]" width={18} height={18} />
                {brand.phone}
              </a>
              <a
                href={`https://wa.me/${brand.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-link inline-flex items-center gap-2 text-[15px] font-semibold text-savings transition-colors duration-150 hover:text-savings-hover"
              >
                <WhatsApp />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Bordered Form Card with Inline Success State */}
        <div data-reveal className="card-bordered bg-subtle" style={{ "--reveal-delay": "120ms" } as CSSProperties} aria-live="polite">
          {isSubmitted ? (
            <div className="anim-swap py-8 text-center md:py-12">
              <div className="anim-pop mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0FDF4] text-savings">
                <Check width={28} height={28} className="draw-check" />
              </div>
              <h3 className="t-h3 mt-5">Survey request confirmed</h3>
              <p className="mx-auto mt-2 max-w-[38ch] text-[15px] leading-relaxed text-body">
                Thank you, <span className="font-semibold text-heading">{formData.fullName.trim()}</span>. Our technical survey coordinator will call you at{" "}
                <span className="tabular font-semibold text-heading">{formData.whatsappNumber}</span> within 24 business hours to confirm your convenient inspection slot.
              </p>
              <div className="mt-8 border-t border-border-hairline pt-6">
                <a
                  href={getWhatsAppQuoteUrl(whatsappFollowupMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-link inline-flex items-center gap-2 text-[15px] font-semibold text-savings hover:underline"
                >
                  <WhatsApp />
                  Connect with our engineer on WhatsApp now →
                </a>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="form-field-fullName" className="t-label text-heading">
                  Full Name
                </label>
                <input
                  id="form-field-fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Ramesh Sharma"
                  className="form-control mt-2"
                  value={formData.fullName}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "form-err-fullName" : undefined}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
                {errors.fullName && (
                  <p id="form-err-fullName" className="anim-swap mt-1.5 text-[13px] font-medium text-[#B91C1C]">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="form-field-whatsappNumber" className="t-label text-heading">
                  10-Digit WhatsApp Mobile Number
                </label>
                <input
                  id="form-field-whatsappNumber"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="98XXXXXXXX"
                  maxLength={10}
                  className="form-control tabular mt-2"
                  value={formData.whatsappNumber}
                  aria-invalid={Boolean(errors.whatsappNumber)}
                  aria-describedby={errors.whatsappNumber ? "form-err-whatsapp" : undefined}
                  onChange={(e) =>
                    handleChange(
                      "whatsappNumber",
                      e.target.value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10})/, "").slice(0, 10)
                    )
                  }
                />
                {errors.whatsappNumber && (
                  <p id="form-err-whatsapp" className="anim-swap mt-1.5 text-[13px] font-medium text-[#B91C1C]">
                    {errors.whatsappNumber}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="form-field-cityPincode" className="t-label text-heading">
                  City / Locality or Pincode
                </label>
                <input
                  id="form-field-cityPincode"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="e.g. Mansarovar / 302020"
                  className="form-control mt-2"
                  value={formData.cityPincode}
                  aria-invalid={Boolean(errors.cityPincode)}
                  aria-describedby={errors.cityPincode ? "form-err-city" : undefined}
                  onChange={(e) => handleChange("cityPincode", e.target.value)}
                />
                {errors.cityPincode && (
                  <p id="form-err-city" className="anim-swap mt-1.5 text-[13px] font-medium text-[#B91C1C]">
                    {errors.cityPincode}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="form-field-monthlyBill" className="t-label text-heading">
                  Monthly Electricity Bill Range
                </label>
                <select
                  id="form-field-monthlyBill"
                  className={`form-control mt-2 ${formData.monthlyBill ? "" : "!text-[#94A3B8]"}`}
                  value={formData.monthlyBill}
                  aria-invalid={Boolean(errors.monthlyBill)}
                  aria-describedby={errors.monthlyBill ? "form-err-bill" : undefined}
                  onChange={(e) => handleChange("monthlyBill", e.target.value)}
                >
                  <option value="" disabled>
                    Select bill range
                  </option>
                  {monthlyBillOptions.map((opt) => (
                    <option key={opt} value={opt} className="text-heading">
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.monthlyBill && (
                  <p id="form-err-bill" className="anim-swap mt-1.5 text-[13px] font-medium text-[#B91C1C]">
                    {errors.monthlyBill}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full">
                  Schedule Free Rooftop Survey
                </button>
              </div>

              <p className="text-center text-[13px] text-muted">
                Your contact details are strictly kept confidential and used solely for survey scheduling.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
