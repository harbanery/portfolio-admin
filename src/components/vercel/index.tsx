import { lazy } from "react";

export const VercelCompatibleComponents = {
  Analytics: lazy(() => import("./analytics")),
  SpeedInsights: lazy(() => import("./speed-insights")),
};
