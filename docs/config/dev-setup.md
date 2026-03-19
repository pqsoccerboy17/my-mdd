---
sidebar_position: 4
title: Dev Setup
sidebar_label: Dev Setup
---

# Dev Setup

This page covers the local development environment for MDD HQ: prerequisites, npm commands, the local Express server, and Vite proxy configuration.

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20+ | Required for Vite 7 and modern ES features |
| npm | 10+ | Comes with Node.js 20 |
| Git | Latest | Source control |
| Supabase account | - | For database access |
| Notion integration | - | For sync features (optional for UI dev) |
| LaunchDarkly account | - | For feature flags (optional, uses defaults) |

:::tip
You can run the frontend without Notion, GitHub, or LaunchDarkly credentials. The app will use default flag values and skip external syncs. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for the UI to function.
:::

## Installation

```bash
# Clone the repository
git clone https://github.com/pqsoccerboy17/MDD_HQ.git
cd MDD_HQ

# Install dependencies
npm install

# Create local environment file
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables page)
```

## npm Commands

### Development

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server + local Express server (via concurrently) |
| `npm run dev:ui` | Start only the Vite dev server (no Express) |
| `npm run dev:server` | Start only the local Express server |

### Build and Preview

| Command | Description |
|---|---|
| `npm run build` | Production build (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |

### Testing

| Command | Description |
|---|---|
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:ui` | Run tests with Vitest UI |

### Quality

| Command | Description |
|---|---|
| `npm run lint` | Run ESLint on all source files |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run type-check` | Run TypeScript type checking |

## Development Server

### npm run dev

The primary development command starts two servers concurrently:

1. **Vite Dev Server** (port 5173) - Serves the React application with hot module replacement
2. **Express Server** (port 3001) - Serves the Shortcuts & Proposals (SNP) module

The `concurrently` package runs both servers in parallel:

```json
{
  "dev": "concurrently \"vite\" \"node server/index.js\""
}
```

### npm run dev:ui

If you only need the frontend (no SNP features), use `dev:ui` to start just the Vite server. This is faster to start and uses fewer resources.

### Vite Dev Server (Port 5173)

The Vite dev server provides:

- **Hot Module Replacement (HMR)** - Changes to React components update in the browser without a full page reload
- **Fast startup** - Sub-second cold start
- **Proxy configuration** - API requests are proxied to avoid CORS issues
- **Environment variables** - `VITE_*` variables from `.env.local` are available via `import.meta.env`

Access the app at `http://localhost:5173` after starting the dev server.

## Vite Proxy Configuration

The Vite dev server proxies API requests to avoid CORS issues during local development:

```js
// vite.config.js (simplified)
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://mdd-hq.vercel.app',
        changeOrigin: true,
        secure: true
      }
    }
  }
});
```

This proxy configuration means:

- Frontend requests to `/api/*` during development are forwarded to the production Vercel deployment
- The browser sees the request as same-origin (localhost:5173/api/...), avoiding CORS errors
- The proxy adds `changeOrigin: true` to set the correct Host header

:::info
During local development, API calls go to the **production** Vercel serverless functions. This means sync operations, AI processing, and database writes affect the production database. If you need isolated development, set up a separate Supabase project and Vercel deployment.
:::

## Local Express Server

The local Express server (port 3001) provides backend support for the Shortcuts & Proposals (SNP) module:

### What It Does

- Serves server-rendered pages for the proposal builder
- Handles local-only operations that should not be serverless functions
- Provides an endpoint for the Monarch Money sync script

### Configuration

```js
// server/index.js (simplified)
const express = require('express');
const app = express();

app.use(express.json());

// SNP routes
app.get('/snp/*', handleSNP);

// Local sync routes
app.post('/local/sync-monarch', handleMonarchSync);

app.listen(3001, () => {
  console.log('Local server running on port 3001');
});
```

### When You Need It

The Express server is only needed if you are:

- Working on the Shortcuts & Proposals module
- Running the Monarch Money financial sync
- Testing local-only server operations

For most frontend development, `npm run dev:ui` (Vite only) is sufficient.

## concurrently Setup

The `concurrently` package runs multiple npm scripts in parallel with color-coded output:

```json
{
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

When running `npm run dev`, you see output from both servers in the same terminal:

```
[vite]   VITE v7.0.0 ready in 300ms
[vite]   Local: http://localhost:5173/
[server] Local server running on port 3001
```

Each server's output is prefixed with its name for easy identification.

## File Watching

Vite watches all files in the `src/` directory and triggers HMR on changes. The following file types trigger different behaviors:

| File Type | HMR Behavior |
|---|---|
| `.jsx` / `.tsx` | Component hot reload (state preserved when possible) |
| `.css` | Style injection (no page reload) |
| `.json` | Full page reload |
| `.js` (non-component) | Full page reload |

## Common Development Tasks

### Accessing the App

After `npm run dev`:
- Dashboard: `http://localhost:5173/`
- Tasks: `http://localhost:5173/tasks`
- Consulting: `http://localhost:5173/consulting`
- Financial Health: `http://localhost:5173/financial-health`
- CC Tracker: `http://localhost:5173/tools/cc-tracker`

### Testing a Single File

```bash
npx vitest run src/features/tasks/hooks/useTaskManager.test.js
```

### Running the Linter

```bash
npm run lint
# Fix auto-fixable issues
npm run lint:fix
```

### Building for Production

```bash
npm run build
# Preview the build
npm run preview
```

The preview server runs on port 4173 and serves the production build locally.

## Troubleshooting

### Port Already in Use

If port 5173 or 3001 is already in use:

```bash
# Find the process using the port
lsof -i :5173
# Kill it
kill -9 <PID>
```

### Environment Variables Not Loading

- Verify `.env.local` exists in the project root
- Verify variable names start with `VITE_` for frontend access
- Restart the Vite dev server after changing `.env.local`

### Supabase Connection Issues

- Check `VITE_SUPABASE_URL` format: should be `https://your-project.supabase.co`
- Verify `VITE_SUPABASE_ANON_KEY` is the anon/public key (not the service key)
- Check Supabase dashboard for project status

## Related Pages

- [Getting Started](../guides/getting-started) - First-time setup guide
- [Environment Variables](./environment) - Full variable reference
- [Testing](../guides/testing) - Test suite documentation
- [Vercel Deployment](./vercel-deployment) - Production deployment
