/**
 * Short "why this structure" copy for structure and peptide detail pages (peptide/app-focused).
 * Complements structureHotspots (residue/position); here we explain overall structure choice.
 * PDB IDs must match actual RCSB/wwPDB entry titles and biology.
 */
export const STRUCTURE_RATIONALE: Record<string, string> = {
  "7KI0":
    "Semaglutide bound to GLP-1 receptor in complex with Gs protein (cryo-EM); useful for understanding GLP-1R binding and dose/modification site reference.",
  "6XBM":
    "Human SMO-Gi complex with 24(S),25-EC (Smoothened); not a peptide agonist structure.",
  "7F9W":
    "Anti-CD25 antibodies (Sci Rep 2021); not a GLP-1 receptor structure.",
};

export function getStructureRationale(pdbId: string): string | undefined {
  return STRUCTURE_RATIONALE[pdbId?.trim().toUpperCase() ?? ""];
}
