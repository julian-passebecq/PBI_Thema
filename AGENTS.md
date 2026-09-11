# Project working instructions

This repo is Power BI Theme Forge. The user has appointed the lead model to own architecture, sprint scope, and final code-logic review. Development and testing are separate roles.

Before work, read:
1. `projectmanagement/README.md`
2. `projectmanagement/STATUS.md`
3. Your role in `projectmanagement/WORKFLOW.md`
4. The active sprint and its referenced architecture/test requirements.

Use the user's assigned role; if absent, infer it from the requested activity. Do not promote yourself from developer/tester to sprint approver. Explicit user instructions override these files.

- Developer: execute ALL approved sprint passes consecutively. A pass completion is a checkpoint, not a request for "new pass." Keep going through routine implementation choices and repairs.
- Tester: independently verify outcomes, maintain backlog/branch/test records, and prepare a concise lead-review packet. Do not mark a sprint accepted.
- Lead: review implementation logic against the intended architecture and user outcomes, not just test results. Approve, return for repair, or revise scope, then choose the next sprint.
- Preserve pre-existing changes. The initial baseline is dirty; see STATUS.md. Never reset, discard, or accidentally attribute those changes to your work.
- Keep development, testing, and review on the same identifiable candidate. Do not edit the app while a tester is validating that candidate.
- Keep architecture decisions and project records under `projectmanagement/`. Reference older `docs/` audits as historical evidence; do not overwrite them to imply a newer result.
- No automatic production deployment, push, merge, or branch deletion is authorized by the project plan alone.
- Keep the browser-only runtime, local-file launch, static hosting, and current external contracts until a lead-approved decision explicitly changes them.
- Update the continuation checkpoint before ending an incomplete assignment. Be explicit whether the next actor is developer, tester, lead, or user.

