/**
 * 导航：Tools/Peptides 带下拉。顺序按「工具 → 内容 → 验证 → 帮助」。
 */

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/peptides", label: "Peptides" },
  { href: "/structure", label: "3D Structure" },
  { href: "/verify", label: "Verify" },
  { href: "/guide", label: "Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const;

/** 顶栏主项：工具与内容优先，Help 收纳 Guide/FAQ/About */
export const headerLinks: { href: string; label: string }[] = [
  { href: "/tools", label: "Tools" },
  { href: "/peptides", label: "Peptides" },
  { href: "/structure", label: "3D Structure" },
  { href: "/verify", label: "Verify" },
  { href: "/guide", label: "Help" },
];

/** Help 下拉子项 */
export const helpSubLinks = [
  { href: "/guide", label: "Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
] as const;

/** Tools 子页 */
export const toolsSubLinks = [
  { href: "/tools/calculator", label: "Recon & Dosing" },
  { href: "/tools/syringe-planner", label: "Syringe Planner" },
  { href: "/tools/vial-cycle", label: "Vial & Cycle" },
  { href: "/tools/unit-converter", label: "Unit Converter" },
  { href: "/tools/cost", label: "Cost per Dose" },
] as const;

/** Peptides 子页 */
export const peptidesSubLinks = [
  { href: "/peptides", label: "Library" },
  { href: "/peptides/compare", label: "Compare" },
] as const;
