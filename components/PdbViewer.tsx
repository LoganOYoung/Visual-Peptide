"use client";

import { useState } from "react";
import Link from "next/link";

const RCSB_3D_VIEW = "https://www.rcsb.org/3d-view";

interface PdbViewerProps {
  pdbId: string;
  title?: string;
  minHeight?: number;
  className?: string;
}

export function PdbViewer({ pdbId, title, minHeight = 400, className = "" }: PdbViewerProps) {
  const [loaded, setLoaded] = useState(false);
  const src = `${RCSB_3D_VIEW}/${pdbId.trim().toUpperCase()}`;

  return (
    <div className={`overflow-hidden rounded-none border border-slate-600 bg-slate-900 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-600 bg-slate-800/80 px-4 py-2">
        <span className="text-sm font-medium text-slate-300">
          {title ?? `PDB ${pdbId.toUpperCase()} — 3D Structure`}
        </span>
        <Link
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="link-inline text-xs"
          aria-label="Open structure in RCSB (new tab)"
        >
          Open in new tab →
        </Link>
      </div>
      <div className="relative" style={{ minHeight }}>
        {!loaded && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-500"
            style={{ minHeight }}
          >
            <span className="animate-pulse">Loading 3D viewer…</span>
          </div>
        )}
        <iframe
          src={src}
          title={`3D structure of PDB ${pdbId}`}
          onLoad={() => setLoaded(true)}
          className="h-full w-full border-0"
          style={{ minHeight }}
          sandbox="allow-scripts allow-same-origin"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
