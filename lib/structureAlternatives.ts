/**
 * Alternative 3D structures for the same peptide/theme—when multiple PDBs are useful.
 * Shown on structure page as "Also useful: …" so users can pick by goal (e.g. peptide vs receptor view).
 */
export type StructureAlternative = {
  pdbId: string;
  label: string;
  reason: string;
};

/** PDB ID → list of alternative structures with short guidance. IDs must match actual RCSB entries. */
const ALTERNATIVES: Record<string, StructureAlternative[]> = {
  "7KI0": [
    { pdbId: "6X18", label: "GLP-1 peptide–receptor", reason: "Native GLP-1 bound to GLP-1R; compare with Semaglutide." },
  ],
};

export function getStructureAlternatives(pdbId: string): StructureAlternative[] {
  const id = pdbId?.trim().toUpperCase();
  return id ? (ALTERNATIVES[id] ?? []) : [];
}
