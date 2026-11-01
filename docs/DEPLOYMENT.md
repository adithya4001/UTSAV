# Hosting and portability

Current implementation: Vinext on Cloudflare Workers, Cloudflare D1 database, Sites-managed Sign in with ChatGPT.

The hosting manifest declares DB. Build with the supported Sites helper; schema migrations are applied before the Worker is deployed. The app remains publicly viewable, while per-organiser database operations require verified sign-in.

## Local database migration
After generating and building the initial schema, apply the generated SQL once to the local DB binding using Wrangler and `.wrangler/state`. Do not replay applied migrations or alter their SQL/history. Local and production databases are separate.

## Vercel migration boundary
The existing Worker bundle and D1/managed identity cannot simply be renamed as a Vercel deployment. A real migration requires a Vercel-supported server build, an authenticated database adapter (for example Postgres) and a configured auth provider. Reuse the UI, planning engine, contracts and tests; replace the platform adapters and verify sign-up/sign-in/owner isolation before claiming completion. No fake Vercel URL or reverse-proxy workaround is used.

Vercel connection was verified, but workspace-level permission returned 403 for the user's default team during this build. The supplied Vercel consent link must be approved before project deployment can proceed. Do not treat plugin connection alone as team access.
