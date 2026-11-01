# UtsavOps — Event Studio

V3 auth/intro release is a saved draft until Supabase accounts and recovery email delivery are configured and verified. V2 remains the current live release.

An organiser-first implementation for PromptWars Virtual Challenge 5: Celebration & Event Planner. The product connects a client brief, personalised creative direction, budgets, vendor checklists, responsibilities, timelines and approval-based replanning.

## V2 experience
- Editorial event-studio design with custom SVG event illustrations, responsive layouts and distinct wedding/birthday/community styling.
- Order pipeline with search and Enquiry → Confirmed → Planning → Live → Completed statuses.
- Guided three-step brief: occasion, constraints, creative context.
- Ordered event workflow: Client brief → Creative plan → Budget & vendors → Team & schedule → Review & delivery.
- Interactive five-lesson tutorial, a help library and contextual help.
- Light/dark themes and 70–110% app brightness, saved per device.
- Authenticated organiser profile and server-persisted orders. Supabase email/password accounts provide verified identity after provider activation; all database reads/updates are scoped to that organiser. Revision checks reject stale saves.
- The public homepage is introductory. Operational screens require login; sample events are available inside the organiser workspace.
- Different event types, visual directions, priorities, start times, venue settings and headcounts affect generated planning drafts and estimates.
- Optional server-side Gemini refinement; missing credentials are reported honestly.
- Deterministic guest-cost impact, conservative setup-delay recovery, approval history, task ownership, dependency completion checks and overlapping-owner warnings.
- JSON export, print view and unsaved-edit warnings.

## Actual scope
This release provides private per-organiser accounts, not shared company membership, separate client/team logins, external invitations, automated bookings, payments, supplier messaging or a customer marketplace. An organiser records client approvals and team progress. Quote evidence labels are user assertions, not independent verification. Sample vendor names/prices are fictional.

Orders are enquiries the organiser enters, not automatically sourced leads. Live AI generation requires a funded/configured provider credential; the context-based draft is explicitly rule-based and is not presented as a live model response. No customer savings, profit improvement or competition score is invented.

## Run
Node 22.13+ and pnpm. `pnpm install`, then `pnpm dev`. The hosted version uses Cloudflare Workers, D1 and Supabase-managed email identity. Add `GEMINI_API_KEY` and optional `GEMINI_MODEL` server-side only. Do not expose credentials in source or browser code.

## Database
Drizzle schema in `db/schema.ts`; bounded schema migration in `drizzle/`. Hosting declares the `DB` binding. The platform applies production migrations during deployment. Local preview requires migration application after the first binding-aware build. See `docs/DEPLOYMENT.md`.

## Tests
`node --test tests/*.test.mjs`
`node --experimental-strip-types --test tests/contracts.test.ts`
`node node_modules/typescript/bin/tsc --noEmit`
`pnpm build`

41 tests cover domain operations, context-based planning and server payload validation. Actual browser results and unverified areas appear in `docs/VALIDATION.md`.

## Architecture and safeguards
React/TypeScript presentation; pure planning/domain modules; Zod server contracts; D1 organiser records; Next-compatible API handlers via Vinext. Financial and timeline changes never depend on generated text. APIs validate origin, identity, owner-scoped predicates, revision and bounded payloads. React escapes generated content. Gemini calls have timeout and output validation. Add durable funded-model usage quotas before broad paid-API production activation.

## Assumptions
INR; 10% contingency; estimates are not market quotes; variable rates scale linearly; fixed quotes require manual revision. Setup recovery uses the recorded setup start and shifts later entries, subject to human review. Preferred programme start is 04:00–21:59 to leave preparation/service time. Approved history retains the most recent 30 snapshots.

## Disclosure
ChatGPT/Codex assisted research, design, implementation and testing. Optional Gemini refines creative drafts. Human organisers approve changes and carry out real-world actions. Market evidence is distinguished from prototype evidence in `docs/RESEARCH.md`.
