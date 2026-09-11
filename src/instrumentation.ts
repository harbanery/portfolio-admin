import type { Instrumentation } from "next";

/**
 * Observability tambahan (tanpa dependensi eksternal):
 *
 * - `register()`: dicatat sekali saat server instance baru aktif —
 *   memudahkan korelasi deploy/runtime di log Vercel.
 * - `onRequestError()`: semua error server (render page, route handler,
 *   server action, proxy) tercatat terstruktur (JSON) dengan konteks
 *   route, method, dan digest — siap dipakai log drain/alerter.
 *
 * Vercel Analytics + Speed Insights di sisi client sudah terpasang
 * (lihat src/components/vercel).
 */

export function register() {
  const runtime = process.env.NEXT_RUNTIME ?? "nodejs";
  const env = process.env.NODE_ENV ?? "unknown";
  console.info(
    JSON.stringify({
      severity: "INFO",
      message: "server instance started",
      event: "server.boot",
      runtime,
      env,
      timestamp: new Date().toISOString(),
    }),
  );
}

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const err = error instanceof Error ? error : null;
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest?: unknown }).digest)
      : undefined;

  console.error(
    JSON.stringify({
      severity: "ERROR",
      message: err?.message ?? String(error),
      event: "server.request_error",
      digest,
      request: {
        method: request.method,
        path: request.path,
      },
      context: {
        routerKind: context.routerKind,
        routePath: context.routePath,
        routeType: context.routeType,
      },
      stack: err?.stack?.split("\n").slice(0, 5).join(" | "),
      timestamp: new Date().toISOString(),
    }),
  );
};
