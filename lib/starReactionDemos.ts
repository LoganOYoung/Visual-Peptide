/**
 * Star product reaction demonstrations: peptide + receptor → preset trajectory.
 * Constrained list only; no open search. Data drives "Laboratory Simulation" UX.
 */

export interface StarReactionDemo {
  /** Must match peptide slug in lib/peptides.ts for display. */
  peptideSlug: string;
  peptideName: string;
  receptorLabel: string;
  /** Frames: e.g. [receptor PDB, complex PDB] for "docking" effect. */
  framePdbIds: string[];
  /** Optional: binding affinity / Kd / citation for sidebar. */
  bindingAffinity?: string;
  /** Optional short caption. */
  caption?: string;
}

export const starReactionDemos: StarReactionDemo[] = [
  {
    peptideSlug: "semaglutide",
    peptideName: "Semaglutide",
    receptorLabel: "GLP-1 receptor",
    framePdbIds: ["7F9W", "6XBM"],
    bindingAffinity: "GLP-1R agonist. Structure: Semaglutide–GLP-1R complex (PDB 6XBM). Research reference only.",
    caption: "Receptor → peptide–receptor complex",
  },
  {
    peptideSlug: "tirzepatide",
    peptideName: "Tirzepatide",
    receptorLabel: "GIP / GLP-1 receptors",
    framePdbIds: ["7F9W", "7V2K"],
    bindingAffinity: "Dual GIP/GLP-1 agonist. Structure: Tirzepatide–receptor complex (PDB 7V2K). Research reference only.",
    caption: "Receptor → dual agonist–receptor complex",
  },
  {
    peptideSlug: "tb-500",
    peptideName: "TB-500",
    receptorLabel: "—",
    framePdbIds: ["1HJ0", "2LL5"],
    bindingAffinity: "Thymosin β4 fragment. Structures: Thymosin β9 (PDB 1HJ0), small peptide (PDB 2LL5). Illustrative only.",
    caption: "Thymosin β-related (1HJ0) → small peptide (2LL5)",
  },
  {
    peptideSlug: "bpc-157",
    peptideName: "BPC-157",
    receptorLabel: "—",
    framePdbIds: ["2LL5", "1D4P"],
    bindingAffinity: "Synthetic peptide fragment. Structures: illustrative small peptides (2LL5, 1D4P). Research reference only.",
    caption: "Small peptide structures (illustrative)",
  },
];

/** Get demo by peptide slug; used for lookup on Run. */
export function getStarReactionByPeptide(slug: string): StarReactionDemo | undefined {
  return starReactionDemos.find((d) => d.peptideSlug === slug);
}
