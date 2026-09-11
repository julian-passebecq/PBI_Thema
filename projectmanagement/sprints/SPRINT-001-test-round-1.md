# Sprint 001 independent test — round 1

Disposition: READY_FOR_LEAD
Next actor: lead, for architecture and code-logic review; sprint acceptance remains pending.
Date: 2026-09-08.
Candidate: sprint-001-dev-01, branch `codex/sprint-001-document-reliability`, dirty HEAD `7d6fbbdc1a35b508d7229688e77c46ea281b5703`, identified by `../artifacts/sprint-001-candidate.json`.
Environment: Windows 11 Pro, Node 22.23.2, npm 10.5.0, Playwright 1.63.0, Chromium 153.0.8010.12, headless fresh contexts.
Candidate drift: none in the 18 manifest files. Only projectmanagement records and a supplementary tester script were added/edited; frozen product and gate tests were unchanged.

## Lead packet

- Clean install and mandatory contracts/smoke/regression/reliability gate passed on file and loopback HTTP. Independent supplementary probes: 12 PASS, 0 FAIL.
- Matrix: 16 PASS / 0 FAIL / 0 BLOCKED / 0 NOT_RUN, using representative cases as permitted by TEST-STRATEGY. Acceptance evidence: AC-01–09 PASS at the tester gate, not architectural acceptance.
- No reproduced defects or repair batch. Rejections, conversion cancellation, stale drafts, model-aware undo, recovery preservation, actual downloads and responsive controls were exercised.
- Lead should trace transaction ownership/rollback, reference-based model history, recovery normalization, and supplied-path theme conversion against ADR-002–005. Tests do not replace that review.
- No Desktop, official Microsoft-schema, PbiBench, Firefox or WebKit validation. Remote CI exists for baseline main only; no CI for this dirty candidate.

## Commands and evidence

All commands ran from the repository root.

| Command | Result | Evidence |
| --- | --- | --- |
| `npm exec --yes --package=node@22 -- npm ci` | exit 0 | `test-artifacts/sprint-001-test-round-1/npm-ci.log` |
| `npm exec --yes --package=node@22 -- npm test` | exit 0; pure contracts plus all three browser suites on both transports | `test-artifacts/sprint-001-test-round-1/npm-test.log` |
| `npm exec --yes --package=node@22 -- node projectmanagement/artifacts/sprint-001-independent.cjs` | exit 0; 12 supplementary results | `test-artifacts/sprint-001-test-round-1/independent-results.json` and `independent.log` |
| `git diff --check` | exit 0; LF/CRLF notices only | direct command output |

The existing gate writes per-transport screenshots and result.json under `test-artifacts/sprint-001/{file,http}/`. Developer artifacts were copied to `test-artifacts/sprint-001-test-round-1/developer-evidence/` before rerunning. The tester gate evidence was subsequently copied to `test-artifacts/sprint-001-test-round-1/gate/`. Bulky artifacts remain ignored. The supplementary script is retained in projectmanagement/artifacts for reproducibility; it does not alter the frozen gate.

## Matrix

Evidence abbreviations: C = executed test/contracts.js; R = executed test/regression.js; B = executed test/reliability.js; I = supplementary independent script. Browser evidence covers file and HTTP unless stated otherwise.

| Test / acceptance | Result | Executed cases and evidence |
| --- | --- | --- |
| T01 / AC-01,02 | PASS | C invalid roots, nested types, null members, scalar IDs/names and string geometry; B rejected accepted-state/history/storage assertions. |
| T02 / AC-01,03 | PASS | C supported/missing and invalid versions, immutable deterministic migration; B repeated legacy routes; I multi-page supplied/generated ID collision fixture and null binding. |
| T03 / AC-01,03 | PASS | C UTF-8 byte limits below/at/above 4 MiB, 40/41 pages, 400/401 visuals, 4000/4001 fields, depths 63/64/65; B actual at/above file input and direct theme/model byte rejection. No performance benchmark claimed. |
| T04 / AC-03 | PASS | B accepted/rejected spec/model chooser and drop, spec/theme dock/full editors, read-only comparison, legacy preparation/recovery and invalid boot recovery. Model editor/compare and theme chooser/drop absent: N/A. Recovery stores internal theme controls, not external theme JSON. |
| T05 / AC-01,02 | PASS | B future spec editor refusal and unsupported `constructor` kind retained with diagnostics; I duplicate spec through full editor rejected, missing measure applied and retained in downloaded spec with validation errors. |
| T06 / AC-04 | PASS | B ten-color/title.show conversion report, unchanged cancel, explicit apply, parsed palette/title and Quiet preset output, arbitrary prototype-like preset keys. I 50 long unknown properties disclosed before conversion. |
| T07 / AC-04 | PASS | B malformed visualStyles/textClasses/preset containers reject; literal comment markers, URL and Unicode preserved in actual download. |
| T08 / AC-05 | PASS | R native text undo and invalid draft retention; B fast fill/blur, editor view/panel changes, real Apply/Ctrl+Enter and pending conversion. |
| T09 / AC-05 | PASS | B pending dock timer/external import, keep/reapply and full theme stale conversion invalidation; I full-spec draft after recovery cannot overwrite recovered state, including reload. |
| T10 / AC-06 | PASS | R/B immediate edits before/after undo, redo invalidation, model undo/redo and navigation dedupe; I actual toolbar undo/redo buttons restore the expected theme name. |
| T11 / AC-07 | PASS | R/B immediate accepted edit and reload; I unaccepted full draft stays out of saved recovery state. B explicit pagehide flush. Hidden event wiring reviewed; not separately dispatched. |
| T12 / AC-07 | PASS | R quota failure and successful retry; I repeated SecurityError writes stay visibly failed until success; B corrupt/future/invalid originals byte-identical through render/pagehide/timers and raw download, explicit replacement. |
| T13 / AC-02 | PASS | B one-time renderAll failure restores document/selection/comparison/history/storage immediately and after 850ms; I independent rebuildPages and renderJsonEd exceptions restore canonical/derived/history/storage snapshots and allow subsequent valid import. |
| T14 / AC-09 | PASS | B four widths for conversion/full editor/recovery; I 50 long paths, keyboard Tab/Escape and focus return at required widths. Inspected screenshots for conversion 420/1024/1440, editor 768, recovery 420; geometry checks cover all four widths. Buttons remain reachable; narrow editor uses vertical scroll. |
| T15 / AC-06,08 | PASS | B model/spec import, editing/history, all three parsed downloads and reload; I missing binding persists through actual spec download/reload, theme and target-map names agree, map contract matches spec and palette maps to ThemeDefault. |
| T16 / AC-01,02 | PASS | B prototype-like kind/preset keys, markup title export/render, no executable image node or prototype pollution; C inert extension keys. Representative coverage, not a complete security audit. |

## Defects and retest

No product defect reproduced. No product repair or assertion weakening. The supplementary suite was extended once to add duplicate-editor and semantic export checks; its final complete run passed. Historical findings F-01–F-06 now have independent scoped evidence, pending lead acceptance.

## Bookkeeping

- Local branches: main and codex/sprint-001-document-reliability, both based at the recorded HEAD. Preserved dirty baseline remains intact.
- `git ls-remote --heads origin`: only main, at the same HEAD. `gh pr list --state all --limit 20 --json ...`: empty list. Five latest workflow runs inspected; latest main run 34127687056 succeeded at this HEAD. This is baseline CI, not sprint CI. Captured in remote-heads.txt, prs.json and ci.json under the round artifact directory.
- STATUS, README continuation, and S001 BACKLOG states moved to READY_FOR_LEAD. No future sprint activated, no acceptance, commit, push, merge, deployment or branch deletion.
- Developer report records zero user resumptions; this tester assignment required no continuation request. No measured developer active duration is available.

## Handoff

Lead: read this report, STATUS, the developer report and candidate manifest; review the complete candidate diff plus inherited baseline fixes and surrounding success/failure/undo/save/export paths. Record ACCEPTED or CHANGES_REQUESTED under projectmanagement/reviews. Choose the next sprint only after acceptance.
