export type PeptideCategory = "metabolic" | "repair" | "cognitive" | "other";

export interface Peptide {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  typicalDoseMcg?: string;
  frequency?: string;
  reconNotes?: string;
  pdbId?: string;
  cas?: string;
  category?: PeptideCategory;
  molecularWeight?: number;
  halfLife?: string;
  sequence?: string;
}

export const PEPTIDE_CATEGORIES: { id: PeptideCategory; label: string }[] = [
  { id: "metabolic", label: "Metabolic (GLP-1s)" },
  { id: "repair", label: "Repair & Healing" },
  { id: "cognitive", label: "Cognitive" },
  { id: "other", label: "Other" },
];

export const peptides: Peptide[] = [
  {
    slug: "bpc-157",
    name: "BPC-157",
    shortName: "Body Protection Compound",
    description:
      "A synthetic peptide fragment derived from gastric juice. Studied for tissue repair and gut integrity in research settings.",
    typicalDoseMcg: "250–500",
    frequency: "1–2x daily",
    reconNotes: "Often reconstituted at 2–5 mg/mL with bacteriostatic water. Stable refrigerated.",
    pdbId: undefined,
    cas: "137525-51-0",
    category: "repair",
    molecularWeight: 1419,
    halfLife: "~4 h",
    sequence: "GEPDPGP",
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    description:
      "GLP-1 receptor agonist. Research use in metabolic and weight studies. Handle per lab protocols.",
    typicalDoseMcg: "250–500 (research); clinical doses vary",
    frequency: "Weekly (clinical) or as protocol",
    reconNotes: "Reconstitute with BAC water. Store refrigerated. Use within protocol-defined period.",
    pdbId: "7KI0",
    cas: "910463-68-2",
    category: "metabolic",
    molecularWeight: 4113,
    halfLife: "~7 days",
  },
  {
    slug: "tirzepatide",
    name: "Tirzepatide",
    description:
      "Dual GIP/GLP-1 agonist. Research applications in metabolism and weight management.",
    typicalDoseMcg: "Protocol-dependent",
    frequency: "Weekly or as protocol",
    reconNotes: "Reconstitute with bacteriostatic water. Refrigerate. Follow protocol for stability.",
    pdbId: undefined,
    cas: "2023788-19-2",
    category: "metabolic",
    molecularWeight: 4813,
    halfLife: "~5 days",
  },
  {
    slug: "ipamorelin",
    name: "Ipamorelin",
    description:
      "Growth hormone secretagogue (GHS). Selective ghrelin receptor agonist used in research.",
    typicalDoseMcg: "200–500",
    frequency: "1x daily",
    reconNotes: "Commonly 2–5 mg/mL. BAC water. Refrigerate after reconstitution.",
    pdbId: undefined,
    cas: "170851-70-4",
    category: "metabolic",
    molecularWeight: 711,
    halfLife: "~2 h",
  },
  {
    slug: "tb-500",
    name: "TB-500",
    shortName: "Thymosin β‑4 fragment",
    description:
      "Synthetic fragment of thymosin beta-4. Research focus on cell migration and tissue repair.",
    typicalDoseMcg: "250–500",
    frequency: "2–3x per week (protocol-dependent)",
    reconNotes: "Reconstitute at 2–5 mg/mL. Store refrigerated.",
    pdbId: undefined,
    cas: "77591-33-4",
    category: "repair",
    molecularWeight: 496,
    halfLife: "~2 weeks",
  },
  {
    slug: "pt-141",
    name: "PT-141",
    shortName: "Bremelanotide",
    description:
      "Synthetic melanocortin receptor agonist. Research use in central pathways.",
    typicalDoseMcg: "Protocol-dependent",
    frequency: "As protocol",
    reconNotes: "Reconstitute with BAC water. Refrigerate.",
    pdbId: undefined,
    cas: "189691-06-5",
    category: "cognitive",
    molecularWeight: 1025,
  },
  {
    slug: "epithalon",
    name: "Epithalon",
    description:
      "Tetrapeptide studied in aging research. Not for human consumption; research only.",
    typicalDoseMcg: "N/A — research only",
    frequency: "—",
    reconNotes: "Handle per lab SOPs. Sterile diluent.",
    pdbId: undefined,
    cas: "307297-39-8",
    category: "other",
    molecularWeight: 390,
    sequence: "Ala-Glu-Asp-Gly",
  },
];

export function getPeptideBySlug(slug: string): Peptide | undefined {
  return peptides.find((p) => p.slug === slug);
}

export function getPeptideByPdbId(pdbId: string): Peptide | undefined {
  const id = pdbId.trim().toUpperCase();
  return peptides.find((p) => p.pdbId?.toUpperCase() === id);
}

export function getAllSlugs(): string[] {
  return peptides.map((p) => p.slug);
}

export function searchPeptides(query: string): Peptide[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return peptides.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      (p.shortName?.toLowerCase().includes(q)) ||
      p.slug.toLowerCase().includes(q) ||
      p.cas?.includes(q) ||
      p.sequence?.toLowerCase().includes(q)
  );
}
