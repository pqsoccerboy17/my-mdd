# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Overview

MDD Docs is a Docusaurus documentation site for MDD HQ -- the personal productivity dashboard at mdd-hq.vercel.app. This is the sister site to my-claude docs, sharing the same framework but with MDD's terracotta branding.

Live: https://my-mdd.vercel.app

## Commands

```bash
npm start        # Dev server at localhost:3000
npm run build    # Production build
npm run serve    # Serve production build locally
npm run typecheck # TypeScript type checking
```

## Tech Stack

- Docusaurus 3.9.2 with React 19 and TypeScript
- Custom CSS theme (no Tailwind) -- terracotta palette adapted from my-claude's heritage green
- Lucide React icons (24px)
- Mermaid diagrams
- Local search via @easyops-cn/docusaurus-search-local
- Framer Motion (Timeline progress animation)
- Deployed on Vercel

## Architecture

### Content (docs/)
- 9 sidebar categories: Overview, Features, AI Pipeline, Integrations, Database Reference, API Reference, Configuration, Guides, Roadmap
- Content sourced from MDD HQ's README.md and CLAUDE.md
- All docs use routeBasePath: '/' (no /docs/ prefix)
- MDX pages (.mdx) import React components; plain Markdown pages (.md) do not

### Custom Components (src/components/)
- `Card.tsx` -- Reusable doc card for landing page grids
- `StatsBar.tsx` -- Clickable pill badges showing MDD inventory counts
- `ScrollReveal.tsx` -- IntersectionObserver-based scroll animations
- `SyncFlowExplorer/` -- Interactive data source sync comparison (6 sources)
- `Timeline/` -- Scroll-animated changelog with Framer Motion progress line

### Theme (src/css/custom.css)
- Terracotta primary: #C85A3A (dark), #8B3520 (light)
- Dark bg: #1A1F2E, surface: #242938
- Light bg: #F8F6F7, surface alt: #F3F0EC
- Fonts: Inter (body), Libre Baskerville (headings), Space Grotesk (hero display)
- Grain texture overlay via body::before SVG noise filter
- Topographic pattern on landing hero
- Card border-radius: 8px

### Data (src/data/)
- `stats.ts` -- Manually maintained MDD inventory counts

## Conventions

- No em dashes -- use hyphens (-) or double hyphens (--)
- No emojis in content
- Frontmatter on every page: title, sidebar_label, sidebar_position
- Docusaurus admonitions for callouts (:::tip, :::info, :::warning, :::note)
- Tables for reference data, code blocks for configuration
- Internal cross-links using relative paths
- Avoid JSX-like syntax in .md files (curly braces, angle brackets outside code blocks)

## Content Sources

Documentation content is derived from the MDD HQ codebase:
- `/Users/mikeduncan/Projects/MDD/README.md` -- overview, tech stack, quick start
- `/Users/mikeduncan/Projects/MDD/CLAUDE.md` -- architecture, features, APIs, database schemas

## Adding Content

1. Create a new `.md` or `.mdx` file in the appropriate `docs/` subdirectory
2. Add frontmatter with title, sidebar_label, and sidebar_position
3. Add the page to `sidebars.ts`
4. Add a Card entry to `docs/home.mdx` if it should appear on the landing page
5. Run `npm run build` to verify no MDX compilation errors
