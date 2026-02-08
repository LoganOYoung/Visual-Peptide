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
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Peptides", href: "/peptides" }, { label: "Library" }]} />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Peptide Library</h1>
      <p className="mt-2 text-slate-600">
        Browse by category or search by name, CAS, or sequence. Use the calculator for exact volumes.
      </p>
      <p className="mt-2 text-sm text-slate-600">
        <Link href="/peptides/compare" className="link-inline font-medium">Compare up to 3</Link> peptides side by side.
        See <Link href="/guide#concentration-dose" className="link-inline">Concentration & dose</Link> in the Guide for dosing and reconstitution.
      </p>
      <div className="mt-8">
        <PeptideLibrary />
      </div>
    </div>
  );
}
