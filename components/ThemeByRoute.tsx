"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const DARK_PREFIXES = ["/", "/structure", "/tools", "/verify", "/peptides"];

function isToolRoute(pathname: string): boolean {
  if (!pathname) return false;
  if (pathname === "/") return true;
  return DARK_PREFIXES.some((p) => p === "/" ? pathname === "/" : pathname === p || pathname.startsWith(p + "/"));
}

export function ThemeByRoute() {
  const pathname = usePathname();

  useEffect(() => {
    const theme = isToolRoute(pathname ?? "") ? "dark" : "light";
    document.body.dataset.theme = theme;
  }, [pathname]);

  return null;
}
