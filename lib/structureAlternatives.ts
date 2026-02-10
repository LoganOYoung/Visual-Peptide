/**
 * Alternative 3D structures for the same peptide/theme—when multiple PDBs are useful.
 * Shown on structure page as "Also useful: …" so users can pick by goal (e.g. peptide vs receptor view).
 */
export type StructureAlternative = {
  pdbId: string;
  label: string;
  reason: string;
};

/** PDB ID → list of alternative structures with short guidance */
const ALTERNATIVES: Record<string, StructureAlternative[]> = {
  "6XBM": [
    { pdbId: "7F9W", label: "GLP-1 receptor complex", reason: "See receptor-side binding and full complex." },
  ],
  "7F9W": [
    { pdbId: "6XBM", label: "Semaglutide (GLP-1) in complex", reason: "Focus on peptide and modification sites." },
  ],
};

export function getStructureAlternatives(pdbId: string): StructureAlternative[] {
  const id = pdbId?.trim().toUpperCase();
  return id ? (ALTERNATIVES[id] ?? []) : [];
}
