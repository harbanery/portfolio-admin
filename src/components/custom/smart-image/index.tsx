"use client";

import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * Gambar yang memakai next/image (optimasi + lazy loading) untuk aset
 * origin sendiri dan Cloudinary, dengan fallback <img> polos untuk URL
 * lain (mis. preview base64 data: URL sebelum upload selesai atau URL
 * eksternal lama yang tidak masuk remotePatterns).
 */

interface SmartImageProps {
  src: string;
  alt: string;
  /** Pakai layout fill (parent wajib position: relative). */
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}

/** Host yang dioptimasi next/image (harus masuk remotePatterns). */
const OPTIMIZED_HOSTS = new Set(["res.cloudinary.com"]);

function isOptimizable(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true; // aset lokal / proxy origin sendiri
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.has(url.hostname);
  } catch {
    return false; // data:, blob:, atau URL tidak valid
  }
}

const SmartImage = ({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  style,
  priority,
}: SmartImageProps) => {
  if (!isOptimizable(src)) {
    // Fallback untuk data URL preview upload / host eksternal.
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} style={style} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : (width ?? 800)}
      height={fill ? undefined : (height ?? 600)}
      sizes={sizes ?? (fill ? "100vw" : undefined)}
      className={className}
      style={style}
      priority={priority}
    />
  );
};

export default SmartImage;
