/**
 * Helper function to ensure URLs start with http:// or https://
 * Prevents relative route resolution errors in Next.js when opening external links.
 */
export function ensureAbsoluteUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
  }
  if (trimmed.startsWith('mailto:')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
