export const SITE_URL = "https://lurgi.github.io";

export function getCanonicalUrl(path = "/") {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}
