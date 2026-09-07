# Theme Forge 1.7 — standalone / Netlify audit

Audit date: 2026-09-07

This audit checks the materialized standalone browser app, not the original Claude artifact container. The goal is to verify that Theme Forge can run from an ordinary static host such as Netlify without Claude, a backend, credentials, or a build step.

## Result

**Status: deployable as a static Netlify site.**

The repository now contains the real `theme-forge.html` source directly. The one-time reconstruction payload used while moving the artifact into GitHub has been removed.

A standalone compatibility pass added:

- a normal viewport meta tag;
- native browser downloads using `Blob`, `URL.createObjectURL()` and `<a download>`;
- downloadable `theme.json`, `dashboard-spec.json` and `export-target-map.json` without Claude's artifact download service;
- a clear `Standalone mode` status for the optional assistant surface;
- a static `index.html` entry point;
- `netlify.toml` with a zero-build publish configuration and basic security headers.

## Runtime boundary

Theme Forge is one browser document containing HTML, CSS and vanilla JavaScript. Runtime dependencies are deliberately small:

| Item | Required to use the app? | Notes |
|---|---:|---|
| Modern browser | Yes | Chrome/Edge/Firefox-class browser |
| Netlify | No | Only one hosting option |
| Node.js | No | Test tooling only |
| Python | No | Optional local static server only |
| Claude | No | Artifact-specific integration is optional and guarded |
| API key | No | None required for the standalone app |
| Power BI/Fabric authentication | No | Theme Forge emits design intent; it does not call the service |
| Backend/database | No | Browser-only state and JSON import/export |

The Google Fonts stylesheet is optional; the UI falls back to system fonts if it cannot load.

## Browser verification performed

The standalone file was loaded in headless Chromium and exercised without `window.claude`.

### Contract / inventory checks

| Check | Observed |
|---|---:|
| App version | 1.7 |
| `dashboard-spec` contract | 3 |
| Power BI theme schema | 2.156 |
| Visual vocabulary | 27 |
| Style families | 11 |
| Variants | 35 |
| Typed formatting targets | 181 |
| Story archetypes | 10 |
| Object kinds | 21 |
| Target-map controls | 44 |
| Current sample spec validation issues | 0 |

### Standalone interaction checks

Passed in Chromium:

- application boots with no JavaScript page errors;
- no Claude object is present;
- assistant surface reports standalone mode;
- Edit layout activates;
- Pages keyboard shortcut opens the dock;
- visual tooling/dock can be opened;
- native Theme download works;
- native `dashboard-spec.json` download works;
- native `export-target-map.json` download works.

### Responsive matrix

The audit checked 1920, 1440, 1141, 1024, 768 and 420 px widths. An earlier migration verification also checked 2560 and 1280.

At all checked widths:

- the document has no horizontal overflow;
- the command bar has no horizontal scroll;
- both tool rails remain available (below 700 px they become the designed horizontal strip);
- desktop widths keep the key `Edit layout` and `Fit` labels.

Observed rail widths follow the v1.7 responsive design: 56 px at wide desktop, then 52/48/44 px as the viewport narrows, with the horizontal strip on phone-width layouts.

## Automated repository test

`test/smoke.js` is a portable Playwright smoke/audit test. It asserts:

- the contract counts above;
- that the current `SPEC` validates;
- standalone browser-save support;
- target-map generation;
- the standalone assistant status;
- all three JSON download paths;
- responsive no-overflow behavior at six viewport sizes;
- visible rails;
- Edit layout and the Pages shortcut;
- absence of page/console errors.

`.github/workflows/test.yml` runs this audit in Chromium on pushes and pull requests.

The original v1.7 artifact also shipped a much larger release suite (`spectest`, `uxtest17`, `paneltest`, `audit`, `check3`, `check5`). Those release results are useful evidence, but they are not being represented here as newly rerun unless they are separately ported into this repository. The repository smoke suite specifically verifies the standalone/Netlify migration boundary.

## Netlify configuration

`netlify.toml` publishes the repository root directly. There is no build command and no environment variable requirement.

Expected Netlify settings:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Base directory | blank / repository root |
| Build command | none |
| Publish directory | `.` |
| Functions directory | none |
| Environment variables | none required |

The root route is internally rewritten to `/theme-forge.html` with HTTP 200, so the public site opens the workbench directly.

## Feature inventory

### Design / theme system

- 11 style families and 35 variants;
- full restyle by Family + Variant;
- generated Power BI theme JSON using schema 2.156;
- palette, typography, surfaces and containers;
- chart-treatment controls such as grid direction/dash, axis side, direct labels/legend, line weight, bar corners/gaps, fills, hatching, zero line, accent rules and source footnotes;
- WCAG-oriented structural contrast normalization.

### Report/spec authoring

- `dashboard-spec` v3 authoring;
- page layout and story archetypes;
- model metadata import and field-reference validation;
- 27-kind visual vocabulary;
- 15 kinds rendered directly and intent-only kinds represented with honest preview substitutions;
- in-place visual type change with compatible binding preservation;
- add/insert visual on the canvas;
- drag, resize, multi-select, align/distribute and 12-column snapping;
- undo/redo and autosave;
- page sizes from 16:9 down to tooltip-sized canvases.

### Power BI intent surfaces

- typed visual/page formatting intent;
- 181 formatting targets;
- container and chart overrides;
- style presets;
- conditional formatting rules evaluated against preview values;
- filters;
- slicer sync groups;
- bookmarks;
- button actions;
- filter-pane preview;
- five reality classes: ThemeDefault, PerVisual, Conditional, CanvasObject, CustomVisualOnly;
- export target map for downstream cross-checking.

### Inspection / accessibility

- Visual / Data / Format / Filters / Interactions / Accessibility / JSON tools;
- progressive Detail 1 / 2 / 3 without changing exported state;
- per-visual alt text plus a draft helper and coverage count;
- spec diff;
- side-by-side theme/spec JSON editor mode;
- read-only PbiBench target view;
- 107-icon library plus DAX measure generator for Image URL use.

### Export / interoperability

- Power BI `theme.json` download;
- `dashboard-spec.json` download;
- `export-target-map.json` download;
- Copy Theme;
- copyable AI prompt/brief;
- PbiBench bridge is the intended downstream materialization boundary.

## Findings / remaining risks

### 1. Single-file maintainability — medium

The app is approximately 523 KB in one HTML file. This is excellent for portability, but increasingly expensive to review and maintain. The next architectural improvement should be a **source split using native ES modules**, while retaining a zero-build static distribution if desired. A framework migration is not required.

### 2. Content Security Policy — medium

The app intentionally keeps inline CSS and JavaScript, so a strict CSP would require either hashes/nonces or splitting the source. The Netlify configuration therefore adds safe low-risk headers but does not pretend to provide a strict CSP. Splitting CSS/JS would make a strong CSP much easier later.

### 3. Assistant semantics — low

On Netlify there is no real Claude runtime. The existing assistant surface falls back to built-in keyword restyling and now says so explicitly. If an actual AI assistant is added later, it should be implemented as a separate, explicit provider integration rather than silently depending on an artifact environment.

### 4. Browser-local persistence — expected

Autosave/workspace state uses browser storage. It is intentionally not synchronized between devices or users. This is consistent with the current no-backend architecture.

### 5. Full legacy release-suite portability — backlog

The standalone smoke test covers the deployment boundary and high-value contract/UI paths. Porting the original full Playwright release suite into the repository would provide broader regression coverage and is a worthwhile follow-up, especially before large UI refactors.

## Recommendation

Keep v1.7 as the stable static baseline. The immediate product is already useful as a **Power BI design-intent workbench** and is a good fit for Netlify. Do not rewrite it in React merely for hosting. The next engineering work should focus on regression-test portability and source modularization, not framework churn.
