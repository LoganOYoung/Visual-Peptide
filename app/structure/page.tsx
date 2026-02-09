import Link from "next/link";
import type { Metadata } from "next";
import nextDynamic from "next/dynamic";
import { peptides, getPeptideByPdbId } from "@/lib/peptides";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PdbOpener } from "@/components/PdbOpener";
import { PdbStructureMetadata } from "@/components/PdbStructureMetadata";
import { StructurePageWrapper } from "@/components/StructurePageWrapper";
import { ViewerSectionErrorBoundary } from "@/components/ViewerSectionErrorBoundary";
import { getBaseUrl, getCanonicalUrl } from "@/lib/site";

/** Load 3D viewer only on client (no backend). Catch chunk load failure so we never throw to error boundary. */
const PdbViewerInSite = nextDynamic(
  () =>
    import("@/components/PdbViewerInSite")
      .then((m) => ({ default: m.PdbViewerInSite }))
      .catch(() => ({
        default: function ViewerLoadFailed() {
          return (
            <div className="flex h-[500px] flex-col items-center justify-center gap-2 rounded-none border-2 border-slate-200 bg-slate-100 px-4 text-center">
              <p className="text-slate-700">Viewer failed to load.</p>
              <a href="https://www.rcsb.org/3d-view/6XBM" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                Open in RCSB →
              </a>
            </div>
          );
        },
      })),
  { ssr: false, loading: () => <div className="h-[500px] animate-pulse rounded-none bg-slate-200" /> }
);

const structureCanonical = getCanonicalUrl("/structure");

/** Uses searchParams so must be dynamic; avoid static generation at build time. */
export const dynamic = "force-dynamic";

type SearchParams = { pdb?: string; chain?: string; residues?: string; labels?: string; simple?: string };

function resolveSearchParams(searchParams?: SearchParams | null): SearchParams {
  return searchParams ?? {};
}

async function getResolvedParams(
  searchParams?: SearchParams | Promise<SearchParams>
): Promise<SearchParams> {
  return searchParams instanceof Promise ? await searchParams : resolveSearchParams(searchParams);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}): Promise<Metadata> {
  try {
    const params = await getResolvedParams(searchParams);
    const pdb = params?.pdb?.trim().toUpperCase();
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
  } catch {
    return {
      title: "3D Structure",
      description: "View peptide structures in 3D.",
      alternates: { canonical: structureCanonical },
      openGraph: { url: structureCanonical },
    };
  }
}

/** PDB IDs for quick load; first is the default demo when no ?pdb= in URL. */
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

const DEFAULT_DEMO_PDB = TEST_PDB_IDS[0].id;
const DEFAULT_DEMO_LABEL = TEST_PDB_IDS[0].label;

function StructurePageFallback() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <h1 className="text-xl font-semibold text-slate-900">3D Structure</h1>
      <p className="mt-2 text-slate-600">The viewer failed to load. You can try again or go home.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/structure" className="btn-primary">
          Open structure page
        </Link>
        <Link href="/" className="rounded-none border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Go home
        </Link>
      </div>
    </div>
  );
}

export default async function StructurePage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  try {
    const params = await getResolvedParams(searchParams);
    const initialPdb = params?.pdb?.trim() ?? "";
    const initialChain = params?.chain?.trim() || null;
    const initialResidues = params?.residues?.trim() || null;
    const fixedLabels = params?.labels?.trim() || null;
    const withPdb = peptides.filter((p) => p.pdbId);
    const peptideForPdb = initialPdb ? getPeptideByPdbId(initialPdb) : undefined;
    const isDemo = !initialPdb;
    const displayPdb = initialPdb || DEFAULT_DEMO_PDB;

    const shareableParams = new URLSearchParams({ pdb: displayPdb });
    if (initialChain) shareableParams.set("chain", initialChain);
    if (initialResidues) shareableParams.set("residues", initialResidues);
    if (fixedLabels) shareableParams.set("labels", fixedLabels);
    const shareablePath = `/structure?${shareableParams.toString()}`;

    const quickLoadIds = [
      ...withPdb.map((p) => ({ id: p.pdbId!, label: p.name })),
      ...TEST_PDB_IDS.filter((t) => !withPdb.some((p) => p.pdbId === t.id)),
    ];

    return (
    <StructurePageWrapper>
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "3D Structure" }]} baseUrl={getBaseUrl()} />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">3D Structure Viewer</h1>
      <p className="mt-2 text-sm text-slate-600 sm:text-base">
        View peptide and protein structures from the PDB. Drag to rotate, scroll to zoom.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        For multi-frame trajectories: <Link href="/structure/demo" className="link-inline">3D reaction demo</Link>
      </p>

      {/* Viewer first: see the 3D, then change structure */}
      <div className="mt-6 sm:mt-8">
        {isDemo && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-none border border-teal-200 bg-teal-50/50 px-4 py-3">
            <span className="rounded-none bg-teal-100 px-2 py-0.5 text-xs font-medium text-teal-700">Demo</span>
            <span className="text-slate-700">
              Showing <strong className="text-slate-900">{DEFAULT_DEMO_LABEL}</strong> (PDB {DEFAULT_DEMO_PDB}).
            </span>
          </div>
        )}
        <p className="mb-4 text-sm text-slate-500 sm:text-slate-600">
          Click residues to explore binding sites.
        </p>
        {!isDemo && peptideForPdb && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-none border border-teal-200 bg-teal-50/50 px-4 py-3">
            <span className="text-slate-700">This structure is <strong className="text-slate-900">{peptideForPdb.name}</strong></span>
            <Link href={`/tools/calculator?peptide=${peptideForPdb.slug}`} className="btn-primary text-sm">
              Open calculator
            </Link>
            <Link href={`/peptides/${peptideForPdb.slug}`} className="link-inline text-sm">
              Peptide detail →
            </Link>
          </div>
        )}
        {!isDemo && initialPdb && !peptideForPdb && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-none border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="text-slate-700">PDB <strong className="text-slate-900">{initialPdb}</strong></span>
            <Link href={`https://www.rcsb.org/3d-view/${initialPdb}`} target="_blank" rel="noopener noreferrer" className="link-inline text-sm" aria-label="Open RCSB 3D view in new tab">
              Open in RCSB →
            </Link>
          </div>
        )}
        <ViewerSectionErrorBoundary
          fallback={
            <div className="flex h-[500px] flex-col items-center justify-center gap-2 rounded-none border-2 border-slate-200 bg-slate-100 px-4 text-center">
              <p className="text-slate-700">Viewer failed to load.</p>
              <a href={`https://www.rcsb.org/3d-view/${displayPdb}`} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                Open in RCSB →
              </a>
            </div>
          }
        >
          <PdbStructureMetadata pdbId={displayPdb} className="mb-4" />
          <PdbViewerInSite
            pdbId={displayPdb}
            minHeight={500}
            initialChain={initialChain}
            initialResidues={initialResidues}
            fixedLabels={fixedLabels}
          />
        </ViewerSectionErrorBoundary>
        <p className="mt-4 text-sm text-slate-600">
          Copy or share:{" "}
          <Link href={shareablePath} className="link-inline font-medium">
            {shareablePath}
          </Link>
        </p>
      </div>

      {/* Single card: load by ID or pick from list */}
      <div className="card mt-6 sm:mt-8">
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
    </StructurePageWrapper>
    );
  } catch (err) {
    console.error("Structure page server error:", err);
    return <StructurePageFallback />;
  }
}
