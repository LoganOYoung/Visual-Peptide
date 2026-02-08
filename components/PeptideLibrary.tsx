"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { peptides, PEPTIDE_CATEGORIES, type PeptideCategory } from "@/lib/peptides";
import { QuickSearch } from "./QuickSearch";

export function PeptideLibrary() {
  const router = useRouter();
  const [category, setCategory] = useState<PeptideCategory | "all">("all");

  const filtered =
    category === "all"
      ? peptides
      : peptides.filter((p) => (p.category || "other") === category);

  const countByCategory = (id: PeptideCategory | "all") =>
    id === "all"
      ? peptides.length
      : peptides.filter((p) => (p.category || "other") === id).length;

  return (
    <div className="space-y-6">
      <div>
        <QuickSearch />
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-slate-600">Filter by category</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`min-h-[44px] rounded-none px-3 py-2 text-sm font-medium transition ${
              category === "all"
                ? "bg-teal-500 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            All ({countByCategory("all")})
          </button>
          {PEPTIDE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(c.id)}
              className={`min-h-[44px] rounded-none px-3 py-2 text-sm font-medium transition ${
                category === c.id
                  ? "bg-teal-500 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300"
              }`}
            >
              {c.label} ({countByCategory(c.id)})
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="rounded-none border border-slate-200 bg-slate-50 px-4 py-8 text-center text-slate-600">
          No peptides in this category.
        </p>
      ) : (
      <ul className="space-y-4">
        {filtered.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/peptides/${p.slug}`}
              className="card block transition hover:border-teal-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-slate-900">{p.name}</h2>
                    {p.category && (
                      <span className="rounded-none bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
                        {PEPTIDE_CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category}
                      </span>
                    )}
                  </div>
                  {p.shortName && (
                    <p className="text-sm text-slate-500">{p.shortName}</p>
                  )}
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 text-sm text-slate-400">
                  <div>
                    {p.typicalDoseMcg && (
                      <span className="block">Typical: {p.typicalDoseMcg} mcg</span>
                    )}
                    {p.frequency && (
                      <span className="block">{p.frequency}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      router.push(`/peptides/compare?compare=${encodeURIComponent(p.slug)}`);
                    }}
                    className="min-h-[44px] min-w-[44px] text-left text-teal-600 hover:underline inline-flex items-center"
                  >
                    Compare
                  </button>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}
