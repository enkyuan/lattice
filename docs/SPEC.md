## 1. Product Summary

A founder-focused go-to-market platform that discovers high-intent conversations across public channels, ranks them by ICP fit and urgency, and turns them into actionable replies, DMs, and content ideas.

Primary user:

- Early-stage B2B SaaS founders
- Solo GTM operators
- Small startup teams doing founder-led sales or founder-led content

Core product promise:

- Find buyer demand signals
- Rank what matters
- Help the user act quickly
- Learn which actions create pipeline

---

## 2. Product Goals

### Primary goals

- Surface high-intent conversations from Reddit and X first
- Let users define ICPs, keywords, and watchlists
- Rank signals by relevance, urgency, and likely impact
- Generate recommended actions for each signal
- Track which actions lead to replies, demos, or qualified leads

### Secondary goals

- Produce weekly GTM summaries
- Cluster repeated pain points into content opportunities
- Build an internal event model that can later support richer analytics and OLAP

### Non-goals for v1

- Full social scheduling suite
- Enterprise social listening platform
- Full CRM replacement
- Real-time collaborative editing
- Full LinkedIn automation or risky gray-area automation

---

## 3. Principles

- Keep the product opinionated
- Optimize for speed and clarity over feature breadth
- Separate app-facing APIs from ingestion and background processing
- Default to deterministic scoring first, ML later
- Use Postgres as system of record until scale clearly demands more
- Add only one abstraction per problem

---

## 4. Final Tech Stack

## 4.1 Frontend and app shell

- **TanStack Start**
  - Full-stack React app framework
  - SSR, routing, server functions, streaming
- **TanStack Query**
  - Server-state fetching, caching, invalidation, optimistic updates
- **Coss UI**
  - UI components built on top of BaseUI
- **Motion**
  - UI animations and transitions
- **visx**
  - Custom charts and visualizations
- **Zustand**
  - Small client-only UI state store

## 4.2 Backend

- **Elysia**
  - Dedicated API service for ingestion, webhooks, admin/internal routes
- **Better Auth**
  - Authentication and session management
- **Drizzle ORM**
  - Type-safe DB schema and queries
- **PostgreSQL**
  - Primary relational database and source of truth
- **Redis**
  - Queue coordination, caching, dedupe, rate limiting
- **Bun**
  - Runtime for app, API service, and workers
- **Bun workers or dedicated worker processes**
  - Ingestion, scoring, clustering, draft generation, analytics sync
- **Cloudflare R2 or S3-compatible object storage**
  - Raw event archives, exports, snapshots

## 4.3 Deferred components

- **ClickHouse**
  - Future analytics warehouse, not a day-one dependency
- **WebSockets**
  - Defer until there is a proven need for live collaboration or streaming updates
- **tRPC**
  - Excluded to avoid overlap with TanStack Start server functions and Elysia APIs

---

## 5. Why this stack

### TanStack Start

Use it for the product-facing application surface:

- SSR pages
- auth-aware routes
- dashboard data loading
- server functions for frontend-specific queries and mutations

### Elysia

Use it for the dedicated backend service:

- source ingestion endpoints
- admin/internal APIs
- webhook receivers
- worker control routes
- health checks and API documentation

### Postgres + Drizzle

Use it as the canonical data model for:

- users and orgs
- ICPs and watchlists
- normalized signals
- actions and outcomes
- analytics rollups for v1

### Redis

Use it for:

- job queues and queue metadata
- request dedupe
- feed caching
- rate-limit bookkeeping

### Bun

Use it because the runtime is already part of the proposed stack and keeps the API/workers aligned around one language and runtime.

---

## 6. Architecture Overview

## 6.1 High-level topology

### App

- TanStack Start app
- Handles authenticated user experience
- Calls server functions for app-specific read/write flows
- Uses TanStack Query for data fetching and invalidation

### API service

- Elysia service
- Handles ingestion and admin/internal APIs
- Owns OpenAPI docs and structured endpoint contracts

### Worker layer

- Bun worker processes
- Consumes jobs from Redis or DB-backed job tables
- Executes ingestion, enrichment, scoring, clustering, recommendation generation

### Data layer

- PostgreSQL for normalized product data
- Redis for ephemeral and queue state
- R2 for raw payload storage and exports

## 6.2 Request flow

1. User opens feed in app
2. TanStack Query calls Start server function
3. Server function reads precomputed ranked signals from Postgres
4. Optionally hits Redis cache
5. Returns paginated feed to UI

## 6.3 Background flow

1. Source adapter fetches or receives raw content
2. Raw payload stored in R2 and/or raw_events table
3. Normalization creates canonical signal rows
4. Scoring job computes rank dimensions
5. Recommendation job creates next-best-action suggestions
6. Feed materialization or ranking view updates

---

## 7. Monorepo Layout

```txt
/apps
  /web                # TanStack Start app
  /api                # Elysia API service
  /worker             # Bun workers
/packages
  /auth               # Better Auth config, adapters, guards
  /db                 # Drizzle schema, migrations, DB client
  /core               # Domain types, scoring logic, shared utilities
  /ingestion          # Source adapters, normalization logic
  /ranking            # Scoring, ranking, recommendation logic
  /analytics          # Event definitions, aggregations, summaries
  /config             # Environment, constants, feature flags
  /ui                 # Shared UI tokens or wrappers if needed
/docs
  SPEC.md
```

### Notes

- Keep domain logic in packages, not route handlers
- Route handlers should compose services, not contain business rules
- Shared package boundaries reduce framework lock-in

## 7.1 API service structure (`apps/api`)

Use vertical slices with thin transport for the Elysia service:

```txt
apps/api/
  src/
    server/
      index.ts
      app.ts
      env.ts
    bootstrap/
      register-plugins.ts
      register-routes.ts
      register-error-handlers.ts
    plugins/
      auth.plugin.ts
      db.plugin.ts
      logger.plugin.ts
      request-context.plugin.ts
      openapi.plugin.ts
      rate-limit.plugin.ts
    middleware/
      auth.middleware.ts
      org-scope.middleware.ts
      request-id.middleware.ts
      logging.middleware.ts
      error-shape.middleware.ts
    routes/
      health/
      ingest/
      admin/
      internal/
    modules/
      health/
      ingestion/
      normalization/
      scoring/
      recommendations/
      analytics/
      signals/
    transport/
      dto/
      mappers/
      validators/
    lib/
      logger.ts
      errors.ts
      response.ts
      timing.ts
      ids.ts
      retry.ts
      redact.ts
      drizzle.ts
```

Rules:

- keep route handlers thin: parse, authorize, call service, map response
- keep business logic in module services
- keep DB access isolated in module repositories and use Drizzle (`drizzle-orm`) for queries
- keep transport DTOs separate from DB/domain row shapes
- use plugins and middleware for cross-cutting concerns (auth, request context, logging, error shaping, OpenAPI)
- share domain logic with workers through `packages/*`, not direct cross-app imports

---

## 8. Core Domain Model

## 8.1 Main entities

- `User`
- `Organization`
- `Membership`
- `Source`
- `SourceAccount`
- `ICPProfile`
- `Watchlist`
- `RawEvent`
- `Signal`
- `SignalScore`
- `Recommendation`
- `Action`
- `Outcome`
- `Draft`
- `AnalyticsEvent`

## 8.2 Table sketch

### users

- id
- email
- name
- created_at

### organizations

- id
- name
- plan
- created_at

### memberships

- id
- user_id
- organization_id
- role

### sources

- id
- kind
- account_handle
- config_json
- status

### icp_profiles

- id
- organization_id
- name
- persona_json
- keywords_json
- exclusions_json
- geography_json
- company_filters_json

### watchlists

- id
- organization_id
- name
- query_json
- active

### raw_events

- id
- source_kind
- source_event_id
- raw_blob_url
- payload_json
- fetched_at
- dedupe_key

### signals

- id
- organization_id nullable
- source_kind
- source_event_id
- author_handle
- author_name
- body_text
- canonical_url
- published_at
- normalized_json
- dedupe_key

### signal_scores

- id
- signal_id
- icp_profile_id
- feasibility_score nullable
- relevance_score
- urgency_score
- pain_score
- blast_radius_score
- intent_score
- final_rank_score
- scored_at

### recommendations

- id
- signal_id
- organization_id
- recommendation_type
- title
- body
- confidence
- created_at

### actions

- id
- signal_id
- organization_id
- actor_user_id
- action_type
- status
- content_json
- external_ref nullable
- created_at

### outcomes

- id
- action_id
- outcome_type
- value_json
- observed_at

### drafts

- id
- organization_id
- source_signal_ids_json
- draft_type
- title
- body
- status
- created_at

### analytics_events

- id
- organization_id
- event_name
- subject_type
- subject_id
- payload_json
- created_at

---

## 9. Service Boundaries

## 9.1 App-facing services

- Auth service
- Feed service
- Watchlist service
- ICP service
- Action service
- Draft service
- Summary service

## 9.2 Backend/internal services

- Ingestion service
- Source adapter service
- Normalization service
- Scoring service
- Recommendation service
- Analytics ingestion service
- Export service

## 9.3 Worker queues

- `ingest-source`
- `normalize-event`
- `score-signal`
- `generate-recommendation`
- `generate-draft`
- `compute-summary`
- `sync-analytics`
- `retry-failed-fetch`

---

## 10. API Design

## 10.1 TanStack Start server functions

Use for app-specific operations only.

### Examples

- getFeed(filters)
- getSignalDetail(signalId)
- createICP(payload)
- updateWatchlist(payload)
- logAction(payload)
- getDashboardSummary(range)

These functions should:

- validate auth and org membership
- call shared domain services
- return stable DTOs
- not perform long-running ingestion or scoring

## 10.2 Elysia routes

Use for backend and internal APIs.

### Public/internal endpoints

- `POST /ingest/reddit`
- `POST /ingest/x`
- `POST /admin/reindex`
- `POST /admin/recompute/:signalId`
- `GET /health`
- `GET /ready`
- `GET /openapi`

### Principles

- version routes from the start
- validate schemas at the edge
- emit structured logs
- document endpoints with OpenAPI

---

## 11. Ranking and Scoring

## 11.1 V1 ranking approach

Start deterministic.

### Signal rank dimensions

- ICP relevance
- pain intensity
- urgency
- audience quality
- blast radius
- recency
- channel trust

### Example formula

```txt
final_rank_score =
  0.30 * icp_relevance +
  0.20 * pain_score +
  0.15 * urgency_score +
  0.10 * blast_radius_score +
  0.10 * author_quality_score +
  0.10 * recency_score +
  0.05 * channel_quality_score
```

### Notes

- Keep each dimension inspectable in the UI for trust
- Store individual score components in `signal_scores`
- Make weights configurable at the org or internal feature-flag level later

## 11.2 Recommendation engine

For each high-ranking signal, generate one of:

- public reply suggestion
- DM suggestion
- founder post idea
- competitor comparison note
- ignore / low-priority recommendation

Keep recommendations template-driven first. Add model-generated drafts later.

---

## 12. Source Adapters

## 12.1 v1 sources

- Reddit
- X

## 12.2 Adapter responsibilities

- fetch source content
- normalize source-specific fields
- generate stable dedupe keys
- store raw payloads
- emit normalized `SignalInput`

## 12.3 Common adapter output shape

```ts
interface SignalInput {
  sourceKind: 'reddit' | 'x'
  sourceEventId: string
  canonicalUrl: string
  bodyText: string
  title?: string
  authorHandle?: string
  authorName?: string
  publishedAt: string
  metrics?: {
    likes?: number
    replies?: number
    reposts?: number
    upvotes?: number
    comments?: number
  }
  rawPayload: unknown
}
```

---

## 13. Security and Auth

## 13.1 Auth model

- Better Auth handles accounts, sessions, and user identity
- App routes require org membership checks
- Internal/admin API routes require service-level authorization

## 13.2 Security requirements

- Environment-based secrets management
- Signed admin endpoints or private network access
- CSRF/session protections where applicable
- Rate limits on ingestion and admin routes
- Audit log for privileged actions

## 13.3 Multi-tenant rules

- Every org-scoped query must filter by `organization_id`
- No client-provided org IDs may be trusted without membership validation
- Background jobs must carry org context explicitly

---

## 14. Analytics Strategy

## 14.1 v1 analytics in Postgres

Track:

- signals discovered
- signals acted upon
- recommendation acceptance rate
- replies sent
- posts published
- meetings or lead outcomes logged
- top recurring pain themes

## 14.2 Future-proofing for ClickHouse

Do not add ClickHouse in v1. Instead:

- define append-only analytics events now
- keep event payloads structured and versioned
- isolate event writing in one package
- keep warehouse exports easy to add later

When scale demands it, replicate or stream analytics events into ClickHouse.

---

## 15. UX and Frontend Notes

## 15.1 Screens for v1

- Auth and onboarding
- Organization setup
- ICP builder
- Feed of ranked signals
- Signal detail view
- Action composer
- Drafts/content workspace
- Analytics summary page
- Settings and source connections

## 15.2 State rules

Use TanStack Query for:

- feed queries
- signal detail queries
- mutations and invalidation
- background refetch

Use Zustand only for:

- selected items in UI
- sidebar state
- command palette
- local composer state
- transient view state

## 15.3 Charts

Use visx for:

- signal volume trends
- pain theme distribution
- action conversion funnel
- top source comparisons

## 15.4 Motion usage

Use Motion sparingly for:

- route transitions
- modal and panel transitions
- feed card reveal
- optimistic action feedback

Avoid excessive animation in the core workflow.

---

## 16. Implementation Timeline

## Phase 0 — Foundations and setup

**Goal:** monorepo, auth, DB, API, deployment skeleton

### Deliverables

- Monorepo scaffold
- TanStack Start app bootstrapped
- Elysia API bootstrapped
- Better Auth integrated with Drizzle/Postgres
- Base environment management
- CI configured

### Tasks

- Set up monorepo and package boundaries
- Create shared TypeScript config and linting
- Add Drizzle schema package and migrations
- Wire Better Auth in app and API contexts
- Add health endpoints and structured logging

### Tests

- app boot test
- API health test
- auth integration test
- migration smoke test

### Exit criteria

- user can sign up and log in
- org membership model exists
- both app and API run in local dev and CI

---

## Phase 1 — Core product data model

**Goal:** orgs, ICPs, watchlists, source configs, signals tables

### Deliverables

- stable DB schema for v1
- CRUD flows for ICPs and watchlists
- source configuration storage

### Tasks

- implement DB tables
- write repository/service layer
- create server functions for CRUD flows
- validate payload schemas

### Tests

- repository unit tests
- schema migration test
- CRUD integration tests
- authz tests for org isolation

### Exit criteria

- users can create org-scoped ICPs and watchlists
- all core writes are org-safe

---

## Phase 2 — Ingestion pipeline for Reddit and X

**Goal:** fetch content, normalize it, and persist canonical signals

### Deliverables

- Reddit adapter
- X adapter
- raw payload storage
- normalization pipeline
- dedupe logic

### Tasks

- define adapter interfaces
- implement fetchers/connectors
- map raw payloads into normalized signal inputs
- store raw payloads in R2 and/or raw_events
- create dedupe keys and upsert logic
- enqueue normalization and scoring jobs

### Tests

- adapter unit tests with fixture payloads
- normalization snapshot tests
- dedupe tests
- retry tests for fetch failures
- contract tests for adapter output shape

### Exit criteria

- signals arrive consistently from both sources
- duplicates are prevented or collapsed safely

---

## Phase 3 — Ranking and feed

**Goal:** produce a useful ranked feed

### Deliverables

- scoring engine
- ranking job
- feed API
- filter and sort support

### Tasks

- implement score components
- persist score breakdowns
- expose ranked feed via app server functions
- add pagination and filter model
- add explainability metadata

### Tests

- pure scoring unit tests
- deterministic ranking tests with fixtures
- feed integration tests
- pagination tests
- authz tests for org feeds

### Exit criteria

- ranked feed is stable, inspectable, and fast enough for v1

---

## Phase 4 — Actions and recommendations

**Goal:** let users act on signals and track outcomes

### Deliverables

- recommendation generation
- action logging
- outcome logging
- signal detail screen with next-best action

### Tasks

- define recommendation templates
- create action and outcome flows
- attach actions to signals
- create optimistic UX patterns in app

### Tests

- recommendation engine tests
- action mutation integration tests
- optimistic UI tests
- outcome linkage tests

### Exit criteria

- users can open a signal, take an action, and log what happened

---

## Phase 5 — Draft generation and summaries

**Goal:** turn repeated demand into reusable content and reports

### Deliverables

- draft suggestions from signal clusters
- weekly GTM summary
- top pain themes view

### Tasks

- cluster signals by theme using deterministic rules first
- generate summary and draft suggestions
- build summary dashboard views

### Tests

- clustering tests with curated fixtures
- summary generation tests
- regression tests for known topic sets

### Exit criteria

- app generates useful founder content prompts and summaries from real signals

---

## Phase 6 — Analytics and operational hardening

**Goal:** improve reliability, observability, and scale readiness

### Deliverables

- analytics event pipeline
- alerting and dashboards
- job retry and dead-letter handling
- performance review

### Tasks

- add analytics event writers
- define SLO-style operational metrics
- implement dead-letter queue handling
- benchmark feed and ingestion paths
- formalize export path for future warehouse use

### Tests

- load tests
- retry and DLQ tests
- failure injection tests
- cache invalidation tests

### Exit criteria

- system degrades safely and can be debugged in production

---

## 17. Testing Strategy

## 17.1 Unit tests

Use for:

- pure score functions
- ranking formulas
- normalization logic
- dedupe key generation
- DTO mappers
- auth guard helpers

## 17.2 Integration tests

Use for:

- server functions against test DB
- Elysia route handlers
- Better Auth integration
- Drizzle migrations and repositories
- worker jobs against ephemeral Redis/Postgres

## 17.3 End-to-end tests

Use for:

- onboarding flow
- create ICP and watchlist
- view ranked feed
- open signal and log action
- read analytics summary

## 17.4 Contract tests

Use for:

- source adapter output shapes
- internal API schemas
- OpenAPI route expectations

## 17.5 Load and resilience tests

Use for:

- feed endpoint latency under concurrent traffic
- ingestion burst handling
- queue backlog behavior
- Redis outage behavior
- Postgres slow query detection

## 17.6 Test data strategy

- fixture payloads from Reddit and X
- curated signal corpora with expected rankings
- synthetic org/user datasets
- seeded demo workspace for local development

## 17.7 CI gates

- typecheck
- lint
- unit tests
- integration tests
- migration check
- build for all apps

---

## 18. Observability

### Logs

- structured JSON logs
- request IDs and job IDs
- org-aware logging where safe

### Metrics

- ingestion success rate
- source fetch latency
- scoring job duration
- feed query latency
- queue depth
- action logging success rate

### Alerts

- ingestion failures above threshold
- queue backlog over threshold
- DB connection errors
- repeated adapter failures

---

## 19. Risks and Mitigations

### Risk: source instability or API access changes

Mitigation:

- isolate source adapters
- persist raw payloads
- degrade gracefully by source

### Risk: weak ranking quality

Mitigation:

- keep scoring transparent
- inspect score components in UI
- tune with fixture corpora and user feedback

### Risk: stack duplication

Mitigation:

- TanStack Start for app-facing functions only
- Elysia for backend/internal APIs only
- no tRPC

### Risk: analytics overengineering

Mitigation:

- Postgres first
- event model designed for later export to ClickHouse

### Risk: queue complexity

Mitigation:

- start with a small queue surface
- isolate retries and DLQ behavior early

---

## 20. Suggested Initial Milestone Order

### Week 1

- Monorepo
- auth
- DB schema
- app and API scaffolding

### Week 2

- ICPs and watchlists
- org model
- source configs

### Week 3

- Reddit ingestion
- normalization
- dedupe

### Week 4

- X ingestion
- ranked feed
- filters

### Week 5

- signal detail
- recommendations
- actions and outcomes

### Week 6

- summaries
- charts
- operational hardening

---

## 21. Recommended Docs

### App framework and frontend

- TanStack Start overview: [https://tanstack.com/start](https://tanstack.com/start)
- TanStack Start server functions: [https://tanstack.com/start/latest/docs/framework/react/guide/server-functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
- TanStack Query overview: [https://tanstack.com/query/v5/docs/react/overview](https://tanstack.com/query/v5/docs/react/overview)
- TanStack Query query basics: [https://tanstack.com/query/v5/docs/react/guides/queries](https://tanstack.com/query/v5/docs/react/guides/queries)
- Coss UI sitemap: [https://coss.com/ui/llms.txt](https://coss.com/ui/llms.txt)
- Motion React docs: [https://motion.dev/docs/react](https://motion.dev/docs/react)
- visx repository and docs entry point: [https://github.com/airbnb/visx](https://github.com/airbnb/visx)
- Zustand docs: [https://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/)

### Backend and runtime

- Bun docs: [https://bun.com/docs](https://bun.com/docs)
- Bun workers: [https://bun.com/docs/runtime/workers](https://bun.com/docs/runtime/workers)
- Elysia overview: [https://elysiajs.com/](https://elysiajs.com/)
- Elysia OpenAPI: [https://elysiajs.com/patterns/openapi](https://elysiajs.com/patterns/openapi)
- Elysia OpenAPI plugin: [https://elysiajs.com/plugins/openapi](https://elysiajs.com/plugins/openapi)

### Auth and database

- Better Auth docs: [https://www.better-auth.com/docs](https://www.better-auth.com/docs)
- Better Auth database concepts: [https://www.better-auth.com/docs/concepts/database](https://www.better-auth.com/docs/concepts/database)
- Better Auth Drizzle adapter: [https://www.better-auth.com/docs/adapters/drizzle](https://www.better-auth.com/docs/adapters/drizzle)
- Drizzle get started: [https://orm.drizzle.team/docs/get-started](https://orm.drizzle.team/docs/get-started)
- Drizzle PostgreSQL guide: [https://orm.drizzle.team/docs/get-started-postgresql](https://orm.drizzle.team/docs/get-started-postgresql)
- PostgreSQL docs: [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/)

### Queue, cache, storage, analytics

- Redis docs: [https://redis.io/docs/latest/](https://redis.io/docs/latest/)
- Redis data types overview: [https://redis.io/docs/latest/develop/data-types/](https://redis.io/docs/latest/develop/data-types/)
- Redis Streams docs: [https://redis.io/docs/latest/develop/data-types/streams/](https://redis.io/docs/latest/develop/data-types/streams/)
- Cloudflare R2 S3 overview: [https://developers.cloudflare.com/r2/api/s3/](https://developers.cloudflare.com/r2/api/s3/)
- Cloudflare R2 S3 get started: [https://developers.cloudflare.com/r2/get-started/s3/](https://developers.cloudflare.com/r2/get-started/s3/)
- ClickHouse intro: [https://clickhouse.com/docs/intro](https://clickhouse.com/docs/intro)

---

## 22. Build Rules

- Keep business logic in shared packages
- Keep source adapters stateless where possible
- Never couple ranking logic directly to route handlers
- Keep scoring deterministic until there is clear need for model-based ranking
- Prefer small explicit interfaces over framework magic
- Every background job must be retry-safe and idempotent
- Every tenant-facing query must be org-scoped
- Every important metric needs an owner and a dashboard

---

## 23. Final Recommendation

The v1 should be built as a clean two-surface system:

- **TanStack Start** for the user-facing product app
- **Elysia + workers** for ingestion and backend operations

The product should ship with:

- Reddit + X ingestion
- ranked signal feed
- signal detail with recommendations
- action logging and outcomes
- weekly summary and lightweight analytics

Everything else should be deferred unless real usage proves the need.
