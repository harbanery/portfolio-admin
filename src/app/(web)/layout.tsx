"use client";

import BaseLayout from "@/components/admin/layout";
import LoaderPage from "@/components/admin/loader";
import { useLocale } from "@/components/locale/LocaleProvider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLocale();

  return <BaseLayout>{children}</BaseLayout>;
}
