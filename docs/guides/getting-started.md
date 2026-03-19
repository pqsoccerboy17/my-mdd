---
sidebar_position: 1
title: Getting Started
sidebar_label: Getting Started
---

# Getting Started

This guide walks you through setting up MDD HQ locally for the first time: cloning the repository, installing dependencies, configuring environment variables, and running the development server.

## Prerequisites

Before you begin, make sure you have the following installed:

| Requirement | Minimum Version | Check Command |
|---|---|---|
| Node.js | 20.0.0 | `node --version` |
| npm | 10.0.0 | `npm --version` |
| Git | Any recent | `git --version` |

You also need access to:

| Service | Required For | Can Skip? |
|---|---|---|
| Supabase project | Database and real-time | No - core dependency |
| LaunchDarkly account | Feature flags | Yes - uses defaults |
| Notion integration | Task/contact sync | Yes - sync features disabled |
| GitHub PAT | GitHub task sync | Yes - GitHub sync disabled |
| Anthropic API key | AI pipeline | Yes - AI features disabled |

:::tip
For a minimal setup to explore the UI, you only need a Supabase project with the schema applied. All external integrations are optional and the app degrades gracefully without them.
:::

## Step 1: Clone the Repository

```bash
cd ~/Projects
git clone https://github.com/pqsoccerboy17/MDD_HQ.git
cd MDD_HQ
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs all frontend and development dependencies. The install typically takes 30-60 seconds.

## Step 3: Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. At minimum, set these:

```bash
# Required for the app to function
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Required for API key validation
VITE_INGEST_API_KEY=your-ingest-key

# Optional but recommended
VITE_LAUNCHDARKLY_CLIENT_ID=your-ld-client-id
```

See [Environment Variables](../config/environment) for the complete list of variables and where to find each value.

### Where to Find Your Supabase Credentials

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings > API**
4. Copy the **Project URL** for `VITE_SUPABASE_URL`
5. Copy the **anon public** key for `VITE_SUPABASE_ANON_KEY`

## Step 4: Start the Development Server

```bash
npm run dev
```

This starts two servers concurrently:

- **Vite** at `http://localhost:5173` - the main application
- **Express** at `http://localhost:3001` - local server for SNP features

If you only need the frontend (most common):

```bash
npm run dev:ui
```

## Step 5: Verify the Setup

Open `http://localhost:5173` in your browser. You should see the MDD HQ dashboard.

### Verification Checklist

| Check | How to Verify |
|---|---|
| App loads | Dashboard renders at localhost:5173 |
| Supabase connected | No console errors about Supabase connection |
| Sidebar visible | Navigation sidebar appears on the left |
| Theme works | `Cmd+Shift+L` cycles between light and dark mode |
| Command palette | `Cmd+K` opens the command palette |

If you see errors in the browser console about Supabase, double-check your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

## First Things to Try

Once the app is running, explore these features:

### 1. Visit the Task Manager

Navigate to `http://localhost:5173/tasks` or use `Cmd+K` and type "tasks".

- View the task list (may be empty on first run)
- Try the 4 view modes: list, board, pipeline, calendar
- Open the filter panel to see 8-dimension filtering
- Create a manual task with the "New Task" button

### 2. Open the Command Palette

Press `Cmd+K` from any page.

- Type to fuzzy-search commands
- Navigate between features
- Toggle dark mode
- See what commands are available

### 3. Toggle Dark Mode

Press `Cmd+Shift+L` to cycle through light, dark, and system theme modes. If the `DARK_MODE` feature flag is enabled, you will see the full theme cycle.

### 4. Check Financial Health

Navigate to `http://localhost:5173/financial-health`.

- You will see the privacy gate (click to reveal data)
- If no financial snapshots exist, the static JSON fallback data appears
- This demonstrates the privacy-first approach to sensitive data

### 5. Explore the Consulting Portal

Navigate to `http://localhost:5173/consulting`.

- Browse clients, pipeline, contacts, and activity sections
- Note how the portal organizes CRM data for consulting workflows
- AI features appear only if the `CONSULTING_AI_FEATURES` flag is enabled

### 6. Check Keyboard Shortcuts

Press `Cmd+/` to see all available keyboard shortcuts. This overlay shows every registered shortcut with descriptions.

## Running Tests

Verify the test suite passes:

```bash
npm test
```

This runs all 1,831 tests across 193 files. A full test run typically takes 30-60 seconds.

For development, use watch mode:

```bash
npm run test:watch
```

See [Testing](./testing) for the complete testing guide.

## Next Steps

| Goal | Page |
|---|---|
| Understand the architecture | [Architecture](../overview/architecture) |
| Learn the tech stack | [Tech Stack](../overview/tech-stack) |
| Configure feature flags | [Feature Flags](../config/feature-flags) |
| Set up external integrations | [Notion Sync](../integrations/notion-sync), [Supabase](../integrations/supabase) |
| Understand the AI pipeline | [AI Pipeline Overview](../ai-pipeline/overview) |
| Deploy to production | [Vercel Deployment](../config/vercel-deployment) |

## Troubleshooting

### npm install fails

- Verify Node.js 20+: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and retry: `rm -rf node_modules && npm install`

### App shows blank page

- Check the browser console for errors
- Verify `.env.local` exists and has correct values
- Ensure the Vite dev server is running (check terminal output)

### Supabase errors in console

- Verify `VITE_SUPABASE_URL` format: `https://your-project.supabase.co`
- Verify the anon key is correct (not the service key)
- Check that the Supabase project is active (not paused)

### Port 5173 in use

```bash
# Find and kill the process using port 5173
lsof -i :5173
kill -9 <PID>
```

### Feature flags not evaluating

- Without `VITE_LAUNCHDARKLY_CLIENT_ID`, all flags use their default values
- This is fine for local development -- most features are visible by default
- Only `PERSONAL_FINANCE` and `CONSULTING_AI_FEATURES` default to OFF

## Related Pages

- [Dev Setup](../config/dev-setup) - Detailed development environment docs
- [Environment Variables](../config/environment) - Complete variable reference
- [Testing](./testing) - Test suite documentation
