import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StabilityHelper } from "@/components/StabilityHelper";

export const metadata: Metadata = {
  title: "Reconstitution Guide",
  description: "Steps for reconstituting lyophilized peptides, concentration and dose concepts, stability.",
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Help", href: "/guide" }, { label: "Reconstitution Guide" }]} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Reconstitution & Dosing Guide</h1>
      <p className="mt-2 text-slate-600">
        Basic steps for reconstituting lyophilized peptides and calculating doses. For research use only.
      </p>

      <div className="mt-8 space-y-8">
        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">1. What you need</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600">
            <li>Lyophilized peptide vial (e.g. 5 mg)</li>
            <li>Bacteriostatic water (BAC water) or sterile diluent per protocol</li>
            <li>Syringe (e.g. 1 mL insulin syringe for dosing)</li>
            <li>Clean, sterile technique</li>
          </ul>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">2. Reconstitution steps</h2>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
            <li>Let vial and diluent reach room temperature if stored cold.</li>
            <li>Draw the desired volume of diluent into a syringe.</li>
            <li>Inject the diluent slowly into the peptide vial (along the wall to avoid foaming).</li>
            <li>Gently swirl or roll — do not shake — until the powder is fully dissolved.</li>
            <li>Store reconstituted peptide as per protocol (often 2–8 °C and use within a defined period).</li>
          </ol>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">3. Concentration and dose</h2>
          <p className="mt-2 text-slate-600">
            Concentration (mg/mL) = peptide mass (mg) ÷ diluent volume (mL). To hit a target dose in mcg, divide dose (mcg) by 1000 to get mg, then divide by concentration to get the volume to draw. Use our{" "}
            <Link href="/tools/calculator" className="link-inline">calculator</Link>{" "}
            for exact numbers.
          </p>
        </section>

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">4. Purity and sourcing</h2>
          <p className="mt-2 text-slate-600">
            Peptide identity and purity should be verified by third-party testing (e.g. HPLC, mass spec). See our{" "}
            <Link href="/verify" className="link-inline">Purity & Verify</Link>{" "}
            page for links to Janoshik and public result databases.
          </p>
        </section>

        <StabilityHelper />

        <section className="card">
          <h2 className="text-lg font-semibold text-slate-900">6. FAQ</h2>
          <p className="mt-2 text-slate-600">
            Common questions about reconstitution, storage, and verification are answered on our{" "}
            <Link href="/faq" className="link-inline">FAQ page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
