"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { searchPeptides } from "@/lib/peptides";

export function QuickSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ReturnType<typeof searchPeptides>>([]);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setResults(searchPeptides(query));
  }, [query]);

  const showDropdown = focused && query.trim().length > 0;
  const hasResults = results.length > 0;

  const handleSelect = (slug: string) => {
    router.push(`/peptides/${slug}`);
    setQuery("");
    setFocused(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-xl">
      <label htmlFor="quick-search" className="sr-only">
        Search by name, CAS, or sequence
      </label>
      <input
        ref={inputRef}
        id="quick-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Search by name, CAS, or sequence..."
        className="input w-full py-3 text-base sm:py-4 sm:text-lg"
        aria-autocomplete="list"
        aria-controls="quick-search-results"
        aria-expanded={showDropdown}
      />
      {showDropdown && (
        <ul
          id="quick-search-results"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-none border border-slate-200 bg-white py-2 shadow-lg"
          role="listbox"
        >
          {hasResults ? (
            results.map((p) => (
              <li key={p.slug} role="option">
                <Link
                  href={`/peptides/${p.slug}`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(p.slug);
                  }}
                  className="block px-4 py-2.5 text-slate-900 hover:bg-slate-100"
                >
                  <span className="font-medium">{p.name}</span>
                  {p.shortName && (
                    <span className="ml-2 text-sm text-slate-600">{p.shortName}</span>
                  )}
                  {p.cas && (
                    <span className="ml-2 font-mono text-xs text-slate-500">{p.cas}</span>
                  )}
                </Link>
              </li>
            ))
          ) : (
            <li className="px-4 py-3 text-slate-500">No matches for &quot;{query}&quot;</li>
          )}
        </ul>
      )}
    </div>
  );
}
