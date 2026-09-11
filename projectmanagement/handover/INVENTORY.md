# Preservation and provenance inventory — 2026-09-11

Repository: `https://github.com/julian-passebecq/PBI_Thema`.
Handover branch: `codex/pro-ai-handover-2026-09-11`.
Preserved source commit: `d6706bfb8980a27fb329e067793596e33fc29cf9`.
Previously published baseline: `7d6fbbdc1a35b508d7229688e77c46ea281b5703`.

Before preservation, fresh fetch and `git ls-remote --heads origin` showed only main at the baseline. Local main and codex/sprint-001-document-reliability pointed there too. No extra local commits, stashes or registered worktrees existed. `gh pr list --state all --limit 30` returned no PRs. All new work was dirty/untracked in `D:/PROJ/PBI_Thema`, not stored as commits on the sprint branch.

The source commit preserves 41 changed/added files (3,715 insertions, 232 deletions), including existing README/package/app changes, CI change to clean install, .gitignore, lockfile, regression/contract/reliability/repair tests, fixtures, AGENTS.md and all projectmanagement records. Baseline provenance remains in projectmanagement/artifacts/sprint-001-baseline/. This handover commit's Git author identifies the committer, not the original author of all preserved work.

## Related Codex work checked

| Exact task title | Task ID | Role and durable result |
| --- | --- | --- |
| Plan AI-led development sprints | 01a08247-c736-7dd1-93a6-14f49c2d16c2 | Lead planning/architecture and lead review; projectmanagement records |
| Execute active sprint passes | 01a08259-f199-79a2-9969-4d1abe1b6e88 | Developer delivery and repairs; application/tests and developer reports |
| Run light tester for Sprint 001 | 01a08274-d03e-7540-856a-dd41ad2c7815 | Independent rounds 1/2; reports, probes and generated evidence |

All three tasks reported the same checkout and were not running (notLoaded). Their recent records were inspected; no separate artifact checkout was identified. Available task inventory (50 recent non-pinned tasks plus pinned entries) and all three available archived task entries were checked. No unavailable host/source was reported. This is scoped evidence, not a claim to have searched inaccessible machines or every historical conversation. No new agents were started or other project tasks modified.

Exact model IDs are not established by repository evidence. Attribution is by recorded lead/developer/tester role; original inherited fixes predate those assignments. The user reported 21m 38s for the repair developer pass; this is not a measured token/accounting record.

## Evidence and exclusions

All 316 generated files under local test-artifacts/ are copied into test-evidence-2026-09-08.zip (~22.7 MB): logs, JSON outcomes, screenshots, diagnostic text/scripts and an HTML snapshot. evidence-manifest.json records each original path, byte size and SHA-256. These are historical artifacts, including failed probes, not new verification results. Original ignored files remain local too.

Excluded from Git: installed node_modules/ (reconstruct with npm ci). No product source, fixture, report or available test artifact was intentionally left local-only. Private Codex transcripts/runtime caches are not required to build or understand this app and are not copied into GitHub. This packet captures task provenance without exporting conversations from unrelated projects.

All 19 dev-02 manifest hashes matched before preservation. git diff --check passed. Product code was not changed during handover and the full browser gate was not rerun. Push outcome and final remote verification are recorded in the adjacent delivery receipt and final user response.

No main merge, force push, branch deletion or production deployment is part of this handover. The original local sprint branch stays at the old baseline; the real accumulated work is now in the handover branch's source commit.
