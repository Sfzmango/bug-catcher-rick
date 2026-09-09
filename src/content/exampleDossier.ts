// A realistic dossier in the exact shape Rick returns (SEV1, CONFIDENT, live).
export const exampleDossier = `SYMPTOM        — Approval inbox returns 500 for newly-invited members; existing members are unaffected.
REPRODUCTION   — GET /approvals as a member invited after the 2026-08-30 release. Prod-only; dev and CI are green.
ROOT CAUSE     — The permissions table is unseeded in prod. db/seeds.rb creates the "approvals.view" permission, but the release phase runs only db:migrate, never db:seed, so the policy lookup raises on a nil permission. Violates the documented "setup/seed-only data the deploy/release phase never provisions" gotcha. CONFIDENT.
EVIDENCE CHAIN — app/policies/approval_policy.rb:14 → app/models/permission.rb:22 → db/seeds.rb:41 → Procfile:3 (release: bundle exec rails db:migrate)
PROPOSED SEV   — SEV2 arguably, but every newly-invited member is locked out of a core workflow and the fix touches authorization, so SEV1.
FIX DIRECTION  — Move the permission rows into a data migration so the release phase provisions them; keep db:seed for local bootstrap only. Sibling case: "reports.export" is seeded the same way.
REGRESSION TEST— spec/requests/approvals_spec.rb: a member created with the release-phase migrations only (no seeds) can GET /approvals and receives 200.
BLAST RADIUS   — Authorization layer + one data migration against live data; no tenancy scoping change; quality gate unchanged.
PROD MITIGATION— Run the one-off console insert for the "approvals.view" permission row in prod now (gated), then ship the durable migration.
OPEN QUESTIONS — Confirm prod has zero rows in permissions (SELECT count(*) FROM permissions) before the mitigation; that row count closes the hypothesis into fact.`;
