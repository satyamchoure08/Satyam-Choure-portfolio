"use client";

import { useState } from "react";
import { brand } from "@/config/brand";
import { Plus } from "./icons";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Will mounting panels cause roof leakage or structural damage?",
    answer:
      "No. We use elevated hot-dip galvanized mounting structures fixed with chemical anchor fasteners. Every anchoring point is sealed with industrial chemical waterproofing. Your roof slab remains completely intact, 100% leak-proof, and usable underneath.",
  },
  {
    question: "How does the PM Surya Ghar subsidy work and who handles the paperwork?",
    answer:
      `We handle the entire process end-to-end. Our team registers your consumer number on the National Solar Portal, submits your DISCOM application, coordinates the local technical survey, and files commissioning reports. The subsidy (up to ₹78,000) is credited directly to your bank account via DBT within 30 to 60 days.`,
  },
  {
    question: "How much shadow-free rooftop space do I need?",
    answer:
      "As a standard benchmark, each 1 kW requires approximately 90 sq. ft. of shadow-free rooftop area. A standard 3 kW residential setup requires roughly 270 sq. ft., while a 5 kW setup needs around 450 sq. ft. Our surveyor measures exact shadow angles during the free visit.",
  },
  {
    question: "What happens during monsoons, cloudy days, and power cuts?",
    answer:
      "On overcast days, panels generate power using diffused ambient daylight. Net metering banks surplus units produced during peak sunny months to offset rainy periods. Standard grid-tied systems disconnect during utility power cuts for grid safety; hybrid battery systems provide continuous backup.",
  },
  {
    question: "What is the expected lifespan and maintenance required?",
    answer:
      `Tier-1 solar panels include a 25-year linear performance warranty. Maintenance simply involves rinsing dust off with water every two to three weeks. ${brand.name} also provides scheduled preventive maintenance checks and real-time remote inverter performance monitoring.`,
  },
  {
    question: "Are there low-cost EMI or solar financing options available?",
    answer:
      "Yes. Under the PM Surya Ghar scheme, leading public sector banks offer collateral-free solar loans at subsidized interest rates (around 7% p.a.) with tenures up to 7 years. In most cases, your monthly electricity savings exceed the loan EMI payment.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="site-section bg-subtle">
      <div className="site-container">
        <div className="mx-auto max-w-3xl">
          {/* Section Header */}
          <div data-reveal className="text-center">
            <span className="pill-eyebrow">
              Common Questions
            </span>
            <h2 className="t-h2 mt-3">Frequently asked questions</h2>
            <p className="t-body mx-auto mt-3">
              Honest engineering answers regarding roof safety, subsidy timelines, and system sizing in {brand.city}.
            </p>
          </div>

          {/* Accordion List */}
          <div data-reveal-stagger className="mt-12 border-t border-border-hairline">
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-trigger-${index}`;
              const contentId = `faq-content-${index}`;

              return (
                <div key={item.question} className="border-b border-border-hairline">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                      onClick={() => toggleItem(index)}
                      className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold text-heading transition-colors duration-150 hover:text-brand focus-visible:text-brand focus-visible:outline-none"
                    >
                      <span>{item.question}</span>
                      <Plus
                        className={`shrink-0 text-muted transition-transform duration-200 ease-out ${
                          isOpen ? "rotate-45 text-brand" : ""
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p
                        className={`t-body pr-8 pb-6 leading-relaxed text-body transition-[opacity,translate] duration-300 ease-out ${
                          isOpen ? "translate-y-0 opacity-100 delay-75" : "-translate-y-1 opacity-0"
                        }`}
                      >
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
