/**
 * Front-end hotspot data: PDB ID → regions with short pharmacological/structural explanations.
 * Key: "chain:resi" or "chain:resiStart-resiEnd". Used for feature 2 (Hotspots).
 */
export type HotspotEntry = {
  /** e.g. "A:12" or "A:10-15" */
  key: string;
  label: string;
  description: string;
};

const HOTSPOTS: Record<string, HotspotEntry[]> = {
  "6XBM": [
    { key: "A:8", label: "His7", description: "N-terminal histidine; may affect receptor recognition." },
    { key: "A:12", label: "Tyr12", description: "Conserved in GLP-1; important for GLP-1R binding." },
    { key: "A:16", label: "Glu16", description: "Stabilizes α-helix; contributes to potency." },
  ],
  "7F9W": [
    { key: "A:1", label: "ECD", description: "Extracellular domain; peptide binding region." },
    { key: "B:1", label: "GLP-1", description: "GLP-1 peptide ligand in complex." },
  ],
};

function parseKey(key: string): { chain: string; resi: number } | { chain: string; resiStart: number; resiEnd: number } | null {
  const m = key.match(/^([A-Z0-9]):(\d+)(?:-(\d+))?$/i);
  if (!m) return null;
  const chain = m[1];
  const resi = parseInt(m[2], 10);
  if (m[3]) return { chain, resiStart: resi, resiEnd: parseInt(m[3], 10) };
  return { chain, resi };
}

export function getHotspotForResidue(pdbId: string, chain: string, resi: number): HotspotEntry | null {
  const list = HOTSPOTS[pdbId];
  if (!list) return null;
  const resiStr = String(resi);
  for (const h of list) {
    const p = parseKey(h.key);
    if (!p) continue;
    if ("resiEnd" in p) {
      if (p.chain === chain && resi >= p.resiStart && resi <= p.resiEnd) return h;
    } else {
      if (p.chain === chain && String(p.resi) === resiStr) return h;
    }
  }
  return null;
}
