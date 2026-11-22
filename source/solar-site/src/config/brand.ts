/**
 * BRAND CONFIGURATION: single source of truth for this concept site.
 * Arkavolt Solar is a fictional company made for Satyam Choure's portfolio.
 * Phone, email and reviews are placeholders, not a real business.
 */
export const brand = {
  name: "Arkavolt Solar Pvt Ltd",
  shortName: "Arkavolt Solar",
  tagline: "Rooftop Solar EPC & Solar Inverter Transformers",
  city: "Jaipur",
  regions: "Jaipur, Rajasthan & Pan-India Industrial EPC",
  address: "Sitapura Industrial Area, Jaipur, Rajasthan",
  phone: "+91 98765 43210",
  whatsappNumber: "919876543210",
  email: "hello@arkavolt.example",
  googleRating: "4.8",
  reviewCount: "120+ Reviews",
  yearsInBusiness: "Est. 2009",
  inverterWarrantyYears: "10-Year",
  registrationNo: "ISO 9001:2015 Certified Plant",
  warrantyYears: 25,
  primaryColor: "#0B3B8C",
  /** Who the site is built for (shown as chips in the hero). */
  majorClients: ["Homes & Villas", "Housing Societies", "Hospitals", "Factories"],
  costPerKw: { residential: 58000, commercial: 42000 },
} as const;

export function getWhatsAppQuoteUrl(message: string): string {
  return `https://wa.me/${brand.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
