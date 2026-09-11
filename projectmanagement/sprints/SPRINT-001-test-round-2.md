# Sprint 001 independent test — round 2

Disposition: **READY_FOR_LEAD**.
Next actor: lead, to review repair logic and decide acceptance or further changes.
Date: 2026-09-08.
Candidate tested: `sprint-001-dev-02`, branch `codex/sprint-001-document-reliability`, dirty HEAD `7d6fbbdc1a35b508d7229688e77c46ea281b5703`; [19-file manifest](../artifacts/sprint-001-candidate-dev-02.json).
Previous candidate: `sprint-001-dev-01`; [round 1](SPRINT-001-test-round-1.md) and [lead CHANGES_REQUESTED decision](../reviews/SPRINT-001-lead.md) remain historical and unchanged.
Environment: Windows 11 Pro, Node 22.23.2, npm 10.5.0, Playwright 1.63.0, Chromium 153.0.8010.12; fresh headless contexts, file and loopback HTTP.
Candidate drift: none. All 19 hashes matched before and after testing. Frozen product/gate files were not edited; tester additions are under projectmanagement/artifacts.

## Lead packet

- Clean install and full mandatory gate passed, including contracts, smoke, regression, reliability and all 13 repair scenarios on each transport: 26 repair scenario runs.
- T17–T20: 4 PASS / 0 FAIL / 0 BLOCKED / 0 NOT_RUN. Eight independent adjacent-case runs also passed. Retained T01–T16 suite coverage passed on this successor; this does not retroactively expand round-1 coverage.
- AC-01–09 have passing local tester evidence for the executed scope. This is a handoff recommendation, not acceptance or proof of exhaustive coverage.
- F-07–F-10 were not reproduced after repair. No new product defect or developer repair batch is proposed. Lead should review escaping/typed preview consumption, actual recovery representations and notification call coverage against the approved repair decisions.
- No Desktop, official Microsoft-schema, PbiBench, Firefox or WebKit validation. No remote CI exists for this dirty candidate. AUT-006 remains the developer's deferred, source-only S004 observation.

## Commands and artifacts

Run from `D:/PROJ/PBI_Thema`. Artifact root below is `test-artifacts/sprint-001-test-round-2/`.

| Command | Actual result | Evidence |
| --- | --- | --- |
| `npm exec --yes --package=node@22 -- npm ci` | exit 0 | `npm-ci.log` |
| `npm exec --yes --package=node@22 -- npm test` with THEME_FORGE_ARTIFACT_DIR pointing at round-2/gate | exit 0; contracts plus four browser suites per transport | `npm-test.log`, `gate/{file,http}/result.json` |
| `npm exec --yes --package=node@22 -- node projectmanagement/artifacts/sprint-001-round-2-independent.cjs` | final exit 0; 8 PASS | `independent.log`, `independent-results.json`, threshold screenshots |
| `npm exec --yes --package=node@22 -- node projectmanagement/artifacts/sprint-001-round-2-timer-diagnostic.cjs` | exit 0; startup-save observation | `timer-diagnostic.json` |
| Manifest SHA-256 comparison | 19/19 before and after | `candidate-before.json`, `candidate-after.json` |
| `git diff --check` | exit 0; LF/CRLF conversion notices only | direct command output |

The repair suite writes a fixed dev-02 artifact directory. Its pre-test file/HTTP outputs were preserved in `developer-repairs/`, and round-2 outputs were copied into `repairs/{file,http}/` after the passing gate. Round-1 artifacts and original manifests were not overwritten. The repair developer's final logs remain intact. All bulky outputs remain ignored.

## Repair matrix and adjacent verification

| ID / acceptance | Result | Mandatory repair suite | Independent adjacent case |
| --- | --- | --- | --- |
| T17 / AC-01,02,09; F-07 | PASS | Visual/page rule and second-threshold strings, invalid overrides, min gradient rejection, defensive renderer probe, malformed preview values, actual parsed exports, reload and narrow/desktop controls | Quote/entity/Unicode/emoji payload in the **second** threshold stays exact after actual input/change, normal autosave, reload, editor reopening and parsed download; no marker node or event execution. Max and center gradient strings reject with type.number and exact endpoint path; accepted state/history/storage unchanged after 850ms. |
| T18 / AC-03,07; F-08 | PASS | Real page-hide control, save/reload and older v1.6 string-name envelope | Hide two pages through controls; observe normal history/save; undo/redo, reload, unhide one, reload again. Names retained, no recovery warning. Numeric hidden-page member rejects without state mutation. |
| T19 / AC-05,06,07; F-09 | PASS | Cross-filter and alt text focus; report/page/visual filter add/change/remove; bookmark add/name/hide/capture/remove; formatting and page title; undo/new-edit/redo invalidation; stale draft and conversion invalidation; workspace silence | Advanced report-filter literal string, locked/hidden toggles and bookmark currentPage/display flags each reach storage/history via actual controls, with no forced save/history helper. Reload retains exact filter/bookmark values. Bookmark preview leaves accepted state/history/revision/raw storage unchanged after 900ms. |
| T20 / AC-01,03,07; F-10 | PASS | Empty display name with diagnostic, reload/export/reimport; invalid name and ID shapes; blank imported preset recovery preparation | Two independently authored blank bookmark names keep distinct stable IDs through normal autosave, reload and parsed export/reimport. Duplicate ID rejects unchanged after 850ms. Renaming one to quoted Unicode/markup-like display text preserves both names across reload. |

Retained integration evidence: contracts and reliability/regression suites reran T01–T16 representative cases, including conversion cancel/commit, version/shape/limits, route rejection, invalid-original recovery, immediate undo/reload, model history, native text undo, export parsing, and transaction failure injection. Thus AC-04 and AC-08 were also retested, alongside the repair-sensitive acceptance areas above. No full Cartesian product or security audit is claimed.

## Test independence and timing investigation

Reviewed `test/repairs.js` helpers: `settled` only reads storage/canonical state/history signature. `changed` waits for previous state, performs a control action and observes normal history/storage; it does not call histPush, flushSession, renderAll or notifyDocumentChange. Setup may call mode/selection/panel rendering functions before the action. Formatting R-A reload assertions are lifecycle checks; separate T19 cases establish timer notification. The conversion race is explicitly a dispatched DOM input handler while a modal is open, not a physical pointer action through a modal.

The initial supplementary run had 3 snapshot failures: file T17 and file/HTTP T19. Its helper could return after reload when stored document content already equaled canonical state but a startup save was still pending. A separate diagnostic observed pendingSaveAtReload=true, unchanged document and history, and stored `at`/`model` representation changes when that scheduled save completed. The helper was corrected to additionally await `_saveT === null`; no save was forced and no product/assertion was weakened. The complete supplementary rerun then passed all eight cases. Initial script/results are retained as `independent-initial.cjs` and `independent-initial-results.json`; the diagnostic and corrected script are retained under projectmanagement/artifacts. This was a test precondition issue, not a reproduced rejection or workspace-mutation defect.

## Visual verification

Inspected round-2 screenshots for visual formatting at 420px, page formatting at 1440px, and independent second-threshold controls at 768px and 1024px. Inputs and rule controls wrap within the editor, marker text remains input content, and no page overflow was observed. Mandatory geometry assertions cover 420/1440; independent screenshots and overflow assertions cover 420/768/1024/1440. Existing conversion/recovery/editor geometry checks also passed in the full gate. No broader cosmetic or accessibility certification is claimed.

## Bookkeeping and handoff

- Local branches: main and codex/sprint-001-document-reliability at the recorded HEAD. Dirty baseline preserved.
- `git ls-remote --heads origin` advertises only main at that HEAD. `gh pr list --state all --limit 20` returns no PRs. Five latest CI runs inspected: latest main run 34127687056 succeeded at baseline HEAD. This is not dev-02 CI. Outputs: `remote-heads.txt`, `prs.json`, `ci.json`.
- STATUS/README continuation and affected BACKLOG items moved to READY_FOR_LEAD; F-07–F-10 marked independently verified in this scope, acceptance pending. No prior lead decision was overwritten and no S002 work was activated.
- Developer repair reported zero resumptions; user supplied elapsed work display of 21m 38s (not independently measured active development time). Tester required no continuation request.
- No commit, push, merge, deployment or branch deletion.

Lead: read this report and the [repair developer report](SPRINT-001-repair-1-dev.md), verify the dev-02 manifest and review repaired logic against [repair batch 1](SPRINT-001-repair-1.md). Record acceptance or requested changes in a new review record that preserves the original decision. S002 and external compatibility remain pending.
