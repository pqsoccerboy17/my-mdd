---
sidebar_position: 1
title: Supabase
sidebar_label: Supabase
---

# Supabase Integration

Supabase is the backbone data layer for MDD HQ, providing PostgreSQL database hosting, real-time WebSocket channels, authentication, and Row-Level Security policies. The integration follows a three-layer state pattern that balances instant load times with persistent, synchronized data.

## Three-Layer State Pattern

MDD HQ does not use Redux, Zustand, or any global state management library. Instead, it uses three complementary layers:

### Layer 1: localStorage (Speed)

- **Purpose:** Instant page loads and offline capability
- **What's cached:** Tasks, preferences, UI state, filter configurations, theme
- **Read strategy:** Always read from localStorage first for immediate rendering
- **Write strategy:** Write to localStorage on every state change
- **Freshness:** Considered stale after Supabase fetch completes

### Layer 2: Supabase (Truth)

- **Purpose:** Persistent storage and source of truth
- **What's stored:** All application data across 15+ tables
- **Read strategy:** Fetch from Supabase after localStorage provides initial render
- **Write strategy:** Write to Supabase on mutations, then update localStorage
- **Conflict handling:** Supabase data overwrites localStorage when fresher

### Layer 3: Real-time Channels (Sync)

- **Purpose:** Cross-tab and cross-device synchronization
- **What's synced:** Changes to tasks, deals, contacts, and other mutable data
- **Mechanism:** Supabase WebSocket subscriptions broadcast row-level changes
- **Conflict handling:** Newest `updated_at` timestamp wins (last-write-wins)

### State Flow

```
Page Load:
  1. Read from localStorage (instant render)
  2. Fetch from Supabase (background)
  3. Merge Supabase data (update if newer)
  4. Subscribe to real-time channel

User Mutation:
  1. Optimistic update to localStorage + UI
  2. Write to Supabase
  3. Real-time broadcast to other tabs
  4. Other tabs receive and merge
```

## Authentication

MDD HQ is a single-user application. Instead of a full user management system, it uses a simple `isOwner` flag:

- **Authentication method:** Supabase Auth with email/password
- **Authorization model:** Single owner -- the authenticated user either is the owner or is not
- **isOwner flag:** A boolean check used throughout the application to gate access
- **Public access:** Read-only views may be available (controlled by feature flags)

:::note
There is no user registration, team management, or role hierarchy. The app is built for exactly one user. The `isOwner` check is a simple guard, not a RBAC system.
:::

## Real-time Channels

Supabase real-time channels enable live data synchronization:

### Channel Setup

The app subscribes to changes on key tables:

| Table | Channel | Events |
|---|---|---|
| `tasks` | `tasks-changes` | INSERT, UPDATE, DELETE |
| `task_queue` | `queue-changes` | INSERT, UPDATE |
| `clients` | `clients-changes` | INSERT, UPDATE, DELETE |
| `deals` | `deals-changes` | INSERT, UPDATE, DELETE |
| `contacts` | `contacts-changes` | INSERT, UPDATE, DELETE |
| `activities` | `activities-changes` | INSERT, UPDATE |

### Cross-Tab Sync

When a task is updated in one browser tab:

1. The mutation is written to Supabase
2. Supabase broadcasts the change via WebSocket
3. All other tabs receive the broadcast
4. Each tab merges the change into its local state
5. localStorage is updated in each tab

This means opening MDD HQ in multiple tabs always shows consistent data.

### Conflict Resolution

When the same record is modified in multiple places (e.g., a task is edited in the UI while a sync endpoint updates it), the real-time channel delivers both changes. Resolution uses `updated_at` timestamp comparison:

- The record with the **newest** `updated_at` wins
- The losing version is silently overwritten
- No manual conflict resolution is required

This is a last-write-wins strategy. It works well for a single-user application where true conflicts (simultaneous edits to the same field) are rare.

## Row-Level Security (RLS)

All Supabase tables have RLS policies enabled:

### Policy Pattern

```sql
-- Typical RLS policy for MDD tables
CREATE POLICY "Owner can read own data" ON tasks
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can insert own data" ON tasks
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update own data" ON tasks
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete own data" ON tasks
  FOR DELETE
  USING (auth.uid() = owner_id);
```

Every table restricts all CRUD operations to the authenticated owner. This ensures that even if the Supabase URL and anon key are exposed (they are in the frontend bundle), no data can be accessed without valid authentication.

### Service Client Bypass

Server-side operations (crons, sync endpoints) need to bypass RLS because they run without a user session. The `createServiceClient` helper initializes a Supabase client with the service role key:

```js
import { createClient } from '@supabase/supabase-js';

function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}
```

:::warning
The service role key (`SUPABASE_SERVICE_KEY`) has full database access and bypasses all RLS policies. It is only used server-side and is never exposed to the frontend. It is set as a Vercel environment variable, not a `VITE_*` variable.
:::

## Table Overview

Supabase hosts 15+ tables organized by domain:

| Domain | Tables | Description |
|---|---|---|
| Tasks | tasks, task_queue, task_decisions, task_dismissals, sync_state | Task management and AI pipeline |
| CRM | clients, deals, contacts, activities, activity_summaries | Consulting portal data |
| AI Intelligence | client_intelligence, deal_scores, pipeline_forecasts, contact_enrichment, follow_up_queue | AI-generated insights |
| Financial | financial_snapshots, cc_tracker | Financial health data |
| Other | chat_messages | Chat/messaging features |

See [Schema Overview](../data/overview) for the full entity-relationship diagram.

## Frontend Client

The frontend Supabase client is initialized with public credentials:

```js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

These credentials are safe to expose in the frontend bundle because RLS policies prevent unauthorized access. The anon key only enables operations that pass RLS checks.

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Public anon key (RLS enforced) |
| `SUPABASE_URL` | Backend | Supabase project URL (same value) |
| `SUPABASE_SERVICE_KEY` | Backend | Service role key (bypasses RLS) |

## Related Pages

- [Schema Overview](../data/overview) - Full database schema
- [Tasks Schema](../data/tasks-schema) - Task-related table details
- [Environment Variables](../config/environment) - Full env var reference
- [Architecture](../overview/architecture) - System overview with diagrams
