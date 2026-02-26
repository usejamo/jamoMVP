# Changelog

## [0.5.0] - 2026-02-26

### Fixed
- White page crash after AI generation caused by stale `SOURCE_STYLES` reference (renamed to `SOURCE_META`)

## [0.4.0] - 2026-02-26

### Changed
- Annotation popover redesigned to match app theme: white background, gray border, subtle shadow
- Popover now opens directly below the clicked highlight instead of floating above
- Popover flips above anchor if too close to bottom of viewport; clamps to right edge of screen
- Source type shown as colored dot + pill badge; quote uses colored left border only

## [0.3.0] - 2026-02-26

### Added
- Full 11-section CRO proposal draft generated on demand per proposal
  - Executive Summary, Study Overview, Scope of Work (6 functional areas), Project Timeline, Staffing Plan, Site Strategy, Budget Summary, Assumptions & Exclusions, Company Qualifications, Quality & Risk Management, Appendices
- ~20 inline source annotations highlighted throughout the draft (amber = RFP, blue = Kick-off Call, green = Supporting Doc)
- Clicking any highlight opens a popover showing the source document name and the exact excerpt that justifies the content
- Draft content dynamically adapts to each proposal's client, study type, therapeutic area, and uploaded documents
- Context & Documents section on proposal detail page
  - Pre-populated mock documents per proposal (RFP, kick-off call transcript, proposal template, supporting docs)
  - Drag-and-drop upload zone and Upload button for adding additional context files
- Interactive navigation throughout the app
  - Dashboard proposal rows and "View all" link navigate to proposals pages
  - Full proposals list page with clickable rows
  - Proposal detail page with back navigation
  - Sidebar updated with Proposals nav link
- Mock data: `src/data/proposals.json` (10 proposals), `src/data/documents.json`, `src/data/proposalDraftData.ts`

## [0.2.0] - 2026-02-25

### Changed
- Converted project from JavaScript to TypeScript
- Added strict TypeScript configuration
- Added typed interfaces for nav items

## [0.1.0] - 2026-02-25

### Added
- Initial project scaffold with Vite + React
- Tailwind CSS v4 with Jamo brand color palette
- React Router with layout shell
- Sidebar navigation with Jamo logo
- Dashboard placeholder page
- Simulated backend data directory (`src/data/`)
