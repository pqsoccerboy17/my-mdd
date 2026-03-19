---
sidebar_position: 3
title: Deployment
sidebar_label: Deployment
---

# Vercel Deployment

MDD HQ is deployed on Vercel, which handles static hosting, serverless function execution, cron job scheduling, and route rewrites. This page documents the deployment configuration.

## Project Configuration

| Setting | Value |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Node.js Version | 20.x |
| Install Command | `npm install` |
| Root Directory | `/` (project root) |

## vercel.json

The `vercel.json` file configures routes, rewrites, crons, and headers:

### Route Rewrites

MDD HQ is a multi-page Vite build that produces 5 HTML entry points. Route rewrites ensure that client-side routing works for each entry point:

```json
{
  "rewrites": [
    { "source": "/tasks", "destination": "/tasks.html" },
    { "source": "/consulting/(.*)", "destination": "/consulting.html" },
    { "source": "/financial-health", "destination": "/financial-health.html" },
    { "source": "/tools/cc-tracker", "destination": "/cc-tracker.html" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

| Route Pattern | HTML File | Feature |
|---|---|---|
| `/` | `index.html` | Dashboard |
| `/tasks` | `tasks.html` | Task Manager |
| `/consulting/*` | `consulting.html` | Consulting Portal |
| `/financial-health` | `financial-health.html` | Financial Health |
| `/tools/cc-tracker` | `cc-tracker.html` | CC Tracker |

The catch-all rewrite (`/((?!api/).*)`) sends any unmatched non-API route to `index.html`, which handles 404s client-side.

:::info
The multi-page build is configured in `vite.config.js` using Vite's `build.rollupOptions.input` to specify multiple HTML entry points. This approach loads less JavaScript per page compared to a single SPA entry point.
:::

### Cron Schedule

```json
{
  "crons": [
    {
      "path": "/api/sync-notion",
      "schedule": "0 14 * * *"
    },
    {
      "path": "/api/sync-granola",
      "schedule": "15 14 * * *"
    },
    {
      "path": "/api/task-process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

| Endpoint | Schedule | Cron Expression | Description |
|---|---|---|---|
| sync-notion | Daily 14:00 UTC | `0 14 * * *` | Sync tasks from Notion |
| sync-granola | Daily 14:15 UTC | `15 14 * * *` | Sync notes from Granola |
| task-process | Every 5 minutes | `*/5 * * * *` | Process AI task queue |

:::note
The Vercel Hobby plan includes 2 cron jobs. MDD HQ uses 3 crons, which requires the Vercel Pro plan or a custom cron trigger arrangement. Verify your plan supports the configured number of crons.
:::

### Headers

Security and caching headers are configured for all routes:

```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" },
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

API responses are never cached (`no-store`). Static assets in `/assets/` are aggressively cached with immutable headers since Vite includes content hashes in filenames.

## Serverless Functions

### Function Limits

| Metric | Hobby Plan | Pro Plan |
|---|---|---|
| Max functions | 12 | Unlimited |
| Execution timeout | 10 seconds | 60 seconds |
| Memory | 1024 MB | 1024 MB (configurable) |
| Cron jobs | 2 | Unlimited |

MDD HQ uses 9 of the 12 allowed serverless functions on the Hobby plan:

| # | Function | Path |
|---|---|---|
| 1 | sync-trigger | `/api/sync-trigger.js` |
| 2 | sync-notion | `/api/sync-notion.js` |
| 3 | sync-granola | `/api/sync-granola.js` |
| 4 | sync-apple | `/api/sync-apple.js` |
| 5 | email-ingest | `/api/email-ingest.js` |
| 6 | task-process | `/api/task-process.js` |
| 7 | task-dismiss | `/api/task-dismiss.js` |
| 8 | task-automate | `/api/task-automate.js` |
| 9 | tasks-github | `/api/tasks-github.js` |

:::warning
**3 function slots remain.** Adding new endpoints requires careful consideration. If you need more than 12, consider consolidating related endpoints or upgrading to the Pro plan.
:::

### Shared Code: api/_lib/

Files in directories starting with `_` are not deployed as serverless functions. The `api/_lib/` directory contains shared utilities used by multiple endpoints:

- `createServiceClient.js` - Supabase service client initialization
- `syncAndUpsert.js` - Generic sync and upsert logic
- `validateAuth.js` - Authentication validation helpers
- `handleError.js` - Error response formatting

## Build Configuration

### Multi-Page Build

The Vite build produces 5 HTML files instead of a single `index.html`:

```js
// vite.config.js (simplified)
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        tasks: 'tasks.html',
        consulting: 'consulting.html',
        'financial-health': 'financial-health.html',
        'cc-tracker': 'cc-tracker.html'
      }
    }
  }
});
```

Each HTML file loads only the JavaScript needed for its feature area, reducing initial bundle size per page.

### Build Output

| File | Size (approx) | Feature |
|---|---|---|
| `index.html` + chunks | ~200 KB | Dashboard |
| `tasks.html` + chunks | ~250 KB | Task Manager |
| `consulting.html` + chunks | ~300 KB | Consulting Portal |
| `financial-health.html` + chunks | ~150 KB | Financial Health |
| `cc-tracker.html` + chunks | ~100 KB | CC Tracker |

Shared dependencies (React, Supabase client, Tailwind utilities) are split into common chunks loaded by all pages.

## Environment Variables in Vercel

Backend environment variables are set in the Vercel project dashboard:

**Settings > Environment Variables**

| Variable | Environment | Sensitive |
|---|---|---|
| `SUPABASE_URL` | Production, Preview | No |
| `SUPABASE_SERVICE_KEY` | Production, Preview | Yes |
| `ANTHROPIC_API_KEY` | Production | Yes |
| `GITHUB_PAT` | Production | Yes |
| `INGEST_API_KEY` | Production, Preview | Yes |
| `CRON_SECRET` | Production | Yes |
| `NOTION_API_KEY` | Production | Yes |
| `NOTION_TASKS_DB_ID` | Production | No |
| `NOTION_GRANOLA_DB_ID` | Production | No |
| `NOTION_CONTACTS_DB_ID` | Production | No |

Sensitive variables should be marked as "Sensitive" in Vercel to prevent them from appearing in build logs.

See [Environment Variables](./environment) for the complete variable reference.

## Deployment Workflow

1. Push to `main` branch on GitHub
2. Vercel detects the push and starts a build
3. `npm install` runs to install dependencies
4. `npm run build` runs Vite in production mode
5. Vercel deploys the `dist/` output as static files
6. Serverless functions in `/api` are deployed
7. Cron schedule is applied
8. Route rewrites are configured
9. The deployment is live

Preview deployments are created for pull request branches, using the Preview environment variables.

## Monitoring

Vercel provides built-in monitoring for:

- **Function logs** - Real-time and historical logs for each serverless function
- **Cron execution** - Success/failure status for each cron run
- **Build logs** - Full build output for debugging
- **Analytics** - Page views, function invocations, and error rates

Access monitoring via the Vercel dashboard under your project's deployment details.

## Related Pages

- [Environment Variables](./environment) - Full env var reference
- [API Overview](../api/overview) - Serverless endpoint documentation
- [Dev Setup](./dev-setup) - Local development configuration
