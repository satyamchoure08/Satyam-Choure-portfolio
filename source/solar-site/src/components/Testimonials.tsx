import type { CSSProperties } from "react";
import Image, { type StaticImageData } from "next/image";
import { brand } from "@/config/brand";
import { people } from "@/config/visuals";
import { Star } from "./icons";

interface Testimonial {
  billBefore: string;
  billAfter: string;
  quote: string;
  clientName: string;
  locality: string;
  systemSize: string;
  photo: StaticImageData;
}

// Sample reviews for the preview: replace with real customer reviews before going live.
const testimonials: Testimonial[] = [
  {
    billBefore: "₹5,200",
    billAfter: "₹320",
    quote:
      "The survey engineer calculated our needs honestly, advising 4 kW rather than overselling 6 kW. Our PM Surya Ghar subsidy was deposited into our bank account within 7 weeks of net meter activation.",
    clientName: "Rajesh Agarwal",
    locality: `Vaishali Nagar, ${brand.city}`,
    systemSize: "4 kW On-Grid",
    photo: people.rajesh.src,
  },
  {
    billBefore: "₹3,800",
    billAfter: "₹260",
    quote:
      "The mounting structure uses elevated chemical anchors with zero terrace drilling damage. We have had two heavy monsoons with zero roof seepage, and net metering was approved without any paperwork hassle.",
    clientName: "Sunita Sharma",
    locality: `Malviya Nagar, ${brand.city}`,
    systemSize: "3 kW On-Grid",
    photo: people.sunita.src,
  },
  {
    billBefore: "₹48,000",
    billAfter: "₹9,500",
    quote:
      "Electricity bills for our apartment lifts, borewell pumps, and compound lights were our society's biggest expense. They delivered a 25 kW system in 2 days and cut our common maintenance bills by over 80%.",
    clientName: "Anil Mathur",
    locality: `Mansarovar Society, ${brand.city}`,
    systemSize: "25 kW Society Solar",
    photo: people.anil.src,
  },
];

export default function Testimonials() {
  return (
    <section id="reviews" className="site-section bg-white">
      <div className="site-container">
        {/* Section Header */}
        <div data-reveal className="max-w-2xl">
          <span className="pill-eyebrow">
            Verified Bill Reductions
          </span>
          <h2 className="t-h2 mt-3">Verified electricity bill reductions</h2>
          <p className="t-body mt-3">
            Real power bills before solar commissioning compared with monthly charges after net metering.
          </p>
        </div>

        {/* 3 Clean Testimonial Cards */}
        <div data-reveal-stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((item) => (
            <figure
              key={item.clientName}
              className="flex flex-col rounded-xl border border-border-hairline bg-subtle p-6 transition-[translate,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-border-hover hover:shadow-[0_18px_36px_-22px_rgba(15,23,42,0.28)] md:p-7"
            >
              {/* Green Bill Drop Pill: old bill gets struck out, new bill slides in */}
              <div className="tabular inline-flex h-8 w-fit items-center gap-1.5 rounded-full bg-[#F0FDF4] px-3.5 text-[13px] font-semibold text-savings">
                <span>Bill:</span>
                <span className="bill-before">{item.billBefore}</span>
                <span className="bill-after">→ {item.billAfter}/mo</span>
              </div>

              {/* 5 Crisp Stars */}
              <div
                className="mt-5 flex gap-1 text-[#F59E0B]"
                role="img"
                aria-label="5 out of 5 stars rating"
              >
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="review-star" style={{ "--s": i } as CSSProperties} />
                ))}
              </div>

              {/* Grounded Quote (< 22 words per sentence) */}
              <blockquote className="mt-3.5 mb-6 text-[15px] leading-relaxed text-body">
                “{item.quote}”
              </blockquote>

              {/* Client Info Footer with portrait */}
              <figcaption className="mt-auto flex items-center gap-3.5 border-t border-border-hairline pt-5">
                <Image
                  src={item.photo}
                  alt=""
                  width={48}
                  height={48}
                  placeholder="blur"
                  className="h-12 w-12 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white"
                />
                <div>
                  <div className="text-[15px] font-semibold text-heading">
                    {item.clientName}
                  </div>
                  <div className="mt-0.5 text-[13px] text-muted">
                    {item.locality} · <span className="tabular">{item.systemSize}</span>
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
