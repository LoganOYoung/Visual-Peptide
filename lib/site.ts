export function getBaseUrl(): string {
  if (typeof process !== "undefined" && process.env?.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  return process.env?.SITE_URL || "https://www.visualpeptide.com";
}

/** For SEO: canonical and openGraph URL for a path (e.g. "/tools", "/peptides/bpc-157"). */
export function getCanonicalUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${p}`;
}
