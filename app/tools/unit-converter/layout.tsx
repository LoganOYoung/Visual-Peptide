import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/tools/unit-converter");

export const metadata: Metadata = {
  title: "Unit Converter",
  description: "mcg ↔ mg and common peptide unit conversions.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
