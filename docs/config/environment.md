---
sidebar_position: 1
title: Environment Variables
sidebar_label: Environment Variables
---

# Environment Variables

MDD HQ uses environment variables organized into three scopes: frontend (exposed to the browser), backend (server-side only), and local scripts (development machine only). Understanding which scope a variable belongs to is critical for security.

## Frontend Variables (VITE_*)

Variables prefixed with `VITE_` are bundled into the frontend JavaScript and are visible to anyone who inspects the page source. Only put non-secret values here.

| Variable | Purpose | Required | Where to Set |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes | Vercel + `.env.local` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Yes | Vercel + `.env.local` |
| `VITE_INGEST_API_KEY` | API key for frontend-triggered ingestion | Yes | Vercel + `.env.local` |
| `VITE_LAUNCHDARKLY_CLIENT_ID` | LaunchDarkly client-side SDK key | Yes | Vercel + `.env.local` |

:::warning
**Never put secrets in VITE_ variables.** Anything prefixed with `VITE_` is embedded in the production JavaScript bundle and visible to the public. The Supabase anon key is safe here because Row-Level Security (RLS) policies prevent unauthorized access even with the key exposed.
:::

### VITE_SUPABASE_URL

The URL of your Supabase project, typically in the format `https://your-project-id.supabase.co`. This is used by the frontend Supabase client to connect to the database and real-time channels.

### VITE_SUPABASE_ANON_KEY

The Supabase public (anonymous) API key. This key is intentionally public -- it only grants access that passes RLS policies. Without valid authentication, no data can be read or written.

### VITE_INGEST_API_KEY

Used by the frontend to authenticate requests to ingestion endpoints like `/api/task-dismiss` and `/api/task-automate`. This is a shared secret between the frontend and backend.

### VITE_LAUNCHDARKLY_CLIENT_ID

The client-side SDK key for LaunchDarkly. This is a public identifier (not a secret) that allows the LaunchDarkly SDK to fetch feature flag values.

## Backend Variables (Vercel)

These variables are only available to Vercel serverless functions. They are never exposed to the frontend.

| Variable | Purpose | Required | Where to Set |
|---|---|---|---|
| `SUPABASE_URL` | Supabase project URL (same as VITE_) | Yes | Vercel |
| `SUPABASE_SERVICE_KEY` | Supabase service role key (bypasses RLS) | Yes | Vercel |
| `ANTHROPIC_API_KEY` | Claude API key for AI executors | Yes | Vercel |
| `GITHUB_PAT` | GitHub Personal Access Token | Yes | Vercel |
| `INGEST_API_KEY` | API key for webhook authentication | Yes | Vercel |
| `CRON_SECRET` | Secret for Vercel cron authentication | Yes | Vercel |
| `NOTION_API_KEY` | Notion integration token | Yes | Vercel |
| `NOTION_TASKS_DB_ID` | Notion Tasks database ID | Yes | Vercel |
| `NOTION_GRANOLA_DB_ID` | Notion Granola Notes database ID | Yes | Vercel |
| `NOTION_CONTACTS_DB_ID` | Notion Contacts database ID | Yes | Vercel |
| `MS365_USER_ID` | Microsoft 365 user identifier | Optional | Vercel |
| `AUTO_ENRICH_ON_SYNC` | Auto-queue enrichment after sync | Optional | Vercel |

:::warning
**SUPABASE_SERVICE_KEY** is the most sensitive backend variable. It bypasses all Row-Level Security policies and grants full database access. Never log it, never expose it to the frontend, and rotate it if compromised.
:::

### SUPABASE_SERVICE_KEY

Used by `createServiceClient()` in serverless functions to perform database operations without a user session. Required for cron jobs and webhook handlers that run without browser-based authentication.

### ANTHROPIC_API_KEY

Authenticates calls to the Claude API (Haiku model) for all AI executors. Used exclusively by the `task-process` endpoint.

### GITHUB_PAT

GitHub Personal Access Token with repo scope. Used by `tasks-github` to read issues and pull requests from specified repositories.

### CRON_SECRET

A shared secret between Vercel's cron scheduler and the serverless functions. Vercel automatically includes this in the `Authorization` header when triggering cron jobs. Endpoints validate this header to prevent unauthorized invocation.

### NOTION_API_KEY

The Notion integration token. Must be created in the Notion developer portal and the integration must be connected to the relevant databases.

### NOTION_*_DB_ID

Database IDs for the three Notion databases MDD reads from. These are the 32-character IDs visible in Notion database URLs.

### AUTO_ENRICH_ON_SYNC

When set to `true`, the sync endpoints automatically queue a classification task for newly imported items. When `false` or unset, new items are imported without AI processing until a user manually triggers it.

## Local Script Variables

These variables are only used by scripts that run on the local development machine. They are never set in Vercel.

| Variable | Purpose | Required | Where to Set |
|---|---|---|---|
| `MONARCH_EMAIL` | Monarch Money login email | For financial sync | `.env.local` only |
| `MONARCH_PASSWORD` | Monarch Money login password | For financial sync | `.env.local` only |

:::warning
**Never set MONARCH_EMAIL or MONARCH_PASSWORD in Vercel.** These are login credentials for a financial aggregation service. They must only exist on your local machine in `.env.local` (which is gitignored).
:::

### Financial Sync Credentials

The Monarch Money sync script (`sync-monarch.js`) uses these credentials to authenticate with the Monarch Money API and download financial snapshots. This is intentionally a local-only operation to keep financial credentials off any server.

## .env.local Template

Create a `.env.local` file in the project root for local development:

```bash
# Frontend (exposed in browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_INGEST_API_KEY=your-ingest-key
VITE_LAUNCHDARKLY_CLIENT_ID=your-ld-client-id

# Backend (server-side only during local dev)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
ANTHROPIC_API_KEY=your-anthropic-key
GITHUB_PAT=your-github-pat
INGEST_API_KEY=your-ingest-key
CRON_SECRET=your-cron-secret
NOTION_API_KEY=your-notion-key
NOTION_TASKS_DB_ID=your-tasks-db-id
NOTION_GRANOLA_DB_ID=your-granola-db-id
NOTION_CONTACTS_DB_ID=your-contacts-db-id

# Local scripts only
MONARCH_EMAIL=your-monarch-email
MONARCH_PASSWORD=your-monarch-password
```

:::note
The `.env.local` file is included in `.gitignore` and must never be committed to version control.
:::

## Security Checklist

| Check | Status |
|---|---|
| No secrets in VITE_* variables | Required |
| SUPABASE_SERVICE_KEY only in Vercel env | Required |
| ANTHROPIC_API_KEY only in Vercel env | Required |
| MONARCH_* only in .env.local | Required |
| .env.local in .gitignore | Required |
| Rotate keys on suspected compromise | Best practice |

## Related Pages

- [Dev Setup](./dev-setup) - Local development configuration
- [Vercel Deployment](./vercel-deployment) - Where backend vars are set
- [Supabase Integration](../integrations/supabase) - How Supabase keys are used
- [Feature Flags](./feature-flags) - LaunchDarkly configuration
