import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/tools/vial-cycle");

export const metadata: Metadata = {
  title: "Vial & Cycle Calculator",
  description: "How many days one vial lasts; how many vials for a target period.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function VialCycleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
