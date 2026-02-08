import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ReportVerifier } from "@/components/ReportVerifier";
import { PurityPulse } from "@/components/PurityPulse";

export const metadata: Metadata = {
  title: "Purity & Verify",
  description: "Third-party testing (Janoshik). Verify batch reports by task ID. Links to public database.",
};

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Purity & Verify" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Purity & Verification</h1>
      <p className="mt-2 text-slate-600">
        Third-party testing is the standard for verifying peptide purity and identity. We recommend using an independent lab before sourcing.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        For procurement or QC: enter a report&apos;s task ID below to open the lab&apos;s official verification page.
        {" "}
        See guide: <Link href="/guide#purity" className="link-inline">Purity and sourcing</Link>
      </p>

      <ReportVerifier />

      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Janoshik Analytical</h2>
        <p className="mt-2 text-slate-600">
          Janoshik provides HPLC purity testing, mass spectrometry (identity), and potency testing. Reports include a unique task ID and verification key so you can confirm the report has not been altered.
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1 text-slate-600">
          <li>Purity (HPLC) — ideally 99%+</li>
          <li>Identity (mass spec)</li>
          <li>Potency (actual mg per vial)</li>
          <li>Blind testing available (vendor not informed)</li>
        </ul>
        <a
          href="https://janoshik.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary mt-6"
          aria-label="Janoshik.com (opens in new tab)"
        >
          Janoshik.com →
        </a>
      </div>

      <div className="mt-8">
        <PurityPulse />
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Public results database</h2>
        <p className="mt-2 text-slate-600">
          Janoshik hosts a public database of test results by peptide type and vendor. Search by peptide or vendor to see if a batch or supplier has been tested.
        </p>
        <a
          href="https://public.janoshik.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4 inline-flex min-h-[44px] items-center"
          aria-label="public.janoshik.com (opens in new tab)"
        >
          public.janoshik.com →
        </a>
      </div>

      <p className="mt-8 text-sm text-slate-600">
        After verifying reports, see <Link href="/suppliers" className="link-inline">Suppliers & sourcing</Link> for options. We do not run tests ourselves; always verify via the lab&apos;s official site (e.g. task ID on Janoshik) and follow your institution&apos;s or jurisdiction&apos;s requirements.
      </p>
    </div>
  );
}
