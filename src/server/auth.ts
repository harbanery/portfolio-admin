import { randomBytes, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_HOURS,
} from "@/config/variables";

/**
 * Service autentikasi admin: password hashing (bcrypt), manajemen sesi
 * (12 jam), dan rate-limit login attempt per IP.
 *
 * Model terkait di Prisma: Admin, Session, LoginAttempt.
 */

/** Durasi sesi dalam milidetik. */
export const SESSION_TTL_MS = SESSION_TTL_HOURS * 60 * 60 * 1000;

/** Batas percobaan login gagal per IP sebelum diblokir sementara. */
export const MAX_LOGIN_ATTEMPTS = 5;

/** Durasi blokir IP setelah melewati batas percobaan gagal. */
const LOGIN_BLOCK_MINUTES = 15;

/** Panjang password yang digenerate (karakter). */
const GENERATED_PASSWORD_LENGTH = 16;

/** Kostum karakter untuk generate password (tanpa karakter ambigu). */
const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Password
// ---------------------------------------------------------------------------

/** Hash password menggunakan bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/** Verifikasi password terhadap hash bcrypt. */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * Generate password acak yang kuat (tanpa karakter ambigu seperti
 * 0/O/1/l/I agar mudah diketik dari email).
 */
export function generatePassword(): string {
  const bytes = randomBytes(GENERATED_PASSWORD_LENGTH);
  let out = "";
  for (let i = 0; i < GENERATED_PASSWORD_LENGTH; i++) {
    out += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Login attempt (rate-limit per IP)
// ---------------------------------------------------------------------------

/** Ambil IP client dari request (mendukung proxy/Vercel). */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/** Apakah IP sedang diblokir karena terlalu banyak percobaan gagal? */
export async function isIpBlocked(ipAddress: string): Promise<boolean> {
  const attempt = await prisma.loginAttempt.findUnique({
    where: { ipAddress },
  });
  if (!attempt?.blockedUntil) return false;
  return attempt.blockedUntil.getTime() > Date.now();
}

/** Catat percobaan login gagal; blokir IP setelah melewati batas. */
export async function recordFailedAttempt(
  ipAddress: string,
): Promise<{ blocked: boolean; blockedUntil: Date | null }> {
  const existing = await prisma.loginAttempt.findUnique({
    where: { ipAddress },
  });

  const attemptCount = (existing?.attemptCount ?? 0) + 1;
  const shouldBlock = attemptCount >= MAX_LOGIN_ATTEMPTS;
  const blockedUntil = shouldBlock
    ? new Date(Date.now() + LOGIN_BLOCK_MINUTES * 60 * 1000)
    : null;

  await prisma.loginAttempt.upsert({
    where: { ipAddress },
    update: {
      attemptCount: shouldBlock ? 0 : attemptCount,
      blockedUntil,
      lastAttemptAt: new Date(),
    },
    create: { ipAddress, attemptCount, blockedUntil },
  });

  return { blocked: shouldBlock, blockedUntil };
}

/** Reset hitungan percobaan gagal setelah login berhasil. */
export async function clearFailedAttempts(ipAddress: string): Promise<void> {
  await prisma.loginAttempt.updateMany({
    where: { ipAddress },
    data: { attemptCount: 0, blockedUntil: null, lastAttemptAt: new Date() },
  });
}

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

/** Ambil record admin tunggal (single-user app). */
export async function getAdmin() {
  return prisma.admin.findFirst();
}

/**
 * Generate password baru (polos) tanpa menerapkannya ke database.
 * Pemanggil bertanggung jawab mengirim email lalu memanggil
 * `applyNewAdminPassword` bila pengiriman berhasil.
 */
export function generateAdminPassword(): string {
  return generatePassword();
}

/**
 * Terapkan password admin baru: password lama langsung dihapus (ditimpa),
 * record admin dibuat bila belum ada, dan semua sesi aktif dicabut.
 * Hanya dipanggil setelah email password berhasil dikirim.
 */
export async function applyNewAdminPassword(password: string): Promise<void> {
  const hashed = await hashPassword(password);
  const admin = await getAdmin();

  if (admin) {
    await prisma.$transaction([
      prisma.admin.update({
        where: { id: admin.id },
        data: { password: hashed },
      }),
      prisma.session.deleteMany({ where: { userId: admin.id } }),
    ]);
  } else {
    await prisma.admin.create({ data: { password: hashed } });
  }
}

/** Hash dummy untuk menyamakan waktu respons saat admin belum ada. */
let dummyHashPromise: Promise<string> | null = null;
function getDummyHash(): Promise<string> {
  if (!dummyHashPromise) {
    dummyHashPromise = bcrypt.hash(randomBytes(16).toString("hex"), BCRYPT_ROUNDS);
  }
  return dummyHashPromise;
}

/**
 * Verifikasi password login terhadap record admin tunggal.
 * Bila admin belum ada, tetap jalankan bcrypt terhadap hash dummy agar
 * waktu respons tidak membocorkan keberadaan admin (timing attack).
 */
export async function verifyLoginPassword(
  password: string,
): Promise<{ ok: boolean; adminId: number | null }> {
  const admin = await getAdmin();
  if (!admin) {
    await bcrypt.compare(password, await getDummyHash()).catch(() => false);
    return { ok: false, adminId: null };
  }
  const ok = await verifyPassword(password, admin.password);
  return { ok, adminId: ok ? admin.id : null };
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/** ID sesi acak (token opaque, disimpan sebagai hash di DB). */
function newSessionId(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Hash token sesi sebelum disimpan ke DB, agar kebocoran database
 * tidak langsung membuka sesi (cookie tetap memegang token asli).
 */
function hashSessionId(sessionId: string): string {
  return createHash("sha256").update(sessionId).digest("hex");
}

/** Bandingkan dua string secara konstan-waktu. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Buat sesi baru untuk admin; mengembalikan token cookie + kedaluwarsa. */
export async function createSession(
  userId: number,
): Promise<{ token: string; expiresAt: Date }> {
  const token = newSessionId();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { id: hashSessionId(token), userId, expiresAt },
  });

  // Bersihkan sesi kedaluwarsa milik admin ini (housekeeping ringan).
  await prisma.session.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  });

  return { token, expiresAt };
}

/**
 * Validasi token sesi dari cookie. Mengembalikan record sesi bila valid
 * dan belum kedaluwarsa, atau null sebaliknya.
 */
export async function validateSession(
  token: string | undefined | null,
): Promise<{ id: string; userId: number; expiresAt: Date } | null> {
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { id: hashSessionId(token) },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session;
}

/** Hapus sesi (logout). */
export async function destroySession(
  token: string | undefined | null,
): Promise<void> {
  if (!token) return;
  await prisma.session
    .delete({ where: { id: hashSessionId(token) } })
    .catch(() => {});
}

/** Opsi cookie sesi untuk `cookies().set()` di Route Handler. */
export function sessionCookieOptions(expiresAt: Date) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    expires: expiresAt,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
  };
}

/**
 * Guard sesi untuk Route Handler: validasi cookie sesi terhadap database.
 * Proxy hanya memeriksa keberadaan cookie; validasi penuh dilakukan di
 * sini agar cookie palsu tidak bisa mengakses data.
 */
export async function requireAuth(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  return (await validateSession(token)) !== null;
}
