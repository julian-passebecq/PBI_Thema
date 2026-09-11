# Sprint 001 lead review — 2026-09-08

Decision: **CHANGES_REQUESTED**.
Next actor: medium developer, following [repair batch 1](../sprints/SPRINT-001-repair-1.md).
Candidate reviewed: sprint-001-dev-01; branch `codex/sprint-001-document-reliability`; dirty HEAD `7d6fbbdc1a35b508d7229688e77c46ea281b5703`.
All 18 files in [the candidate manifest](../artifacts/sprint-001-candidate.json) matched before lead review. Product code and frozen gate tests were not edited by the lead.

## Decision summary

The shared preparation/application architecture is a useful improvement. The tested candidate still violates the safe-import, history/autosave and recovery requirements. Four blocking findings were reproduced in five scenarios on both file and loopback HTTP (ten observations).

Repair Sprint 001 before starting S002. These repairs close existing sprint invariants; they do not authorize a feature expansion or framework rewrite. Complete all three repair passes consecutively, hand off to the independent tester, then return to the lead.

## Evidence and review scope

Relied on [developer report](../sprints/SPRINT-001-dev.md), [independent round 1](../sprints/SPRINT-001-test-round-1.md), the frozen manifest, contract/browser test sources, and the complete tracked application/configuration diff against HEAD, including inherited baseline changes. Read the relevant surrounding mutation handlers, renderers, validators, export, history and recovery code.

Independent tester evidence remains: clean Node 22 install, complete file/HTTP gate and twelve supplementary runs passed for their covered cases. The lead did not repeat that full gate; verified candidate identity and exercised additional risks identified from the code.

Lead diagnostic command:
```powershell
npm exec --yes --package=node@22 -- node projectmanagement/artifacts/sprint-001-lead-probes.cjs
```

Script: [sprint-001-lead-probes.cjs](../artifacts/sprint-001-lead-probes.cjs).
Observed results: `test-artifacts/sprint-001-lead/results.json`.
Recovery screenshots: `test-artifacts/sprint-001-lead/{file,http}-hidden-page-recovery.png`.
The diagnostic command completed with exit 0: it records observations, including defects; it is not a passing regression gate. All ten scenario runs reproduced the described failures with no page errors. After repairing, convert the cases into assertions of the required behavior in the mandatory test suite.

Tests used synthetic data and fresh local Chromium contexts. Hidden-page, add-filter and bookmark setup dispatch the existing DOM controls' handlers directly so collapsed groups do not block diagnosis; the cross-filter case uses visible field typing/blur. The markup probe applies JSON and selects the affected visual through the app's selection/render functions. These are logic/integration reproductions, not a claim that every setup step used a physical pointer.

An initial ad-hoc probe timed out waiting for a collapsed page-toggle control to become visible. That probe failure is not an application finding; the retained script uses the actual control handler and records its effects.

No remote CI rerun, deployment, Desktop/PbiBench compatibility test or exhaustive security/feature audit was performed.

## F-07 — P1: Imported conditional-formatting strings execute as HTML

Locations in reviewed candidate:
- `theme-forge.html:6254` — fmtHtml interpolates rule.value directly into an input value attribute.
- `theme-forge.html:6255` — corresponding value2 interpolation.
- `theme-forge.html:6262` and `:6265` — related unescaped gradient endpoint values.
- `shapeIssues` and `validateFormatting` — generic rule payload handling and acceptance of string rule values.

Reproduction: clone the current sample spec, locate the table visual with conditional formatting, replace the first rule's value with a string that closes the attribute and adds a small image with a harmless local marker handler. Apply the JSON, then select that visual so renderBind creates the formatting editor.

Observed in both transports:
```json
{"import":{"applied":true,"issues":[]},"injectedImage":true,"executed":true}
```

The marker only set `window.leadMarkupExecuted = true`; no user data was read or sent. The source string became an actual DOM element and its event handler executed. A successful import and absence of pageerror are therefore insufficient safety assertions.

Required repair: context-safe rendering of every imported value in this affected formatting path and adjacent typed-value editors. Prefer DOM property assignment; if retaining templates, use correct attribute escaping and separately enforce value types. Unknown/incomplete intent must remain inert even when it contains invalid scalar values. Do not rely on a numeric input type, a downstream diagnostic, a regex that strips markup, or a CSP change to repair this sink.

Preserve legitimate string-based rule intent where supported. Validate numeric-only endpoints at their actual contract paths, but renderer safety must not depend solely on that validation. Test rules, second thresholds, gradient endpoints, override values and page/visual editors with inert markup/quote payloads. Reject unsupported structure before mutation or safely display retained intent with diagnostics.

Impact: imported data can run script in the workbench origin. Violates INV-10 and T16, and the safe editable-intent condition behind AC-01/02. This renderer sink predates the sprint; the sprint's safe-input acceptance remains incomplete.

## F-08 — P1: Page hiding produces an unrecoverable saved session

Locations: `theme-forge.html:4804`–`:4807` (page-hide producer), `:4849` (consumer), `:6937` (new recovery check).

Reproduction: name the theme "Lead hidden-page recovery", enter configuration, toggle the first page in "Pages in the report", then reload.

The control stores `S.pagesOff = ["Executive Summary"]`; shownPages also consumes names. prepareSession requires each entry to be an integer and returns "Invalid hidden-page list." Reload displays the default theme and recovery notice instead of the saved work.

Original data remains retained, which is an improvement over deletion, but ordinary supported app use must not trigger corrupt-session recovery.

Required repair: validate the actual existing representation, an array of page-name strings, and add an own-UI save/reload fixture plus an older-session fixture. Do not switch the producer to numeric indices merely to fit the new validator; that changes existing storage semantics and requires a separate migration design.

Impact: normal page hiding prevents session restoration. Violates AC-03/07 and INV-06/08. This is a regression in the new recovery validator.

## F-09 — P1: Several accepted UI edits do not publish history or autosave events

Locations: `theme-forge.html:6086` (cross-filter text handler), `:7018` (wireFilters completion path), `:7098` (wireBookmarks completion path), with `specTouch` around `:5622` showing the existing notification path.

Two reproductions, each after initial history/save timers have settled:
1. Select the first visual, open Interactions, change Cross-filters to "Lead cross-filter edit only", blur and wait 1.1 seconds.
2. Enter configuration, add a report filter, wait 1.1 seconds.

Observed:
- Cross-filters: active interaction changed; saved interaction remained null; history stayed at one entry and Undo remained disabled.
- Report filter: active count became 1; saved count stayed 0; history stayed at one entry and Undo remained disabled.

The first handler only assigns a field. Filter/bookmark completion paths redraw without the history/save notification used by specTouch. Render-based change detection cannot observe mutations if the relevant rendering path does not call it.

Required repair: one explicit accepted-document-change notification used by affected mutation handlers, including filter/bookmark/interaction changes. Audit analogous handlers rather than adding an isolated timer workaround. Coalesce text/gestures intentionally; workspace-only redraw must not become a document edit. Preserve revision invalidation for stale drafts, immediate undo behavior, redo invalidation and transactional suppression during import/rollback.

Tests must not call histPush, flushSession, renderAll or a helper that does so between the user edit and the observed history/storage assertion. The current test snapshot helper forcibly saves/pushes history; useful for rejection snapshots, it can hide missing event wiring.

Impact: autosave silently lags indefinitely until another action/lifecycle event; normal Undo may remain unavailable. Lifecycle flushing helps on an orderly reload but does not meet autosave/history behavior. Violates AC-06/07 and INV-06/07. The underlying omissions predate the sprint; its explicit notification-integration requirement remains incomplete.

## F-10 — P2: An empty bookmark display name poisons recovery

Locations: `theme-forge.html:3488` (bookmark name treated like a nonempty identity by shape helper), `:7115` (bookmark-name editor), `prepareSession` spec preparation.

Reproduction: add a bookmark, clear its name using the existing name input/change handler, then reload.

Observed: the app stores a bookmark with a valid id and name="", but prepareSession rejects `spec.bookmarks[0].name` with "Must be a nonempty string." Reload falls back to the sample with recovery notice.

Required decision: a bookmark display name is editable content, not its stable identity. Allow an empty string as incomplete display content, retain the existing content diagnostic/fallback label, and continue to require nonempty bookmark IDs and model field/table identifiers. Keep invalid non-string names rejected. This aligns import/recovery with current authoring instead of silently replacing the name.

Impact: an ordinary editor action prevents restoration. Violates AC-03/07 and the safe incomplete-intent policy. This is a regression from the new shared nonempty-name classifier.

## Architecture assessment

- Pure preparation and explicit applied status improve version/identity/refusal semantics. Known route wrappers now share preparation and avoid the original applied-but-failed flag confusion.
- applyPrepared snapshots accepted/derived state and suppresses scheduled effects during application. The exercised rollback paths hold for the candidate. Its surrounding renderers still need to treat imported data as inert; rollback cannot protect against script execution triggered later when opening an editor.
- Retaining replaced models by reference in bounded history is reasonable in the current code: the inspected model write sites replace MODEL and no in-place model editor was found. If later work mutates model data, this ownership assumption must be revisited.
- The recovery retention gate is valuable, but validators must accept states the app itself legitimately creates. Strictness without producer/consumer alignment creates a new failure path.
- Conversion disclosure and named-preset preservation are coherent for S001. Full lossless theme preservation remains S002.
- Export refreshes diagnostics and preserves more spec extensions. That partial work does not establish downstream schema compliance.
- Mutation notification remains incomplete. Fix its caller coverage within S001; avoid a wholesale module split to solve a small set of omitted application events.

## Acceptance decision

| Requirement | Lead disposition | Reason |
| --- | --- | --- |
| AC-01 / AC-02 | CHANGES_REQUIRED | F-07 breaks safe imported/retained intent when an editor renders it |
| AC-03 | CHANGES_REQUIRED | F-08/F-10 reject legitimate authored recovery state |
| AC-04 | No blocker found in reviewed scope | Conversion/preset evidence and inspected path are consistent |
| AC-05 | No independent blocker found; integration retest required | Notification repairs must preserve draft revision/conflict behavior |
| AC-06 | CHANGES_REQUIRED | F-09 missing history events |
| AC-07 | CHANGES_REQUIRED | F-08/F-09/F-10 recovery/autosave failures |
| AC-08 | Existing command/install evidence valid; extend gate | Add these user-outcome cases without forced notification helpers |
| AC-09 | Existing layout evidence valid; records updated | Retest UI affected by repairs |
| INV-10 / T16 | CHANGES_REQUIRED | Executable imported markup reproduced |
| Overall sprint | CHANGES_REQUESTED | All blockers need repair, independent retest and lead acceptance |

Round 1's "PASS" rows remain a historical statement about its representative cases. They are superseded as an overall acceptance recommendation by these lead findings; do not rewrite its actual test results to imply the new cases ran then.

## Next work and limits

Medium developer executes [repair batch 1](../sprints/SPRINT-001-repair-1.md) in three consecutive passes. Light tester then runs the complete mandatory gate plus the added regression matrix on a newly identified candidate and writes round 2. Lead reviews the repair diff and acceptance evidence.

No new sprint is activated. S002 remains the provisional next capability stage after S001 acceptance. Product/deployment files remain unchanged by this review.
