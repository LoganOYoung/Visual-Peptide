import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/tools/calculator");

export const metadata: Metadata = {
  title: "Recon & Dosing Calculator",
  description:
    "Calculate BAC water volume, concentration, dose per injection, and syringe units (0.3 / 0.5 / 1 mL).",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function CalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
