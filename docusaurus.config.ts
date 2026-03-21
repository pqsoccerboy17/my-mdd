import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'MDD Docs',
  tagline: 'Personal Dashboard Knowledge Base',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
  },

  url: 'https://my-mdd.vercel.app',
  baseUrl: '/',

  organizationName: 'pqsoccerboy17',
  projectName: 'my-mdd',

  onBrokenLinks: 'throw',

  headTags: [
    { tagName: 'link', attributes: { rel: 'apple-touch-icon', sizes: '180x180', href: '/img/apple-touch-icon.png' } },
    { tagName: 'link', attributes: { rel: 'manifest', href: '/manifest.json' } },
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#1A1F2E' } },
  ],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@500;600;700&display=swap',
      type: 'text/css',
    },
  ],

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  themes: [
    '@docusaurus/theme-mermaid',
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        docsRouteBasePath: '/',
        indexBlog: false,
        indexPages: false,
        highlightSearchTermsOnTargetPage: true,
        searchBarShortcutHint: true,
        searchResultLimits: 8,
        searchResultContextMaxLength: 60,
        explicitSearchResultPath: true,
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl: 'https://github.com/pqsoccerboy17/my-mdd/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'MDD Docs',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://mdd-hq.vercel.app',
          label: 'MDD HQ',
          position: 'right',
        },
        {
          href: 'https://github.com/pqsoccerboy17/my-mdd',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {},
    metadata: [
      { name: 'description', content: 'Documentation for MDD HQ -- a personal productivity dashboard combining task management, consulting CRM, financial health tracking, and AI automation.' },
      { property: 'og:title', content: 'MDD Docs' },
      { property: 'og:description', content: 'Documentation for MDD HQ -- a personal productivity dashboard combining task management, consulting CRM, financial health tracking, and AI automation.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://my-mdd.vercel.app' },
      { name: 'twitter:card', content: 'summary' },
    ],
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {
      theme: {light: 'neutral', dark: 'dark'},
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
