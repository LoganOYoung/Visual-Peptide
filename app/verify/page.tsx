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
        >
          Janoshik.com →
        </a>
      </div>

      <ReportVerifier />

      <div className="mt-6">
        <PurityPulse />
      </div>

      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-slate-900">Public results database</h2>
        <p className="mt-2 text-slate-600">
          Janoshik hosts a public database of test results by peptide type and vendor. Use it to check whether a batch or supplier has been tested.
        </p>
        <a
          href="https://public.janoshik.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary mt-4 inline-block"
        >
          public.janoshik.com →
        </a>
      </div>

      <p className="mt-8 text-sm text-slate-500">
        We do not run tests ourselves. Always verify reports via the lab&apos;s official site (e.g. task ID on Janoshik) and follow your institution&apos;s or jurisdiction&apos;s requirements.
      </p>
    </div>
  );
}
