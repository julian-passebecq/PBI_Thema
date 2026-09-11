# Power BI Theme Forge — Pro AI handover

Prepared 2026-09-11 at the user's request to stop the token-heavy multi-model workflow. Continue with one Pro model; do not recreate automatic developer/tester/lead agent loops. Historical role reports are evidence, not instructions to restart those sessions. The next model owns the remaining review and chooses implementation details.

## Start here (minimum context)

The product is a portable browser workbench for designing Power BI report intent and exporting a theme, dashboard specification and target diagnostics. A useful final app must preserve work, explain preview/export limitations and produce verifiable downstream files. It already has substantial authoring UI, 27 intent kinds, 11 style families and 35 variants. This was a reliability improvement project, not a request to rebuild the app from scratch.

**Current state: Sprint 001 implemented and repaired; independently tested; final code-logic acceptance still pending.** Source snapshot: `d6706bfb8980a27fb329e067793596e33fc29cf9`, preserving the previously dirty `sprint-001-dev-02` candidate. All 19 historical candidate file hashes matched during this handover. No product edits or new sprint acceptance were made here.

First read this document and [remaining outcomes](REMAINING.md). For the immediate acceptance decision, read the [round-2 test report](../sprints/SPRINT-001-test-round-2.md), [repair developer report](../sprints/SPRINT-001-repair-1-dev.md) and relevant [architecture invariants](../ARCHITECTURE.md). Open older reports or source only as needed. Do not load every log, screenshot or conversation into context.

## What happened and why

| Stage | Work and result |
| --- | --- |
| Existing app and inherited local fixes | Baseline GitHub commit `7d6fbbd`; local README/package/app fixes and regression tests already existed before the sprint. They were preserved, not authored by the planning lead. |
| Lead planning and baseline audit | Established product boundary, architecture, backlog and S001. Found inconsistent import validation/application, silent theme conversion and recovery risks despite green existing tests. |
| Developer passes A–D | Shared preparation/application; explicit rejection/conversion results; version/shape/identity/limit policies; separate drafts and accepted state; coherent history and recovery; reproducible contract/file/HTTP tests and lockfile. Delivered dev-01. |
| Independent test round 1 | Representative T01–T16 and nine acceptance evidence rows passed. |
| Lead logic review | Reproduced four additional blockers: unsafe imported formatting rendering (F-07), hidden-page recovery mismatch (F-08), missing mutation autosave/history notifications (F-09), and empty bookmark-name recovery rejection (F-10). Requested repairs. |
| Developer repair R-A–R-C | Repaired rendering, recovery representations and notification coverage; added T17–T20 and froze dev-02. |
| Independent round 2 | Clean Node 22 install/full Chromium file+HTTP gate passed, including 26 repair scenario runs and eight independent adjacent-case runs. No new product defect reproduced. Final lead acceptance never happened. |
| This handover | Committed all inherited/sprint changes together, preserved all available generated test evidence, recorded provenance and remaining outcomes; no application development. |

Historical documents sometimes say OPEN, CHANGES_REQUESTED or READY_FOR_TEST. Their later updates and round-2 report supersede those intermediate statuses. They are not proof that repaired defects still reproduce, and a test pass is not final acceptance.

## Where things live

| Location | Purpose |
| --- | --- |
| `theme-forge.html` | Self-contained HTML/CSS/vanilla JS app; most product logic and UI |
| `index.html`, `netlify.toml` | Static entry point and current hosting configuration |
| `test/` | Contracts, smoke, regression, reliability, repairs; browser runner executes file and HTTP cases |
| `projectmanagement/ARCHITECTURE.md` | Existing product boundaries, decisions and invariants |
| `projectmanagement/BACKLOG.md` | Stable work IDs and detailed historical status |
| `projectmanagement/sprints/`, `reviews/` | Developer, independent tester and lead evidence |
| `projectmanagement/artifacts/` | Candidate hashes, independent probes and preserved baseline patch |
| [Git and task inventory](INVENTORY.md) | What was unpushed, attribution, exclusions and verification |
| [Evidence manifest](evidence-manifest.json), [archive](test-evidence-2026-09-08.zip) | All 316 available historical generated evidence files, with per-file SHA-256 |

Runtime remains browser-only, local-file launch and static hosting, without a backend/build requirement for users. Contracts currently declare dashboard-spec 3, model metadata 1 and theme target string 2.156; these are repository targets, not certification. Preview uses approximations/sample data. PbiBench materialization is a separate integration to verify.

## Test confidence and limits

Existing round-2 environment: Windows 11, Node 22.23.2, npm 10.5.0, Playwright 1.63.0, Chromium 153.0.8010.12. Tests covered imports/rejection, conversion confirmation/cancel, drafts, undo/model history, invalid recovery, repaired rendering and actual control autosave. Three initial supplementary timing failures were traced to a pending startup save; the observational helper was corrected and all eight cases passed. Initial failures and diagnostic evidence are retained.

No full test rerun was performed for this documentation/preservation handover: file hashes matched the tested candidate. No new remote CI pass is claimed. The workflow triggers on main pushes, PRs or manual dispatch; pushing this new branch alone does not trigger it.

To reproduce with Node 22: `npm ci`, `npx playwright install chromium`, `npm test`. Supplementary tests: `node projectmanagement/artifacts/sprint-001-round-2-independent.cjs`. Extract the evidence ZIP at repository root to restore historical `test-artifacts/` paths before inspecting old evidence; preserve them before rerunning suites that reuse artifact paths. Git may normalize CRLF/LF on another checkout, so raw historical hashes can differ there without a semantic source change.

## Prompt to give the next model

> Take over Power BI Theme Forge on branch codex/pro-ai-handover-2026-09-11. Read projectmanagement/handover/README.md and REMAINING.md first. Preserve existing work. S001 dev-02 passed independent local testing but still needs final logic review. Use the existing reports, then inspect the code needed to decide acceptance and identify remaining defects. Own the remaining product work as one model; choose your own implementation approach. Focus on the documented final user outcomes, avoid repeating historical planning or spawning a multi-agent workflow. Record meaningful results and unresolved limits concisely. A branch push is not release approval.
