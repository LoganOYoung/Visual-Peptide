import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function buildBreadcrumbJsonLd(items: BreadcrumbItem[], baseUrl: string) {
  const base = baseUrl.replace(/\/$/, "");
  const itemListElement = items.map((item, i) => ({
    "@type": "ListItem" as const,
    position: i + 1,
    name: item.label,
    ...(item.href != null && item.href !== "" && { item: `${base}${item.href.startsWith("/") ? item.href : `/${item.href}`}` }),
  }));
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement };
}

export function Breadcrumbs({
  items,
  baseUrl,
}: {
  items: BreadcrumbItem[];
  baseUrl?: string;
}) {
  const jsonLd = baseUrl ? buildBreadcrumbJsonLd(items, baseUrl) : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-x-2">
              {i > 0 && (
                <span className="text-slate-400" aria-hidden>
                  /
                </span>
              )}
              {item.href ? (
                <Link href={item.href} className="link-inline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
