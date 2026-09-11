# Starting route inventory

Captured before application edits, 2026-09-08. Branch `codex/sprint-001-document-reliability`, HEAD `7d6fbbdc1a35b508d7229688e77c46ea281b5703`.

| Route | Spec | Model | Theme |
| --- | --- | --- | --- |
| File picker | bindContextIO → loadSpec | bindContextIO → loadModel | N/A, no picker |
| Context drop | bindContextIO → loadSpec | bindContextIO → loadModel | N/A, no theme drop |
| Dock editor | bindJson → applySpecText | N/A, no model editor | bindJson → applyThemeText |
| Full editor | bindJsonEd → applySpecText | N/A, no model editor | bindJsonEd → applyThemeText |
| Compare picker | compareSpec | N/A | N/A |
| Boot recovery | restoreSession | restoreSession | restoreSession (internal controls, not external theme JSON) |

Baseline `npm test`: smoke and regression PASS on Node 21.7.1 / npm 10.5.0 / Playwright 1.63.0. Bundled alternate Node is 24.19.0, not workflow Node 22.
Tracked baseline patch, untracked inventory and source hashes are adjacent. Pre-existing files remain in place; inherited application changes are included in the eventual candidate.
