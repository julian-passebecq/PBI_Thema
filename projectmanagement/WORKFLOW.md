# Roles and working cycle

## Ownership

| Role | Owns | Must not substitute for |
| --- | --- | --- |
| Lead / strongest model | Product direction, architecture, invariants, difficult coding decisions, risk assessment, code-logic audit, sprint acceptance and next sprint | Tester evidence with assumed correctness; developer delivery with a plan alone |
| Medium / developer | Implementation, local design within approved boundaries, regression tests for changes, meaningful self-checks, complete repair batches, developer handoff | Independent acceptance or unapproved architecture/scope changes |
| Light / tester and coordinator | Independent test execution, missing outcome tests, reproductions, evidence, mechanical consistency checks, branch/backlog inventory and concise lead packet | Final architecture judgment, product logic changes, declaring a sprint accepted |
| User | Product priorities, meaningful product choices outside agreed scope, assignment of model sessions, release authorization where needed | Repeated permission to perform each planned pass |

The tester can review straightforward logic such as result flags, limits, missing handlers, changed export fields and mismatched documentation. The lead reviews state ownership, transaction semantics, migrations, preservation rules and interactions that need deeper reasoning.

## Long development assignments

One assignment covers the whole approved sprint. Passes are coherent multi-step engineering units and may be long. Do not stop at an arbitrary number of files, a single green test, or an elapsed-time estimate.

After each pass:
1. Run its focused checks and fix failures.
2. Update STATUS and a short developer work log with decisions, changes, evidence and next step.
3. Continue to the next pass automatically.

Do not ask "continue?" or "new pass?" when the next pass is already specified. Do not advance to unapproved future sprints to keep busy. End at the independent test gate, a real blocker, an explicit user pause, or a runtime limit.

Context compaction is a continuation, not a new assignment. If execution ends, leave exact file/function/task pointers and the pending command or test. The user's resume message should be enough; do not make them reconstruct the work.

Keep pass durations observational. Tester records how many developer resumptions the user needed and approximate active time if known. The lead uses that feedback to resize future batches. Never pad work to make it last hours.

## State transitions

`READY_FOR_DEV -> IN_DEV -> READY_FOR_TEST -> IN_TEST -> READY_FOR_LEAD -> ACCEPTED`

Repair route: `IN_TEST -> NEEDS_DEV_FIX -> IN_DEV -> READY_FOR_TEST`.
Lead rejection: `READY_FOR_LEAD -> CHANGES_REQUESTED -> IN_DEV`.
A real unresolved decision uses `BLOCKED_LEAD`; a required external/user action uses `BLOCKED_USER`. Record the specific dependency and continue unrelated approved work when possible.

READY_FOR_TEST means every sprint acceptance item has an implementation and developer evidence, or a clearly recorded external limitation. A known failing mandatory local test is not a test-ready candidate.

READY_FOR_LEAD means independent testing is complete, defects are triaged, and the lead packet states exactly what passed, failed or could not be tested. It is not acceptance. A missing mandatory check can be handed to the lead for an explicit decision but cannot be silently marked passed.

## Developer-to-tester handoff

Freeze the app candidate during independent testing. Supply:
- candidate identity, preserved starting changes and changed-file/function map;
- acceptance IDs mapped to implementation and tests;
- commands with actual results and limitations;
- decisions made within the approved plan;
- unusual cases the tester should challenge;
- any new dependency, contract, storage or hosting changes.

Finish with: **READY FOR LIGHT TESTER — Sprint 001. Read STATUS.md and the developer report; execute TEST-STRATEGY.md and the sprint matrix.**

The default is the user's separate model sessions. If the user asks for automatic delegation, use available agent tools for a concrete test task and wait for its result; do not create user-visible Codex tasks without an explicit request. Do not assume an unavailable lower model is running.

## Tester repair loop and record keeping

Run the complete required matrix once on the candidate, then investigate failures. Add targeted outcome tests where existing tests are inadequate; do not weaken assertions just to get green. Test-tooling edits belong in the report and may require a new candidate identity.

Collect ordinary failures into one repair batch with severity, reproduction, expected/actual behavior and acceptance ID. Developer fixes the batch and supplies a fresh handoff. Tester reruns affected tests plus relevant integration checks; rerun the complete gate when integration behavior changed.

The tester may correct project records and test harness issues. Product-code fixes go to the developer. Do not have developer and tester mutate the same checkout at once. For an independent review during development, use a read-only snapshot or explicitly coordinated isolated worktree.

Maintain:
- STATUS candidate and branch register;
- BACKLOG statuses and newly discovered work with severity and dependencies;
- test report, actual commands, environment, artifact paths and skipped checks;
- unresolved defects and explicit recommendation to the next actor.

Inspect local branches and read-only remote branches/PR/CI when available. Never infer a PR/CI result from a local pass, merge/delete branches, or turn a remote-tracking name into proof of current remote state.

## Escalation to lead

Escalate promptly for:
- a needed change to external contracts, runtime/hosting boundaries, state ownership or preservation policy;
- ambiguous accepted requirements that materially change user-visible behavior;
- reproducible data loss, executable imported content, corrupted saved state, or an irreversible migration;
- a cross-feature defect with unclear cause, or the same defect surviving two focused repair attempts;
- a dependency/tooling blocker after reasonable diagnosis, with alternatives and tradeoffs;
- all sprint requirements reaching the final review gate.

For normal scoped bugs with a clear cause, developer repairs without asking the lead. For a blocker, provide the smallest reproduction, code locations, attempted remedies, affected invariant, recommended option and impact. Do not send a vague "please check" or silently improvise a new architecture.

## Lead review and next sprint

The lead reads the complete app diff for the sprint and relevant surrounding call paths, including inherited fixes relied on by the sprint. Trace success, failure, undo, save/reload and export. Challenge tester evidence with targeted probes where risk warrants; delegate mechanical checks to the tester when useful.

The lead records actionable findings with severity and locations, acceptance decision, remaining risks and backlog changes. Only after acceptance does the lead activate and fully specify the next sprint. Passing automated tests alone never closes the code-logic review.

The lead need not run every mechanical test again if the tester's candidate and evidence are trustworthy. Any new code changes or contradictions require appropriate renewed verification.

