/**
 * Peptide Purity Pulse — 手动维护的批次验证摘要。
 * 每周可更新 3–5 条，营造与全球实验室深度连接的权威感。
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
