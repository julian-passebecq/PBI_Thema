# Test strategy and independent verification

Test ownership is shared: developer writes regression protection and checks implementation; tester independently challenges outcomes and maintains evidence; lead audits deeper logic and acceptance.

## Baseline and proposed gate

Initial pre-sprint baseline: `npm test` ran smoke/regression on local files, with only smoke accepting THEME_FORGE_URL. The S001 candidate now runs contract tests and a managed file/HTTP browser gate; the independent round-1 report records its clean Node 22 pass. That passing gate did not cover the four later lead findings.

Current repair gate: retain T01–T16 and add T17–T20 from [repair batch 1](sprints/SPRINT-001-repair-1.md). Test actual authored state round trips and unassisted notification behavior. Helpers that force histPush/flushSession/renderAll must not precede assertions intended to prove normal event wiring. Lead review is CHANGES_REQUESTED; round 2 is required on a new candidate.

Sprint 001 developer must provide:
- a lockfile and clean-install command using `npm ci`;
- mandatory automated suites under `npm test`;
- documented targeted scripts for contract/input tests and browser integration;
- an automatically managed loopback HTTP server for local HTTP tests, using an available port and guaranteed cleanup;
- meaningful failure artifacts and nonzero test exits.

Do not run destructive import/recovery probes on a user's active workspace or production. Use fresh Playwright contexts against the local candidate with synthetic fixtures.

## Layers

1. Pure behavior tests: shape/version/limits/migration/normalization/result policy without DOM. Test invariants and user outcomes, not a line-by-line copy of implementation.
2. Browser integration: actual file chooser input, drop, typing/blur/buttons, undo, download and reload. A helper-function pass does not prove event wiring.
3. Scenario checks: a realistic report edited and exported across several operations, including incomplete intent and recovery.
4. Later compatibility checks: pinned official schema and actual Desktop/PbiBench evidence. These are not claimed by a Chromium pass.

Existing private globals are usable for targeted probes during the transition, but prefer returned domain results and user-observable output for durable tests.

## Sprint 001 matrix

| Test ID | Cases / action | Required assertions | Acceptance |
| --- | --- | --- | --- |
| T01 | Null/array/primitive roots; wrong nested list/object types; null list members; invalid scalar IDs/names; numeric geometry strings | Rejected without throwing; same accepted document/history/storage; path-specific issue | AC-01/02 |
| T02 | Version 1/2/3/missing; future/zero/negative/fractional/string versions; missing and duplicate IDs | Supported migration deterministic and input unchanged; unsupported rejected; repeated routes identical | AC-01/03 |
| T03 | UTF-8 text/file bytes below/at/above 4 MiB; pages 40/41; visuals 400/401; fields 4000/4001; depth around 64 | Inclusive supported boundary; above rejected before render; no route bypass; document remains responsive | AC-01/03 |
| T04 | Known fixture through spec picker, drop, dock editor, full editor, compare and recovery where applicable; model picker/drop/recovery; theme dock/full/recovery | Same appropriate prepared result; comparison nonmutating; absent routes N/A with reason | AC-03 |
| T05 | Future version and duplicate spec via real editor; valid missing field and unsupported kind | First two rejected unchanged; latter safe intent applied with explicit issues; preview does not guess kind | AC-01/02 |
| T06 | Ten-color palette and wildcard title.show false; extra supplied theme settings; built-in preset collisions; arbitrary key names | Accurate conversion report before commit; cancel harmless; accepted conversion matches report; named definitions intact in actual download | AC-04 |
| T07 | Wrong visualStyles/textClasses containers, malformed preset definitions, literal comment markers/URLs and Unicode | Malformed structure rejected; valid strings preserved; no accidental character-index dictionaries | AC-04 |
| T08 | Fast paste + blur; pending debounce + switch; invalid drafts + panel/mode switch; dock and full-editor Apply; native text undo | No silent overwrite/discard; correct active document, draft and status; conversion not auto-accepted | AC-05 |
| T09 | Invalid or valid pending draft, then external import/undo/recovery, then old timer/Apply | Obsolete draft cannot replace newer state without explicit reapply; old pending conversion invalidated | AC-05 |
| T10 | Edit then immediate undo; immediate edit after undo; redo; model replacement then undo/redo; read-only navigation | Correct theme/spec/model restored; new edit clears redo; no history entry from workspace-only change | AC-06 |
| T11 | Latest accepted edit followed immediately by reload/pagehide/hidden; invalid pending draft then reload | Accepted change retained; no invalid draft committed; draft persistence limit stated | AC-07 |
| T12 | Quota/blocked storage followed by retry; corrupt JSON; structurally invalid/future session at boot | Visible save failure; retry truthfulness; original raw recovery data retained even after default render/pagehide until intentional replacement | AC-07 |
| T13 | Controlled one-time failure during apply/rebuild/render | Canonical/derived state, selection/history/save are restored; subsequent valid import works; error is caught | AC-02 |
| T14 | New conversion/recovery controls, JSON full view and open panels at 420/768/1024/1440; long text; keyboard navigation | Apply/cancel/close visible and usable, focus meaningful, no overflow; screenshots inspect actual UI | AC-09 |
| T15 | Complete design journey: import metadata/spec, make edit, undo/redo, export all artifacts, reload | Downloads parse, intended edits/bindings/presets match accepted state, no page errors, local-file/HTTP parity | AC-06/08 |
| T16 | Prototype-like IDs/keys and markup strings through imports and renderers touched by sprint | Strings remain data; no script execution, prototype mutation or false registry match | AC-01/02 |

Use representative positive and negative cases. Do not expand this into an exhaustive Cartesian product of all data values/routes/browser sizes. Every route needs at least one accepted and one rejected integration case; high-risk cases get additional cross-route checks.

For rejection, compare semantic accepted state plus history position/length and the persisted accepted snapshot. Draft/error display may change. Also wait long enough for scheduled callbacks or trigger their flush explicitly so a delayed mutation cannot escape the assertion.

For exports, parse the actual downloaded file. Compare semantic fields; ignore only explicitly nondeterministic metadata such as generatedAt. Do not replace assertions with count checks or broad snapshots that simply accept the new output.

Time-sensitive tests should await an observable state where possible. For debounce boundaries, deliberately exercise before/after timings with justified margins; record flaky failures and investigate. Avoid arbitrary long sleeps.

## Independent tester procedure

1. Read STATUS, active sprint, developer report and relevant architecture decisions. Verify candidate identity before testing.
2. Review changed code enough to identify untested paths and likely edge cases; do not limit testing to the developer's happy path.
3. Reproduce environment/install and run the mandatory gate. Capture commands, exit codes and outputs. Include Node/package/browser/OS information.
4. Execute missing matrix scenarios, inspect screenshots for new UI and check at least one full user journey. Add focused test fixtures where valuable.
5. Classify each matrix/acceptance row PASS, FAIL, BLOCKED or NOT_RUN, with evidence. Do not call an entire gate passed because part of it ran.
6. Write one repair list for routine product failures. Escalate architecture/data-loss uncertainty using WORKFLOW. Tester must not fix app logic and self-approve it.
7. Refresh branch/candidate/backlog records; record local vs remote/CI evidence distinctly. If remote access is unavailable, state it rather than requesting irrelevant credentials.
8. Produce the lead packet using templates/REPORTS.md. State READY_FOR_LEAD or NEEDS_DEV_FIX, with the exact next actor.

Tester report should be concise at the top and detailed enough below to reproduce failures. Store large logs/screenshots under a candidate-specific local artifact folder; do not commit personal data or generated browser profiles. Record paths. Add ignore rules for bulky generated artifacts as needed; retain curated evidence appropriate for the repo.

## Lead use of test evidence

A trustworthy report lets the lead focus on architecture and logic. It must expose missing checks, not hide them in raw logs. Lead can ask the tester for mechanical follow-up checks while reviewing complex code, but sprint acceptance always remains an explicit lead decision.
