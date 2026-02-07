import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syringe Planner",
  description:
    "Visual syringe planner: see exactly where to draw. Enter reconstitution and dose — the syringe shows the fill level for 0.3/0.5/1 mL.",
};

export default function SyringePlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
