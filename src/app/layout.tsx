import "@/assets/global/index.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ui/theme/ThemeProvider";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { geistSans, geistMono } from "@/utils/fonts/next-google";
import {
  META_TITLE,
  META_APP,
  META_DESCRIPTION,
  BASE_URL,
} from "@/utils/config/variables";
import { neueHaasDisplay } from "@/utils/fonts/next-local";
import { VercelCompatibleComponents } from "@/components/ui/vercel";

export const metadata: Metadata = {
  title: META_TITLE,
  applicationName: META_APP,
  ...(META_DESCRIPTION && { description: META_DESCRIPTION }),
  metadataBase: new URL(BASE_URL),
  // Aplikasi admin privat: jangan diindeks mesin pencari.
  robots: { index: false, follow: false },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: META_APP,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: META_TITLE,
    ...(META_DESCRIPTION && { description: META_DESCRIPTION }),
    type: "profile",
    siteName: META_APP,
    countryName: "Indonesia",
    locale: "en-US",
    url: `/`,
    // Gambar OG dihasilkan dinamis oleh src/app/opengraph-image.tsx.
  },
  creator: "Raihan Yusuf",
  authors: [
    { name: "Raihan Yusuf", url: "https://www.linkedin.com/in/raihan-yusuf" },
  ],
  icons: [
    {
      rel: "icon",
      type: "image/x-icon",
      url: `/favicon.ico`,
      sizes: "any",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      url: `/ios/180.png`,
      sizes: "180x180",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      url: `/ios/120.png`,
      sizes: "120x120",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      url: `/ios/152.png`,
      sizes: "152x152",
    },
    {
      rel: "apple-touch-icon",
      type: "image/png",
      url: `/ios/1024.png`,
      sizes: "1024x1024",
    },
    {
      rel: "shortcut icon",
      type: "image/x-icon",
      url: `/favicon.ico`,
    },
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${neueHaasDisplay.variable} h-full antialiased hide-scrollbar`}
    >
      <body className="min-h-full flex flex-col">
        <AntdRegistry>
          <LocaleProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </LocaleProvider>
        </AntdRegistry>
        <VercelCompatibleComponents.Analytics />
        <VercelCompatibleComponents.SpeedInsights />
      </body>
    </html>
  );
}
