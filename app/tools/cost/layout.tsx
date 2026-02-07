import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cost per Dose",
  description: "Price per vial, mg per vial, dose (mcg) → cost per injection.",
};

export default function CostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
