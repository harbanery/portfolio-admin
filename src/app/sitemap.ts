import type { MetadataRoute } from "next";
import { BASE_URL } from "@/config/variables";

/**
 * sitemap.xml dinamis.
 *
 * Satu-satunya halaman publik aplikasi admin ini adalah /login;
 * seluruh rute lain butuh sesi login sehingga tidak dimasukkan.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
