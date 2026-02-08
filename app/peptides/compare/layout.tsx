import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/peptides/compare");

export const metadata: Metadata = {
  title: "Compare Peptides",
  description: "Compare up to 3 peptides side by side: dose, frequency, reconstitution.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
