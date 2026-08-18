import type { MetadataRoute } from "next";
import {
  META_APP,
  META_DESCRIPTION,
  META_TITLE,
} from "@/config/variables";

/**
 * Web App Manifest (PWA).
 *
 * Di-generate ke `/manifest.webmanifest` oleh Next.js dan otomatis ditautkan
 * pada <link rel="manifest">. Memungkinkan aplikasi dipasang ke home screen
 * (installable PWA).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: META_TITLE ?? META_APP ?? "Admin Portfolio",
    short_name: META_APP ?? "Admin Portfolio",
    description: META_DESCRIPTION ?? "Admin portfolio dashboard",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f5f5f7",
    theme_color: "#1677ff",
    lang: "id",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/android/launchericon-48x48.png",
        sizes: "48x48",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-72x72.png",
        sizes: "72x72",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-96x96.png",
        sizes: "96x96",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-144x144.png",
        sizes: "144x144",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android/launchericon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
