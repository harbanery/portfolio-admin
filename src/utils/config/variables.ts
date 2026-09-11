export const META_TITLE: string | undefined = process.env.TITLE_WEB;
export const META_APP: string | undefined = process.env.APP_WEB;
export const META_DESCRIPTION: string | undefined = process.env.DESCRIPTION_WEB;

export const BASE_URL: string =
  process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export const NODE_ENV: string = process.env.NODE_ENV || "development";

/** Prefix API internal (client-server via folder src/app/api). */
export const API_BASE_PATH = "/api";

// ---------------------------------------------------------------------------
// Autentikasi admin
// ---------------------------------------------------------------------------

/** Nama cookie sesi admin (dipakai proxy + route auth). */
export const SESSION_COOKIE_NAME = "admin_portfolio_session";

/** Durasi sesi login admin (jam). */
export const SESSION_TTL_HOURS = 12;

// Email (Nodemailer SMTP) — pola dari progress-self; dipakai untuk
// mengirim password admin hasil generate (khusus development).
// Bila SMTP_HOST kosong, channel email otomatis dilewati (no-op).
export const SMTP_HOST: string = process.env.SMTP_HOST || "";
export const SMTP_PORT: number = Number(process.env.SMTP_PORT || "465");
/** Secure (TLS langsung) bila port 465. STARTTLS untuk port lain (587). */
const SMTP_SECURE_RAW = process.env.SMTP_SECURE ?? "";
export const SMTP_SECURE: boolean =
  SMTP_SECURE_RAW === "" ? SMTP_PORT === 465 : SMTP_SECURE_RAW === "true";
export const SMTP_USER: string = process.env.SMTP_USER || "";
export const SMTP_PASS: string = process.env.SMTP_PASS || "";
/** Alamat pengirim. Jika kosong, pakai SMTP_USER. */
export const SMTP_FROM: string = process.env.SMTP_FROM || SMTP_USER;
/** Alamat penerima password admin (single-user app). */
export const NOTIFICATION_EMAIL_TO: string =
  process.env.NOTIFICATION_EMAIL_TO || "";

/** Bahasa konten email server-side (id | en). Default "id". */
export type NotificationLocale = "id" | "en";
export const NOTIFICATION_LOCALE: NotificationLocale =
  process.env.NOTIFICATION_LOCALE === "en" ? "en" : "id";
