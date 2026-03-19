# MDD Docs

Documentation site for [MDD HQ](https://mdd-hq.vercel.app) -- the personal productivity dashboard.

Built with [Docusaurus 3.9.2](https://docusaurus.io/) and deployed on [Vercel](https://vercel.com/).

## Quick Start

```bash
npm install
npm start
```

Open http://localhost:3000

## Project Structure

```
my-mdd/
├── docs/                    # Documentation content (27+ pages)
│   ├── home.mdx             # Landing page
│   ├── overview/            # Product overview, tech stack, architecture
│   ├── features/            # Task manager, CRM, financial, AI, platform
│   ├── ai-pipeline/         # AI pipeline, executors, flywheel
│   ├── integrations/        # Supabase, Notion sync
│   ├── data/                # Database schema reference
│   ├── api/                 # API endpoint reference
│   ├── config/              # Environment, flags, deployment, dev setup
│   ├── guides/              # Getting started, testing
│   └── roadmap/             # Wishlist, changelog
├── src/
│   ├── css/custom.css       # Terracotta theme (adapted from my-claude)
│   ├── components/
│   │   ├── Card.tsx          # Reusable doc card
│   │   ├── StatsBar.tsx      # MDD stats pills
│   │   ├── ScrollReveal.tsx  # Scroll animations
│   │   ├── SyncFlowExplorer/ # Interactive data source explorer
│   │   └── Timeline/        # Changelog timeline
│   ├── data/stats.ts        # MDD inventory counts
│   └── theme/Footer/        # Custom footer
├── static/img/              # Favicon and icons
├── docusaurus.config.ts     # Site configuration
└── sidebars.ts              # Navigation structure
```

## Tech Stack

- Docusaurus 3.9.2 + React 19 + TypeScript
- Custom CSS with terracotta/warm palette
- Lucide React icons
- Mermaid diagrams
- Local search
- Framer Motion animations
- Vercel deployment

## Build

```bash
npm run build    # Production build
npm run serve    # Serve built site locally
```

## Deployment

Auto-deploys on push to `main` via Vercel.
