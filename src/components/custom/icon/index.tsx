"use client";

import { memo } from "react";
import type { IconBaseProps as AntdIconProps } from "@ant-design/icons/lib/components/Icon";
import {
  BookOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  GithubOutlined,
  HistoryOutlined,
  LinkOutlined,
  PlusOutlined,
  ProjectOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  StarOutlined,
  StopOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

/**
 * Registry ikon AntD berbasis import langsung (static import per ikon).
 *
 * Implementasi lama memanggil `await import("@ant-design/icons")` yang
 * menarik SELURUH paket ikon (ratusan komponen) ke dalam satu chunk.
 * Dengan import bernama, bundler hanya menyertakan ikon yang dipakai
 * (tree-shaking) sehingga bundle jauh lebih kecil.
 */

const ICON_REGISTRY = {
  BookOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileTextOutlined,
  GithubOutlined,
  HistoryOutlined,
  LinkOutlined,
  PlusOutlined,
  ProjectOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  StarOutlined,
  StopOutlined,
  UploadOutlined,
  UserOutlined,
} as const;

export type AntdIconName = keyof typeof ICON_REGISTRY;

/** Fallback bila nama ikon tidak dikenal (mis. konfigurasi salah ketik). */
const FallbackIcon = QuestionCircleOutlined;

/** Ambil komponen ikon secara sinkron dari registry. */
export function getAntdIcon(
  iconName: string,
): React.ComponentType<AntdIconProps> {
  const icon = (ICON_REGISTRY as Record<string, React.ComponentType<AntdIconProps> | undefined>)[
    iconName
  ];
  if (!icon) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[icon] Ikon tidak dikenal: "${iconName}"`);
    }
    return FallbackIcon;
  }
  return icon;
}

const wrappedCache = new Map<
  string,
  React.ComponentType<AntdIconProps>
>();

/**
 * Balikan komponen ikon (API lama dipertahankan agar pemanggil tidak
 * berubah). Komponen dibungkus sekali lalu di-cache; render langsung
 * dari registry tanpa dynamic import.
 */
export const loadAntdIcon = (
  iconName: string,
): React.ComponentType<AntdIconProps> => {
  const cached = wrappedCache.get(iconName);
  if (cached) return cached;

  const Resolved = getAntdIcon(iconName);
  const DynamicIconComponent = memo((props: AntdIconProps) => (
    <Resolved {...props} />
  ));
  DynamicIconComponent.displayName = `AntdIcon_${iconName}`;
  wrappedCache.set(iconName, DynamicIconComponent);
  return DynamicIconComponent;
};
