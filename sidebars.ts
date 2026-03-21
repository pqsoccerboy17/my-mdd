import type {SidebarsConfig} from '@docusaurus/types';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'home',
    {
      type: 'category',
      label: 'Overview',
      collapsible: false,
      collapsed: false,
      items: [
        'overview/what-is-mdd',
        'overview/tech-stack',
        'overview/architecture',
        'overview/keyboard-shortcuts',
      ],
    },
    {
      type: 'category',
      label: 'Features',
      collapsible: false,
      collapsed: false,
      items: [
        'features/task-manager',
        'features/task-data-sources',
        'features/consulting-portal',
        'features/financial-health',
        'features/cc-tracker',
        'features/ai-automation',
        'features/platform',
      ],
    },
    {
      type: 'category',
      label: 'AI Pipeline',
      collapsible: false,
      collapsed: false,
      items: [
        'ai-pipeline/overview',
        'ai-pipeline/task-processor',
        'ai-pipeline/executors',
        'ai-pipeline/learning-flywheel',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      collapsible: false,
      collapsed: false,
      items: [
        'integrations/supabase',
        'integrations/notion-sync',
      ],
    },
    {
      type: 'category',
      label: 'Database Reference',
      collapsible: false,
      collapsed: false,
      items: [
        'data/overview',
        'data/tasks-schema',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      collapsible: false,
      collapsed: false,
      items: [
        'api/overview',
        'api/sync-endpoints',
      ],
    },
    {
      type: 'category',
      label: 'Configuration',
      collapsible: false,
      collapsed: false,
      items: [
        'config/environment',
        'config/feature-flags',
        'config/vercel-deployment',
        'config/dev-setup',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsible: false,
      collapsed: false,
      items: [
        'guides/getting-started',
        'guides/testing',
      ],
    },
    {
      type: 'category',
      label: 'Roadmap',
      collapsible: false,
      collapsed: false,
      items: [
        'roadmap/visual-planner',
        'roadmap/wishlist',
        'roadmap/changelog',
      ],
    },
  ],
};

export default sidebars;
