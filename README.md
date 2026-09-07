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

Node.js is required **only for the automated test tooling**:

```bash
npm install
npx playwright install chromium
npm test
```

`test/smoke.js` launches the standalone file in Chromium and verifies the important migration boundary: contracts, JSON downloads, current spec validation, responsive behavior, rails/toolbars, edit mode, keyboard navigation and browser errors.

GitHub Actions runs the same smoke audit on pushes and pull requests.

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

The current single-file distribution is useful for portability. If the codebase grows substantially, the next architecture step should be to split source into native ES modules while keeping the deployed output static; a React rewrite is not required just to make this maintainable or deployable.
