"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PdbOpener({ initialPdb = "" }: { initialPdb?: string }) {
  const [pdbId, setPdbId] = useState(initialPdb.trim().toUpperCase());
  const router = useRouter();

  const load = () => {
    const id = pdbId.trim().toUpperCase();
    if (!id) return;
    router.push(`/structure?pdb=${id}`);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <input
        type="text"
        value={pdbId}
        onChange={(e) => setPdbId(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), load())}
        placeholder="e.g. 6XBM"
        className="input max-w-[180px] font-mono uppercase"
        maxLength={10}
      />
      <button type="button" onClick={load} className="btn-primary">
        Load 3D viewer
      </button>
    </div>
  );
}
