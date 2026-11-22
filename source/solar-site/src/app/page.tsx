import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowSolarWorksDiagram from "@/components/HowSolarWorksDiagram";
import RoofEngineeringDiagram from "@/components/RoofEngineeringDiagram";
import SystemTypes from "@/components/SystemTypes";
import ComponentsBreakdown from "@/components/ComponentsBreakdown";
import Calculator from "@/components/Calculator";
import Process from "@/components/Process";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* 1. Header with Logo & Spec RFQ link */}
      <Header />

      <main>
        {/* 2. Hero: Punchy, visual, verified client trust badges */}
        <Hero />

        {/* 3. Interactive How Solar Works Diagram (Sunlight → PV → Inverter → Home → Net Meter → Grid) */}
        <HowSolarWorksDiagram />

        {/* 4. Roof Safety & Elevated Structure Cross-Section Visual */}
        <RoofEngineeringDiagram />

        {/* 5. 3-Way System Architecture Visualizer (On-Grid, Hybrid, Commercial Transformers) */}
        <SystemTypes />

        {/* 6. Hardware Components Bill of Materials with technical specs */}
        <ComponentsBreakdown />

        {/* 7. Live Solar Savings & Subsidy Calculator */}
        <Calculator />

        {/* 8. 4-Step Engineering Process */}
        <Process />

        {/* 9. Verified Bill-Drop Proof Testimonials */}
        <Testimonials />

        {/* 10. Clean FAQ Accordion */}
        <Faq />

        {/* 11. Consultation & Spec RFQ Lead Capture Form */}
        <Contact />
      </main>

      {/* 12. Complete Footer with Industrial Compliance & Contacts */}
      <Footer />
    </>
  );
}
