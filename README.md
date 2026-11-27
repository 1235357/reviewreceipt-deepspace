# ScopeCheck
A small release decision workspace: evaluate proposed changes against impact, effort and evidence confidence. An evidence-qualified release planner solves a bounded 0/1 allocation problem under a user-selected effort capacity, maximizing total impact × confidence without changing decision states. A public sample board runs in-memory; the signed-in workspace uses DeepSpace auth, server-enforced owner-only records with live sync, and private R2 evidence attachments. No client or school material is included.

## Run
`npm ci`, `npm run validate`, `npm run build`. Use `npx deepspace auth login` and `npx deepspace dev start` to exercise the live workspace; use `npx deepspace deploy` only after checking the intended account and commit.

## Tradeoffs
Rules are explicit and deterministic rather than AI guesses. The planner uses ordinal effort units, not hours or money; only valid open Ship decisions qualify, with stable lower-effort and ID tie-breaking. Invalid or conflicting saved records are flagged and excluded without changing storage. There is no shared organization or external notification integration in this scope. Attach genuine non-sensitive evidence only; the app owner can have operational access to the platform. Public sample mutations are intentionally ephemeral. Deployment and multi-session verification must be recorded separately when completed.

Official docs: https://docs.deep.space/get-started/quickstart · https://docs.deep.space/guides/data-storage · https://docs.deep.space/guides/file-uploads
