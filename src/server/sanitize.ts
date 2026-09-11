/**
 * Sanitasi HTML dari rich text editor (Quill) di sisi server.
 *
 * Editor dibatasi ke format bold/italic/underline/link/blockquote,
 * tetapi client bisa dikirim request apa pun — jadi HTML dari client
 * TIDAK pernah dipercaya apa adanya. Sanitizer ini memakai pendekatan
 * allowlist: semua tag di luar daftar dibuang (isinya dipertahankan),
 * semua atribut dibuang kecuali `href` pada <a> yang terbukti aman
 * (skema javascript:/data:/vbscript: ditolak).
 *
 * String divalidasi ulang saat disimpan ke database; saat ditampilkan,
 * konten sudah pasti hanya berisi tag yang diizinkan (pertahanan
 * terhadap stored XSS).
 */

/** Tag yang boleh lolos (selaras formats Quill yang dikonfigurasi). */
const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "ul",
  "ol",
  "li",
  "a",
]);

/** Apakah URL aman untuk atribut href (http/https/mailto/relatif)? */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (trimmed.length === 0 || trimmed.length > 2048) return false;
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:")
  ) {
    return false;
  }
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  try {
    const parsed = new URL(trimmed);
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

/** Escape nilai atribut (cegah keluar dari tanda kutip atribut). */
function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

const TAG_PATTERN =
  /<\/?([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^"'>])*)>/g;

/**
 * Sanitasi HTML rich text. Nilai null/undefined diteruskan apa adanya
 * agar tetap kompatibel dengan field opsional di Prisma.
 */
export function sanitizeRichText(
  html: string | null | undefined,
): string | null | undefined {
  if (html === null || html === undefined) return html;

  // Buang komentar HTML dan seluruh isi script/style.
  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script\s*>/gi, "")
    .replace(/<style[\s\S]*?<\/style\s*>/gi, "");

  out = out.replace(
    TAG_PATTERN,
    (match, rawTagName: string, rawAttrs: string) => {
      const tag = rawTagName.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return ""; // tag lain dibuang, teks tetap
      if (match.startsWith("</")) return `</${tag}>`; // closing tag polos

      if (tag === "a") {
        const hrefMatch =
          /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(rawAttrs);
        const rawHref = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3];
        if (rawHref && isSafeUrl(rawHref.trim())) {
          return `<a href="${escapeAttr(rawHref.trim())}" rel="noopener noreferrer nofollow" target="_blank">`;
        }
        return "<a>";
      }
      return `<${tag}>`; // atribut apa pun dibuang
    },
  );

  return out;
}
