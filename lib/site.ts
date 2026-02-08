/** Production domain for sitemap/canonical. Set SITE_URL in Vercel (e.g. https://www.visualpeptide.com) so sitemap uses your domain, not the .vercel.app URL. */
export function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.SITE_URL?.trim())
    return process.env.SITE_URL.replace(/\/$/, "");
  if (typeof process !== "undefined" && process.env?.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  return "https://www.visualpeptide.com";
}

/** For SEO: canonical and openGraph URL for a path (e.g. "/tools", "/peptides/bpc-157"). */
export function getCanonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${p}`;
}
