# Power BI Theme Forge 1.7

Theme Forge is a **static browser application** for producing Power BI design intent. It was originally developed as a Claude artifact, but **Claude is not part of the runtime**.

The app is one self-contained `theme-forge.html` file containing:

- HTML for the workspace
- CSS for the full UI and report preview
- **vanilla JavaScript** for state, rendering, import/export, validation, editing, and interactions
- an optional Google Fonts stylesheet; if it cannot load, system fonts are used

There is **no React, Vue, Node server, backend, API key, Claude SDK, or build step** required to run the application.

**Contract:** `dashboard-spec` **v3** · Power BI report theme schema **2.156**

## Run it

### Simplest: open the file

Double-click `theme-forge.html` (or `index.html`). The browser runs the embedded JavaScript directly from `file://`.

### Optional: serve it locally

A local HTTP server is useful when you want a normal `http://localhost` URL:

```bash
# Python
python -m http.server 8000

# then open http://localhost:8000/
```

No Python code is used by Theme Forge itself; Python is only acting as a tiny static file server.

### GitHub Pages / Netlify

This repository includes `index.html`, which redirects to `theme-forge.html`, so the repository can be published as a static site without changing the app. For GitHub Pages, publish the repository root from `main`. Netlify can also deploy the repository root with no build command.

## What needs Node.js?

Only the **automated Playwright test suite**. The app itself does not need Node.js.

```bash
npm install
npx playwright install chromium
npm test
```

The tests are repository-relative; the Claude-only path `/home/claude/theme-forge.html` has been removed.

## Repository layout

```text
.
├── index.html                         static-host entry point
├── theme-forge.html                   the complete application
├── README.md                          run/development instructions
├── HANDOFF.md                         architecture and feature handoff
├── docs/
│   ├── pbibench-bridge-contract.md
│   ├── release-notes-v1.1.md ... v1.7.md
│   ├── theme-forge-handbook.md
│   ├── theme-forge-v1.0-handbook.md
│   └── theme-forge-business-case.md
├── samples/
│   ├── pbibench-model-context.json
│   ├── dashboard-spec.json
│   ├── dashboard-spec-v1.json
│   ├── ai-prompt-example.txt
│   ├── export-target-map.json
│   ├── theme-editorial-red.json
│   └── vocabulary.json
├── screenshots/
│   └── workspace-1141.png             representative v1.7 responsive proof
├── test/
│   ├── spectest.js
│   ├── uxtest17.js
│   ├── paneltest.js
│   ├── audit.js
│   ├── check3.js
│   └── check5.js
└── .github/workflows/test.yml
```

The original artifact contained a large screenshot set. The repository keeps one representative 1141 px screenshot; the screenshots are not runtime assets and are not needed by the tests.

## Two-minute tour

1. Open `theme-forge.html`. It boots with a built-in sample model and a one-page spec.
2. Use **Edit layout**, **+ Add visual**, **Arrange**, **Fit**, **Filter pane**, and **Detail 1/2/3** from the command bar.
3. Pick a **Family** and **Variant** under the canvas for a full restyle.
4. Use the left rail for Pages / Visuals / Themes / Model / Library / Gallery / Icons.
5. Use the right rail for Visual / Data / Format / Filters / Interactions / Accessibility / JSON.
6. Import `samples/pbibench-model-context.json` to bind the preview to a model shape.
7. Export `dashboard-spec.json`, `theme.json`, and the diagnostic target map.

## Architecture boundary

Theme Forge never authenticates, never calls the Power BI/Fabric API, never writes PBIR, and never stores credentials. It reads/imports JSON and emits design-intent JSON. PbiBench is the downstream materializer described in `docs/pbibench-bridge-contract.md`.

See `HANDOFF.md` for the complete architecture and `docs/release-notes-v1.7.md` for the responsive-workspace changes.
