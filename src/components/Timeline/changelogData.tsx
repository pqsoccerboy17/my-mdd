import type { TimelineEra } from './types';

export const eras: TimelineEra[] = [
  {
    id: 'base-camp',
    title: 'Base Camp',
    subtitle: 'Foundation',
    stats: {
      commits: 11,
      dayRange: 'Day 1',
      dateRange: 'Feb 22, 2026',
      highlights: 6,
    },
    description: 'The entire foundation laid in a single day -- from empty directory to deployed production app with a complete design system, command palette, and the first feature module.',
    trailPosition: 4,
    changes: [
      { text: 'Vite + React 19 + Tailwind CSS 4 scaffold with full design system', category: 'infrastructure', notable: true },
      { text: 'Phase 1 components: collapsible sidebar, dashboard shell, command palette, dark mode', category: 'feature', notable: true },
      { text: 'CC Rewards Tracker with credits dashboard, card comparison, and transfer partners', category: 'feature', notable: true },
      { text: 'PWA support for iPhone home screen installation', category: 'feature' },
      { text: 'Deployed to Vercel with auto-deploy on push to main', category: 'infrastructure', notable: true },
      { text: 'Open Graph and Twitter Card meta tags for link previews', category: 'design' },
    ],
  },
  {
    id: 'trail-markers',
    title: 'Trail Markers',
    subtitle: 'Navigation and Polish',
    stats: {
      commits: 11,
      dayRange: 'Day 2',
      dateRange: 'Feb 23, 2026',
      highlights: 4,
    },
    description: 'Polishing the foundation -- mobile responsiveness, GitHub automation, and the small details that make an app feel finished.',
    trailPosition: 8,
    changes: [
      { text: 'Mobile header with sidebar toggle and pill-shaped search bar', category: 'design', notable: true },
      { text: 'Claude Code GitHub Actions: issue triage, PR review, weekly maintenance', category: 'infrastructure', notable: true },
      { text: 'SPA routing fix for Vercel 404s on direct navigation', category: 'quality' },
      { text: 'Multiple favicon iterations for 16x16 visibility', category: 'design' },
    ],
  },
  {
    id: 'summit-push',
    title: 'Summit Push',
    subtitle: 'Task Manager and AI Pipeline',
    stats: {
      commits: 40,
      dayRange: 'Days 7-12',
      dateRange: 'Feb 28 - Mar 5, 2026',
      highlights: 8,
    },
    description: 'The first major feature push -- a full task management system with GitHub sync, an AI-native development pipeline, and the home page coming alive with dynamic content.',
    trailPosition: 27,
    changes: [
      { text: 'Task Manager with TASKS.md sync via GitHub API', category: 'feature', notable: true },
      { text: 'AI-native task pipeline: classify, spec, build, deploy -- all from the task view', category: 'feature', notable: true },
      { text: 'Auto-generated success criteria with tooltip on Approve Spec', category: 'feature' },
      { text: 'Target repos dropdown with preview and discard controls', category: 'feature' },
      { text: 'Full mobile parity pass -- touch targets, notifications, visible actions', category: 'design', notable: true },
      { text: 'Home page card grid organized by category', category: 'design' },
      { text: 'Command palette search relevance improvements', category: 'quality' },
      { text: 'Toast notifications and mini search UI on home page', category: 'feature' },
      { text: 'Credit card statement processor via Claude Files API', category: 'feature' },
      { text: 'Completed tasks auto-move to Done section', category: 'quality' },
    ],
  },
  {
    id: 'new-territory',
    title: 'New Territory',
    subtitle: 'Consulting Portal',
    stats: {
      commits: 80,
      dayRange: 'Days 13-16',
      dateRange: 'Mar 6-9, 2026',
      highlights: 15,
    },
    description: 'The biggest push of the entire project -- 9 portal versions in 4 days. From zero CRM to a full consulting command center with client management, deal pipeline, AI intelligence, and financial dashboards.',
    trailPosition: 50,
    changes: [
      { text: 'Consulting Portal v1.0: CRM foundation with client management', category: 'feature', notable: true },
      { text: 'v2.0: AI Features with intelligence summary and prompt library', category: 'feature', notable: true },
      { text: 'v3.0: Event Intelligence with Granola Notes sync', category: 'feature' },
      { text: 'v4.0: Activity Center with client time tracking', category: 'feature' },
      { text: 'v5.0: Task Manager with team task assignment', category: 'feature' },
      { text: 'v6.0: Pipeline View with drag-and-drop deal tracking', category: 'feature', notable: true },
      { text: 'v7.0: Financial Dashboard -- MRR, ARR, churn, payables tracking', category: 'feature' },
      { text: 'v8.0: Proposals, Pricing, Documents, and Settings UI', category: 'feature' },
      { text: 'v9.0: CRM Contact Profiles with embedded Notion forms', category: 'feature', notable: true },
      { text: 'Supabase integration with real-time CRM data sync', category: 'infrastructure', notable: true },
      { text: 'Granola Notes API for direct event intelligence sync', category: 'infrastructure' },
      { text: 'Custom theme provider with persistent Supabase user_metadata', category: 'infrastructure' },
      { text: 'Analytics tracking with custom UUID for user sessions', category: 'feature' },
      { text: 'Keyboard navigation for all modals and dropdown menus', category: 'quality' },
      { text: 'Mobile responsiveness for consulting portal modals and forms', category: 'design' },
    ],
  },
  {
    id: 'ridge-line',
    title: 'Ridge Line',
    subtitle: 'Infrastructure and Quality',
    stats: {
      commits: 60,
      dayRange: 'Days 17-18',
      dateRange: 'Mar 10-11, 2026',
      highlights: 8,
    },
    description: 'Shifting from feature velocity to structural integrity -- optimizing performance, extracting shared components, and adding the polish that separates a prototype from a product.',
    trailPosition: 65,
    changes: [
      { text: 'Drag-and-drop task reorganization with kanban-style board', category: 'feature', notable: true },
      { text: 'Real-time chat integration for proposals and team messaging', category: 'feature' },
      { text: 'Performance monitoring with real-time session analytics', category: 'infrastructure', notable: true },
      { text: 'Advanced filtering with saved filter presets on client list', category: 'feature' },
      { text: 'Field-level sync status indicators for real-time data', category: 'design' },
      { text: 'Vim-like command mode for the Task Manager', category: 'feature' },
      { text: 'Shared component extraction across consulting portal views', category: 'quality', notable: true },
      { text: 'Re-render optimization with memoization and context separation', category: 'quality' },
      { text: 'Search-across-all-data command in the command palette', category: 'feature' },
    ],
  },
  {
    id: 'alpine-crossing',
    title: 'Alpine Crossing',
    subtitle: 'Enterprise Depth',
    stats: {
      commits: 80,
      dayRange: 'Days 23-24',
      dateRange: 'Mar 16-17, 2026',
      highlights: 9,
    },
    description: 'Systematically deepening every view with production-grade error handling, skeleton loading states, validation, and accessibility -- transforming a working app into a resilient one.',
    trailPosition: 82,
    changes: [
      { text: 'Enterprise depth: Proposals, Pricing, Documents -- skeletons, validation, error handling', category: 'quality', notable: true },
      { text: 'Enterprise depth: Authentication -- validation, error states, loading, accessibility', category: 'quality' },
      { text: 'Enterprise depth: Contacts, Client Detail -- inline editing, tab skeletons, error handling', category: 'quality' },
      { text: 'Enterprise depth: Task Manager -- keyboard nav, sync error toasts, validation', category: 'quality' },
      { text: 'Enterprise depth: AI Features -- error boundaries, latency indicators, fallback states', category: 'quality' },
      { text: 'Enterprise depth: Analytics, Pipeline, Dashboard -- chart skeletons, aria-labels', category: 'quality' },
      { text: 'HubSpot-inspired CRM contacts with detail panel and inline editing', category: 'feature', notable: true },
      { text: 'Dashboard intelligence widget with dead code cleanup', category: 'feature' },
      { text: 'n8n workflow definitions for scheduled data syncs', category: 'infrastructure' },
      { text: 'Axe-core accessibility assertions and visual test specs', category: 'quality', notable: true },
    ],
  },
  {
    id: 'summit',
    title: 'Summit',
    subtitle: 'Production Hardening',
    stats: {
      commits: 54,
      dayRange: 'Days 25-26',
      dateRange: 'Mar 18-19, 2026',
      highlights: 10,
    },
    description: 'The final push to production -- multi-source sync, the AI learning flywheel, 1,831 tests, and a 100/100 quality score. From concept to shipped product in 26 days.',
    trailPosition: 100,
    changes: [
      { text: 'Multi-source task sync: Notion (bidirectional), Granola, Apple Reminders, Email, Calendar', category: 'infrastructure', notable: true },
      { text: 'AI learning flywheel with acceptance rates and trust levels', category: 'feature', notable: true },
      { text: '8 AI executors: classify, dev, research, comms, section, enrich, follow-up, deal-score', category: 'feature', notable: true },
      { text: '1,831 tests across 193 files with Vitest + React Testing Library', category: 'quality', notable: true },
      { text: 'Quality score: 100/100 -- zero lint errors, zero semgrep findings, zero vulnerabilities', category: 'quality', notable: true },
      { text: 'LaunchDarkly feature flags for progressive rollout', category: 'infrastructure' },
      { text: 'Contact enrichment pipeline via Claude with batch grouping by company', category: 'feature' },
      { text: 'Financial data sync via Monarch Money with Playwright automation', category: 'infrastructure' },
      { text: 'Vercel cron jobs: Notion daily sync, Granola daily sync, task queue every 5 minutes', category: 'infrastructure' },
      { text: 'MDD Docs site launched -- you are here', category: 'design', notable: true },
    ],
  },
];

/** Compute project stats from any era array (supports merged historical + synced data). */
export function computeProjectStats(allEras: TimelineEra[]) {
  const totalCommits = allEras.reduce((sum, era) => sum + era.stats.commits, 0);
  const totalDays = allEras.reduce((max, era) => {
    const match = era.stats.dayRange.match(/(\d+)/g);
    return match ? Math.max(max, ...match.map(Number)) : max;
  }, 0);
  return { totalCommits, totalDays, totalEras: allEras.length };
}

/** Total project stats derived from historical era data */
export const projectStats = {
  ...computeProjectStats(eras),
  dateRange: 'Feb 22 - Mar 19, 2026',
};
