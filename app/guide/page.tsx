import Link from "next/link";
import type { Metadata } from "next";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { StabilityHelper } from "@/components/StabilityHelper";

const canonical = getCanonicalUrl("/guide");

export const metadata: Metadata = {
  title: "Reconstitution Guide",
  description: "Steps for reconstituting lyophilized peptides, units (mcg, mg, mL), concentration and dose, stability, and which tools to use when.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Help", href: "/guide" }, { label: "Reconstitution Guide" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Reconstitution & Dosing Guide</h1>
      <p className="mt-2 text-slate-600">
        Basic steps for reconstituting lyophilized peptides and calculating doses. For research use only.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        First time here? Read sections <strong>1 → 2 → 3 → 4</strong> in order for the full workflow.
      </p>

      <nav className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-slate-600 sm:gap-x-4 sm:gap-y-1" aria-label="In this page">
        <a href="#what-you-need" className="link-inline py-1">1. What you need</a>
        <span aria-hidden>·</span>
        <a href="#units" className="link-inline">2. Units</a>
        <span aria-hidden>·</span>
        <a href="#reconstitution-steps" className="link-inline">3. Reconstitution steps</a>
        <span aria-hidden>·</span>
        <a href="#concentration-dose" className="link-inline">4. Concentration & dose</a>
        <span aria-hidden>·</span>
        <a href="#purity" className="link-inline">5. Purity</a>
        <span aria-hidden>·</span>
        <a href="#stability" className="link-inline">6. Stability</a>
        <span aria-hidden>·</span>
        <a href="#tools-at-a-glance" className="link-inline">7. Tools</a>
        <span aria-hidden>·</span>
        <a href="#more-questions" className="link-inline">8. More questions</a>
      </nav>

      <div className="mt-8 space-y-8">
        <section id="what-you-need" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">1. What you need</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600">
            <li>Lyophilized peptide vial (e.g. 5 mg)</li>
            <li>Bacteriostatic water (BAC water) or sterile diluent per protocol</li>
            <li>Syringe (e.g. 1 mL insulin syringe for dosing)</li>
            <li>Clean, sterile technique</li>
          </ul>
        </section>

        <section id="units" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">2. Units you’ll see</h2>
          <p className="mt-2 text-slate-600">
            Doses and labels use standard mass and volume units. Converting correctly avoids errors.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-slate-600">
            <li><strong className="text-slate-700">mg</strong> (milligram) — peptide per vial, e.g. 5 mg.</li>
            <li><strong className="text-slate-700">mcg</strong> (microgram) — dose per injection; 1000 mcg = 1 mg.</li>
            <li><strong className="text-slate-700">mL</strong> (milliliter) — diluent volume and volume to draw; 1 mL = 1000 µL.</li>
            <li><strong className="text-slate-700">IU</strong> — sometimes used for certain peptides (e.g. some GLP-1); convert using product or literature when needed.</li>
          </ul>
          <p className="mt-3 text-sm text-slate-500">
            For quick mcg ↔ mg and other conversions, use our{" "}
            <Link href="/tools/unit-converter" className="link-inline">Unit Converter</Link>.
          </p>
        </section>

        <section id="reconstitution-steps" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">3. Reconstitution steps</h2>
          <ol className="mt-3 list-decimal list-inside space-y-2 text-slate-600">
            <li>Let vial and diluent reach room temperature if stored cold.</li>
            <li>Draw the desired volume of diluent into a syringe.</li>
            <li>Inject the diluent slowly into the peptide vial (along the wall to avoid foaming).</li>
            <li>Gently swirl or roll — do not shake — until the powder is fully dissolved.</li>
            <li>Store reconstituted peptide as per protocol (often 2–8 °C and use within a defined period).</li>
          </ol>
          <p className="mt-3 text-sm text-slate-500">
            To see exactly where to draw to on your syringe after reconstituting, use the{" "}
            <Link href="/tools/syringe-planner" className="link-inline">Syringe Planner</Link>.
          </p>
        </section>

        <section id="concentration-dose" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">4. Concentration and dose</h2>
          <p className="mt-2 text-slate-600">
            <strong className="text-slate-700">Concentration (mg/mL)</strong> = peptide mass (mg) ÷ diluent volume (mL). To hit a target dose in mcg: convert dose to mg (dose ÷ 1000), then divide by concentration to get the volume (mL) to draw. Use our{" "}
            <Link href="/tools/calculator" className="link-inline">Recon & Dosing Calculator</Link>{" "}
            for exact numbers and syringe units.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Doses cited here and in our peptide pages are for <strong>research reference only</strong>; clinical use follows different protocols and regulations.
          </p>
        </section>

        <section id="purity" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">5. Purity and sourcing</h2>
          <p className="mt-2 text-slate-600">
            Peptide identity and purity should be verified by third-party testing (e.g. HPLC, mass spec). Before you source, use our{" "}
            <Link href="/verify" className="link-inline">Purity & Verify</Link>{" "}
            page to check reports (e.g. Janoshik Task ID) and see the public result database.
          </p>
        </section>

        <section id="stability" className="scroll-mt-24">
          <StabilityHelper />
        </section>

        <section id="tools-at-a-glance" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">7. Tools at a glance</h2>
          <p className="mt-2 text-slate-600">
            Use the right tool for each step of your workflow:
          </p>
          <ul className="mt-3 space-y-3 text-slate-600">
            <li>
              <Link href="/tools/calculator" className="link-inline font-medium text-slate-800">Recon & Dosing Calculator</Link>
              {" — "}Peptide mass (mg), diluent (mL), target dose (mcg), syringe size → concentration, volume to draw, units. Use after recon to plan each injection.
            </li>
            <li>
              <Link href="/tools/syringe-planner" className="link-inline font-medium text-slate-800">Syringe Planner</Link>
              {" — "}Same inputs as the calculator plus syringe type → visual syringe showing where to draw to. Use when you want to see the fill line.
            </li>
            <li>
              <Link href="/tools/vial-cycle" className="link-inline font-medium text-slate-800">Vial & Cycle</Link>
              {" — "}Dose, frequency, vial size → days per vial, vials per cycle. Use to plan how many vials to buy and how long one vial lasts.
            </li>
            <li>
              <Link href="/tools/unit-converter" className="link-inline font-medium text-slate-800">Unit Converter</Link>
              {" — "}mcg ↔ mg and other mass/volume conversions. Use for quick unit checks.
            </li>
            <li>
              <Link href="/tools/cost" className="link-inline font-medium text-slate-800">Cost per Dose</Link>
              {" — "}Price per vial, mg per vial, dose (mcg) → cost per injection. Use to compare cost across products or doses.
            </li>
          </ul>
          <p className="mt-4 text-sm text-slate-500">
            For peptide reference (typical dose, frequency, recon notes): <Link href="/peptides" className="link-inline">Peptide Library</Link>. To compare 2–3 peptides side by side: <Link href="/peptides/compare" className="link-inline">Compare</Link>. For 3D structure: <Link href="/structure" className="link-inline">3D Structure</Link>.
          </p>
        </section>

        <section id="more-questions" className="card scroll-mt-24">
          <h2 className="text-lg font-semibold text-slate-900">8. More questions</h2>
          <p className="mt-2 text-slate-600">
            Common questions about reconstitution, storage, and verification are on our{" "}
            <Link href="/faq" className="link-inline">FAQ</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
