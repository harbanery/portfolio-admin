import { BASE_URL, META_APP, NOTIFICATION_LOCALE } from "@/config/variables";

/**
 * Builder email "Password Admin Baru" (khusus development).
 *
 * Desain rich email mengikuti pola progress-self: kartu dengan header
 * berwarna, konten terstruktur, kotak password, CTA, dan signature —
 * responsif untuk HP, tablet, dan laptop.
 */

const APP_NAME = META_APP ?? "Admin Portfolio";
const THEME_COLOR = "#4f46e5";

/** Pilih teks sesuai locale notifikasi. */
function L(id: string, en: string): string {
  return NOTIFICATION_LOCALE === "en" ? en : id;
}

/** Escape karakter HTML agar aman di email. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export interface PasswordEmailPayload {
  subject: string;
  text: string;
  html: string;
}

/** Bangun payload email berisi password admin baru. */
export function buildPasswordEmail(params: {
  password: string;
  generatedAt: Date;
}): PasswordEmailPayload {
  const { password, generatedAt } = params;
  const localeTag = NOTIFICATION_LOCALE === "en" ? "en-GB" : "id-ID";
  const formattedDate = new Intl.DateTimeFormat(localeTag, {
    dateStyle: "full",
    timeStyle: "short",
  }).format(generatedAt);

  const subject = L(
    "🔐 Password Admin Baru — Admin Portfolio",
    "🔐 New Admin Password — Admin Portfolio",
  );

  const text = L(
    [
      `Password admin baru telah digenerate pada ${formattedDate}.`,
      "",
      `Password lama sudah dihapus (tidak berlaku lagi).`,
      `Password baru: ${password}`,
      "",
      `Semua sesi login aktif juga telah dicabut.`,
      `Login di: ${BASE_URL}/login`,
      "",
      "Fitur ini hanya tersedia pada mode development.",
    ].join("\n"),
    [
      `A new admin password was generated on ${formattedDate}.`,
      "",
      `The old password has been deleted (no longer valid).`,
      `New password: ${password}`,
      "",
      `All active login sessions have also been revoked.`,
      `Log in at: ${BASE_URL}/login`,
      "",
      "This feature is only available in development mode.",
    ].join("\n"),
  );

  const html = buildPasswordEmailHtml({ password, formattedDate });
  return { subject, text, html };
}

/** Template HTML kaya untuk email password (pola progress-self). */
function buildPasswordEmailHtml(params: {
  password: string;
  formattedDate: string;
}): string {
  const font =
    "'Geist','Google Sans',Roboto,Helvetica,Arial,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
  const monoFont =
    "'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace";
  const { password, formattedDate } = params;

  const title = L("🔐 Password Baru", "🔐 New Password");
  const subtitle = `${APP_NAME} · ${formattedDate}`;
  const greeting = L("Halo Admin! 👋", "Hello Admin! 👋");
  const bluf = L(
    `<strong>Password admin baru telah digenerate.</strong> Password lama sudah <strong>dihapus</strong> dan tidak dapat digunakan lagi. Semua sesi login aktif juga telah dicabut demi keamanan.`,
    `<strong>A new admin password has been generated.</strong> The old password has been <strong>deleted</strong> and can no longer be used. All active login sessions have also been revoked for security.`,
  );

  const passwordLabel = L("Password Baru Anda", "Your New Password");
  const passwordHint = L(
    "Salin password di atas dan gunakan untuk login.",
    "Copy the password above and use it to sign in.",
  );

  const notesHeader = L("Catatan Keamanan", "Security Notes");
  const notes = [
    L(
      "Password lama langsung dihapus saat generate baru.",
      "The old password is deleted as soon as a new one is generated.",
    ),
    L(
      "Semua sesi login aktif dicabut; Anda perlu login ulang.",
      "All active sessions are revoked; you need to sign in again.",
    ),
    L(
      "Sesi login berlaku 12 jam sejak login.",
      "Login sessions last 12 hours from sign-in.",
    ),
    L(
      "Fitur generate password hanya aktif di mode development.",
      "The password generation feature is only active in development mode.",
    ),
  ];

  const ctaText = L("Masuk ke Admin", "Sign in to Admin");
  const ctaUrl = `${BASE_URL}/login`;

  const closing = L(
    "Jika Anda tidak meminta password baru, abaikan email ini — namun periksa environment development Anda.",
    "If you did not request a new password, ignore this email — but check your development environment.",
  );
  const signature = L(
    `Salam hangat,<br/><strong style="color:#1f2937">${APP_NAME}</strong>`,
    `Best regards,<br/><strong style="color:#1f2937">${APP_NAME}</strong>`,
  );
  const footerNote = L(
    "Email otomatis dari sistem development — tidak perlu dibalas.",
    "Automated email from the development system — no reply needed.",
  );

  const notesRows = notes
    .map(
      (note, i) =>
        `<tr><td style="padding:8px 0;${i < notes.length - 1 ? "border-bottom:1px solid #e5e7eb;" : ""}">
        <span style="display:inline-block;width:10px;height:10px;background:#4f46e5;border-radius:50%;margin-right:8px;vertical-align:middle"></span>
        <span style="font-size:14px;color:#374151">${note}</span>
      </td></tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${NOTIFICATION_LOCALE}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<title>${escapeHtml(title)}</title>
<style type="text/css">
@media screen{body,table,td,p,a,span,strong,h1{font-family:${font}}}
/* Responsif: Tablet (<=768px) */
@media only screen and (max-width:768px){
  .email-container{max-width:100%!important;margin:0 auto!important}
  .email-body{padding:20px 18px!important}
  .email-header{padding:20px!important}
  .email-header h1{font-size:19px!important}
}
/* Responsif: HP (<=480px) */
@media only screen and (max-width:480px){
  body{padding:12px!important}
  .email-container{max-width:100%!important;border-radius:8px!important}
  .email-header{padding:18px 16px!important;border-radius:8px 8px 0 0!important}
  .email-header h1{font-size:18px!important}
  .email-header p{font-size:12px!important}
  .email-body{padding:18px 14px!important;border-radius:0 0 8px 8px!important}
  .email-body p{font-size:14px!important}
  .email-password{font-size:17px!important;letter-spacing:1px!important;padding:14px 10px!important}
  .email-cta{display:block!important;padding:12px 20px!important;font-size:13px!important}
}
</style>
<!--[if mso]>
<style type="text/css">body,table,td,p,a,span,strong,h1{font-family:Arial,sans-serif!important}</style>
<![endif]-->
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:${font}">
<div class="email-container" style="font-family:${font};max-width:560px;margin:0 auto;color:#1f2937;padding:0">
  <div class="email-header" style="background:${THEME_COLOR};color:#fff;padding:24px;text-align:center;border-radius:12px 12px 0 0">
    <h1 style="font-family:${font};margin:0;font-size:22px;font-weight:700">${escapeHtml(title)}</h1>
    <p style="font-family:${font};margin:4px 0 0;font-size:13px;opacity:0.9">${escapeHtml(subtitle)}</p>
  </div>
  <div class="email-body" style="background:#f9fafb;padding:28px 24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px">
    <p style="font-family:${font};margin:0 0 16px;font-size:15px">${greeting}</p>
    <p style="font-family:${font};margin:0 0 20px;font-size:15px;line-height:1.6">${bluf}</p>
    <p style="font-family:${font};margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(passwordLabel)}</p>
    <div style="background:#ffffff;border:2px dashed ${THEME_COLOR};border-radius:10px;padding:18px 12px;text-align:center;margin:0 0 8px">
      <strong class="email-password" style="font-family:${monoFont};font-size:20px;letter-spacing:2px;color:#1f2937;word-break:break-all">${escapeHtml(password)}</strong>
    </div>
    <p style="font-family:${font};margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center">${escapeHtml(passwordHint)}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px" />
    <p style="font-family:${font};margin:0 0 8px;font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px">${escapeHtml(notesHeader)}</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px;font-size:14px">${notesRows}</table>
    <div style="text-align:center;margin:24px 0 16px">
      <a href="${escapeHtml(ctaUrl)}" class="email-cta" style="font-family:${font};display:inline-block;padding:12px 32px;background:${THEME_COLOR};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">${escapeHtml(ctaText)}</a>
    </div>
    <p style="font-family:${font};margin:0 0 4px;font-size:14px;line-height:1.6">${closing}</p>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0 12px" />
    <p style="font-family:${font};margin:0;font-size:13px;color:#6b7280;line-height:1.5">${signature}</p>
    <p style="font-family:${font};margin:8px 0 0;font-size:12px;color:#9ca3af">${escapeHtml(footerNote)}</p>
  </div>
</div>
</body>
</html>`;
}
