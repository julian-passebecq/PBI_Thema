# Power BI Theme Forge — working instructions

## Current operating mode

For the current Codex assignment, **Codex is the verification/test agent only**. Treat the existing candidate as frozen while testing it. Do not turn a test pass into another implementation sprint.

The final implementation/release pass belongs to a separate **Pro model outside Codex**. That Pro model will receive this repository plus the verification handoff ZIP and test evidence. It owns final code-logic review, any necessary fixes, acceptance, PR/merge and deployment decisions when explicitly requested by the user.

Explicit user instructions always override this file.

## Candidate to verify

- Repository: `julian-passebecq/PBI_Thema`
- Candidate branch: `codex/pro-ai-handover-2026-09-11`
- Production branch: `main`
- Current production site: `https://pbi-thema.netlify.app`
- The candidate branch contains the preserved Sprint 001 implementation/repairs and expanded regression/reliability tests.
- Production currently represents `main`, not the unmerged candidate. Test candidate and production as two different targets and report the distinction clearly.

Before testing, read only what is needed:
1. `projectmanagement/handover/README.md`
2. `projectmanagement/handover/REMAINING.md`
3. `projectmanagement/TEST-STRATEGY.md`
4. `projectmanagement/sprints/SPRINT-001-test-round-2.md`
5. `projectmanagement/sprints/SPRINT-001-repair-1-dev.md`

Use older historical reports only when needed to understand a reproduced failure. Do not restart the old developer/tester/lead loop.

## Codex Light responsibilities

Codex Light should perform a **mechanical, evidence-first verification pass**:

- record the exact branch and HEAD being tested;
- use Node 22;
- run `npm ci`;
- install Chromium if needed with `npx playwright install chromium` (or `--with-deps chromium` in CI/Linux when appropriate);
- run the complete existing gate with `npm test`;
- run targeted suites when useful: `npm run test:contracts`, `npm run test:reliability`, `npm run test:repairs`;
- run the supplementary independent checks documented in the handover when available;
- verify both the local-file and loopback-HTTP paths already exercised by `test/run-browser.js`;
- inspect actual browser screenshots/UI for responsive and interaction failures instead of relying only on exit codes;
- separately open and smoke-test the current production site without pretending it contains the candidate fixes;
- check console/page errors, downloads, persistence/reload, keyboard paths, mobile/open-panel layout and the documented remaining high-risk behaviors;
- produce a concise PASS/FAIL/BLOCKED matrix with exact repro steps and artifact paths.

When a failure appears, reproduce it carefully and isolate it. Prefer user-observable evidence over implementation guesses. A useful failure report includes target, viewport/browser, steps, expected result, actual result, console error if any, screenshot/artifact path and whether it reproduces on file, HTTP, production or more than one target.

## Codex Light restrictions

During this verification assignment, **do not modify the product candidate**.

Do not:

- edit `theme-forge.html` to fix a defect;
- redesign/refactor the application;
- change runtime behavior, contracts or product scope;
- weaken or rewrite existing assertions just to make the suite green;
- merge to `main`;
- deploy the candidate to production;
- declare Sprint 001 accepted or the product release-ready;
- claim Power BI Desktop, Microsoft-schema or PbiBench compatibility without real external evidence;
- create another autonomous developer/tester/lead agent loop.

Temporary diagnostic scripts and generated screenshots/logs are allowed when they do not change the candidate. Keep bulky generated evidence under ignored test-artifact paths. If a test harness itself is broken, report that separately instead of silently repairing the application or changing acceptance criteria.

## Required Codex Light handoff

End with one of these dispositions:

- `READY_FOR_PRO_REVIEW` — mandatory candidate tests passed and no new blocker was reproduced; list remaining external/unverified gaps.
- `PRO_REVIEW_WITH_FAILURES` — candidate tests or manual checks reproduced defects; provide a bounded failure list for Pro.
- `BLOCKED` — a concrete environment/access dependency prevented required verification; state exactly what could not be established.

Return the verification report and evidence to the user. The user will give them, together with the repository/handoff ZIP, to the separate Pro model.

## Separate Pro model

The external Pro model is **not the Codex Light tester**. When the user explicitly assigns the Pro final pass, the Pro model may inspect and modify the candidate as needed. It should start from Codex Light's evidence, avoid redoing already-green historical work without cause, fix only reproduced or code-review-confirmed defects, perform final logic review, rerun affected/full gates, and then make the explicit release decision.

A green Codex Light report means **ready for Pro review**, not automatically ready to merge or deploy.
