/** Recent highlights for the What's New section on the homepage. */

export interface WhatsNewItem {
  title: string;
  description: string;
  href: string;
  date: string;
  category: 'docs' | 'feature' | 'data';
}

export const whatsNewItems: WhatsNewItem[] = [
  {
    title: 'Integration Docs',
    description: '5 new pages covering GitHub, Apple Reminders, Granola, Email, and Calendar sync.',
    href: '/integrations/github-sync',
    date: 'Mar 2026',
    category: 'docs',
  },
  {
    title: 'Visual Roadmap Planner',
    description: 'Interactive roadmap with timeline, dependency graph, and kanban views.',
    href: '/roadmap',
    date: 'Mar 2026',
    category: 'feature',
  },
  {
    title: 'Roadmap Audit',
    description: '9 roadmap items verified and promoted to shipped status.',
    href: '/roadmap',
    date: 'Mar 2026',
    category: 'data',
  },
  {
    title: 'Sync Flow Explorer',
    description: 'Interactive comparison of how 6 data sources feed into the task inbox.',
    href: '/features/task-data-sources',
    date: 'Mar 2026',
    category: 'feature',
  },
];
