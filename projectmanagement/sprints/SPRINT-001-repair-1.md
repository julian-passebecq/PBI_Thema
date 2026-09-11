# Sprint 001 — Lead repair batch 1

Status: APPROVED FOR DEVELOPMENT, 2026-09-08.
Next actor: medium developer.
Source: [lead review](../reviews/SPRINT-001-lead.md), F-07 through F-10.
Candidate to preserve: sprint-001-dev-01 on `codex/sprint-001-document-reliability`.
Goal: close the four lead blockers while preserving the passing S001 behavior.

Execute **R-A, R-B and R-C consecutively**. Do not ask the user to approve each pass. This is a continuation of S001, not S002 and not a repeat of completed Passes A–D. No product code was repaired by the lead.

## R-A — Safe rendering and compatible recovery

1. Read the complete findings/reproduction script; capture a new starting candidate identity and preserve old manifest/test artifacts.
2. F-07 first: repair imported conditional-formatting value rendering. Inspect fmtHtml rule/value2/gradient paths and valueEditor/adjacent override paths, including visual and page scope. Make strings remain data even for retained incomplete intent. Use DOM value/text properties or correct escaping in retained templates; do not assume `type=number` makes interpolation safe.
3. Keep classification deliberate: numeric-only gradient/threshold structures need path-specific validation; legitimate supported string rule values remain supported, and unknown retained values never become markup. Do not fix this by discarding whole formatting sections or stripping special characters from user data.
4. Add regression assertions for the harmless marker fixture: no extra DOM nodes, no event execution, and accepted semantic content preserved when allowed. For rejected input assert no canonical/history/storage mutation. Exercise opening the editor after import and again after save/reload.
5. F-08: align prepareSession.pagesOff with the existing producer/consumer, string page names. Add fixtures from actual hidden-page UI state and older saved state. Preserve representation and session key; do not convert names to indices.
6. F-10: distinguish bookmark `name` display content from `id` identity. Empty string is accepted incomplete content with a diagnostic/fallback label. Non-string name and empty/invalid IDs remain rejected. Demonstrate editor → autosave → reload → export/reimport.
7. Inspect other newly added session-control checks against their actual UI writers for analogous representation mismatches. Stay within existing S001 recovery policy.

Checkpoint: focused regressions pass; note changed rendering and validation decisions. Continue to R-B.

## R-B — Complete accepted-change notifications

1. Introduce or consolidate one lightweight document-change notification that observes the accepted revision, schedules bounded history and autosave, and updates relevant diagnostics without reconstructing focused text inputs unnecessarily.
2. Route cross-filter text, report/page/visual filters and bookmark mutations through it. Inspect neighboring wireBind, wireFmt, wireFilters, wireBookmarks and page-edit handlers for the same omission. Record an inventory of mutation category → notification path.
3. Preserve existing fast typing and gesture coalescing. Do not create history entries for panel opening, page browsing, bookmark preview, selection or Detail changes. Do not replace this with periodic polling of the whole app.
4. Preserve transaction/restore suppression and rollback; exactly the intended accepted change should produce a document revision. Verify that newly notified edits invalidate pending conversion/old drafts appropriately without discarding raw text.
5. Regression tests start after initial timers settle, perform an actual UI change and observe history/storage without explicit histPush/flushSession/renderAll between action and assertion.
6. Required representative cases: cross-filter text; report and visual filter add/change/remove; bookmark add/rename/hide/remove; undo then edit, redo invalidation; recovery of state authored through these controls. Add other categories if the call-site audit finds omissions.
7. Use an observable history/storage condition with a bounded timeout covering the documented debounce; do not count a successful lifecycle flush as proof of periodic autosave.

Checkpoint: user edits reach autosave/history; read-only actions do not; focused draft/rollback tests remain passing. Continue to R-C.

## R-C — Integration gate and one test-ready handoff

1. Add the regression matrix below to the mandatory gate. Preserve valid existing tests and independent round-1 evidence.
2. Run the complete Node 22 clean-install file/HTTP gate. Retest conversion, invalid originals, immediate undo/reload and transaction failure injection because notification/recovery changes touch them.
3. Inspect any affected editor UI at narrow and desktop widths; assure focus/typing behavior remains usable. No broad cosmetic redesign.
4. Create `sprint-001-dev-02` (or a uniquely recorded successor if another candidate already exists). Keep the dev-01 manifest immutable; write a new manifest and point STATUS at it.
5. Extend the developer report with a repair outcome/acceptance map and exact test results. Mark F-07–F-10 fixed-awaiting-test only when demonstrated. Record the caller audit and any newly found unrelated work.
6. Hand off once to the light tester with **READY FOR LIGHT TESTER — Sprint 001 repair batch 1**. Do not mark acceptance, deploy, merge or begin S002.

## Required added regression matrix

| ID | Required behavior | Finding / prior matrix |
| --- | --- | --- |
| T17 | Imported formatting string/quote/markup payload remains inert when editing; rule/value2/gradient/override and page/visual scopes considered; valid string intent retained | F-07 / T01,T07,T16 |
| T18 | UI page hide → save → reload preserves theme/spec/page-hidden state without recovery notice; older string-name session also restores | F-08 / T04,T11,T12 |
| T19 | Cross-filter/filter/bookmark accepted edits reach history and saved storage after debounce without helper-induced flush; Undo works, redo invalidates, workspace-only actions remain clean | F-09 / T09,T10,T11 |
| T20 | Empty bookmark display name survives editor/save/reload/export/reimport with a diagnostic; invalid non-string names/IDs still reject | F-10 / T01,T04,T11,T12 |

The retained lead script is diagnostic evidence, not the regression gate. Add assertions against desired behavior in the actual tests; do not label its exit 0 as acceptance.

## Independent tester instructions for round 2

Verify the new candidate identity, then run the full mandatory gate and T17–T20. Independently include an adjacent case for each repaired area. Re-check that no test helper saves/pushes history before the assertions meant to prove event wiring.

Record old/new candidate, exact environments/results, actual UI steps versus direct-handler probes, and all open limitations. Preserve round 1 as historical evidence. Write `SPRINT-001-test-round-2.md`, update STATUS/BACKLOG, and return to lead for acceptance; ordinary remaining scoped failures go back as one developer repair batch.

## Lead decisions already supplied

- Existing page-hidden storage representation remains string names.
- Bookmark display names may be empty; stable identities may not.
- Rendering must be safe independently of domain diagnostics.
- Accepted-document change notification is explicit; no periodic polling or source/framework rewrite is needed.
- S002 remains deferred until S001 acceptance. User reauthorization for these repairs is not required.

