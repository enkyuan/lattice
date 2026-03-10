## Purpose

This file is the operating contract for LLMs and agents working on this project.

The goal is to keep the codebase:
- fast
- minimal
- correct
- observable
- testable
- easy to refactor

This is not a vibes-based project. Prefer correctness, clarity, and maintainability over cleverness, abstraction sprawl, or plausible-looking code.

Read `SPEC.md` and `CLIENT.md` before implementing meaningful changes.

---

## Global Rules

- Keep files under **400 LOC** whenever reasonably possible.
- Split aggressively once a file starts mixing concerns.
- Separate:
  - types
  - constants
  - schemas
  - utilities
  - query definitions
  - services
  - repositories
  - UI components
- Reuse `packages/` before writing new helpers, hooks, types, schemas, constants, or utilities.
- If something might already exist, search the repo first.
- Treat warnings as errors.
- Run formatting, linting, and typechecking generously.
- Use `bunx tsgo` as part of the quality loop where applicable.
- Add logs generously, but keep them structured and useful.
- Prefer deleting code over adding code.
- Prefer explicit code over magical code.
- Prefer boring code over framework tricks.

---

## Required Development Loop

For both backend and client work, follow this loop:

1. Read the relevant code and nearby packages first.
2. Read the relevant docs listed in `SPEC.md` if the stack behavior is unclear.
3. Write the smallest correct implementation.
4. Examine the implementation thoroughly.
5. Rewrite it to reduce complexity, tighten types, and improve structure.
6. Add or update tests.
7. Run format, lint, and typecheck.
8. Re-check logs, edge cases, and failure modes.
9. Repeat until the change is minimal and solid.

Do not stop at “plausible.”

---

## Backend Rules

### Priorities

Backend code must optimize for:
- correctness
- performance
- idempotency
- observability
- failure handling

Not for speed of writing.

### Backend Requirements

- Write failure tests for meaningful behavior.
- Add a logging utility and use it consistently.
- Log state transitions, retries, failures, queue actions, and external calls.
- Keep route handlers thin.
- Keep business logic in domain services.
- Keep persistence logic in repositories.
- Keep schemas and DTOs separate from DB row types.
- Prefer deterministic logic first. Add AI only where explicitly required.
- Make background jobs retry-safe and idempotent.
- Validate all external inputs at the boundary.
- Use constants for retry policies, timeouts, queue names, and score weights.
- Keep hot paths simple and measurable.

### Backend Workflow

For backend tasks, always:
- write code
- inspect it for waste, duplication, and unclear naming
- rewrite it smaller and cleaner
- write tests
- rerun checks

### Logging Expectations

Backend logs should capture:
- request start and end
- route name
- job enqueue and dequeue
- external source fetch start and end
- retry attempts
- dedupe decisions
- scoring passes
- failures with enough context to debug

Do not log secrets, tokens, full credentials, or raw sensitive payloads.

### Failure Testing Expectations

Write failure tests for:
- invalid input
- auth failures
- missing org scope
- duplicate events
- retries and backoff
- partial failures in workers
- adapter normalization failures
- queue redelivery behavior
- DB constraint failures where relevant
- timeouts and aborted operations where relevant

### Performance Expectations

- Avoid unnecessary allocations in hot paths.
- Avoid repeated parsing or repeated schema work in loops.
- Batch where useful, but do not hide logic in giant batch functions.
- Prefer simple data access patterns over premature generic abstractions.
- Profile and inspect before “optimizing.”
- Keep ranking/scoring functions pure where possible.

---

## Client Rules

### Priorities

Client code must optimize for:
- clarity
- composition
- load performance
- keyboard-friendly UX
- predictable state
- debuggability

### Client Requirements

- Split code aggressively to keep files under 400 LOC.
- Keep page routes thin.
- Implement pages as compositions of smaller components.
- Separate page-level hooks, query wiring, constants, types, and utilities.
- Use `packages/` before creating duplicate local abstractions.
- Add logs for major user flows, state transitions, and mutation outcomes.
- Keep animations restrained.
- Use TanStack Query for server state.
- Use Zustand only for local UI state.
- Do not introduce a second informal state layer.

### Client Quality Rules

- Run format, lint, and typecheck generously.
- Treat warnings as errors.
- Prefer stable props and explicit data flow.
- Prefer query option factories over ad hoc query definitions.
- Prefer small presentational components over giant smart components.

---

## Page Structure

Do not put everything directly into `index.tsx`.

The proposed structure in the prompt is too flat for nontrivial pages. Use this instead.

```txt
apps/web/src/pages/
  <page>/
    route.tsx
    <page>-page.tsx
    <page>-page.types.ts
    <page>-page.constants.ts
    <page>-page.utils.ts
    <page>-page.hooks.ts
    components/
      ...
    lib/
      query-options.ts
      filters.ts
      serializers.ts
```

### Page Structure Rules

- `route.tsx`
  - route entry only
  - minimal loader and composition
  - no business logic

- `<page>-page.tsx`
  - main page composition
  - arranges sections and subcomponents

- `<page>-page.types.ts`
  - page-local types only
  - move shared types to `packages/`

- `<page>-page.constants.ts`
  - labels, defaults, limits, static config

- `<page>-page.utils.ts`
  - small pure helpers only

- `<page>-page.hooks.ts`
  - page-local hooks
  - query wiring
  - mutation composition

- `components/`
  - page-specific UI building blocks

- `lib/`
  - page-local query options
  - local mappers
  - view-model shaping

### Rule of Promotion

- If code is used by only one page, keep it in that page folder.
- If code is reused by multiple pages, move it into `packages/`.
- If code is domain logic, it belongs in `packages/`, not in `apps/web`.

### Important

Do not create empty sibling files just to satisfy a pattern. Only create companion files when the page actually needs them.

---

## Suggested Monorepo Structure

```txt
/apps
  /web
    /src
      /pages
      /components
      /features
      /routes
  /api
    /src
      /routes
      /services
      /repositories
      /jobs
      /adapters
  /worker
    /src
      /jobs
      /workers
      /queues
/packages
  /auth
  /db
  /logging
  /core
  /ingestion
  /ranking
  /analytics
  /ui
  /config
  /testing
```

### Package Rules

- `packages/logging`
  - logger factory
  - log helpers
  - shared log fields

- `packages/db`
  - schema
  - migrations
  - DB client
  - repository helpers

- `packages/core`
  - shared domain types
  - constants
  - error codes
  - utility helpers

- `packages/testing`
  - fixtures
  - factory builders
  - mock payloads
  - queue and adapter test helpers

---

## Logging Standard

Create a shared logger and use it everywhere.

### Logging Rules

- Use structured logs.
- Include stable event names.
- Include request ID, job ID, org ID, and source kind when applicable.
- Prefer a small set of common fields over random ad hoc fields.
- Log state transitions explicitly.

### Log Categories

- `request.*`
- `auth.*`
- `feed.*`
- `ingest.*`
- `normalize.*`
- `score.*`
- `queue.*`
- `action.*`
- `draft.*`
- `analytics.*`
- `error.*`

### Example Expectations

- `ingest.fetch.started`
- `ingest.fetch.succeeded`
- `ingest.fetch.failed`
- `queue.job.enqueued`
- `queue.job.started`
- `queue.job.retried`
- `queue.job.failed`
- `score.signal.completed`

---

## Testing Standard

### Backend

Always prefer:
- unit tests for pure functions
- integration tests for repositories and routes
- failure tests for jobs and adapters
- fixture-driven tests for normalization and ranking

### Client

Prefer:
- component tests for dense UI logic
- interaction tests for keyboard and command workflows
- query/mutation tests for page hooks
- end-to-end tests for core flows

### Required Test Areas

- auth boundaries
- org scoping
- normalization correctness
- ranking determinism
- dedupe correctness
- optimistic update behavior
- error states
- loading states
- empty states

### Test Data

Keep fixture payloads in dedicated directories.
Suggested examples:
- Reddit payload fixtures
- X payload fixtures
- ranked feed fixtures
- score explanation fixtures
- analytics event fixtures

---

## Formatting, Linting, and Typechecking

Run these often.

Suggested loop:

```bash
bun run format
bun run lint
bunx tsgo
bun run test
```

If the repo uses different script names, update this section to match reality.

Warnings are to be treated as errors.

Do not leave “fix later” lint or type issues behind.

---

## Documentation Expectations

Before implementing unfamiliar stack behavior, check the relevant docs linked in `SPEC.md`.

Especially for:
- TanStack Start
- TanStack Query
- Better Auth
- Elysia
- Bun
- Drizzle
- Postgres
- Redis
- Coss UI
- Motion
- visx
- Zustand

Do not invent framework behavior from memory when docs are available.

---

## What to Avoid

- giant route files
- giant page files
- mixing DB row shapes with API DTOs
- one-off ad hoc logging styles
- hidden global state
- magic query keys scattered everywhere
- duplicate helpers across apps and packages
- speculative abstractions
- performance theater
- plausible but untested failure handling

---

## Definition of Done

A change is not done until:
- code is minimal
- names are clear
- files are well-split
- logs are useful
- tests exist and pass
- format, lint, and typecheck pass
- failure cases were considered
- duplicate abstractions were removed
- repo packages were checked for reuse first

---

## Final Heuristic

Build the smallest correct thing.
Then tighten it.
Then test the ugly cases.
Then simplify it again.
