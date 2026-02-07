"use client";

import { useState } from "react";
import Link from "next/link";
import { peptides, type Peptide } from "@/lib/peptides";
import { Breadcrumbs } from "@/components/Breadcrumbs";

const MAX_SELECT = 3;
const PLACEHOLDER = "";

function CompareRow({
  label,
  cells,
  highlightLabel,
}: {
  label: string;
  cells: (string | React.ReactNode)[];
  highlightLabel?: boolean;
}) {
  return (
    <tr className="border-b border-slate-200 last:border-0">
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

export default function PeptideComparePage() {
  const [selected, setSelected] = useState<string[]>([PLACEHOLDER, PLACEHOLDER, PLACEHOLDER]);

  const selectedPeptides = selected
    .map((slug) => (slug === PLACEHOLDER ? null : peptides.find((p) => p.slug === slug)))
    .filter((p): p is Peptide => p != null);

  const updateSelect = (index: number, slug: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[index] = slug;
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Breadcrumbs
        items={[{ label: "Peptides", href: "/peptides" }, { label: "Compare" }]}
      />
      <h1 className="mt-2 text-3xl font-bold text-slate-900">Compare Peptides</h1>
      <p className="mt-2 text-slate-600">
        Select up to 3 peptides to compare dose, frequency, and usage side by side.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        {[0, 1, 2].map((i) => (
          <label key={i} className="min-w-[180px]">
            <span className="block text-sm font-medium text-slate-600">
              Peptide {i + 1}
            </span>
            <select
              value={selected[i]}
              onChange={(e) => updateSelect(i, e.target.value)}
              className="input mt-1"
            >
              <option value={PLACEHOLDER}>— Select —</option>
              {peptides.map((p) => (
                <option
                  key={p.slug}
                  value={p.slug}
                  disabled={selected.filter((s) => s === p.slug).length >= 1 && selected[i] !== p.slug}
                >
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {selectedPeptides.length === 0 ? (
        <div className="card mt-8 text-center text-slate-500">
          Select at least one peptide above to see the comparison table.
        </div>
      ) : (
        <div className="card mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="py-3 pr-4 text-left text-sm font-medium text-slate-500">
                  —
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
                label="Typical dose (research)"
                cells={selectedPeptides.map(
                  (p) => p.typicalDoseMcg ?? "—"
                )}
              />
              <CompareRow
                label="Frequency"
                cells={selectedPeptides.map((p) => p.frequency ?? "—")}
              />
              <CompareRow
                label="Description / use"
                cells={selectedPeptides.map((p) => (
                  <span className="block max-w-[240px]">{p.description}</span>
                ))}
                highlightLabel
              />
              <CompareRow
                label="Reconstitution"
                cells={selectedPeptides.map((p) => (
                  <span className="block max-w-[240px]">
                    {p.reconNotes ?? "—"}
                  </span>
                ))}
              />
              <CompareRow
                label="3D structure"
                cells={selectedPeptides.map((p) =>
                  p.pdbId ? (
                    <a
                      href={`https://www.rcsb.org/3d-view/${p.pdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-inline"
                    >
                      PDB {p.pdbId} →
                    </a>
                  ) : (
                    "—"
                  )
                )}
              />
              <CompareRow
                label="CAS"
                cells={selectedPeptides.map((p) => (
                  <span className="font-mono text-slate-600">
                    {p.cas ?? "—"}
                  </span>
                ))}
              />
            </tbody>
          </table>
        </div>
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
    </div>
  );
}
