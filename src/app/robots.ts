import type { MetadataRoute } from "next";
import { BASE_URL } from "@/utils/config/variables";

/**
 * robots.txt dinamis.
 *
 * Aplikasi ini adalah admin panel privat (single-user, login password):
 * seluruh halaman admin dilarang di-crawl. Hanya /login yang masuk
 * sitemap agar mesin pencari tahu halaman publik satu-satunya.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/login",
      disallow: ["/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
