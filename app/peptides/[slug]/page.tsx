import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { getPeptideBySlug, getAllSlugs, PEPTIDE_CATEGORIES } from "@/lib/peptides";
import { getStructureRationale } from "@/lib/structureRationale";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MiniReconCalc } from "@/components/MiniReconCalc";
import { PdbViewerInSite } from "@/components/PdbViewerInSite";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const peptide = getPeptideBySlug(slug);
  if (!peptide) return { title: "Not Found" };
  const canonical = getCanonicalUrl(`/peptides/${slug}`);
  return {
    title: peptide.name,
    description: peptide.description,
    alternates: { canonical },
    openGraph: { url: canonical },
  };
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function PeptideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const peptide = getPeptideBySlug(slug);
  if (!peptide) notFound();

  const defaultDose = peptide.typicalDoseMcg
    ? parseInt(peptide.typicalDoseMcg.match(/\d+/)?.[0] ?? "250", 10)
    : 250;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Breadcrumbs
        items={[{ label: "Peptides", href: "/peptides" }, { label: peptide.name }]}
        baseUrl={getBaseUrl()}
      />
      <header className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{peptide.name}</h1>
            {peptide.shortName && (
              <p className="text-slate-500">{peptide.shortName}</p>
            )}
            {peptide.category && (
              <span className="mt-2 inline-block rounded-none bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                {PEPTIDE_CATEGORIES.find((c) => c.id === peptide.category)?.label ?? peptide.category}
              </span>
            )}
          </div>
          {peptide.pdbId && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link
                href={`/structure?pdb=${peptide.pdbId}`}
                className="btn-primary"
              >
                View 3D structure (PDB {peptide.pdbId}) →
              </Link>
              <Link
                href={`/tools/calculator?peptide=${peptide.slug}`}
                className="btn-secondary"
              >
                Dosing calculator
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* 3D viewer (if PDB available) */}
      {peptide.pdbId && (
        <div className="mt-8">
          {getStructureRationale(peptide.pdbId) && (
            <p className="mb-3 text-sm text-slate-600">
              <span className="font-medium text-slate-700">Why this structure: </span>
              {getStructureRationale(peptide.pdbId)}
            </p>
          )}
          <Suspense fallback={<div className="h-[400px] animate-pulse rounded-none bg-slate-100" />}>
            <PdbViewerInSite
              pdbId={peptide.pdbId}
              title={`${peptide.name} — PDB ${peptide.pdbId}`}
              minHeight={400}
            />
          </Suspense>
        </div>
      )}

      {/* Bio-Data table */}
      {(peptide.cas || peptide.molecularWeight || peptide.halfLife || peptide.sequence) && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-slate-900">Bio-data</h2>
          <dl className="mt-3 grid gap-2 sm:grid-cols-2">
            {peptide.molecularWeight && (
              <>
                <dt className="text-sm text-slate-500">Molecular weight</dt>
                <dd className="font-mono text-sm text-slate-700">{peptide.molecularWeight} Da</dd>
              </>
            )}
            {peptide.cas && (
              <>
                <dt className="text-sm text-slate-500">CAS</dt>
                <dd className="font-mono text-sm text-slate-600">{peptide.cas}</dd>
              </>
            )}
            {peptide.halfLife && (
              <>
                <dt className="text-sm text-slate-500">Half-life</dt>
                <dd className="text-slate-700">{peptide.halfLife}</dd>
              </>
            )}
            {peptide.sequence && (
              <>
                <dt className="text-sm text-slate-500">Sequence (fragment)</dt>
                <dd className="font-mono text-xs text-slate-600">{peptide.sequence}</dd>
              </>
            )}
          </dl>
        </div>
      )}

      <div className="card mt-6 space-y-4">
        <p className="text-slate-700">{peptide.description}</p>

        <dl className="grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
          {peptide.typicalDoseMcg && (
            <>
              <dt className="text-sm text-slate-500">Typical dose (research)</dt>
              <dd className="text-slate-900">{peptide.typicalDoseMcg} mcg</dd>
            </>
          )}
          {peptide.frequency && (
            <>
              <dt className="text-sm text-slate-500">Frequency</dt>
              <dd className="text-slate-900">{peptide.frequency}</dd>
            </>
          )}
          {peptide.reconNotes && (
            <>
              <dt className="text-sm text-slate-500 col-span-2">Reconstitution</dt>
              <dd className="text-slate-700 col-span-2">{peptide.reconNotes}</dd>
            </>
          )}
        </dl>
      </div>

      {/* Inline mini calculator */}
      <div className="mt-6">
        <MiniReconCalc
          defaultVialMg={5}
          defaultDiluentMl={2.5}
          defaultDoseMcg={defaultDose}
          peptideSlug={peptide.slug}
          peptideName={peptide.name}
        />
      </div>

      <p className="mt-4 text-sm text-slate-600">
        See guide: <Link href="/guide#concentration-dose" className="link-inline">Concentration & dose</Link>.
        <span className="ml-2">Verify purity before sourcing: <Link href="/verify" className="link-inline">Purity checker</Link>.</span>
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href={`/tools/calculator?peptide=${peptide.slug}`}
          className="btn-primary"
        >
          Open full calculator
        </Link>
        {peptide.pdbId && (
          <Link
            href={`/structure?pdb=${peptide.pdbId}`}
            className="btn-secondary"
          >
            View 3D structure
          </Link>
        )}
        <Link href="/peptides/compare" className="btn-secondary">
          Compare with others
        </Link>
      </div>
    </div>
  );
}
