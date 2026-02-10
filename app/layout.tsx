import type { Metadata } from "next";
import Script from "next/script";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeByRoute } from "@/components/ThemeByRoute";
import { getBaseUrl } from "@/lib/site";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Visual Peptide",
  url: SITE_URL,
  description:
    "Research-grade peptide calculators, 3D structure viewer, and purity verification. Reconstitution and dosing for BPC-157, Semaglutide, Tirzepatide and more.",
  publisher: { "@type": "Organization" as const, name: "Visual Peptide", url: SITE_URL },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization" as const,
  name: "Visual Peptide",
  url: SITE_URL,
  description: "Research-grade peptide calculators and reference. Reconstitution, dosing, 3D structure, purity verification.",
  logo: `${SITE_URL}/logo.svg`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="flex min-h-screen flex-col overflow-x-hidden font-sans antialiased [background-color:var(--bg)] [color:var(--text)]">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var p=document.location.pathname;var d=p==='/'||p.startsWith('/structure')||p.startsWith('/tools')||p.startsWith('/verify')||p.startsWith('/peptides');document.body.dataset.theme=d?'dark':'light';})();`,
          }}
        />
        <ThemeByRoute />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
