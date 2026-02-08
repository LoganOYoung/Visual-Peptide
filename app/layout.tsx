import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getBaseUrl } from "@/lib/site";
import "./globals.css";

const SITE_URL = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Visual Peptide — Reconstitution, Dosing & Purity",
    template: "%s | Visual Peptide",
  },
  description:
    "Research-grade peptide calculators, 3D structure viewer, and purity verification. Reconstitution and dosing for BPC-157, Semaglutide, Tirzepatide and more.",
  keywords: [
    "peptide calculator",
    "reconstitution",
    "dosing",
    "BPC-157",
    "Semaglutide",
    "Tirzepatide",
    "peptide 3D structure",
    "peptide purity",
    "Janoshik",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "Visual Peptide",
    title: "Visual Peptide — Reconstitution, Dosing & Purity",
    description:
      "Research-grade peptide calculators, 3D structure viewer, and purity verification. Reconstitution and dosing for BPC-157, Semaglutide, Tirzepatide and more.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Visual Peptide — Reconstitution, Dosing & Purity" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Visual Peptide — Reconstitution, Dosing & Purity",
    description:
      "Research-grade peptide calculators, 3D structure viewer, and purity verification.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Visual Peptide",
  url: SITE_URL,
  description:
    "Research-grade peptide calculators, 3D structure viewer, and purity verification. Reconstitution and dosing for BPC-157, Semaglutide, Tirzepatide and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-slate-50 text-slate-900">
      <body className="flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-900 antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
