import type { TimelineEntry } from './types';

export const changelogEntries: TimelineEntry[] = [
  {
    title: 'v1.0',
    subtitle: 'March 2026',
    content: (
      <>
        <p><strong>Initial release of MDD HQ documentation site.</strong></p>

        <h4>Site Launch</h4>
        <ul>
          <li>Docusaurus 3.9.2 with MDD terracotta theme</li>
          <li>27 documentation pages across 9 sidebar categories</li>
          <li>Interactive SyncFlowExplorer component for data source visualization</li>
          <li>Scroll-animated changelog timeline</li>
          <li>Grain texture and topographic pattern overlays</li>
        </ul>

        <h4>Content Documented</h4>
        <ul>
          <li>5 core features: Task Manager, Consulting CRM, Financial Health, CC Tracker, AI Automation</li>
          <li>AI Pipeline: task processor, 8 executors, learning flywheel</li>
          <li>6 integrations: Supabase, Notion, Granola, Apple Reminders, MS365, Monarch Money</li>
          <li>9 Vercel serverless API endpoints</li>
          <li>15+ Supabase database tables with schema documentation</li>
          <li>Environment variables, feature flags, deployment configuration</li>
          <li>1,831 tests across 193 files</li>
        </ul>

        <h4>Design System</h4>
        <ul>
          <li>Terracotta (#C85A3A) primary accent with ocean, eucalyptus, and coral secondary accents</li>
          <li>Inter (body), Libre Baskerville (headings), Space Grotesk (display) typography</li>
          <li>Subtle grain texture overlay and topographic map patterns</li>
          <li>Dark mode default with light mode support</li>
        </ul>
      </>
    ),
  },
];
