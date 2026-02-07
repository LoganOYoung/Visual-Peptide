import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PeptideLibrary } from "@/components/PeptideLibrary";
import { getBaseUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Peptide Library",
  description: "Research peptides by category: Metabolic, Repair & Healing, Cognitive. Typical doses, frequency, and reconstitution notes.",
  alternates: { canonical: `${getBaseUrl()}/peptides` },
};

export default function PeptidesListPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Peptides", href: "/peptides" }, { label: "Library" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Peptide Library</h1>
      <p className="mt-2 text-slate-600">
        Browse by category or search by name, CAS, or sequence. Use the calculator for exact volumes.
      </p>
      <div className="mt-8">
        <PeptideLibrary />
      </div>
    </div>
  );
}
