"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { PdbViewerInSite, type ViewerState } from "@/components/PdbViewerInSite";

interface StructureViewerWithUrlProps {
  displayPdb: string;
  minHeight?: number;
}

export function StructureViewerWithUrl({ displayPdb, minHeight = 500 }: StructureViewerWithUrlProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialChain = searchParams.get("chain") ?? undefined;
  const initialResidues = searchParams.get("residues") ?? undefined;
  const initialLabels = searchParams.get("labels") ?? undefined;

  const onStateChange = useCallback(
    (state: ViewerState) => {
      const params = new URLSearchParams();
      params.set("pdb", displayPdb);
      if (state.chain) params.set("chain", state.chain);
      if (state.residues) params.set("residues", state.residues);
      if (state.labels) params.set("labels", state.labels);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [displayPdb, pathname, router]
  );

  const shareParams = new URLSearchParams();
  shareParams.set("pdb", displayPdb);
  if (initialChain) shareParams.set("chain", initialChain);
  if (initialResidues) shareParams.set("residues", initialResidues);
  if (initialLabels) shareParams.set("labels", initialLabels);
  const shareUrl = `${pathname}?${shareParams.toString()}`;

  return (
    <>
      <PdbViewerInSite
        pdbId={displayPdb}
        minHeight={minHeight}
        initialChain={initialChain}
        onStateChange={onStateChange}
      />
      <p className="mt-4 text-sm text-slate-600">
        Copy or share this link to open the same view:{" "}
        <a href={shareUrl} className="link-inline font-medium">
          {shareUrl}
        </a>
      </p>
    </>
  );
}
