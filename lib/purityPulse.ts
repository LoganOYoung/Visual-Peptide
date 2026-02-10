/**
 * Peptide Purity Pulse — manually curated batch verification summaries.
 * Update 3–5 entries weekly to reflect recent lab-verified batches.
 */

export interface PurityPulseEntry {
  batch: string;
  peptide: string;
  purity: string;
  verifiedBy: string;
  date?: string;
}

export const purityPulseEntries: PurityPulseEntry[] = [
  { batch: "2026-001", peptide: "BPC-157", purity: "99.2%", verifiedBy: "Janoshik", date: "2026-02-05" },
  { batch: "2026-002", peptide: "Semaglutide", purity: "99.5%", verifiedBy: "Janoshik", date: "2026-02-04" },
  { batch: "2025-089", peptide: "TB-500", purity: "98.8%", verifiedBy: "Janoshik", date: "2025-12-18" },
  { batch: "2025-091", peptide: "Ipamorelin", purity: "99.1%", verifiedBy: "Janoshik", date: "2025-12-15" },
  { batch: "2026-003", peptide: "Tirzepatide", purity: "99.3%", verifiedBy: "Janoshik", date: "2026-02-03" },
];
