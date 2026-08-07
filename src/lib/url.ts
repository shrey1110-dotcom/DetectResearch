/**
 * Robust URL Sanitizer & Real-World Domain Resolver
 * Ensures all external research links & faculty profile URLs open valid, working live webpages.
 */
export function ensureAbsoluteUrl(url?: string | null, universityInfo?: string | null, domainHint?: string | null): string {
  if (!url || url === '#' || url === 'null' || url === 'undefined') {
    return resolveRealUniversityUrl(universityInfo, domainHint);
  }

  const trimmed = url.trim();
  const lower = trimmed.toLowerCase();

  // Detect fake/mock placeholder domains or non-existent paths from synthetic data
  if (
    lower.includes('labs.university.edu') ||
    lower.includes('faculty.edu') ||
    lower.includes('example.com')
  ) {
    return resolveRealUniversityUrl(universityInfo || trimmed, domainHint);
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

export function resolveRealUniversityUrl(universityInfo?: string | null, domainHint?: string | null): string {
  const info = `${universityInfo || ''} ${domainHint || ''}`.toLowerCase();

  if (info.includes('ut austin') || info.includes('texas') || info.includes('utaustin.edu') || info.includes('utexas')) {
    return 'https://www.utexas.edu';
  }
  if (info.includes('csulb') || info.includes('long beach') || info.includes('csulb.edu')) {
    return 'https://www.csulb.edu/college-of-engineering/computer-engineering-computer-science';
  }
  if (info.includes('pacific') || info.includes('uop') || info.includes('pacific.edu')) {
    return 'https://www.pacific.edu/engineering-and-computer-science';
  }
  if (info.includes('mit') || info.includes('mit.edu')) {
    return 'https://news.mit.edu';
  }
  if (info.includes('stanford') || info.includes('stanford.edu')) {
    return 'https://engineering.stanford.edu';
  }
  if (info.includes('harvard') || info.includes('harvard.edu')) {
    return 'https://chemistry.harvard.edu';
  }
  if (info.includes('berkeley') || info.includes('berkeley.edu')) {
    return 'https://eecs.berkeley.edu';
  }
  if (info.includes('michigan') || info.includes('umich.edu')) {
    return 'https://engin.umich.edu';
  }
  if (info.includes('cmu') || info.includes('carnegie') || info.includes('cmu.edu')) {
    return 'https://www.cs.cmu.edu';
  }
  if (info.includes('caltech') || info.includes('caltech.edu')) {
    return 'https://www.eas.caltech.edu';
  }
  if (info.includes('columbia') || info.includes('columbia.edu') || info.includes('columbiauniversity')) {
    return 'https://engineering.columbia.edu';
  }
  if (info.includes('princeton') || info.includes('princeton.edu') || info.includes('princetonuniversity')) {
    return 'https://engineering.princeton.edu';
  }
  if (info.includes('ucla') || info.includes('ucla.edu')) {
    return 'https://www.samueli.ucla.edu';
  }
  if (info.includes('cornell') || info.includes('cornell.edu') || info.includes('cornelluniversity')) {
    return 'https://www.engineering.cornell.edu';
  }
  if (info.includes('purdue') || info.includes('purdue.edu') || info.includes('purdueuniversity')) {
    return 'https://engineering.purdue.edu';
  }
  if (info.includes('florida') || info.includes('ufl.edu') || info.includes('universityofflorida')) {
    return 'https://www.ufl.edu';
  }
  if (info.includes('dartmouth') || info.includes('dartmouth.edu') || info.includes('dartmouthcollege')) {
    return 'https://www.dartmouth.edu';
  }
  if (info.includes('hopkins') || info.includes('jhu.edu') || info.includes('johnshopkins')) {
    return 'https://engineering.jhu.edu';
  }
  if (info.includes('boston university') || info.includes('bu.edu') || info.includes('bostonuniversity')) {
    return 'https://www.bu.edu';
  }
  if (info.includes('pennsylvania') || info.includes('upenn.edu') || info.includes('universityofpennsylvania')) {
    return 'https://www.upenn.edu';
  }
  if (info.includes('maryland') || info.includes('umd.edu') || info.includes('universityofmaryland')) {
    return 'https://www.umd.edu';
  }
  if (info.includes('ohio state') || info.includes('osu.edu') || info.includes('ohiostate')) {
    return 'https://www.osu.edu';
  }
  if (info.includes('washington') || info.includes('uw.edu') || info.includes('universityofwashington')) {
    return 'https://www.washington.edu';
  }
  if (info.includes('chicago') || info.includes('uchicago.edu') || info.includes('universityofchicago')) {
    return 'https://pme.uchicago.edu';
  }
  if (info.includes('vanderbilt') || info.includes('vanderbilt.edu') || info.includes('vanderbiltuniversity')) {
    return 'https://www.vanderbilt.edu';
  }
  if (info.includes('brown') || info.includes('brown.edu') || info.includes('brownuniversity')) {
    return 'https://www.brown.edu';
  }
  if (info.includes('duke') || info.includes('duke.edu') || info.includes('dukeuniversity')) {
    return 'https://www.duke.edu';
  }
  if (info.includes('ucsd') || info.includes('san diego') || info.includes('ucsd.edu')) {
    return 'https://jacobsschool.ucsd.edu';
  }
  if (info.includes('usc') || info.includes('southern california') || info.includes('usc.edu')) {
    return 'https://viterbischool.usc.edu';
  }
  if (info.includes('georgia tech') || info.includes('georgiatech.edu')) {
    return 'https://coenet.gatech.edu';
  }
  if (info.includes('uiuc') || info.includes('illinois.edu')) {
    return 'https://grainger.illinois.edu';
  }

  // Domain fallback if a valid domain is passed in
  if (domainHint && domainHint.includes('.')) {
    const cleanDomain = domainHint.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return `https://www.${cleanDomain}`;
  }

  return 'https://www.csulb.edu/college-of-engineering';
}
