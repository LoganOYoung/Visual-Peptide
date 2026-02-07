import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vial & Cycle Calculator",
  description: "How many days one vial lasts; how many vials for a target period.",
};

export default function VialCycleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
