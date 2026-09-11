# Sprint 001 developer report

Status: READY_FOR_TEST — all approved passes complete.
Next actor: separate light tester session.
Candidate: `codex/sprint-001-document-reliability`, dirty HEAD `7d6fbbdc1a35b508d7229688e77c46ea281b5703`. Final manifest: `projectmanagement/artifacts/sprint-001-candidate.json`.

## Starting baseline

Preserved all pre-existing modified and untracked files listed in STATUS. Captured the tracked patch, inventory and hashes under `projectmanagement/artifacts/sprint-001-baseline/`. Baseline smoke/regression passed on Node 21.7.1, npm 10.5.0, Playwright 1.63.0. No reset, stash, commit, push, merge or deployment.

## Developer checkpoints

- A complete: baseline captured; branch created; package lock pins the installed Playwright 1.63.0; CI uses npm ci. Added pure contract fixtures and loopback HTTP runner. `node test/contracts.js` passes versions, structural typing, limits, deterministic IDs, clone migration, credential cleanup and inert extension checks. Route inventory is in the baseline artifact folder.
- B complete: shared preparation feeds spec/model pickers, drops, editors, comparison and recovery. Atomic application snapshots document, derived pages, selection, history and revision; render/save scheduling is suppressed during application/rollback. Results distinguish applied, rejected and pending conversion. Conversion compares supplied paths, requires an explicit action and preserves arbitrary named preset keys/collisions. Existing smoke/regression and new local-file cross-route/rollback/download cases pass.
- C complete: shared draft commit logic with independent dock/full raw text and base revisions; explicit stale-draft reapply. Model included in bounded history; pending accepted edits flush before undo. Invalid saved original is retained with autosave suspended until explicit replacement. Per-document recovery limits and envelope version checks retain session-key compatibility. Local-file typing, conflict, history, reload and original-data download cases pass.
- D implementation complete: Node 22.23.2 obtained through npm exec; clean `npm ci` passed. Final clean-install gate PASS (exit 0), including the added markup-preservation assertion, on both local-file and HTTP transports. Conversion, recovery and full-editor screenshots inspected at 420px, with automated geometry/focus checks and screenshots at 420/768/1024/1440. README and candidate records updated. Final source-review repair refreshes the unedited full editor after an external import; the prepared transaction covers that render too.

## Implementation decisions for review

- Keep pure contracts and transaction adapters inside the portable HTML; no runtime dependencies or hosting/target contract changes.
- Unknown extension data is bounded and preserved as inert data. Spec exports retain extensions and incomplete formatting intent; validation is refreshed on export. This is a limited reliability fix, not the full S002 export policy.
- Missing page/visual IDs are generated from page/visual positions, avoiding supplied IDs. Explicit null IDs and non-string identities reject. An explicit null field binding is unbound editable intent, consistent with the app's own incomplete filter editor; malformed non-null field references reject.
- Theme conversion compares only supplied paths, including array items; added object defaults do not count as losses. Changed array lengths count as a change. Reports list paths, array-length changes and safe boolean/numeric/color before/after values; arbitrary text and credential-looking values are withheld.
- Recovery recognizes the current application version and older 1.0–1.6 envelopes, accepts missing legacy envelope version, writes `sessionVersion: 1` under the existing v2 key, and checks each constituent against 4 MiB independently.
- Models are replaced as prepared clones and retained by reference in history; ordinary visual changes do not copy model data. Signature comparison still serializes the document to detect existing control handlers; workspace-only rendering does not append history.
- Full editor retains explicit Apply/Ctrl+Enter behavior; dock also applies after debounce/blur. Both call the same commit policy. Drafts remain local to their editor view for the current browser session.

## Current evidence and limitations

- `npm test` before adding the new runner: inherited smoke and regression PASS after core changes (Node 21).
- `node test/contracts.js`: PASS.
- `node test/reliability.js`: PASS on local file (Node 21), including actual parsed theme/spec/map downloads, one-time render failure, stale timer wait, model undo and raw recovery download.
- `npm exec --yes --package=node@22 -- npm ci --ignore-scripts`: PASS; 2 test packages, 0 reported vulnerabilities. No new dependency or unrelated upgrade.
- An initial prototype-key test failed because passing an object through the automation serializer lost its special key. The fixture now passes literal JSON, exercising the actual import parser and actual downloaded output.
- Remote CI, Power BI Desktop, PbiBench and additional browser engines have not been verified. They are not claimed by local Chromium evidence.

The candidate is frozen and READY_FOR_TEST. Verify the recorded hashes before beginning independent tests.

## Implementation and acceptance map

| ID | Implementation | Developer evidence |
| --- | --- | --- |
| AC-01 | `inputData`, `shapeIssues`, `prepareDocument`, clone-based `migrateSpec`; own-property registries | `test/contracts.js`: versions 1/2/3/missing + invalid variants; nested shapes, IDs, limits at/below/above, UTF-8, extension and cleanup cases. Browser rejected-state assertions. |
| AC-02 | `resultOf`, `applyPrepared`; bounded state snapshot, suppressed render scheduling and delayed-failure protection | Cross-route suite applies unsupported kind with diagnostics; injects a one-time render exception and compares document/selection/comparison/history/storage immediately and after both timer windows. |
| AC-03 | Spec/model pickers and drop → `loadSpec`/`loadModel` → shared preparation; both editors use shared apply; `compareSpec`, `prepareSession` | Actual accepted/rejected picker, drop and both editor routes; read-only compare; identical prepared legacy spec through direct application/comparison/recovery. Theme picker/drop and model editor/compare do not exist (N/A). |
| AC-04 | `prepareTheme`, `suppliedChanges`, `showConversion`, preserved named definitions in `buildThemeJson` | Ten-color + title.show false report/cancel/explicit apply, malformed themes, collisions, prototype-like keys, literal comment markers/URL/Unicode, parsed downloaded theme. |
| AC-05 | `drafts`, `editDraft`, `commitDraft`, conflict dialog, cancellation on accepted revision changes | Real dock typing/blur/Ctrl+Enter, invalid text retention and panel/view switch, obsolete debounce wait, explicit reapply, full editor actions and stale pending conversion; inherited native text undo case. |
| AC-06 | `histSig`/`histPush`/`histGo` includes model; explicit import snapshots; signature dedupe for workspace rendering | Real control edits before undo and immediately after; model replacement undo/redo; navigation does not append history; parsed theme/spec/map journey. |
| AC-07 | `prepareSession`, `loadSession`, `restoreSession`, `recoveryNotice`, `flushSession` | Fresh-context corrupt/future/invalid boot originals remain byte-identical after render/pagehide/timer and download; intentional replacement; combined >4 MiB valid envelope; immediate reload; inherited quota error/retry visibility. |
| AC-08 | Lockfile, npm ci workflow, contracts + managed file/HTTP runner | Clean install and full Node 22 gate; runtime stays self-contained and static. Artifacts and nonzero failure handling in new suite. |
| AC-09 | Responsive conversion/conflict dialogs and recovery banner; README, route inventory, manifest | 420/768/1024/1440 screenshots and geometry; focused cancel control; full-editor theme Apply scrolled into viewport; narrow-screen visual inspection. |

## Final verification artifacts

- `test-artifacts/sprint-001/npm-ci.log`: exact clean install, Node 22 command context, exit 0.
- `test-artifacts/sprint-001/node22-final-gate.log`: final complete gate output.
- `test-artifacts/sprint-001/file/result.json` and `http/result.json`: Node, Playwright, URL and browser-error result per transport.
- `test-artifacts/sprint-001/{file,http}/{conversion,editors,theme-editor,recovery}-{420,768,1024,1440}.png`: new UI screenshots. Full editor has a vertical page scroll at mobile widths; Apply remains reachable. Textarea horizontal scroll is native text editing, not page overflow.
- `git diff --check`: clean (Git emits existing LF/CRLF conversion notices only).

## Tester handoff and review focus

The candidate includes inherited baseline reliability fixes as well as this sprint. Compare against the preserved starting patch to distinguish ownership. Review the complete candidate against HEAD for acceptance.

Challenge transaction rollback with other render/rebuild failures; migration and generated-ID collisions across multiple pages; null/unbound editable field intent; both editor revision conflicts; model-reference history ownership; repeated recovery/quota failures; and keyboard focus return. New tests provide representative matrix coverage, not an exhaustive Cartesian product or a complete app security/logic audit.

No known mandatory local failure is being deferred. No independent tester has been launched, and no sprint acceptance is claimed. Remote freshness/CI, Power BI Desktop, Microsoft-schema validation, PbiBench and non-Chromium browsers remain unverified. Full lossless theme import remains S002; the current conversion step makes its losses explicit.

Final command: `npm exec --yes --package=node@22 -- npm test`, exit 0 after clean `npm ci`. No mandatory local failures remain.

**READY FOR LIGHT TESTER — Sprint 001. Read STATUS.md and the developer report; execute TEST-STRATEGY.md and the sprint matrix.**

## Repair successor — 2026-09-08

Lead repair batch 1 R-A through R-C completed as sprint-001-dev-02, READY_FOR_TEST. See [repair developer report](SPRINT-001-repair-1-dev.md) for the caller audit, F-07–F-10 outcome/acceptance map, final Node 22 gate and round-2 handoff. The original dev-01 manifest and round-1 evidence remain historical and unchanged.
