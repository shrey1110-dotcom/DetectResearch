# Security Policy

## Supported versions

Security fixes are applied to the current production version and the latest code on the default branch. Older deployments may not receive fixes.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Report it privately through GitHub's security advisory form:

https://github.com/shrey1110-dotcom/DetectResearch/security/advisories/new

Include:

- the affected page, API route, or component;
- clear reproduction steps;
- the expected and observed behavior;
- the potential impact;
- a proposed mitigation, if known.

Remove API keys, access tokens, database credentials, student records, professor contact exports, and other personal data from the report. Use synthetic examples where possible.

The maintainer will acknowledge the report, investigate the impact, and coordinate a fix and disclosure. Please allow reasonable time for a patch before publishing vulnerability details.

## Security-sensitive areas

Changes involving authentication, administrator routes, generated outreach drafts, data imports, Prisma migrations, or environment variables require extra review and tests. Never commit production secrets or copies of production data.
