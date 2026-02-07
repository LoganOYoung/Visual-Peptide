import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Peptides",
  description: "Compare up to 3 peptides side by side: dose, frequency, reconstitution.",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
