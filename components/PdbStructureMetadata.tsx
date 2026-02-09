"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const RCSB_ENTRY_API = "https://data.rcsb.org/rest/v1/core/entry";
const RCSB_VIEW_PDB = "https://files.rcsb.org/view";
const RCSB_STRUCTURE = "https://www.rcsb.org/structure";

type EntryMeta = {
  struct?: { title?: string };
  rcsb_entry_info?: {
    resolution_combined?: Array<{ value?: number }>;
    resolution_high?: number;
    experimental_method?: string[];
  };
  rcsb_primary_citation?: {
    title?: string;
    journal_abbrev?: string;
    year?: number;
    pdbx_database_id_PubMed?: string;
    pdbx_database_id_DOI?: string;
  };
  rcsb_entry_container_identifiers?: { polymer_entity_ids?: string[] };
};

interface PdbStructureMetadataProps {
  pdbId: string;
  className?: string;
}

export function PdbStructureMetadata({ pdbId, className = "" }: PdbStructureMetadataProps) {
  const id = pdbId.trim().toUpperCase();
  const [data, setData] = useState<EntryMeta | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setErr(null);
    setData(null);
    fetch(`${RCSB_ENTRY_API}/${id}`, { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Failed to load metadata"));
  }, [id]);

  if (err) return null;

  const title =
    data?.struct?.title ??
    data?.rcsb_primary_citation?.title ??
    "";
  const resolution =
    data?.rcsb_entry_info?.resolution_combined?.[0]?.value ??
    data?.rcsb_entry_info?.resolution_high;
  const method = data?.rcsb_entry_info?.experimental_method?.join(", ") ?? "";

  return (
    <div
      className={`rounded-none border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 ${className}`}
      data-pdb-meta
    >
      {(title || resolution != null || method) && (
        <div className="space-y-1">
          {title && <p className="font-medium text-slate-900">{title}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-600">
            {resolution != null && (
              <span>Resolution: {typeof resolution === "number" ? `${resolution} Å` : String(resolution)}</span>
            )}
            {method && <span>Method: {method}</span>}
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Link
          href={`${RCSB_VIEW_PDB}/${id}.pdb`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline text-slate-700"
        >
          Download PDB
        </Link>
        <Link
          href={`${RCSB_STRUCTURE}/${id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline text-slate-700"
        >
          Cite
        </Link>
      </div>
    </div>
  );
}
