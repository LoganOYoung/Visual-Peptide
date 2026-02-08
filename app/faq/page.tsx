import Link from "next/link";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

const canonical = getCanonicalUrl("/faq");

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about reconstitution, storage, verification, tools, and peptide reference. Quick answers with links to Guide and tools.",
  alternates: { canonical },
  openGraph: { url: canonical },
};

const FAQ_GROUPS: {
  id: string;
  heading: string;
  items: { id: string; q: string; a: React.ReactNode }[];
}[] = [
  {
    id: "reconstitution",
    heading: "Reconstitution & storage",
    items: [
      {
        id: "water",
        q: "What water should I use for reconstitution?",
        a: "Bacteriostatic water (BAC water) or sterile diluent per your protocol. Do not use plain tap or distilled water. Check your lab or product instructions.",
      },
      {
        id: "storage-time",
        q: "How long can reconstituted peptide be stored?",
        a: (
          <>
            Many peptides are stable 2–8 °C for about 30 days after reconstitution; stability varies by peptide and formulation. Follow your product leaflet or protocol. Use the stability helper on the{" "}
            <Link href="/guide#stability" className="link-inline">Guide (Stability)</Link> to get a suggested use-by date.
          </>
        ),
      },
      {
        id: "first-time",
        q: "What should I know before reconstituting for the first time?",
        a: (
          <>
            Use sterile technique: clean work surface, avoid touching the rubber stopper or needle. Let vial and diluent reach room temperature if refrigerated. Follow the{" "}
            <Link href="/guide#reconstitution-steps" className="link-inline">reconstitution steps</Link> in our Guide and your product or lab protocol.
          </>
        ),
      },
    ],
  },
  {
    id: "verification",
    heading: "Verification & reports",
    items: [
      {
        id: "where-verify",
        q: "Where can I verify purity and get reports?",
        a: (
          <>
            Third-party labs such as Janoshik offer HPLC purity, mass spec identity, and potency testing. See our{" "}
            <Link href="/verify" className="link-inline">Purity & Verify</Link> page for Janoshik and the public results database. Use the verification helper there to open the official page with your task ID.
          </>
        ),
      },
      {
        id: "real-report",
        q: "How do I know my Janoshik report is real?",
        a: (
          <>
            Every report has a task ID. Go to Janoshik&apos;s site and use &quot;Verify report&quot; (or the link from our{" "}
            <Link href="/verify" className="link-inline">verification helper</Link>), enter the task ID, and confirm the content matches your report. Do not trust reports that cannot be verified on the lab&apos;s official site.
          </>
        ),
      },
      {
        id: "purity-vs-potency",
        q: "What is the difference between purity and potency on a report?",
        a: "Purity (e.g. HPLC) is the percentage of the target peptide in the sample. Potency is the actual amount of active peptide per vial (e.g. mg per vial). Both matter: high purity with low potency means less active compound than labeled.",
      },
    ],
  },
  {
    id: "tools",
    heading: "Tools",
    items: [
      {
        id: "mcg-mg",
        q: "How do I convert mcg to mg?",
        a: (
          <>
            1 mg = 1000 mcg. Divide mcg by 1000 to get mg. Use our{" "}
            <Link href="/tools/calculator" className="link-inline">Recon & Dosing Calculator</Link> or{" "}
            <Link href="/tools/unit-converter" className="link-inline">Unit Converter</Link> for dose and concentration.
          </>
        ),
      },
      {
        id: "syringe-size",
        q: "What if my syringe is 0.3 mL or 0.5 mL, not 1 mL?",
        a: (
          <>
            The{" "}
            <Link href="/tools/calculator" className="link-inline">Recon & Dosing Calculator</Link> lets you choose syringe size (0.3 mL / 30 units, 0.5 mL / 50 units, or 1 mL / 100 units) and shows the volume to draw and units for your syringe.
          </>
        ),
      },
      {
        id: "syringe-visual",
        q: "How can I see where to draw to on my syringe?",
        a: (
          <>
            Use the{" "}
            <Link href="/tools/syringe-planner" className="link-inline">Syringe Planner</Link>: enter your recon parameters and dose, pick your syringe type, and you get a visual showing the fill line so you know exactly where to draw to.
          </>
        ),
      },
      {
        id: "vials-cycle",
        q: "How many vials do I need for a cycle?",
        a: (
          <>
            Use the{" "}
            <Link href="/tools/vial-cycle" className="link-inline">Vial & Cycle</Link> tool: enter vial size (mg), dose per injection (mcg), and injections per day to see how many days one vial lasts, then enter target days to get the number of vials needed.
          </>
        ),
      },
      {
        id: "cost-per-dose",
        q: "How do I work out cost per injection?",
        a: (
          <>
            Use{" "}
            <Link href="/tools/cost" className="link-inline">Cost per Dose</Link>: enter price per vial, mg per vial, and your dose (mcg) to get the cost per injection. Useful for comparing suppliers or doses.
          </>
        ),
      },
    ],
  },
  {
    id: "peptides",
    heading: "Peptides & dose reference",
    items: [
      {
        id: "typical-dose",
        q: "Where can I find typical dose and frequency for a peptide?",
        a: (
          <>
            Our{" "}
            <Link href="/peptides" className="link-inline">Peptide Library</Link> lists peptides by category (Metabolic, Repair & Healing, Cognitive, etc.). Each peptide page has typical dose (mcg), frequency, reconstitution notes, and a link to the calculator for your vial.
          </>
        ),
      },
      {
        id: "compare-peptides",
        q: "How do I compare two or three peptides?",
        a: (
          <>
            Use{" "}
            <Link href="/peptides/compare" className="link-inline">Compare</Link>: select up to 3 peptides to see dose, frequency, description, reconstitution, and category side by side. You can also start from a peptide&apos;s Library card with &quot;Compare&quot;.
          </>
        ),
      },
    ],
  },
  {
    id: "about-site",
    heading: "About this site",
    items: [
      {
        id: "research-clinical",
        q: "Is the information here for research or clinical use?",
        a: (
          <>
            All content is for <strong>research and education only</strong>. Doses and protocols cited are common research references, not clinical recommendations. Clinical use follows different regulations and protocols — we do not provide medical advice. See{" "}
            <Link href="/about" className="link-inline">About</Link> for full disclaimer.
          </>
        ),
      },
      {
        id: "sell-advice",
        q: "Do you sell peptides or give medical advice?",
        a: (
          <>
            No. We do not sell peptides, run tests, or give medical advice. We only provide calculators, peptide reference, verification links (e.g. Janoshik), and educational content. See{" "}
            <Link href="/about" className="link-inline">About</Link> for details.
          </>
        ),
      },
    ],
  },
];

/** Plain-text answers for FAQPage JSON-LD (same order as FAQ_GROUPS items). */
const FAQ_PLAIN_ANSWERS: string[] = [
  "Bacteriostatic water (BAC water) or sterile diluent per your protocol. Do not use plain tap or distilled water. Check your lab or product instructions.",
  "Many peptides are stable 2–8 °C for about 30 days after reconstitution; stability varies by peptide and formulation. Follow your product leaflet or protocol. Use the stability helper on the Guide (Stability) to get a suggested use-by date.",
  "Use sterile technique: clean work surface, avoid touching the rubber stopper or needle. Let vial and diluent reach room temperature if refrigerated. Follow the reconstitution steps in our Guide and your product or lab protocol.",
  "Third-party labs such as Janoshik offer HPLC purity, mass spec identity, and potency testing. See our Purity & Verify page for Janoshik and the public results database. Use the verification helper there to open the official page with your task ID.",
  "Every report has a task ID. Go to Janoshik's site and use Verify report (or the link from our verification helper), enter the task ID, and confirm the content matches your report. Do not trust reports that cannot be verified on the lab's official site.",
  "Purity (e.g. HPLC) is the percentage of the target peptide in the sample. Potency is the actual amount of active peptide per vial (e.g. mg per vial). Both matter: high purity with low potency means less active compound than labeled.",
  "1 mg = 1000 mcg. Divide mcg by 1000 to get mg. Use our Recon & Dosing Calculator or Unit Converter for dose and concentration.",
  "The Recon & Dosing Calculator lets you choose syringe size (0.3 mL / 30 units, 0.5 mL / 50 units, or 1 mL / 100 units) and shows the volume to draw and units for your syringe.",
  "Use the Syringe Planner: enter your recon parameters and dose, pick your syringe type, and you get a visual showing the fill line so you know exactly where to draw to.",
  "Use the Vial & Cycle tool: enter vial size (mg), dose per injection (mcg), and injections per day to see how many days one vial lasts, then enter target days to get the number of vials needed.",
  "Use Cost per Dose: enter price per vial, mg per vial, and your dose (mcg) to get the cost per injection. Useful for comparing suppliers or doses.",
  "Our Peptide Library lists peptides by category (Metabolic, Repair & Healing, Cognitive, etc.). Each peptide page has typical dose (mcg), frequency, reconstitution notes, and a link to the calculator for your vial.",
  "Use Compare: select up to 3 peptides to see dose, frequency, description, reconstitution, and category side by side. You can also start from a peptide's Library card with Compare.",
  "All content is for research and education only. Doses and protocols cited are common research references, not clinical recommendations. Clinical use follows different regulations and protocols — we do not provide medical advice. See About for full disclaimer.",
  "No. We do not sell peptides, run tests, or give medical advice. We only provide calculators, peptide reference, verification links (e.g. Janoshik), and educational content. See About for details.",
];

function buildFaqJsonLd() {
  const mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[] = [];
  let idx = 0;
  for (const group of FAQ_GROUPS) {
    for (const item of group.items) {
      mainEntity.push({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: FAQ_PLAIN_ANSWERS[idx] ?? item.q },
      });
      idx += 1;
    }
  }
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity };
}

export default function FAQPage() {
  const faqJsonLd = buildFaqJsonLd();
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Breadcrumbs items={[{ label: "Help", href: "/guide" }, { label: "FAQ" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">FAQ</h1>
      <p className="mt-2 text-slate-600">
        Quick answers to common questions. New to peptides? Start with the{" "}
        <Link href="/guide" className="link-inline">Guide</Link>, then use this page for specific topics.
      </p>

      <nav className="mt-4 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600" aria-label="FAQ topics">
        {FAQ_GROUPS.map((group, i) => (
          <span key={group.id}>
            {i > 0 && <span aria-hidden className="text-slate-400">· </span>}
            <a href={`#faq-${group.id}`} className="link-inline">
              {group.heading}
            </a>
          </span>
        ))}
      </nav>

      <div className="mt-8 space-y-10">
        {FAQ_GROUPS.map((group) => (
          <section key={group.id} id={`faq-${group.id}`} className="scroll-mt-24">
            <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-4">
              {group.heading}
            </h2>
            <dl className="space-y-4">
              {group.items.map((item) => (
                <div key={item.id} id={`faq-${group.id}-${item.id}`} className="card scroll-mt-24">
                  <dt className="font-semibold text-slate-900">{item.q}</dt>
                  <dd className="mt-2 text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-500">
        <Link href="/guide" className="link-inline">Guide</Link>
        {" · "}
        <Link href="/tools" className="link-inline">Tools</Link>
        {" · "}
        <Link href="/peptides" className="link-inline">Peptide Library</Link>
        {" · "}
        <Link href="/peptides/compare" className="link-inline">Compare</Link>
        {" · "}
        <Link href="/verify" className="link-inline">Purity & Verify</Link>
        {" · "}
        <Link href="/suppliers" className="link-inline">Suppliers</Link>
        {" · "}
        <Link href="/about" className="link-inline">About</Link>
      </p>
    </div>
  );
}
