import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About",
  description: "What Visual Peptide is: calculators and reference for research peptides. Research and education only; we don't sell peptides or give medical advice. Privacy and disclaimer.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Help", href: "/guide" }, { label: "About" }]} />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">About</h1>
      <p className="mt-2 text-slate-600">
        What this site is, how we operate, and the legal bits.
      </p>
      <p className="mt-2 rounded-none border-l-4 border-teal-500 bg-slate-50 px-4 py-2 text-sm text-slate-700">
        <strong>In short:</strong> Research & education only. We do not sell peptides or give medical advice. No tracking; your inputs stay in your browser.
      </p>

      <nav className="mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600" aria-label="On this page">
        <a href="#what" className="link-inline">What we do</a>
        <span aria-hidden className="text-slate-400">·</span>
        <a href="#disclaimer" className="link-inline">Disclaimer</a>
        <span aria-hidden className="text-slate-400">·</span>
        <a href="#privacy" className="link-inline">Privacy</a>
      </nav>

      <div className="mt-8 space-y-8">
        <section id="what" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">What we do</h2>
          <p className="mt-2 text-slate-600">
            Visual Peptide provides calculators and reference for research-grade peptides. Everything here is for <strong className="text-slate-700">research and education only</strong>. We do not provide medical advice, sell peptides, or run tests — only tools and links to third-party resources (e.g. Janoshik for verification).
          </p>
          <p className="mt-2 text-slate-600">
            Useful for: researchers, lab staff, and anyone who needs neutral reference and precise calculations for reconstitution, dosing, and verification.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600">
            <li><Link href="/tools/calculator" className="link-inline">Recon & Dosing Calculator</Link> — concentration, volume to draw, syringe units</li>
            <li><Link href="/tools/syringe-planner" className="link-inline">Syringe Planner</Link> — visual fill line for your dose</li>
            <li><Link href="/peptides" className="link-inline">Peptide Library</Link> — typical dose, frequency, recon notes by peptide</li>
            <li><Link href="/peptides/compare" className="link-inline">Compare</Link> — side-by-side up to 3 peptides</li>
            <li><Link href="/structure" className="link-inline">3D Structure</Link> — view peptide structures (PDB)</li>
            <li><Link href="/verify" className="link-inline">Purity & Verify</Link> — verify reports (e.g. Janoshik Task ID), transparency board</li>
          </ul>
        </section>

        <section id="disclaimer" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">Disclaimer</h2>
          <p className="mt-2 text-slate-600">
            This site does not provide medical advice. All content is for informational and educational purposes only. Dosing and usage information reflect common research protocols; they are not clinical recommendations. <strong className="text-slate-700">Doses and protocols here are research-reference only</strong>; clinical use follows different regulations and protocols.
          </p>
          <p className="mt-2 text-slate-600">
            You are responsible for complying with your institution&apos;s policies and local laws. Always verify peptide identity and purity (e.g. via third-party testing such as Janoshik) before use.
          </p>
        </section>

        <section id="privacy" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">Privacy</h2>
          <p className="mt-2 text-slate-600">
            This site is static and runs in your browser. We do not collect, store, or transmit your personal data. We do not use analytics or tracking cookies. No login is required. Values you enter in calculators stay in your browser and are not sent to our servers (we have no backend). Links to external sites (e.g. Janoshik, RCSB) are subject to their respective privacy policies.
          </p>
        </section>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/guide" className="link-inline">Guide</Link>
        {" · "}
        <Link href="/faq" className="link-inline">FAQ</Link>
        {" · "}
        <Link href="/tools" className="link-inline">Tools</Link>
        {" · "}
        <Link href="/peptides" className="link-inline">Peptide Library</Link>
        {" · "}
        <Link href="/verify" className="link-inline">Purity & Verify</Link>
        {" · "}
        <Link href="/suppliers" className="link-inline">Suppliers</Link>
      </p>
    </div>
  );
}
