import Link from "next/link";

export const metadata = {
  title: "Not Found",
  robots: { index: false as const, follow: true as const },
};

const WORKING_LINKS = [
  { href: "/", label: "Home" },
  { href: "/tools", label: "Tools" },
  { href: "/peptides", label: "Peptides" },
  { href: "/guide", label: "Guide" },
  { href: "/verify", label: "Verify" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-slate-600">The page you’re looking for doesn’t exist.</p>
      <Link href="/" className="mt-6 inline-block btn-primary">
        Back to home
      </Link>
      <p className="mt-8 text-sm text-slate-500">Or try:</p>
      <ul className="mt-2 flex flex-wrap justify-center gap-2">
        {WORKING_LINKS.filter((l) => l.href !== "/").map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="link-inline text-sm">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
