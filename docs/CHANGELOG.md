# Changelog

## [1.2.0] - 2026-07-31

### Added
- **CSULB Support**: Added California State University, Long Beach (CSULB) to university index with CECS and Aerospace engineering departments and faculty research.
- **UOP Support**: Added University of the Pacific (UOP) to university index with Computer Science and Bioengineering research projects.
- **URL Sanitizer**: Added `ensureAbsoluteUrl` utility to format external research and profile links with protocol headers (`https://`).

### Fixed
- **Professor Outreach Action**: Fixed "Reach Out to Professor" action buttons to open native `mailto:` clients cleanly with pre-filled subject line and body text.
- **External Link Navigation**: Fixed broken relative routing on external research links across feed and detail pages.
