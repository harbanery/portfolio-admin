"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";

/** Vercel Speed Insights: Core Web Vitals aplikasi (lazy-loaded). */
export default function CustomSpeedInsights() {
  return <SpeedInsights />;
}
