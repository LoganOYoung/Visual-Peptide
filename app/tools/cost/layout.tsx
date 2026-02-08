import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/tools/cost");

export const metadata: Metadata = {
  title: "Cost per Dose",
  description: "Price per vial, mg per vial, dose (mcg) → cost per injection.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function CostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
