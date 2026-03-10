## Product

Founder Distribution Intelligence Platform

Purpose: help founders find high-intent demand signals across communities, triage them quickly, turn them into replies, DMs, and content, and learn which actions convert into meetings and pipeline.

This document is the client and UX source of truth.
It covers:

- information architecture
- sitemap and URLs
- navigation
- page structure
- screen anatomy
- component usage with Coss UI
- visual and motion direction
- frontend implementation guidance

Backend architecture, workers, data model, and broader rollout/testing strategy belong in `SPEC.md`.

---

## Product UI Direction

The product should feel like a mix of:

- Attio for shell polish, keyboard-centric workflows, and crisp workspace UI
- Superhuman for triage-first behavior and fast processing loops
- Bloomberg Terminal for information density and workflow continuity
- Notion for sidebar organization and discoverability

This is not a social media scheduler and not a traditional dashboard product.
It should feel like a signal inbox and execution terminal.

Core UX principles:

- one primary operating surface
- high information density without visual noise
- command-first navigation
- instant context in a detail pane
- fast keyboard navigation
- clear next-best action on every signal
- compact, embedded analytics rather than giant dashboards
- routes for durable objects and sections, query params for views and filters

---

## Frontend Stack

- Coss UI
- TanStack Start
- TanStack Query
- Better Auth
- Motion
- visx
- Zustand
- Tailwind CSS

### How each frontend tool is used

#### Coss UI

Use Coss UI as the component system and layout foundation.

Use it for:

- navigation chrome
- forms and filters
- command palette
- detail panes and sheets
- tables, badges, toolbars, menus, dialogs, sidebars
- empty states, skeletons, toasts

#### TanStack Start

Use for:

- routing
- SSR and page shells
- authenticated app structure
- app-facing server functions and page loaders

#### TanStack Query

Use for:

- feed fetching
- pagination
- filter-backed server state
- optimistic mutations
- background refresh and invalidation

#### Better Auth

Use for:

- user auth
- organizations and sessions
- protected app routes

#### Motion

Use for:

- panel transitions
- command bar open and close
- feed row hover and micro-interactions
- optimistic action transitions

Keep motion restrained.

#### visx

Use for:

- custom analytics charts
- compact trend views
- funnel views
- topic cluster trendlines

#### Zustand

Use only for client UI state:

- sidebar open and collapse state
- command palette open state
- selected signal ids
- local draft composer state
- transient filter UI state before applying

Do not use Zustand as a second server-state layer.

---

## Information Architecture

The app should be organized around the real workflow:

- signal triage first
- execution second
- analytics third
- configuration last

### Primary product areas

1. Inbox
2. Signal Detail
3. Drafts
4. Outcomes
5. Analytics
6. Settings

### Secondary/config areas

- Watchlists
- ICPs
- Sources
- Summaries

### Routing rules

- use routes for durable objects and major sections
- use query params for views, filters, tabs, and sort state
- keep top-level nav shallow
- do not turn every tab into a route

---

## Recommended Sitemap and URL Tree

```txt
/
├─ /login
├─ /register
├─ /invite/accept
├─ /onboarding
│  ├─ /onboarding/profile
│  ├─ /onboarding/workspace
│  ├─ /onboarding/icp
│  ├─ /onboarding/sources
│  └─ /onboarding/finish
│
├─ /app
│  ├─ /app/inbox
│  ├─ /app/signals/:signalId
│  ├─ /app/watchlists
│  ├─ /app/watchlists/:watchlistId
│  ├─ /app/icps
│  ├─ /app/icps/:icpId
│  ├─ /app/drafts
│  ├─ /app/drafts/new
│  ├─ /app/drafts/:draftId
│  ├─ /app/outcomes
│  ├─ /app/outcomes/:outcomeId
│  ├─ /app/analytics
│  ├─ /app/summaries
│  ├─ /app/sources
│  ├─ /app/settings/profile
│  ├─ /app/settings/workspace
│  ├─ /app/settings/members
│  ├─ /app/settings/notifications
│  ├─ /app/settings/integrations
│  └─ /app/settings/security
│
└─ /api
   ├─ /api/health
   ├─ /api/ready
   ├─ /api/ingest/reddit
   ├─ /api/ingest/x
   ├─ /api/admin/reindex
   ├─ /api/admin/recompute/:signalId
   ├─ /api/admin/replay/:jobId
   └─ /api/openapi
```

### Query param conventions

#### Inbox

Use query params for views and filters, for example:

- `/app/inbox?view=high-intent`
- `/app/inbox?view=pain-spikes&source=reddit`
- `/app/inbox?view=needs-reply&icp=seed-fintech&sort=rank`

#### Signal detail

Keep one durable route and switch detail panes with query params:

- `/app/signals/:signalId?tab=context`
- `/app/signals/:signalId?tab=actions`
- `/app/signals/:signalId?tab=similar`
- `/app/signals/:signalId?tab=history`

#### Drafts

- `/app/drafts?type=reply`
- `/app/drafts?type=post`
- `/app/drafts?type=message`

#### Analytics

- `/app/analytics?view=overview`
- `/app/analytics?view=funnel`
- `/app/analytics?view=themes`
- `/app/analytics?view=channels`
- `/app/analytics?view=content`

---

## Sidebar Navigation

Use this as the default left-nav structure:

- Inbox
- Drafts
- Outcomes
- Analytics
- Watchlists
- ICPs
- Sources
- Summaries
- Settings

### Navigation guidance

- `Inbox`, `Drafts`, `Outcomes`, and `Analytics` are the primary workflow areas
- `Watchlists`, `ICPs`, `Sources`, and `Summaries` are secondary and can sit lower in the sidebar
- do not expose `Signals` as a top-level nav item; users reach a signal through Inbox and deep links
- keep Settings grouped and nested

---

## Sitemap using Coss UI component families

The sitemap below uses Coss UI concepts and components as the organizing system.

### 1. App Shell

Primary components:

- Sidebar
- Toolbar
- Command
- Scroll Area
- Separator
- Avatar
- Breadcrumb
- Tooltip
- Sheet

#### 1.1 Global shell

- left Sidebar for navigation
- top Toolbar for command search, workspace switcher, sync state, and quick actions
- central content area
- optional right Sheet or persistent detail pane on smaller breakpoints

#### 1.2 Navigation structure

- Inbox
- Drafts
- Outcomes
- Analytics
- Watchlists
- ICPs
- Sources
- Summaries
- Settings

---

### 2. Signal Inbox

Primary components:

- Input
- Input Group
- Select
- Combobox
- Checkbox Group
- Toggle Group
- Table
- Badge
- Kbd
- Skeleton
- Empty
- Menu
- Pagination
- Toast

#### 2.1 Main feed layout

- center pane showing ranked signal feed
- compact row layout by default
- filters at the top
- bulk actions in a Toolbar

#### 2.2 Each signal row should include

- source icon
- author
- excerpt
- intent score badge
- pain score badge
- ICP match badge
- freshness timestamp
- recommended action
- state indicator such as saved, dismissed, replied, converted

#### 2.3 Feed controls

- search via Input or Combobox
- source filter via Select
- status filters via Toggle Group
- ICP filters via Checkbox Group
- sort options via Menu
- keyboard navigation hints via Kbd

#### 2.4 Loading and empty states

- Skeleton while feed loads
- Empty when no signals match current filters
- Toast for successful actions such as dismiss, save, or create draft

---

### 3. Signal Detail Workspace

Primary components:

- Card
- Group
- Frame
- Badge
- Preview Card
- Tabs
- Separator
- Button
- Menu
- Sheet
- Dialog
- Alert Dialog

#### 3.1 Detail pane sections

- original signal content and thread context
- signal interpretation
- action recommendations
- related signals
- history and outcomes

#### 3.2 Tabs in detail pane

- Context
- Why It Matters
- Actions
- Similar Signals
- History

#### 3.3 Actions

- Draft Public Reply
- Draft DM
- Turn into Post
- Save
- Dismiss
- Mark as Converted

Use Alert Dialog for destructive actions such as deleting drafts or removing outcomes.

---

### 4. Draft Studio

Primary components:

- Tabs
- Textarea
- Input
- Form
- Field
- Fieldset
- Toolbar
- Card
- Badge
- Preview Card
- Menu
- Popover
- Tooltip

#### 4.1 Layout

- left column: source signals and reference context
- center column: editor
- right column: guidance, performance hints, and reusable snippets

#### 4.2 Features

- transform signal into post or reply
- attach source references
- store draft state locally and remotely
- show recommended hooks and objections
- show tone toggles

#### 4.3 Interaction model

- use Tabs for Reply, DM, Post
- use Toolbar for format actions
- use Popover for prompt aids and snippets
- use Preview Card to render the source signal or linked references

---

### 5. Analytics

Primary components:

- Card
- Group
- Tabs
- Table
- Meter
- Progress
- Badge
- Empty
- Skeleton

#### 5.1 Analytics should remain secondary

Open analytics from the sidebar. Do not make it the home screen.

#### 5.2 Key views

- signal to action to meeting funnel
- top recurring pain clusters
- channel quality trendlines
- reply and content performance by theme
- ICP and source effectiveness tables

#### 5.3 Chart guidance

Use visx for:

- slim line charts
- compact bars
- small multiples
- embedded trendlines inside cards

Avoid giant BI dashboards.

---

### 6. Workspace and Source Configuration

Primary components:

- Form
- Field
- Fieldset
- Input
- Select
- Switch
- Checkbox
- Radio Group
- Calendar
- Date Picker
- Number Field
- Alert
- Dialog
- Accordion

#### 6.1 Source setup

- connect Reddit
- connect X
- add watchlists
- define ingest limits
- define sync windows

#### 6.2 ICP setup

- persona title
- company size
- stage
- keywords
- pain phrases
- competitor list

#### 6.3 Alerts and thresholds

- enable or disable notifications
- pain threshold
- intent threshold
- source-specific priority rules

Use Accordion to group advanced settings rather than showing everything at once.

---

## Screen-by-Screen UX Specification

### Screen 1: Inbox

Route:

- `/app/inbox`

Goal:

- let users triage opportunities quickly

Layout:

- Sidebar on the left
- feed in the middle
- detail pane on the right

Key interactions:

- arrow-key navigation through signals
- enter opens detail
- shortcuts for save, dismiss, draft, mark converted
- command palette for jumping between views
- filters and view state reflected in query params

Design notes:

- compact rows
- subtle hover lift
- badges for scores and status
- detail pane opens instantly

### Screen 2: Signal Detail

Route:

- `/app/signals/:signalId`

Goal:

- provide durable access to a single signal and all attached context

Layout:

- content and thread context
- interpretation and scoring summary
- action workspace
- similar signals and history via tab state

Design notes:

- keep one durable route
- use query param tabs rather than fragmenting into many routes

### Screen 3: Draft Studio

Routes:

- `/app/drafts`
- `/app/drafts/new`
- `/app/drafts/:draftId`

Goal:

- turn signals into founder-led replies, posts, and DMs

Layout:

- evidence and reference context on the left
- editor in the center
- recommendations on the right

Design notes:

- not a blank page
- always keep supporting evidence visible
- optimize for short, high-quality writing workflows

### Screen 4: Outcomes

Routes:

- `/app/outcomes`
- `/app/outcomes/:outcomeId`

Goal:

- capture what happened after action was taken

Design notes:

- simple, structured logging of meetings, replies, qualified leads, and pipeline movement
- outcomes should connect clearly back to signals and actions

### Screen 5: Analytics

Route:

- `/app/analytics`

Goal:

- help users learn what works without overwhelming them

Layout:

- summary cards at top
- compact charts below
- drill-down tables underneath

Design notes:

- analytics should answer action questions, not just report vanity metrics
- view switching should use query params

### Screen 6: Settings and Source Management

Routes:

- `/app/sources`
- `/app/watchlists`
- `/app/icps`
- `/app/settings/*`

Goal:

- configure sources, thresholds, workspace state, and team settings

Design notes:

- keep forms straightforward
- use progressive disclosure
- avoid long walls of settings

---

## Page and Route Structure

Use this standard for page implementation:

```txt
apps/web/src/pages/
  <page>/
    route.tsx
    <page>-page.tsx
    <page>-page.types.ts
    <page>-page.constants.ts
    <page>-page.hooks.ts
    <page>-page.utils.ts
    components/
    lib/
```

### Rules

- `route.tsx` contains route definition only
- `<page>-page.tsx` contains composition only
- `components/` contains page-specific UI
- `lib/` contains query option factories, serializers, and local adapters
- move anything reused twice into shared `components/` or `packages/`
- keep route files under 100 LOC when possible
- keep page composition files under roughly 250 LOC

---

## Visual Direction

### Tone

- calm
- premium
- dense but readable
- editorial rather than playful

### Palette

- mostly neutral base
- one strong accent for signal and positive actions
- one caution color for pain and urgency
- sparse use of red for destructive actions

### Density

- medium-high density
- whitespace inside modules, not between every block

### Corners and shadows

- modest radius
- low shadow
- rely more on borders and contrast than floating cards everywhere

### Typography

- clear sans serif
- strong hierarchy
- mono only for timestamps, counts, and system metadata

---

## Motion Guidance

Use Motion for:

- sidebar collapse and expand
- detail pane open and close
- command palette enter and exit
- feed row hover states
- optimistic mutation transitions
- skeleton to content fades

Do not:

- overanimate charts
- animate every list item aggressively
- create consumer-app bounce everywhere

Target feel:

- fast
- precise
- almost invisible motion

---

## Frontend Testing Strategy

### Unit tests

Use for:

- UI state stores
- page-local utilities
- serializers and query param helpers
- small presentational components

### Integration tests

Use for:

- route-level rendering
- TanStack Query query option wiring
- form flows
- auth-aware page behavior
- command palette interactions

### End-to-end tests

Use for:

- sign in
- onboarding
- triage signal in inbox
- open signal detail
- create draft
- mark outcome
- inspect analytics view

### Frontend UI tests

Use for:

- keyboard navigation
- command palette behavior
- panel interactions
- empty and loading states
- query param persistence for filters and tabs

---

## Documentation Links

### Coss UI

- Sitemap and component index: [https://coss.com/ui/llms.txt](https://coss.com/ui/llms.txt)
- Docs overview: [https://coss.com/ui/docs/index.md](https://coss.com/ui/docs/index.md)
- Get started: [https://coss.com/ui/docs/get-started.md](https://coss.com/ui/docs/get-started.md)
- Component docs root: [https://coss.com/ui/docs/components/](https://coss.com/ui/docs/components/)

Recommended Coss UI components for this app:

- Command
- Sidebar
- Sheet
- Toolbar
- Table
- Tabs
- Dialog
- Empty
- Skeleton
- Toast
- Badge
- Input
- Combobox
- Menu
- Scroll Area

### TanStack Start

- [https://tanstack.com/start/latest](https://tanstack.com/start/latest)

### TanStack Query

- [https://tanstack.com/query/latest](https://tanstack.com/query/latest)

### Better Auth

- [https://www.better-auth.com/docs](https://www.better-auth.com/docs)
- Drizzle adapter: [https://www.better-auth.com/docs/adapters/drizzle](https://www.better-auth.com/docs/adapters/drizzle)

### Elysia

- [https://elysiajs.com/](https://elysiajs.com/)
- OpenAPI pattern: [https://elysiajs.com/patterns/openapi](https://elysiajs.com/patterns/openapi)

### Bun

- [https://bun.sh/docs](https://bun.sh/docs)
- Workers: [https://bun.sh/docs/runtime/workers](https://bun.sh/docs/runtime/workers)

### Motion

- [https://motion.dev/docs/react](https://motion.dev/docs/react)

### visx

- [https://github.com/airbnb/visx](https://github.com/airbnb/visx)

### Zustand

- [https://zustand.docs.pmnd.rs/](https://zustand.docs.pmnd.rs/)

---

## Final Product Direction

The UI should be built around a single powerful operating surface:

- inbox first
- analytics second
- writing and action close to the signal
- keyboard-driven and context-rich
- durable URLs for objects and sections
- query params for views, filters, tabs, and sort state

The product should feel like a founder's signal terminal, not a marketing dashboard.