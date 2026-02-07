import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/site";

const BASE_URL = getBaseUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/test-page/"] },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
