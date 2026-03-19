---
sidebar_position: 2
title: Tech Stack
sidebar_label: Tech Stack
---

# Tech Stack

MDD HQ is built on a modern JavaScript stack optimized for solo development velocity, real-time data, and AI integration. Every dependency was chosen deliberately -- no framework bloat, no unused abstractions.

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI framework with concurrent features |
| Vite | 7 | Build tool and dev server |
| Tailwind CSS | 4 | Utility-first styling with CSS-first configuration |
| React Router | 6 | Client-side routing |
| Lucide React | latest | Icon library |
| date-fns | latest | Date formatting and manipulation |
| recharts | latest | Chart and data visualization |
| @hello-pangea/dnd | latest | Drag-and-drop (pipeline board) |
| LaunchDarkly React SDK | latest | Feature flag evaluation |

### Frontend Highlights

**Tailwind CSS 4** uses the new CSS-first configuration approach. Instead of a `tailwind.config.js` file, configuration lives directly in CSS using `@theme` directives. This simplifies the build pipeline and keeps styling co-located with the design system.

**React 19** provides concurrent rendering features used throughout the app for smoother transitions between views, especially during the task manager's filter and sort operations.

**Vite 7** delivers sub-second hot module replacement during development and optimized chunking for production builds. The multi-page build configuration produces 5 HTML entry points for Vercel route rewrites.

## Backend

| Technology | Version | Purpose |
|---|---|---|
| Vercel Serverless | Node.js 20 | API endpoints and cron jobs |
| Supabase JS | latest | Database client and real-time subscriptions |
| Express | latest | Local development server for Shortcuts & Proposals |

### Backend Highlights

**Vercel Serverless Functions** power all 9 API endpoints. Each function is a standalone Node.js module in the `/api` directory. The Vercel Hobby plan allows up to 12 serverless functions -- MDD currently uses 9, leaving 3 slots available.

**Supabase** provides PostgreSQL database hosting, row-level security policies, real-time WebSocket channels, and a service client for server-side operations. The `createServiceClient` helper initializes the Supabase client with the service role key for backend operations that bypass RLS.

The **local Express server** runs alongside Vite during development to serve the Shortcuts & Proposals (SNP) module, which requires server-side rendering for certain operations.

## Database

| Technology | Purpose |
|---|---|
| PostgreSQL (via Supabase) | Primary relational database |
| Supabase Real-time | WebSocket-based live data sync |
| Supabase Auth | Authentication with `isOwner` flag |
| Row-Level Security (RLS) | Table-level access control policies |

### Database Highlights

MDD HQ uses **15+ Supabase tables** organized into 4 domain clusters:

1. **Tasks** - tasks, task_queue, task_decisions, task_dismissals, sync_state
2. **CRM** - clients, deals, contacts, activities, activity_summaries
3. **AI/Intelligence** - client_intelligence, deal_scores, pipeline_forecasts, contact_enrichment, follow_up_queue
4. **Financial** - financial_snapshots, cc_tracker
5. **Other** - chat_messages

See [Schema Overview](../data/overview) for the full entity-relationship diagram.

## AI and APIs

| Technology | Purpose |
|---|---|
| Claude API (Haiku) | Task classification, scoring, research, email drafting |
| Anthropic SDK | API client for Claude |
| Notion API | Bidirectional task and contact sync |
| GitHub API | Issue and PR sync for dev tasks |
| Monarch Money | Financial data sync (local scripts) |

### AI Highlights

The AI pipeline exclusively uses **Claude Haiku** for all executor operations. Haiku was chosen for its speed and cost-efficiency -- the pipeline processes tasks on a 5-minute cron cycle and needs fast responses. The system maintains a strict **human-in-the-loop** policy: AI suggests, humans decide.

Eight executor types handle different task categories: classify, dev, research, comms, section, enrich, follow-up, and deal-score. See [Executors](../ai-pipeline/executors) for detailed documentation.

## Quality and DevOps

| Tool | Purpose |
|---|---|
| Vitest | Test runner (1,831 tests across 193 files) |
| React Testing Library | Component testing |
| jsdom | Browser environment simulation |
| ESLint | Code linting (0 errors enforced) |
| Semgrep | Security scanning (0 findings enforced) |
| Vercel CI/CD | Automatic deployment on push |
| GitHub Actions | CI pipeline |

### Quality Highlights

The project enforces strict quality thresholds:

| Metric | Threshold |
|---|---|
| Statements | 74% |
| Branches | 63% |
| Functions | 63% |
| Lines | 76% |
| Quality Score | 100/100 |
| Lint Errors | 0 |
| Semgrep Findings | 0 |

See [Testing](../guides/testing) for the full quality and testing documentation.

## Infrastructure

| Service | Purpose |
|---|---|
| Vercel | Hosting, serverless functions, cron scheduling |
| Supabase | Database hosting, real-time, auth |
| LaunchDarkly | Feature flag management |
| GitHub | Source control, CI/CD triggers |

### Infrastructure Highlights

**Vercel** handles both static hosting and serverless function execution. Three cron jobs run on schedule:

| Cron | Schedule | Endpoint |
|---|---|---|
| Notion Sync | Daily at 14:00 UTC | `/api/sync-notion` |
| Granola Sync | Daily at 14:15 UTC | `/api/sync-granola` |
| Task Processor | Every 5 minutes | `/api/task-process` |

**LaunchDarkly** manages 8 feature flags that control feature visibility, security-sensitive features, and demo mode. All security-sensitive flags default to OFF. See [Feature Flags](../config/feature-flags) for the full registry.

## Development Environment

| Tool | Purpose |
|---|---|
| Node.js | 20+ required |
| npm | Package management |
| Vite Dev Server | Port 5173 |
| Express Dev Server | Local SNP server |
| concurrently | Run multiple dev servers |

For local setup instructions, see [Dev Setup](../config/dev-setup).

## Dependency Philosophy

MDD HQ follows a deliberate dependency strategy:

1. **Prefer built-in** - Use native browser APIs and React built-ins before adding a library
2. **One job, one library** - Each dependency solves exactly one problem
3. **No framework lock-in** - The data layer is abstracted from the UI layer
4. **Audit regularly** - Keep dependencies updated, remove unused packages
5. **Size matters** - Prefer smaller, focused libraries over kitchen-sink frameworks
