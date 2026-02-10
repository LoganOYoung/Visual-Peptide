/**
 * Short "why this structure" copy for structure and peptide detail pages (peptide/app-focused).
 * Complements structureHotspots (residue/position); here we explain overall structure choice.
 */
export const STRUCTURE_RATIONALE: Record<string, string> = {
  "6XBM":
    "Semaglutide in complex with GLP-1 receptor extracellular domain; useful for understanding GLP-1–receptor binding and dose/modification site reference.",
  "7F9W":
    "GLP-1 receptor–ligand complex; compare with 6XBM to understand receptor-side binding, for research and teaching.",
};

export function getStructureRationale(pdbId: string): string | undefined {
  return STRUCTURE_RATIONALE[pdbId?.trim().toUpperCase() ?? ""];
}
