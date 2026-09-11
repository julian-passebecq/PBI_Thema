# Power BI Theme Forge 1.7

Theme Forge is a **static browser workbench** for producing Power BI design intent. It started life as a Claude artifact, but the repository version is now a normal standalone web application.

**Runtime:** HTML + CSS + vanilla JavaScript · **no backend** · **no build step** · **no API key** · **no Claude runtime required**.

**Contracts:** `dashboard-spec` v3 · Power BI report theme schema 2.156.

## Deploy on Netlify

This repository is already configured for a zero-build Netlify deployment with `netlify.toml`.

1. In Netlify, choose **Add new project → Import an existing project**.
2. Select GitHub and `julian-passebecq/PBI_Thema`.
3. Use branch **`main`**.
4. Leave the build command empty.
5. Publish directory is **`.`** (the repository root).
6. No environment variables are required.
7. Deploy.

Netlify reads `netlify.toml`, publishes the root, and internally rewrites `/` to `/theme-forge.html`. There is no Node process after deployment.

## Run locally

The simplest option is to open `theme-forge.html` directly in a browser.

For a normal localhost URL:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Python is only serving static files; Theme Forge itself is JavaScript running in the browser.

## What the standalone migration fixed

The original artifact already contained the application logic, but one runtime detail was Claude-specific: JSON export used the artifact download service. The standalone version now uses the browser's own `Blob` + `<a download>` path when Claude is absent.

That means these work normally from Netlify:

- Download Power BI `theme.json`
- Export `dashboard-spec.json`
- Export `export-target-map.json`
- Copy theme / JSON
- Import model/spec/theme JSON
- localStorage workspace persistence

The optional Assistant surface also reports **Standalone mode** instead of implying that Claude is available. Its local keyword-restyle fallback remains usable without an AI provider.

## Core features

- **11 style families / 35 variants** with full report restyling.
- **27-kind visual vocabulary** with honest preview substitutions for intent-only kinds.
- `dashboard-spec` v3 page/layout authoring.
- Model metadata import and broken-field validation.
- In-place visual type changes while preserving compatible bindings.
- Add, drag, resize, multi-select, align/distribute, snapping and grid support.
- Typed filters, sync groups, bookmarks and button actions.
- **181 typed formatting targets**, per-visual overrides, presets and conditional formatting intent.
- Filter pane and bookmark preview.
- Detail levels 1/2/3 that change visibility only, not exported state.
- Alt text workflow and coverage count.
- Undo/redo and autosave.
- Spec diff and side-by-side JSON workspace.
- PbiBench export-target diagnostics and five Power BI reality classes.
- **107-icon library** with Image URL/DAX helper.
- WCAG-oriented structural contrast normalization.

See [`docs/AUDIT.md`](docs/AUDIT.md) for the standalone audit, responsive matrix, feature inventory and remaining engineering risks.

## Test it

Node.js 22 is required **only for the automated test tooling**:

```bash
npm ci
npx playwright install chromium
npm test
```

`test/smoke.js` launches the standalone file in Chromium and verifies the important migration boundary: contracts, JSON downloads, current spec validation, responsive behavior, rails/toolbars, edit mode, keyboard navigation and browser errors.

`test/regression.js` also checks malformed imports, preservation of named theme presets in downloaded JSON, immediate JSON-editor blur, retained invalid drafts, undo/redo timing, open-panel responsive layout, and saving on reload. `npm test` runs pure contract fixtures, then smoke, regression and Sprint 001 integration suites against both `file://` and an automatically managed loopback HTTP server. No application server or build step is needed by users.

Theme imports use standard JSON. Named style definitions, including collisions with built-in presets, are retained when exporting; their preview may be approximate. Other settings are converted into the workbench's supported controls. Before supplied settings change or disappear (including palette truncation to eight colors), a path report requires **Import supported settings**. Cancel leaves the accepted document unchanged. These are local shape checks, not Microsoft-schema validation or a Power BI compatibility certification.

Dock drafts apply after a short pause or blur; full-editor drafts use Apply. Ctrl/Cmd+Enter applies either editor immediately, subject to conversion review. Invalid/pending drafts remain in their editor across panel/view changes. If another operation accepts a newer document, an old draft requires explicit **Reapply draft**. Ctrl/Cmd+Z inside text fields uses native text undo. Drafts are not persisted across browser restarts.

Imports share spec versions 1–3 (missing legacy version migrates), typed structural checks, deterministic missing IDs and rejection of duplicate IDs or future versions. Safe incomplete bindings and unknown visual kinds remain editable with diagnostics. Limits are 4 MiB UTF-8 per document, 40 pages, 400 visuals, 4,000 model fields and nesting depth 64. Credential-looking properties are removed from spec/model input with value-free diagnostics; unknown extension properties remain inert data.

Undo/redo includes theme, spec and model. Autosave covers accepted state, reports storage failures and flushes on page hide/leave. Invalid or unsupported saved data is retained while autosave is paused: **Save original data** downloads the exact original; **Replace with current document** intentionally resumes saving. Browser storage remains best effort.

Targeted checks: `npm run test:contracts`, `npm run test:reliability`, `npm run test:repairs` (local file by default), and `npm run test:browser` (both transports). Individual browser suites honor `THEME_FORGE_URL`. The mandatory gate includes repair regressions T17–T20 for inert formatting strings, hidden-page/bookmark recovery, and actual control edits reaching history/autosave without forced test flushes. Repair-candidate artifacts are under ignored `test-artifacts/sprint-001-dev-02/`; the prior candidate and independent test artifacts remain historical. `THEME_FORGE_ARTIFACT_DIR` can relocate the original integration suite's screenshots/results. The loopback server closes on completion or failure; test failures exit nonzero.

Formatting-rule string thresholds remain literal text when edited. Invalid retained formatting values remain in exported intent with diagnostics and are not used as preview CSS. Hiding a page preserves the existing page-name storage representation; an empty bookmark display name is incomplete content with a warning, while its stable ID remains required. Cross-filter text, filters, bookmarks and formatting changes notify normal autosave and undo history directly.

GitHub Actions is configured to run the same gate with Node 22 and `npm ci` on pushes and pull requests. A local pass does not establish a remote CI result.

## Repository layout

```text
.
├── theme-forge.html               complete standalone application
├── index.html                     generic static-host entry point
├── netlify.toml                   Netlify publish/rewrite/headers config
├── README.md
├── docs/
│   └── AUDIT.md                   standalone audit + feature inventory
├── test/
│   └── smoke.js                   portable Chromium smoke audit
├── package.json                   test dependencies only
├── scripts/
│   └── standalone_patch.py        migration/provenance helper, not runtime
└── .github/workflows/
    └── test.yml                    CI browser audit
```

## Architecture boundary

Theme Forge intentionally does **not** authenticate to Power BI/Fabric, call their REST APIs, write PBIR, or store credentials. It produces design-intent JSON and theme JSON. PbiBench is the intended downstream materializer.

The current single-file distribution preserves direct local-file launch. The approved later packaging direction is focused development modules plus a generated self-contained HTML artifact; it does not assume that browser ES modules work over `file://`. See `projectmanagement/ARCHITECTURE.md` for the architecture decisions and sprint boundaries.
