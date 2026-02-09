import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { peptides, getPeptideByPdbId } from "@/lib/peptides";
import { getStructureRationale } from "@/lib/structureRationale";
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
const DEFAULT_DEMO_PDB = "6XBM";
const DEFAULT_DEMO_LABEL = "Semaglutide (GLP-1)";

/** Extra PDB IDs for testing 3D viewer (small/fast or peptide-related). */
const TEST_PDB_IDS: { id: string; label: string }[] = [
  { id: "6XBM", label: "Semaglutide (GLP-1)" },
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
  { id: "7F9W", label: "GLP-1 receptor" },
];

export default function StructurePage({
  searchParams,
}: {
  searchParams?: { pdb?: string };
}) {
  const initialPdb = searchParams?.pdb?.trim() ?? "";
  const withPdb = peptides.filter((p) => p.pdbId);
  const peptideForPdb = initialPdb ? getPeptideByPdbId(initialPdb) : undefined;
  const isDemo = !initialPdb;
  const displayPdb = initialPdb || DEFAULT_DEMO_PDB;

  const quickLoadIds = [
    ...withPdb.map((p) => ({ id: p.pdbId!, label: p.name })),
    ...TEST_PDB_IDS.filter((t) => !withPdb.some((p) => p.pdbId === t.id)),
  ];

  const structureRationale = getStructureRationale(displayPdb);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "3D Structure" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">3D Structure Viewer</h1>
      <p className="mt-2 text-slate-600">
        从肽段选择、结构查看，到剂量计算与复溶——一站完成，无需在数据库和计算器之间切换。
      </p>
      <p className="mt-1 text-sm text-slate-500">
        View PDB structures in-page. Drag to rotate, scroll to zoom.{" "}
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
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-700">当前结构对应肽段 <strong className="text-slate-900">{peptideForPdb.name}</strong></span>
              <Link href={`/tools/calculator?peptide=${peptideForPdb.slug}`} className="btn-primary text-sm">
                剂量计算
              </Link>
              <Link href={`/peptides/${peptideForPdb.slug}`} className="btn-secondary text-sm">
                肽段详情
              </Link>
              <Link href="/verify" className="rounded-none border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                验证报告
              </Link>
            </div>
            {structureRationale && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">为何选此结构：</span>
                {structureRationale}
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
            {structureRationale && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-medium text-slate-700">为何选此结构：</span>
                {structureRationale}
              </p>
            )}
          </div>
        )}
        <Suspense fallback={<div className="h-[500px] animate-pulse rounded-none bg-slate-200" />}>
          <PdbViewerInSite pdbId={displayPdb} minHeight={500} />
        </Suspense>
        <p className="mt-4 text-sm text-slate-600">
          Copy or share this link to open the same structure (PDB {displayPdb}) directly:{" "}
          <Link href={`/structure?pdb=${displayPdb}`} className="link-inline font-medium">
            /structure?pdb={displayPdb}
          </Link>
        </p>
      </div>

      {/* Single card: load by ID or pick from list */}
      <div className="card mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Load or pick a structure</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter a PDB ID or click one below to load in the viewer above.
        </p>
        <PdbOpener initialPdb={initialPdb} />
        <p className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">Quick load</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {quickLoadIds.map(({ id, label }) => (
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
      </div>

      <p className="mt-4 text-sm text-slate-500">
        To load another structure, use the form above.
      </p>

      <p className="mt-6 text-sm text-slate-500">
        Data from RCSB PDB. For research and education.{" "}
        <Link href="/peptides" className="link-inline">Peptide Library</Link>
        {" · "}
        <Link href="/tools/calculator" className="link-inline">Calculator</Link>
        . Not all peptides have a public 3D structure; small peptides may be under different IDs or in other databases.
      </p>
    </div>
  );
}
