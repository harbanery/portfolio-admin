export const META_TITLE: string | undefined = process.env.TITLE_WEB;
export const META_APP: string | undefined = process.env.APP_WEB;
export const META_DESCRIPTION: string | undefined = process.env.DESCRIPTION_WEB;

export const BASE_URL: string =
  process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

export const NODE_ENV: string = process.env.NODE_ENV || "development";

/** Prefix API internal (client-server via folder src/app/api). */
export const API_BASE_PATH = "/api";
