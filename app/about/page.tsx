import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description: "Who we are, disclaimer, and privacy. Research and education only.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Help", href: "/guide" }, { label: "About" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">About</h1>
      <p className="mt-2 text-slate-600">
        Who we are, how we operate, and the legal bits.
      </p>

      <div className="mt-8 space-y-8">
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">About this site</h2>
          <p className="mt-2 text-slate-600">
            Visual Peptide is a collection of calculators and reference information for research-grade peptides: reconstitution and dosing, peptide directory, 3D structure links, and purity verification (e.g. Janoshik). The site is for <strong className="text-slate-700">research and education only</strong>. We do not sell peptides or run tests; we only provide tools and links to third-party resources.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Disclaimer</h2>
          <p className="mt-2 text-slate-600">
            This site does not provide medical advice. All content is for informational and educational purposes. Dosing and usage information reflect common research protocols only; they are not recommendations. You are responsible for complying with your institution&apos;s policies and local laws. Always verify peptide identity and purity (e.g. via third-party testing such as Janoshik) before use.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
          <p className="mt-2 text-slate-600">
            This site is static and client-side. We do not collect, store, or transmit your personal data. We do not use analytics or tracking cookies. Any values you enter in calculators stay in your browser and are not sent to our servers (we have no backend). Links to external sites (e.g. Janoshik, RCSB) are subject to their respective privacy policies.
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/" className="link-inline">← Back to home</Link>
      </p>
    </div>
  );
}
