/**
 * Atomic hotspot annotations: residue/region → short explanatory text (e.g. pharmacology).
 * Key: "resi:chain" for specific residue, or "resn" for generic residue type.
 */

export type HotspotEntry = {
  /** Short label (e.g. "C18 Fatty Acid") */
  label?: string;
  /** Explanation (e.g. "Extends half-life via albumin binding") */
  explanation: string;
};

/** Per-PDB map: "resi:chain" or "resn" → HotspotEntry */
const BY_PDB: Record<string, Record<string, HotspotEntry>> = {
  "6XBM": {
    "26:A": {
      label: "Lys26",
      explanation: "Fatty acid attachment site. C18 side chain extends half-life via albumin binding.",
    },
    "37:A": {
      label: "Arg36/37",
      explanation: "GLP-1R binding region. Key for receptor recognition and activation.",
    },
    "8:A": {
      label: "Ala8",
      explanation: "Substitution from His in GLP-1; improves DPP-4 resistance and stability.",
    },
    "GLY": {
      label: "Glycine",
      explanation: "Smallest residue; often in turns and flexible regions.",
    },
    "CYS": {
      label: "Cysteine",
      explanation: "Can form disulfide bonds; important for peptide stability.",
    },
    "SER": {
      label: "Serine",
      explanation: "Often in active sites; can participate in hydrogen bonding.",
    },
  },
  "1UBQ": {
    "48:K": {
      label: "Gly48",
      explanation: "Part of the flexible C-terminal tail; recognition site for many partners.",
    },
    "LYS": {
      label: "Lysine",
      explanation: "Ubiquitin uses Lys residues for polyubiquitin chain linkage.",
    },
  },
};

/** Generic residue type explanations (fallback when no structure-specific entry). */
const BY_RESN: Record<string, HotspotEntry> = {
  GLY: { label: "Glycine", explanation: "Smallest amino acid; often in turns and flexible regions." },
  ALA: { label: "Alanine", explanation: "Small, hydrophobic; common in α-helices." },
  CYS: { label: "Cysteine", explanation: "Can form disulfide bonds; important for stability." },
  SER: { label: "Serine", explanation: "Polar; often in active sites and hydrogen bonding." },
  THR: { label: "Threonine", explanation: "Hydroxyl group; can form H-bonds." },
  VAL: { label: "Valine", explanation: "Hydrophobic; common in β-sheets." },
  LEU: { label: "Leucine", explanation: "Hydrophobic; common in protein cores." },
  ILE: { label: "Isoleucine", explanation: "Hydrophobic; stereochemistry affects packing." },
  MET: { label: "Methionine", explanation: "Sulfur-containing; can coordinate metals." },
  TRP: { label: "Tryptophan", explanation: "Aromatic; often at binding interfaces." },
  PHE: { label: "Phenylalanine", explanation: "Aromatic; hydrophobic." },
  TYR: { label: "Tyrosine", explanation: "Aromatic hydroxyl; H-bonding and phosphorylation." },
  HIS: { label: "Histidine", explanation: "Can be charged; common in active sites and metal binding." },
  LYS: { label: "Lysine", explanation: "Positively charged; salt bridges and modification site." },
  ARG: { label: "Arginine", explanation: "Positively charged; strong salt bridges and H-bonds." },
  ASP: { label: "Aspartic acid", explanation: "Negatively charged; metal binding and catalysis." },
  GLU: { label: "Glutamic acid", explanation: "Negatively charged; metal binding and catalysis." },
  ASN: { label: "Asparagine", explanation: "Polar; H-bonding and glycosylation site." },
  GLN: { label: "Glutamine", explanation: "Polar; H-bonding." },
  PRO: { label: "Proline", explanation: "Rigid; can break helices and create turns." },
};

/**
 * Get hotspot annotation for a residue. Prefer structure-specific (resi:chain), then resn.
 */
export function getHotspotAnnotation(
  pdbId: string,
  resi: number,
  chain: string,
  resn: string
): HotspotEntry | null {
  const id = pdbId.trim().toUpperCase();
  const key = `${resi}:${chain}`;
  const byPdb = BY_PDB[id];
  if (byPdb?.[key]) return byPdb[key];
  const resnUpper = (resn || "").trim().toUpperCase();
  if (resnUpper && byPdb?.[resnUpper]) return byPdb[resnUpper];
  return BY_RESN[resnUpper] ?? null;
}
