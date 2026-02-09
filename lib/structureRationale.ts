/**
 * 以肽/应用为中心的「为何选此结构」简短说明，用于结构页与肽详情页。
 * 与 lib/structureHotspots 互补：热点讲残基/位点，这里讲整体结构选择理由。
 */
export const STRUCTURE_RATIONALE: Record<string, string> = {
  "6XBM":
    "Semaglutide（司美格鲁肽）与 GLP-1 受体胞外域复合物，用于理解 GLP-1 类肽与受体结合模式及剂量/修饰位点参考。",
  "7F9W":
    "GLP-1 受体与配体复合物结构，可与 6XBM 对照理解受体侧结合区，用于科研与教学中的机制解读。",
};

export function getStructureRationale(pdbId: string): string | undefined {
  return STRUCTURE_RATIONALE[pdbId?.trim().toUpperCase() ?? ""];
}
