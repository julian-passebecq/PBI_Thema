# Report templates

Copy the appropriate template into a sprint-specific file, for example:
- `projectmanagement/sprints/SPRINT-001-dev.md`
- `projectmanagement/sprints/SPRINT-001-test-round-1.md`
- `projectmanagement/reviews/SPRINT-001-lead.md`

Use real results. Delete irrelevant prompts instead of filling them with invented evidence.

## Developer report

```md
# Sprint NNN developer report
Status: IN_DEV / READY_FOR_TEST / BLOCKED_LEAD / BLOCKED_USER
Next actor:
Candidate: branch, clean SHA OR HEAD + dirty file hashes
Starting baseline and preserved pre-existing changes:
Passes completed:
Exact continuation checkpoint if incomplete:

## Outcome
What now works for the user, and why.

## Implementation map
| Acceptance ID | Files / key functions | Behavior / design decision | Developer verification |
| --- | --- | --- | --- |

## Commands and evidence
Command, environment, exit/result, artifact path.
Distinguish full-suite, targeted and not-run checks.

## Risks and decisions
Known defects, architecture decisions applied, new assumptions,
dependencies/storage/contract changes, external limitations.

## Test handoff
Cases the independent tester should challenge.
Remaining work or explicit none.
```

## Independent tester report

```md
# Sprint NNN independent test — round N
Disposition: NEEDS_DEV_FIX / READY_FOR_LEAD / BLOCKED_LEAD / BLOCKED_USER
Next actor:
Candidate tested: branch, SHA or dirty manifest
Environment: OS, Node, npm, installed test/browser versions
Candidate drift during testing: none / details

## Lead packet
- User-visible outcome tested:
- Acceptance summary: X PASS / X FAIL / X BLOCKED / X NOT_RUN
- Most important findings:
- Architecture decisions needing lead attention:
- Limitations and exact next action:

## Matrix
| Acceptance / test ID | PASS / FAIL / BLOCKED / NOT_RUN | Command or steps | Evidence |
| --- | --- | --- | --- |

## Defects
For each: stable ID, severity, user impact, minimal reproduction,
expected/actual, source location if known, evidence,
proposed owner, affected acceptance, regression coverage.
Label source-only suspicions separately from reproduced defects.

## Repairs and retest
Previous candidate, repair batch, new candidate, tests rerun and why.

## Bookkeeping
Branches / PRs / CI inspected; exact local vs remote status.
STATUS/BACKLOG updates.
New unrelated features/bugs deferred.
User resumptions needed and pass-size feedback if known.

## Handoff
Explicit next actor and report references.
Do not mark the sprint ACCEPTED.
```

## Lead acceptance / rework record

```md
# Sprint NNN lead review
Decision: ACCEPTED / CHANGES_REQUESTED / BLOCKED
Candidate reviewed:
Test evidence relied on:
Review scope and material limits:

## Logic assessment
Trace the relevant input → candidate → apply → history/save →
preview/export flows and failure/rollback paths.
Record whether intended architecture/invariants actually hold.

## Findings
Severity, file/function/verified line, concrete failure,
why it matters, required change, required verification.
Separate blocking defects from deferred improvements.

## Acceptance
| Acceptance ID / invariant | Decision | Evidence / reasoning |
| --- | --- | --- |

## Remaining risks
Explicit limitations, backlog IDs, owner and reason for deferral.

## Next action
If rework: one clear scoped repair batch and test gate.
If accepted: activate the next fully specified sprint, explain why,
and update STATUS/BACKLOG.
```

