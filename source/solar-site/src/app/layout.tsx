import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { brand } from "@/config/brand";
import MotionRoot from "@/components/MotionRoot";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${brand.name} | Rooftop Solar EPC in ${brand.city}`,
  description: `End-to-end rooftop solar EPC for homes, housing societies, and businesses across ${brand.regions}. PM Surya Ghar subsidy handling, chemical waterproofing, and ${brand.warrantyYears}-year performance warranty.`,
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN" className={jakarta.variable}>
      <body className="min-h-screen bg-white text-body font-sans antialiased">
        {children}
        <MotionRoot />
      </body>
    </html>
  );
}
