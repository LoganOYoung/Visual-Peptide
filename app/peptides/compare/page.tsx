"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { peptides, PEPTIDE_CATEGORIES, type Peptide } from "@/lib/peptides";
import { getBaseUrl } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const MAX_SLOTS = 3;
const PLACEHOLDER = "";

const QUICK_PRESETS: { label: string; slugs: string[] }[] = [
  { label: "BPC-157 vs TB-500", slugs: ["bpc-157", "tb-500"] },
  { label: "GLP-1 comparison", slugs: ["semaglutide", "tirzepatide"] },
];

function parseCompareQuery(query: string | null): string[] {
  if (!query?.trim()) return [PLACEHOLDER, PLACEHOLDER, PLACEHOLDER];
  const slugs = query.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const valid = slugs.filter((slug) => peptides.some((p) => p.slug === slug));
  const result: string[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) result.push(valid[i] ?? PLACEHOLDER);
  return result;
}

function buildCompareQuery(selected: string[]): string {
  const list = selected.filter((s) => s !== PLACEHOLDER);
  return list.length ? list.join(",") : "";
}

function CompareRow({
  label,
  cells,
  highlightLabel,
  rowIndex,
}: {
  label: string;
  cells: (string | React.ReactNode)[];
  highlightLabel?: boolean;
  rowIndex?: number;
}) {
  return (
    <tr
      className={`border-b border-slate-200 last:border-0 ${
        rowIndex != null && rowIndex % 2 === 1 ? "bg-slate-50" : ""
      } hover:bg-slate-100/80 transition-colors`}
    >
      <th
        className={`whitespace-nowrap py-3 pr-4 text-left text-sm font-medium ${
          highlightLabel ? "text-teal-600" : "text-slate-500"
        }`}
      >
        {label}
      </th>
      {cells.map((cell, i) => (
        <td key={i} className="py-3 px-4 text-sm text-slate-700">
          {cell}
        </td>
      ))}
    </tr>
  );
}

function PeptideCompareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const compareQuery = searchParams.get("compare");

  const [selected, setSelected] = useState<string[]>(() =>
    parseCompareQuery(compareQuery)
  );

  useEffect(() => {
    setSelected(parseCompareQuery(compareQuery));
  }, [compareQuery]);

  const selectedPeptides = selected
    .map((slug) => (slug === PLACEHOLDER ? null : peptides.find((p) => p.slug === slug)))
    .filter((p): p is Peptide => p != null);

  const syncUrl = useCallback(
    (next: string[]) => {
      const q = buildCompareQuery(next);
      const url = q ? `/peptides/compare?compare=${encodeURIComponent(q)}` : "/peptides/compare";
      router.replace(url, { scroll: false });
    },
    [router]
  );

  const updateSelect = (index: number, slug: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = slug;
      syncUrl(next);
      return next;
    });
  };

  const clearSlot = (index: number) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = PLACEHOLDER;
      syncUrl(next);
      return next;
    });
  };

  const applyPreset = (slugs: string[]) => {
    const next: string[] = [];
    for (let i = 0; i < MAX_SLOTS; i++) next.push(slugs[i] ?? PLACEHOLDER);
    setSelected(next);
    syncUrl(next);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <Breadcrumbs
        items={[{ label: "Peptides", href: "/peptides" }, { label: "Compare" }]}
        baseUrl={getBaseUrl()}
      />
      <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Compare Peptides</h1>
      <p className="mt-2 text-slate-600">
        Select up to 3 peptides to compare dose, frequency, and usage side by side.
        Use the dropdowns below to choose peptides, or pick a quick comparison.
      </p>
      <p className="mt-1 text-sm text-slate-500">
        You can also browse the <Link href="/peptides" className="link-inline">Library</Link> first, then come here to compare.
      </p>

      {QUICK_PRESETS.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500">Quick compare:</span>
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.slugs)}
              className="inline-flex min-h-[44px] items-center rounded-none border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <label className="min-w-[160px]">
              <span className="block text-sm font-medium text-slate-600">
                Peptide {i + 1}
              </span>
              <select
                value={selected[i]}
                onChange={(e) => updateSelect(i, e.target.value)}
                className="input mt-1"
                aria-label={`Select peptide ${i + 1}`}
              >
                <option value={PLACEHOLDER}>— Select —</option>
                {peptides.map((p) => (
                  <option
                    key={p.slug}
                    value={p.slug}
                    disabled={
                      selected.filter((s) => s === p.slug).length >= 1 &&
                      selected[i] !== p.slug
                    }
                  >
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            {selected[i] !== PLACEHOLDER && (
              <button
                type="button"
                onClick={() => clearSlot(i)}
                className="inline-flex min-h-[44px] items-center rounded-none border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200"
                aria-label={`Clear peptide ${i + 1}`}
              >
                Clear
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedPeptides.length === 0 ? (
        <div className="card mt-8 text-center text-slate-600">
          <p className="font-medium">Select at least one peptide above to see the comparison table.</p>
          <p className="mt-2 text-sm text-slate-500">
            Use the dropdowns to choose 1–3 peptides, or click a quick compare button above.
          </p>
        </div>
      ) : (
        <>
          {selectedPeptides.length >= 2 && (
            <p className="mt-6 text-xs text-slate-500 sm:hidden">
              Swipe horizontally to see all columns.
            </p>
          )}
          <div className="card mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px]" role="table" aria-label="Peptide comparison">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="py-3 pr-4 text-left text-sm font-medium text-slate-500">
                    Property
                  </th>
                  {selectedPeptides.map((p) => (
                    <th key={p.slug} className="py-3 px-4 text-left">
                      <Link
                        href={`/peptides/${p.slug}`}
                        className="font-semibold text-slate-900 hover:text-teal-600"
                      >
                        {p.name}
                      </Link>
                      {p.shortName && (
                        <p className="mt-0.5 text-xs font-normal text-slate-500">
                          {p.shortName}
                        </p>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <CompareRow
                  label="Category"
                  cells={selectedPeptides.map((p) => {
                    const cat = p.category || "other";
                    const label = PEPTIDE_CATEGORIES.find((c) => c.id === cat)?.label ?? cat;
                    return (
                      <span key={p.slug} className="rounded-none bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                        {label}
                      </span>
                    );
                  })}
                  rowIndex={0}
                />
                <CompareRow
                  label="Typical dose (research)"
                  cells={selectedPeptides.map((p) => p.typicalDoseMcg ?? "—")}
                  rowIndex={1}
                />
                <CompareRow
                  label="Frequency"
                  cells={selectedPeptides.map((p) => p.frequency ?? "—")}
                  rowIndex={2}
                />
                <CompareRow
                  label="Description / use"
                  cells={selectedPeptides.map((p) => (
                    <span className="block max-w-[240px]">{p.description}</span>
                  ))}
                  highlightLabel
                  rowIndex={3}
                />
                <CompareRow
                  label="Reconstitution"
                  cells={selectedPeptides.map((p) => (
                    <span className="block max-w-[240px]">
                      {p.reconNotes ?? "—"}
                    </span>
                  ))}
                  rowIndex={4}
                />
                <CompareRow
                  label="3D structure"
                  cells={selectedPeptides.map((p) =>
                    p.pdbId ? (
                      <Link
                        href={`/structure?pdb=${p.pdbId}`}
                        className="link-inline"
                      >
                        PDB {p.pdbId} →
                      </Link>
                    ) : (
                      "—"
                    )
                  )}
                  rowIndex={5}
                />
                <CompareRow
                  label="CAS"
                  cells={selectedPeptides.map((p) => (
                    <span className="font-mono text-slate-600">
                      {p.cas ?? "—"}
                    </span>
                  ))}
                  rowIndex={6}
                />
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-4">
        {selectedPeptides.map((p) => (
          <Link
            key={p.slug}
            href={`/peptides/${p.slug}`}
            className="btn-secondary"
          >
            {p.name} detail →
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-slate-600">
        <Link href="/tools/calculator" className="link-inline">Calculator</Link>
        {" · "}
        <Link href="/guide#concentration-dose" className="link-inline">Guide: Concentration & dose</Link>
      </p>
    </div>
  );
}

export default function PeptideComparePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <Breadcrumbs items={[{ label: "Peptides", href: "/peptides" }, { label: "Compare" }]} baseUrl={getBaseUrl()} />
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Compare Peptides</h1>
        <p className="mt-4 text-slate-500">Loading comparison…</p>
      </div>
    }>
      <PeptideCompareContent />
    </Suspense>
  );
}
