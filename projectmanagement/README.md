# Theme Forge project management

2026-09-11: **Pro model takeover starts at [handover/README.md](handover/README.md)**. The user requested a concise handover instead of continuing the multi-model workflow. Prior role/pass instructions below remain historical context; do not restart an agent loop.

The goal is a dependable Power BI design workbench: users can design a report, understand what the preview represents, and export useful theme and design-intent files without losing their work.

This folder is the durable coordination system for the lead, development, and test models. It is grounded in the repository reviewed on 2026-09-08. It does not assume access to a separate PbiBench repository or to Power BI Desktop.

## Start here

- [Current status and next action](STATUS.md) — the authoritative continuation pointer.
- [Roles and working cycle](WORKFLOW.md) — ownership, long passes, handoffs, escalation.
- [Architecture and product direction](ARCHITECTURE.md) — what we are building, why, boundaries and invariants.
- [Backlog and roadmap](BACKLOG.md) — feature priorities and acceptance ownership.
- [Sprint 001](sprints/SPRINT-001.md) — approved development scope, four substantial consecutive passes.
- [Test strategy](TEST-STRATEGY.md) — required evidence and independent checks.
- [Initial lead review](reviews/2026-09-08-baseline.md) — observed baseline, findings and limitations.
- [Sprint 001 lead decision](reviews/SPRINT-001-lead.md) — four reproduced blockers; CHANGES_REQUESTED.
- [Active repair batch](sprints/SPRINT-001-repair-1.md) — three consecutive developer passes and independent retest.
- [Handoff prompts](PROMPTS.md) — reusable instructions for each model.
- [Report templates](templates/REPORTS.md) — developer, tester and lead records.

## Current decision

Sprint 001 repair batch 1 is READY_FOR_LEAD as sprint-001-dev-02. Independent round 2 passed the clean Node 22 full file/HTTP gate, T17–T20 and eight adjacent-case runs. Read STATUS and sprints/SPRINT-001-test-round-2.md. The original lead decision and round-1 report remain historical; sprint acceptance and S002 remain pending.

The normal interaction is: assign the developer once, assign the tester once when the candidate is ready, then call the lead for sprint acceptance. Routine test failures go back to the developer with a complete repair list; they do not all require lead involvement.

This plan does not start background agents, schedule unattended jobs, publish code, or guarantee a model will run for a particular number of hours. Each assignment should continue as far as its runtime allows and leave an exact checkpoint if interrupted.




