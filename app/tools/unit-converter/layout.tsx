import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unit Converter",
  description: "mcg ↔ mg and common peptide unit conversions.",
};

export default function UnitConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
