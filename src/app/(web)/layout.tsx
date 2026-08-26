"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { App as AntdApp } from "antd";
import BaseLayout from "@/components/admin/layout";
import LoaderPage from "@/components/admin/loader";
import { useLocale } from "@/components/locale/LocaleProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const { message } = AntdApp.useApp();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  // Guard client: validasi sesi ke database via /api/auth/session.
  // Proxy sudah memblokir request tanpa cookie; cek ini menangani cookie
  // yang ada tapi tidak valid (mis. sesi kedaluwarsa 12 jam / dicabut).
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session")
      .then((response) => response.json())
      .then((result) => {
        if (!active) return;
        if (result.authenticated) {
          setAuthenticated(true);
        } else {
          message.warning(t("auth.sessionExpired"));
          router.replace("/login");
        }
      })
      .catch(() => {
        if (active) router.replace("/login");
      });
    return () => {
      active = false;
    };
  }, [router, message, t]);

  if (authenticated === null) return <LoaderPage />;

  return <BaseLayout>{children}</BaseLayout>;
}
