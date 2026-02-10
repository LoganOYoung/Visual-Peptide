/**
 * Nav: Tools/Peptides with dropdowns. Order: tools → content → verify → help.
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

/** Header main items: tools and content first; Help holds Guide/FAQ/About */
export const headerLinks: { href: string; label: string }[] = [
  { href: "/tools", label: "Tools" },
  { href: "/peptides", label: "Peptides" },
  { href: "/structure", label: "3D Structure" },
  { href: "/verify", label: "Verify" },
  { href: "/guide", label: "Help" },
];

/** Help dropdown items (href starting with http opens in new tab) */
export const helpSubLinks = [
  { href: "/guide", label: "Guide" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  {
    href: "https://github.com/LoganOYoung/Visual-Peptide/issues/new?title=Feedback%3A%20&body=**Page**%3A%20%0A**What%20went%20wrong%20or%20suggestion**%3A%20%0A",
    label: "Feedback",
  },
] as const;

/** Tools sub-pages */
export const toolsSubLinks = [
  { href: "/tools/calculator", label: "Recon & Dosing" },
  { href: "/tools/syringe-planner", label: "Syringe Planner" },
  { href: "/tools/vial-cycle", label: "Vial & Cycle" },
  { href: "/tools/unit-converter", label: "Unit Converter" },
  { href: "/tools/cost", label: "Cost per Dose" },
] as const;

/** Peptides sub-pages */
export const peptidesSubLinks = [
  { href: "/peptides", label: "Library" },
  { href: "/peptides/compare", label: "Compare" },
] as const;

/** 3D Structure sub-pages */
export const structureSubLinks = [
  { href: "/structure", label: "3D Structure Viewer" },
  { href: "/structure/demo", label: "3D Reaction demo" },
] as const;
