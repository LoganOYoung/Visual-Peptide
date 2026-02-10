import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { peptides, getPeptideByPdbId } from "@/lib/peptides";
import { getStructureRationale } from "@/lib/structureRationale";
import { getStructureAlternatives } from "@/lib/structureAlternatives";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PdbOpener } from "@/components/PdbOpener";
import { PdbViewerInSite } from "@/components/PdbViewerInSite";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

const structureCanonical = getCanonicalUrl("/structure");

export function generateMetadata({
  searchParams,
}: {
  searchParams?: { pdb?: string };
}): Metadata {
  const pdb = searchParams?.pdb?.trim().toUpperCase();
  if (pdb) {
    return {
      title: `PDB ${pdb} — 3D Structure`,
      description: `View PDB structure ${pdb} in 3D. Peptide and protein molecular viewer.`,
      alternates: { canonical: structureCanonical },
      openGraph: { url: structureCanonical },
    };
  }
  return {
    title: "3D Structure",
    description: "View peptide structures in 3D. In-site viewer (no external embed).",
    alternates: { canonical: structureCanonical },
    openGraph: { url: structureCanonical },
  };
}

/** Default structure shown when no ?pdb= is in the URL (demo). */
const DEFAULT_DEMO_PDB = "7KI0";
const DEFAULT_DEMO_LABEL = "Semaglutide (GLP-1)";

/** Extra PDB IDs for testing 3D viewer (small/fast or peptide-related). Labels must match RCSB entry. */
const TEST_PDB_IDS: { id: string; label: string }[] = [
  { id: "7KI0", label: "Semaglutide (GLP-1)" },
  { id: "6XBM", label: "SMO-Gi complex" },
  { id: "7F9W", label: "Anti-CD25 antibodies" },
  { id: "1CRN", label: "Crambin (small protein)" },
  { id: "1UBQ", label: "Ubiquitin" },
  { id: "4N8T", label: "Membrane protein" },
  { id: "1JPY", label: "Protein (JPY)" },
  { id: "2LL5", label: "Small peptide" },
  { id: "1MO8", label: "Oxidoreductase" },
  { id: "2EJ0", label: "Protein (2EJ0)" },
  { id: "4DLN", label: "Protein (4DLN)" },
  { id: "5IRE", label: "Insulin receptor" },
  { id: "1D4P", label: "Small peptide" },
];

export default function StructurePage({
  searchParams,
}: {
  searchParams?: { pdb?: string };
}) {
  const initialPdb = searchParams?.pdb?.trim() ?? "";
  const peptideForPdb = initialPdb ? getPeptideByPdbId(initialPdb) : undefined;
  const isDemo = !initialPdb;
  const displayPdb = initialPdb || DEFAULT_DEMO_PDB;

  const structureRationale = getStructureRationale(displayPdb);
  const alternatives = getStructureAlternatives(displayPdb);
  const withPdbList = peptides.filter((p) => p.pdbId);
  const otherPdbList = TEST_PDB_IDS.filter((t) => !withPdbList.some((p) => p.pdbId === t.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "3D Structure" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">3D Structure Viewer</h1>
      <p className="mt-2 text-slate-600">
        From peptide choice and structure view to dosing and reconstitution—all in one place, without switching between databases and calculators.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        Start from a peptide below or enter any PDB ID. Structures load here—no need to leave the site. Drag to rotate, scroll to zoom.{" "}
        <Link href="/structure/demo" className="link-inline">Multi-frame demo</Link>
      </p>

      {/* Viewer first: see the 3D, then change structure */}
      <div className="mt-8">
        {isDemo && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-none border border-teal-200 bg-teal-50/50 px-4 py-3">
            <span className="rounded-none bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">Demo</span>
            <span className="text-slate-700">
              Showing <strong className="text-slate-900">{DEFAULT_DEMO_LABEL}</strong> (PDB {DEFAULT_DEMO_PDB}).
            </span>
          </div>
        )}
        {!isDemo && peptideForPdb && (
          <div className="mb-4 rounded-none border border-teal-200 bg-teal-50/50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wider text-teal-700">Your workflow: structure → dose → detail → verify</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-slate-700">This structure is <strong className="text-slate-900">{peptideForPdb.name}</strong></span>
              <Link href={`/tools/calculator?peptide=${peptideForPdb.slug}`} className="btn-primary text-sm">
                Dosing calculator
              </Link>
              <Link href={`/peptides/${peptideForPdb.slug}`} className="btn-secondary text-sm">
                Peptide detail
              </Link>
              <Link href="/verify" className="rounded-none border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Purity & Verify
              </Link>
            </div>
            <div className="mt-3">
              <span className="text-sm font-medium text-slate-700">Why this structure</span>
              <p className="mt-0.5 text-sm text-slate-600">
                {structureRationale ?? "—"}
              </p>
            </div>
            {alternatives.length > 0 && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Also useful: </span>
                {alternatives.map((alt, i) => (
                  <span key={alt.pdbId}>
                    {i > 0 && "; "}
                    <Link href={`/structure?pdb=${alt.pdbId}`} className="link-inline font-medium">{alt.pdbId}</Link>
                    {alt.label && ` (${alt.label})`}
                    {" — "}{alt.reason}
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
        {!isDemo && initialPdb && !peptideForPdb && (
          <div className="mb-4 rounded-none border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-700">PDB <strong className="text-slate-900">{initialPdb}</strong></span>
              <Link href={`https://www.rcsb.org/3d-view/${initialPdb}`} target="_blank" rel="noopener noreferrer" className="link-inline text-sm" aria-label="Open RCSB 3D view in new tab">
                Open in RCSB →
              </Link>
            </div>
            {(structureRationale || alternatives.length > 0) && (
              <div className="mt-3">
                {structureRationale && (
                  <>
                    <span className="text-sm font-medium text-slate-700">Why this structure</span>
                    <p className="mt-0.5 text-sm text-slate-600">{structureRationale}</p>
                  </>
                )}
                {alternatives.length > 0 && (
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-medium text-slate-700">Also useful: </span>
                    {alternatives.map((alt, i) => (
                      <span key={alt.pdbId}>
                        {i > 0 && "; "}
                        <Link href={`/structure?pdb=${alt.pdbId}`} className="link-inline font-medium">{alt.pdbId}</Link>
                        {alt.label && ` (${alt.label})`}
                        {" — "}{alt.reason}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        <details className="group mb-4 rounded-none border border-slate-200 bg-slate-50/80">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-slate-700 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2">
              <span aria-hidden className="inline-block transition-transform group-open:rotate-90">▸</span>
              How to use the 3D viewer
            </span>
          </summary>
          <div className="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
            <ul className="list-inside list-disc space-y-1">
              <li><strong>Rotate & zoom:</strong> Drag to rotate the structure; scroll to zoom in/out.</li>
              <li><strong>Chains:</strong> Use the checkboxes above the viewer to show or hide each chain.</li>
              <li><strong>Display mode:</strong> Switch between cartoon, stick, line, or sphere (buttons above the viewer).</li>
              <li><strong>Seq ↔ 3D:</strong> Open the panel to see residue numbers by chain; click a number to center the view on that residue. Hover in 3D to highlight the same residue in the panel.</li>
              <li><strong>Hover:</strong> Move the mouse over the structure to see full residue info (structure title, PDB ID, chain, residue) in the bottom-left overlay; configured residues show a short description. The hovered residue is highlighted in red (precise region under the cursor).</li>
              <li><strong>Measure:</strong> Turn on Measure, then click two atoms to see the distance (Å) and a red line between them.</li>
              <li><strong>Copy link</strong> copies this structure’s URL to the clipboard (paste to share). <strong>Export PNG</strong> saves the current view with a watermark; <strong>Download PDB</strong> and <strong>Copy Cite</strong> are in the bar above the viewer.</li>
            </ul>
          </div>
        </details>
        <Suspense fallback={<div className="h-[500px] animate-pulse rounded-none bg-slate-200" />}>
          <PdbViewerInSite pdbId={displayPdb} minHeight={500} />
        </Suspense>
        <p className="mt-4 text-sm text-slate-600">
          Use <strong>Copy link</strong> in the bar above the viewer to copy this structure’s URL and share it. Or open:{" "}
          <Link href={`/structure?pdb=${displayPdb}`} className="link-inline font-medium">
            /structure?pdb={displayPdb}
          </Link>
        </p>
        <p className="mt-3 text-sm text-slate-600">
          Need synthesis?{" "}
          <Link href="/inquiry" className="link-inline font-medium">
            Request quote / Send to synthesis lab →
          </Link>
        </p>
      </div>

      {/* Load by ID or pick: peptides with 3D first, then other structures */}
      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Load or pick a structure</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter a PDB ID or pick a peptide below to view its 3D structure in the viewer above.
        </p>
        <PdbOpener initialPdb={initialPdb} />
        {withPdbList.length > 0 && (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-teal-600">Peptides with 3D structure</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {withPdbList.map((p) => (
                <li key={p.pdbId!}>
                  <Link
                    href={`/structure?pdb=${p.pdbId}`}
                    className="inline-block rounded-none border border-teal-200 bg-teal-50/50 px-3 py-2 text-sm font-medium text-teal-800 transition hover:border-teal-400 hover:bg-teal-100"
                  >
                    {p.pdbId} — {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
        {otherPdbList.length > 0 && (
          <>
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">Other structures</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {otherPdbList.map(({ id, label }) => (
                <li key={id}>
                  <Link
                    href={`/structure?pdb=${id}`}
                    className="inline-block rounded-none border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-slate-900"
                  >
                    {id} — {label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="mt-4 text-sm text-slate-500">
        To load another structure, use the form above.
      </p>

      <p className="mt-6 text-sm text-slate-500">
        Data from RCSB PDB. For research and education. All viewing is in-site—no redirect.{" "}
        <Link href="/peptides" className="link-inline">Peptide Library</Link>
        {" · "}
        <Link href="/tools/calculator" className="link-inline">Calculator</Link>
        {" · "}
        <Link href="/verify" className="link-inline">Purity & Verify</Link>
        . Not all peptides have a public 3D structure; small peptides may be under different IDs or in other databases.
      </p>
    </div>
  );
}
