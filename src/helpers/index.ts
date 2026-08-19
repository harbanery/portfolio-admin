export function getGithubRepoName(url: string): string {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) return parts.slice(0, 2).join("/");
    return parsed.pathname;
  } catch {
    return url;
  }
}
