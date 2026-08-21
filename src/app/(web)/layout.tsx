"use client";

import BaseLayout from "@/components/admin/layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BaseLayout>{children}</BaseLayout>;
}
