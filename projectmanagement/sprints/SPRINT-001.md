# Sprint 001 — Document reliability

Current decision: CHANGES_REQUESTED after lead review on 2026-09-08. Original Passes A–D are delivered; continue with [repair batch 1](SPRINT-001-repair-1.md), not a restart. See [lead findings](../reviews/SPRINT-001-lead.md). The original approved scope and acceptance contract below remain in force.
Owner: medium developer. Independent validation: light tester. Acceptance: lead.
Dependencies: existing dirty baseline preserved as recorded in [STATUS](../STATUS.md).
Goal: importing, editing, undoing and reopening a design has predictable, truthful results and does not silently lose the last valid work.

Read [architecture decisions](../ARCHITECTURE.md), [workflow](../WORKFLOW.md) and [test strategy](../TEST-STRATEGY.md) first.

## Scope and completion boundary

Execute all four passes below in one sustained assignment where the runtime permits. Do not ask for another pass between A, B, C and D. Each pass includes coding, focused checks and repairs. The independent tester is called after D; the lead is called after independent testing or on the explicit escalation conditions.

Included:
- integrate and retain the existing uncommitted reliability fixes;
- unify import version/shape/limit/migration policies and application results;
- make theme conversion explicit without implementing full lossless theme editing;
- fix draft/history/recovery interactions needed for reliable document transitions;
- supply meaningful tests through all current entry points;
- make test installation and candidate reporting reproducible.

Not included: adding new visual types, changing spec/theme target versions, real AI-provider work, Power BI authentication, PBIR generation, full source modularization, production deployment or a complete UI redesign. Record unrelated issues in BACKLOG.

## Acceptance contract

| ID | Required outcome | Required evidence |
| --- | --- | --- |
| AC-01 | Invalid shape/type/IDs/version/limits reject before active state mutation; supported legacy imports migrate consistently | Pure fixture checks + browser state assertions |
| AC-02 | Result clearly distinguishes rejected, pending conversion, and applied-with-diagnostics; unexpected failure rolls back | Success/error/injected-failure browser cases; no half-applied state/history/save |
| AC-03 | Current file/drop/dock/full-editor/compare/recovery paths apply one appropriate policy | Entry-point matrix; matching normalized output/diagnostics for the same fixture |
| AC-04 | Named presets stay intact; other changed/dropped theme input requires an accurate conversion report and explicit action; cancel is harmless | Actual parsed download, ten-color/title.show fixture, collisions and malformed theme tests |
| AC-05 | Valid fast edits apply; invalid drafts survive expected navigation; obsolete drafts/timers cannot overwrite newer state | Real typing, blur, file switch, panel/mode change, full-editor and external-change cases |
| AC-06 | Pending accepted edits and rapid post-undo edits are undoable; model/spec/theme restore consistently; redo invalidates correctly | Real controls/import plus history assertions and exported state |
| AC-07 | Latest accepted changes flush on lifecycle events; quota failure visible; corrupt/unsupported saved original retained until intentional replacement | Fresh-context reload, forced storage errors, invalid boot recovery, original raw-string comparison |
| AC-08 | Existing smoke/regressions remain valid; added suites run on local file and HTTP where relevant, with reproducible install | npm test and documented targeted commands; lockfile + npm ci; exact environment |
| AC-09 | Conversion/error/recovery controls stay usable at required widths; docs and candidate record accurately describe behavior | Browser screenshots/geometry/focus checks + completed developer handoff |

All nine are mandatory for sprint acceptance. External CI/Power BI access limitations must be stated; Power BI Desktop verification is later-sprint work, not a hidden prerequisite here.

## Pass A — Baseline, fixtures and explicit input rules

Outcome: a reproducible starting point and executable examples of the agreed policy.

1. Read the initial lead review and inspect the actual current tree; another model/user may have changed it. Capture git status, HEAD, diff and untracked files. Preserve existing application changes. Do not start from clean main and lose them.
2. Create or use `codex/sprint-001-document-reliability` when safe. If switching risks existing work, stay in the current checkout temporarily and record why. Do not stash/reset/discard by default. No push/merge/deploy is part of this sprint.
3. Establish the current test baseline. Existing local Node is 21.7.1; workflow uses Node 22. Use Node 22 for reproducible verification when available; record a local mismatch rather than inventing a pass. Add a package lock and use `npm ci` in CI. Do not upgrade unrelated dependencies.
4. Add fixtures and test helpers with fresh browser contexts, deterministic local HTTP hosting and failure artifacts. Keep runtime free of test dependencies. Expose useful package scripts by outcome; `npm test` must run the mandatory automated local gate.
5. Encode ADR-002 classification, using typed issue codes/paths/blocking status. Cover:
   - supported spec versions 1/2/3 and missing legacy version; reject future, zero, negative, noninteger and string versions;
   - required object/list types at contract paths, nonempty string names/IDs, finite number geometry, deterministic missing legacy IDs and duplicate rejection;
   - model tables/fields/relationships and field-reference shapes, including null/primitives and invalid names;
   - 4 MiB UTF-8 external text/file limit, 40 pages, 400 total visuals, 4,000 model fields and depth 64;
   - theme container shapes, valid scalar/control inputs, named definitions and arbitrary property names;
   - safe incomplete intent remains editable with explicit diagnostics; unknown keys remain inert.
6. Inventory every actual entry point and every caller of `applySpecText`, `applyThemeText`, `loadSpec`, `loadModel`, `compareSpec`, `restoreSession`. Record absent combinations as N/A (there is currently no model JSON editor or theme file-picker route).

Use failing tests to define the confirmed defects; complete their fixes in following passes. At a pass checkpoint, clearly mark intentionally failing new regression tests and do not call the overall candidate green.

Continue automatically to B.

## Pass B — Shared preparation, atomic application and honest conversion

Outcome: one policy per document type, with correct behavior through current UI routes.

1. Separate parse/shape/migration/normalization/preparation from state assignment. Prefer pure functions with explicit context (model, theme registry), leaving adapters for existing UI functions. A full filesystem/module split is not needed.
2. Enforce limits before expensive traversal/rendering; use context-aware structural checks. Validate migrations after transforming a clone. Give missing IDs stable unique values across pages/routes. Ensure inherited keys such as `constructor` or `__proto__` cannot masquerade as known registry entries.
3. Preserve existing model/spec credential-key cleanup behavior consistently where appropriate, but make any removal/normalization visible as paths or safe notes. Never print secret-looking values in diagnostics. Do not silently strip arbitrary input based only on a renderer's needs.
4. Introduce a bounded application transaction around imports/recovery: prepare the candidate, capture relevant accepted and derived state, apply, rebuild/render, then finalize history/save. Suppress render-driven side effects during preparation/rollback. Unexpected failure restores state and returns rejection, with no pending callback later committing the failed candidate.
5. Use a distinct applied flag rather than treating all validation issues as rejection. A safe unresolved field reference may be applied with issues. A future contract or duplicate identity is rejected. Repair every caller so it neither retains an already-applied draft as "rejected" nor reports rejection after replacing the document.
6. Keep comparisons read-only. Same parsing/migration rules, no replacement of active state; failed comparison leaves prior comparison intact.
7. Theme conversion: compare the supplied input with the generated prepared export for supplied paths. Surface changed/dropped values and palette truncation. Do not count additional generated defaults as losses. Before a lossy conversion, require explicit `Import supported settings`; cancel preserves state. In a live editor, show pending conversion after debounce/blur rather than automatically accepting it. A later edit invalidates the old pending conversion.
8. Existing named preset definitions, including collisions with built-ins, remain intact. Reject wrong theme structural types instead of allowing strings to become accidental preset dictionaries. Preserve literal comment markers inside strings.
9. Conversion UI must clearly distinguish local shape checks from Microsoft-schema validation and warn when a preserved preset cannot be previewed accurately. Do not implement the full S002 lossless overlay architecture in this sprint.

Focused verification: AC-01–04, forced application exception, direct function and actual UI routes. Compare accepted exports semantically excluding generated timestamps.

Continue automatically to C.

## Pass C — Drafts, coherent history and safe recovery

Outcome: asynchronous editing and storage cannot undermine the new application contract.

1. Map draft ownership for both dock and full JSON editors. Track raw text, kind, base accepted revision and pending action. Avoid maintaining two conflicting commit implementations.
2. Cancel obsolete callbacks on kind switch, revert, accepted external import, restore and undo. Preserve invalid/pending drafts across opening/closing panels and switching existing editor views. If a newer document revision exists, show a conflict/reapply choice instead of silently overwriting it.
3. Blur/explicit Apply/Ctrl-Cmd+Enter must all honor the same acceptance and conversion policy. Preserve native text undo within text fields. Mark accepted vs pending/invalid state truthfully; explain that drafts are not persisted across browser restarts.
4. Include model identity/data with theme and spec in document history. Use coherent snapshots or immutable references; do not create new history entries for page navigation or rendering. Keep the 80-entry bound. Avoid needless full-model copies during purely visual workspace changes.
5. Flush pending accepted changes before undo; immediate changes after undo are recorded and clear redo. No suppression timeout may swallow a real edit.
6. Recovery uses the same candidate checks with session-envelope validation. Validate individual stored documents against their applicable limits; do not accidentally apply a single input-file limit to the combined envelope and reject legitimate sessions.
7. Invalid/unsupported original storage is retained. Boot must not call `clearSession()` and then autosave the sample over the recovery data. Surface an actionable recovery/reset choice and a safe way to save the original raw data. Require intentional replacement before writing over it.
8. Keep quota/blocked-storage errors visible outside the context panel. Successful retries clear the error only after a successful write. Lifecycle flush saves accepted document state, not an obsolete/invalid draft. Preserve key compatibility or provide explicit versioned migration.
9. Review history/save scheduling callers affected by the transaction so successful edits generate the intended events and read-only actions do not modify saved design intent.

Focused verification: AC-05–07 with fresh contexts and real UI actions, plus existing blur/history/reload regressions.

Continue automatically to D.

## Pass D — Integration, developer verification and handoff

Outcome: one coherent candidate ready for independent testing.

1. Finish cross-route test coverage and integration cases from TEST-STRATEGY. Include actual parsed downloads and reloads, not only global-variable assertions.
2. Confirm local-file launch, local HTTP launch and static runtime; no dependency on a backend, build server, provider or API key was introduced.
3. Check widths 420/768/1024/1440 with relevant panels open, long messages and new conversion/recovery controls. Verify keyboard access, focus return, visible cancel/apply/close actions, and no unexpected horizontal overflow.
4. Run the complete automated local gate, focused failure-injection checks, clean install verification, and diff hygiene. Diagnose actual failures rather than rerunning blindly. Record remote CI only if actually observed.
5. Update README product behavior/test instructions as needed; preserve historical audits. Update STATUS, acceptance map, defect/backlog state and developer report. Record hashes for dirty source/test files or a clean candidate SHA; include all inherited changes.
6. Report all implementation decisions, untested limits and any external restrictions. No critical local acceptance failures may be hidden in "known issues."
7. Freeze the app candidate and finish with the exact tester handoff in WORKFLOW.

## Stop / escalation conditions

Continue ordinary repairs autonomously. Ask the lead only when the workflow's escalation rules apply, especially if correct implementation requires changing approved version policy, lossless-vs-conversion scope, session compatibility, direct-file delivery, or the external export contract.

If the same scoped defect survives two focused repair attempts, provide the reproduction and alternatives. Do not rewrite the whole app to avoid explaining the problem.

## Lead review focus after testing

Trace every state assignment and caller affected by the import/result changes. Review normalization and extension handling, not just validators. Check rollback side effects, stale callbacks, snapshot/model consistency, boot overwrite protection and conversion comparison correctness. Review both inherited reliability fixes and new code that depends on them.

Provisional next sprint: S002 export fidelity and compatibility, only after the lead accepts S001 and writes its concrete implementation plan.
