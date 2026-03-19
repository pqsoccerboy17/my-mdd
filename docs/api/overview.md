---
sidebar_position: 1
title: API Overview
sidebar_label: Overview
---

# API Overview

MDD HQ uses 9 Vercel serverless functions for data ingestion, sync orchestration, AI processing, and task automation. All endpoints live in the `/api` directory and are deployed automatically with each Vercel build.

## Endpoint Reference

| Endpoint | Method | Purpose | Trigger | Auth |
|---|---|---|---|---|
| `/api/sync-trigger` | POST | Orchestrate all sync operations | Manual | `INGEST_API_KEY` |
| `/api/sync-notion` | GET | Sync tasks from Notion | Cron (daily 14:00 UTC) | `CRON_SECRET` |
| `/api/sync-granola` | GET | Sync notes from Granola via Notion | Cron (daily 14:15 UTC) | `CRON_SECRET` |
| `/api/sync-apple` | POST/GET | Sync Apple Reminders | Webhook + cron | `INGEST_API_KEY` |
| `/api/email-ingest` | POST | Ingest forwarded emails as tasks | Webhook | `INGEST_API_KEY` |
| `/api/task-process` | GET | Process one AI task from queue | Cron (every 5 min) | `CRON_SECRET` |
| `/api/task-dismiss` | POST | Dismiss a synced task | Manual (UI) | Supabase Auth |
| `/api/task-automate` | POST | Queue an AI action for a task | Manual (UI) | Supabase Auth |
| `/api/tasks-github` | GET/POST | Sync GitHub issues and PRs | Manual | `INGEST_API_KEY` |

## Vercel Hobby Plan Limits

:::warning
The Vercel Hobby plan allows a maximum of **12 serverless functions** per project. MDD HQ currently uses **9**, leaving **3 slots available**. Adding new endpoints requires careful consideration of this limit.
:::

| Metric | Limit | Current Usage |
|---|---|---|
| Serverless functions | 12 | 9 |
| Remaining slots | - | 3 |
| Execution timeout | 10 seconds (Hobby) | Most complete in 2-5 seconds |
| Cron jobs | 2 per project (Hobby) | Using Vercel Pro for 3 crons |

## Authentication Methods

Endpoints use two authentication patterns:

### CRON_SECRET

Cron-triggered endpoints validate the `Authorization` header:

```js
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // ... process request
}
```

Vercel automatically includes the `CRON_SECRET` header when triggering cron jobs.

### INGEST_API_KEY

Webhook and manual endpoints validate a custom API key:

```js
const apiKey = req.headers['x-api-key'] || req.query.key;
if (apiKey !== process.env.INGEST_API_KEY) {
  return res.status(401).json({ error: 'Invalid API key' });
}
```

The `INGEST_API_KEY` is shared with external systems that need to call MDD endpoints (Apple Shortcuts, email forwarding services).

### Supabase Auth

UI-triggered endpoints validate the Supabase JWT token from the authenticated session. These endpoints are called from the frontend with the user's auth token.

## Shared Helpers: api/_lib/

Common server-side utilities live in `api/_lib/`:

| Helper | Purpose |
|---|---|
| `createServiceClient` | Initialize Supabase client with service role key |
| `syncAndUpsert` | Generic sync function with insert_only and upsert modes |
| `validateAuth` | Shared authentication middleware |
| `handleError` | Standardized error response formatting |
| `rateLimitCheck` | Simple rate limiting for webhook endpoints |

The `_lib` directory is a Vercel convention -- files in directories starting with `_` are not deployed as endpoints. They are only importable by other serverless functions.

## Request Flow

A typical endpoint request follows this pattern:

1. **Authentication** - Validate CRON_SECRET, INGEST_API_KEY, or Supabase token
2. **Input validation** - Check required parameters and format
3. **Database operations** - Read from and write to Supabase using the service client
4. **External API calls** - Call Notion, GitHub, Claude, or other APIs as needed
5. **Response** - Return JSON with status, data, and any error messages

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

Common error codes:

| Code | HTTP Status | Description |
|---|---|---|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Requested resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `EXTERNAL_API_ERROR` | 502 | External API (Notion, GitHub) failed |

## Cron Schedule

Three endpoints run on scheduled crons:

| Endpoint | Schedule | Cron Expression |
|---|---|---|
| `/api/sync-notion` | Daily at 14:00 UTC | `0 14 * * *` |
| `/api/sync-granola` | Daily at 14:15 UTC | `15 14 * * *` |
| `/api/task-process` | Every 5 minutes | `*/5 * * * *` |

The cron schedule is configured in `vercel.json`. See [Vercel Deployment](../config/vercel-deployment) for the full configuration.

:::info
The 15-minute offset between Notion and Granola syncs prevents them from competing for Notion API rate limits, since both read from Notion databases.
:::

## Endpoint Categories

### Sync Endpoints

Endpoints that pull data from external sources into Supabase. They are idempotent -- running them multiple times produces the same result.

- `sync-trigger` - Orchestrator that triggers all syncs in sequence
- `sync-notion` - Pulls from Notion Tasks database
- `sync-granola` - Pulls from Granola Notes database (via Notion)
- `sync-apple` - Receives Apple Reminders data

See [Sync Endpoints](./sync-endpoints) for detailed documentation.

### Ingestion Endpoints

Endpoints that receive data pushed from external systems.

- `email-ingest` - Receives forwarded emails
- `tasks-github` - Receives GitHub webhook data or pulls on demand

### AI Processing Endpoints

Endpoints that power the AI pipeline.

- `task-process` - Processes one queued AI task per invocation
- `task-automate` - Queues a new AI action

### Task Management Endpoints

Endpoints for direct task operations from the UI.

- `task-dismiss` - Dismisses a synced task (prevents re-import)

## Related Pages

- [Sync Endpoints](./sync-endpoints) - Detailed sync endpoint docs
- [Task Processor](../ai-pipeline/task-processor) - AI processing details
- [Vercel Deployment](../config/vercel-deployment) - Cron and deployment config
- [Environment Variables](../config/environment) - Auth keys and secrets
