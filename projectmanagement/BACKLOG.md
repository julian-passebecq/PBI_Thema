# Backlog and roadmap

Status date: 2026-09-08. Only Sprint 001 is approved for implementation. The lead may reorder later sprints after evidence and user feedback. Priority reflects data integrity and user value, not the amount of code.

Status vocabulary: READY, IN_PROGRESS, READY_FOR_TEST, NEEDS_FIX, READY_FOR_LEAD, ACCEPTED, PLANNED, BLOCKED. Tester updates evidence/status; lead controls acceptance and scope.

## Roadmap

| Sequence | Outcome | Why this comes here | Exit evidence |
| --- | --- | --- | --- |
| S001 — Document reliability | Predictable imports, visible conversions, coherent drafts/history/recovery | Existing passing tests miss state mutation and silent conversion | Independent matrix + lead logic review |
| S002 — Export fidelity and compatibility | Preserve unedited theme content, explicit control/path ownership, schema-backed export checks | Users rely on exported files, not just the preview | Semantic round trips; pinned official schema; Desktop check separately recorded |
| S003 — Maintainable source and delivery | Domain/application/UI separation, deterministic portable build, controlled published files | Refactor against trustworthy contracts | Behavior parity; generated-file freshness; static/local launch and preview-host checks |
| S004 — Dependable report authoring | Layout, bindings, filters, bookmarks, formatting and accessibility workflows proven end to end | Expand useful design work on a stable foundation | Representative full report journeys and limits/performance evidence |
| S005 — Verified handoff to PbiBench | Versioned fixtures and honest capability/target diagnostics | Downstream materialization needs an actual partner contract | Real downstream fixture round trip or explicitly blocked acceptance |

These are capability stages, not calendar or hour commitments. S004 can split into separate sprints if its concrete scope warrants it.

## Work items

| ID | Priority | Feature / outcome | State | Sprint / dependency | Acceptance |
| --- | --- | --- | --- | --- | --- |
| REL-001 | P1 | Shared input preparation and atomic application; rejected input unchanged | READY_FOR_LEAD | S001 / lead repair batch 1 | AC-01, AC-02, AC-03; F-07 safe-render integration |
| REL-002 | P1 | Clear version, ID, shape, limits and diagnostic policies | READY_FOR_LEAD | S001 / lead repair batch 1 | AC-01, AC-03; F-08/F-10 authored-state compatibility |
| REL-003 | P1 | Honest theme conversion report and cancellation; reject malformed themes | READY_FOR_LEAD | S001 / REL-001 | AC-04 |
| REL-004 | P1 | Draft timing, invalid retention and stale-draft protection across both editors | READY_FOR_LEAD | S001 / REL-001 | AC-05 |
| REL-005 | P1 | History restores coherent theme/spec/model and handles immediate edits | READY_FOR_LEAD | S001 / lead repair batch 1 | AC-06; F-09 notification coverage |
| REL-006 | P1 | Preserve invalid original session; transactional recovery and truthful save state | READY_FOR_LEAD | S001 / lead repair batch 1 | AC-07; F-08/F-09/F-10 |
| REL-007 | P1 | Imported formatting stays inert in editors and preview regardless of diagnostic state | READY_FOR_LEAD | S001 / lead repair batch 1 | INV-10; F-07 / T17 |
| QA-001 | P1 | Reproducible local/HTTP test harness, fixtures and candidate evidence | READY_FOR_LEAD | S001 / lead repair batch 1 | AC-08, AC-09; add T17–T20 without forced notification helpers |
| QA-002 | P2 | Deterministic test dependency install and Node 22 CI verification | READY_FOR_LEAD | S001 | Lockfile + npm ci; remote CI separately recorded |
| EXP-001 | P1 | Lossless unedited theme round trips, all palette colors and unknown properties | PLANNED | S002 / S001 | Semantic compare import→export; edit affects only owned paths |
| EXP-002 | P1 | Pinned official theme-schema validation of generated/exported files | PLANNED | S002 | Fixtures with schema provenance; fail on invalid generated output |
| EXP-003 | P1 | Spec export diagnostics freshly match exported state; extension policy complete | PLANNED | S002 | Pure export tests; no stale issues; loss policy demonstrated |
| EXP-004 | P2 | Representative Power BI Desktop import evidence | PLANNED | S002 / external Desktop access | Exact exported artifact, Desktop version, actual result; never inferred |
| ARC-001 | P2 | Separate pure contracts/application/rendering and generate portable HTML | PLANNED | S003 / accepted S001–S002 | Stable behavior, no hand-maintained duplicate source |
| OPS-001 | P2 | Publish only intended runtime assets; inspect headers/caching policy | PLANNED | S003 | Preview routes/assets correct; projectmanagement/test artifacts absent |
| AUT-001 | P2 | Reliable page/visual create, clone, delete and ID/reference handling | PLANNED | S004 | Full authoring journey, undo and export assertions |
| AUT-002 | P2 | Drag/resize/align/snap/type-change preserves layout and compatible bindings | PLANNED | S004 | Pointer + keyboard journeys; representative kinds and canvas sizes |
| AUT-003 | P2 | Model binding diagnostics and metadata refresh/remap workflow | PLANNED | S004 | Missing/renamed fields actionable; no silent remap |
| AUT-004 | P2 | Filters, bookmarks, sync groups and actions behave consistently | PLANNED | S004 | Reference validation and preview/export consistency |
| AUT-005 | P2 | Formatting, presets and conditional intent match target diagnostics | PLANNED | S004 / EXP-001 | Representative rule/target cases; preview caveats visible |
| UX-001 | P2 | Keyboard/focus, panel layouts, zoom and alt-text workflow | PLANNED | S004 | Keyboard-only journey, widths and zoom, export alt text |
| PERF-001 | P2 | Measured workload at supported page/visual/model limits | PLANNED | S004 | Fixed workload/environment, elapsed time/memory observations and chosen budgets |
| INT-001 | P2 | PbiBench contract alignment and fixture exchange | PLANNED | S005 / downstream access | Verified versions and result artifacts |
| QA-003 | P2 | Broader browser engines and portable legacy feature coverage | PLANNED | S003–S004 | Chromium/Firefox/WebKit evidence with explicit platform limits |
| FUT-001 | P3 | Optional AI-provider assistant | PLANNED | After foundation; user demand | Separate design for provider/privacy/cost; not current scope |
| FUT-002 | P3 | Multi-workspace management or optional sync | PLANNED | After recovery/export foundation; user demand | Explicit data model and storage choice; not implied cloud requirement |

## Initial defect register (historical; later verification below)

| Finding | Evidence | Work item | State |
| --- | --- | --- | --- |
| F-01 Future-version/duplicate-ID spec becomes active with failure result | Chromium lead probe + applySpecText logic | REL-001/002 | OPEN |
| F-02 Ten-color input exports eight; title.show false becomes true without disclosure | Chromium lead probe | REL-003 now; EXP-001 for full preservation | OPEN |
| F-03 Numeric model/table field names validate and load | Chromium lead probe | REL-002 | OPEN |
| F-04 Path-insensitive validator constrains unknown extension keys | Chromium lead probe; extension behavior not yet formalized | REL-002 | OPEN |
| F-05 Invalid saved session is deleted by boot catch | Source review; browser-specific recovery still to be tested | REL-006 | OPEN |
| F-06 Multiple input paths use different cleanup/default/application semantics | Source review | REL-001/002 | OPEN |

Existing fixes for named presets, malformed nested imports, blur, literal comment markers, mobile panel layout, undo timing and storage notification have local regression coverage. Treat them as implemented baseline changes awaiting sprint integration/lead acceptance; do not re-open or mark universally resolved just from historical audit text.

## Maintenance rules

Every new feature/defect needs: stable ID, user impact, priority, acceptance condition, dependency, owner/state and evidence link. Report newly discovered unrelated work here instead of expanding the active sprint silently. A critical defect in an invariant escalates; low-risk unrelated improvements wait.

Do not claim all remote branches, PRs or tests were audited unless they were actually enumerated. STATUS contains the branch/candidate register; test reports contain per-candidate executions so this backlog does not become a second conflicting run log.


## Sprint 001 developer delivery — 2026-09-08

Passes A–D delivered as sprint-001-dev-01; see sprints/SPRINT-001-dev.md and artifacts/sprint-001-candidate.json. Developer clean-install Node 22 contract/file/HTTP gate passes. Initial findings F-01–F-06 have scoped implementations and regression evidence; they remain subject to independent testing and lead acceptance. EXP-003 has partial fresh-diagnostic/extension preservation work from reliability integration; its complete S002 policy remains planned. No later sprint was activated.

## Sprint 001 independent verification — 2026-09-08

T01–T16 and all nine acceptance evidence rows passed representative independent testing; see sprints/SPRINT-001-test-round-1.md. F-01–F-06: verified scoped fixes, pending lead acceptance (supersedes initial OPEN entries). No new reproduced defects. Next actor is lead; no later sprint is activated.

## Current lead decision — CHANGES_REQUESTED, 2026-09-08

The above round-1 results remain historical evidence for their cases. The lead subsequently reproduced the following blockers on both file and HTTP. See [lead review](reviews/SPRINT-001-lead.md) and [approved repair batch](sprints/SPRINT-001-repair-1.md). All 18 candidate hashes still match; product code is unchanged by review. Next actor is medium developer, then light tester round 2, then lead acceptance. S002 is not activated.

| Finding | Priority / impact | Evidence | Work item / required test | State |
| --- | --- | --- | --- | --- |
| F-07 | P1 — imported formatting value executes HTML on editor render | Local marker executes, import applied=true/issues=[]; both transports | REL-007/001; T17, T16 | VERIFIED round 2 — lead acceptance pending |
| F-08 | P1 — hiding a page prevents recovery of the app's own session | String page names produced; integer-only recovery check rejects | REL-002/006; T18 | VERIFIED round 2 — lead acceptance pending |
| F-09 | P1 — accepted cross-filter/filter edits miss history and autosave | Active state changes; storage/history unchanged and Undo disabled after debounce | REL-005/006; T19 | VERIFIED round 2 — lead acceptance pending |
| F-10 | P2 — empty bookmark display name prevents recovery | UI accepts empty display string; new identity classifier rejects on reload | REL-002/006; T20 | VERIFIED round 2 — lead acceptance pending |

F-01–F-06 have scoped verified fixes, pending final integration acceptance. F-07/F-09 expose remaining inherited integration gaps; F-08/F-10 are new validation regressions. Do not conflate these causes or mark the whole sprint accepted from the older matrix.


## Repair batch 1 developer delivery — 2026-09-08

R-A through R-C complete as sprint-001-dev-02; see [repair report](sprints/SPRINT-001-repair-1-dev.md) and [candidate](artifacts/sprint-001-candidate-dev-02.json). F-07–F-10 have demonstrated developer fixes and are READY_FOR_TEST, not independently verified or accepted. Clean Node 22 full file/HTTP gate passes, including T17–T20. Next actor is light tester round 2; S002 remains pending.

| ID | Priority / user impact | State / owner | Dependency / acceptance | Evidence |
| --- | --- | --- | --- | --- |
| AUT-006 | P2 — bookmark “Capture what is hidden now” button has no action | PLANNED / future S004 developer | S004, AUT-004; lead defines capture semantics, then actual UI updates intended bookmark state with undo/save/export consistency | Source-only caller audit: bmFromHidden is rendered without a handler; repair report. Not independently reproduced; not repaired in S001 |

## Current independent repair disposition — READY_FOR_LEAD, 2026-09-08

Round 2 verified sprint-001-dev-02 with all 19 hashes unchanged. Clean install/full file+HTTP gate, 26 repair scenario runs and 8 independent adjacent-case runs passed; see sprints/SPRINT-001-test-round-2.md. F-07–F-10 no longer reproduce in tested cases; no new product defects or repair batch. This supersedes the developer handoff next-action above without changing historical lead decisions. Next actor: lead acceptance review. AUT-006 and S002 remain deferred.

