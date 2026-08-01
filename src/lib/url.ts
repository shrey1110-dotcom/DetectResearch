/**
 * Helper function to ensure URLs start with http:// or https:// and resolve to live, working web pages.
 * Prevents relative route resolution errors in Next.js and replaces legacy mock subpaths with live university portals.
 */
export function ensureAbsoluteUrl(url?: string | null, universityName?: string | null): string {
  if (!url || url === '#') {
    return getUniversityFallbackUrl(universityName);
  }

  const trimmed = url.trim();

  // If the URL contains legacy non-existent mock subpaths from early seeding, redirect to the real live domain
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('mit-quantum-topological-qubit') ||
    lower.includes('quantum-coherence-materials') ||
    lower.includes('bao-group/flexible-organic-electronics') ||
    lower.includes('s41587-026-crispr') ||
    lower.includes('nsf-climate-resilient-grid')
  ) {
    return getUniversityFallbackUrl(universityName || trimmed);
  }

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

export function getUniversityFallbackUrl(universityName?: string | null): string {
  const u = (universityName || '').toLowerCase();
  if (u.includes('csulb') || u.includes('long beach')) {
    return 'https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science';
  }
  if (u.includes('pacific') || u.includes('uop')) {
    return 'https://www.pacific.edu/engineering-and-computer-science';
  }
  if (u.includes('mit')) {
    return 'https://news.mit.edu';
  }
  if (u.includes('stanford')) {
    return 'https://engineering.stanford.edu';
  }
  if (u.includes('harvard')) {
    return 'https://chemistry.harvard.edu';
  }
  if (u.includes('berkeley')) {
    return 'https://eecs.berkeley.edu';
  }
  return 'https://www.csulb.edu/college-of-engineering';
}
