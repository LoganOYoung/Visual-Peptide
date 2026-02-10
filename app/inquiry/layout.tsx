import type { Metadata } from "next";
import { getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/inquiry");

export const metadata: Metadata = {
  title: "Request quote",
  description: "Request peptide synthesis quote or send to synthesis lab. Research use only.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function InquiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
