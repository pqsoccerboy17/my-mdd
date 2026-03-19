/** Types and static data for the SyncFlowExplorer data source comparison. */

export type SourceId = 'notion' | 'granola' | 'apple' | 'github' | 'email' | 'calendar';
export type SyncMode = 'bidirectional' | 'one-way' | 'webhook';

export interface SourceInfo {
  id: SourceId;
  label: string;
  icon: string;
  tagline: string;
}

export interface SyncDetail {
  source: SourceId;
  mode: SyncMode;
  note: string;
}

export interface SyncCapability {
  category: string;
  entries: Record<SourceId, SyncDetail>;
}

export interface SyncStep {
  title: string;
  description: string;
  tools: string[];
  tip?: string;
}

export interface SourceProfile {
  id: SourceId;
  steps: SyncStep[];
}

export const sources: SourceInfo[] = [
  {
    id: 'notion',
    label: 'Notion',
    icon: 'Database',
    tagline: 'Bidirectional task sync with status mapping',
  },
  {
    id: 'granola',
    label: 'Granola',
    icon: 'FileText',
    tagline: 'Meeting notes ingestion with stable block IDs',
  },
  {
    id: 'apple',
    label: 'Apple Reminders',
    icon: 'Bell',
    tagline: 'Bidirectional sync via Shortcuts webhooks',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: 'GitBranch',
    tagline: 'Task sync via tasks.md markdown file',
  },
  {
    id: 'email',
    label: 'Email',
    icon: 'Mail',
    tagline: 'Email-derived tasks via MS365 MCP',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: 'Calendar',
    tagline: 'MS365 calendar events synced as tasks',
  },
];

export const syncCapabilities: SyncCapability[] = [
  {
    category: 'Data Pulled',
    entries: {
      'notion': { source: 'notion', mode: 'bidirectional', note: 'Tasks with title, description, status, priority' },
      'granola': { source: 'granola', mode: 'one-way', note: 'Action items from meeting transcripts' },
      'apple': { source: 'apple', mode: 'bidirectional', note: 'Reminders with title, due date, completion' },
      'github': { source: 'github', mode: 'bidirectional', note: 'Tasks from tasks.md + issues and PRs' },
      'email': { source: 'email', mode: 'one-way', note: 'Action items extracted from emails' },
      'calendar': { source: 'calendar', mode: 'one-way', note: 'Meeting events with attendees' },
    },
  },
  {
    category: 'Frequency',
    entries: {
      'notion': { source: 'notion', mode: 'bidirectional', note: 'Daily cron (14:00 UTC) + manual trigger' },
      'granola': { source: 'granola', mode: 'one-way', note: 'Daily cron (14:15 UTC) + manual trigger' },
      'apple': { source: 'apple', mode: 'webhook', note: 'Webhook on reminder change via Shortcuts' },
      'github': { source: 'github', mode: 'bidirectional', note: 'On-demand via API' },
      'email': { source: 'email', mode: 'one-way', note: 'On-demand via /sync-email skill' },
      'calendar': { source: 'calendar', mode: 'one-way', note: 'On-demand via /sync-calendar skill' },
    },
  },
  {
    category: 'Target Table',
    entries: {
      'notion': { source: 'notion', mode: 'bidirectional', note: 'tasks + sync_state' },
      'granola': { source: 'granola', mode: 'one-way', note: 'tasks + sync_state' },
      'apple': { source: 'apple', mode: 'bidirectional', note: 'tasks + task_dismissals' },
      'github': { source: 'github', mode: 'bidirectional', note: 'tasks (via tasks.md)' },
      'email': { source: 'email', mode: 'one-way', note: 'tasks + task_dismissals' },
      'calendar': { source: 'calendar', mode: 'one-way', note: 'tasks + contacts' },
    },
  },
  {
    category: 'Sync Mode',
    entries: {
      'notion': { source: 'notion', mode: 'bidirectional', note: 'Pull updates + push completions back' },
      'granola': { source: 'granola', mode: 'one-way', note: 'Upsert with stable block-ID source_ids' },
      'apple': { source: 'apple', mode: 'bidirectional', note: 'Bidirectional via Shortcuts webhook' },
      'github': { source: 'github', mode: 'bidirectional', note: 'Pull from + push to tasks.md' },
      'email': { source: 'email', mode: 'one-way', note: 'Insert only, dedup by source_id' },
      'calendar': { source: 'calendar', mode: 'one-way', note: 'Insert only via sync-trigger' },
    },
  },
  {
    category: 'Auth Method',
    entries: {
      'notion': { source: 'notion', mode: 'bidirectional', note: 'NOTION_API_KEY + DB IDs' },
      'granola': { source: 'granola', mode: 'one-way', note: 'NOTION_API_KEY + GRANOLA_DB_ID' },
      'apple': { source: 'apple', mode: 'webhook', note: 'INGEST_API_KEY (webhook auth)' },
      'github': { source: 'github', mode: 'bidirectional', note: 'GITHUB_PAT' },
      'email': { source: 'email', mode: 'one-way', note: 'MS365 MCP (no OAuth)' },
      'calendar': { source: 'calendar', mode: 'one-way', note: 'MS365 MCP + INGEST_API_KEY' },
    },
  },
];

export const sourceProfiles: SourceProfile[] = [
  {
    id: 'notion',
    steps: [
      {
        title: '1. Trigger',
        description: 'Daily cron at 14:00 UTC calls /api/sync-notion, or manual via /api/sync-trigger',
        tools: ['Vercel Cron', 'sync-trigger API'],
      },
      {
        title: '2. Fetch',
        description: 'Query Notion API for tasks DB, pull pages modified since last sync timestamp',
        tools: ['Notion API', 'sync_state table'],
      },
      {
        title: '3. Transform',
        description: 'Map Notion status to MDD sections, extract title/description/priority/due date',
        tools: ['notion-sync.js', 'status mapping'],
      },
      {
        title: '4. Upsert',
        description: 'syncAndUpsert() with conflict detection -- both-changed flagging in task_meta.sync_conflict',
        tools: ['Supabase', 'syncAndUpsert()'],
        tip: 'Completions are pushed back to Notion via notion.pages.update()',
      },
      {
        title: '5. Route',
        description: 'New untagged tasks flagged for AI classification and scoring',
        tools: ['task-router.js', 'Claude Haiku'],
      },
    ],
  },
  {
    id: 'granola',
    steps: [
      {
        title: '1. Trigger',
        description: 'Daily cron at 14:15 UTC calls /api/sync-granola',
        tools: ['Vercel Cron'],
      },
      {
        title: '2. Fetch',
        description: 'Query Notion Granola DB for meeting notes with action items',
        tools: ['Notion API', 'NOTION_GRANOLA_DB_ID'],
      },
      {
        title: '3. Extract',
        description: 'Parse action item blocks from meeting transcripts, generate stable block-ID source_ids',
        tools: ['notion-sync.js', 'block parsing'],
      },
      {
        title: '4. Upsert',
        description: 'Upsert tasks with stable source_ids to prevent duplicate ingestion',
        tools: ['Supabase', 'deduplicateAndInsert()'],
      },
    ],
  },
  {
    id: 'apple',
    steps: [
      {
        title: '1. Trigger',
        description: 'Apple Shortcuts automation fires webhook on reminder changes',
        tools: ['Apple Shortcuts', 'Webhook'],
      },
      {
        title: '2. Receive',
        description: '/api/sync-apple receives POST with reminder data (title, due, completion)',
        tools: ['sync-apple API', 'INGEST_API_KEY auth'],
      },
      {
        title: '3. Transform',
        description: 'Map reminder fields to MDD task schema, check dismissals to prevent re-ingestion',
        tools: ['task_dismissals table'],
      },
      {
        title: '4. Sync',
        description: 'Bidirectional: new reminders create tasks, completed tasks update reminders',
        tools: ['Supabase', 'Apple Shortcuts'],
      },
    ],
  },
  {
    id: 'github',
    steps: [
      {
        title: '1. Trigger',
        description: 'On-demand via /api/tasks-github with action=read or action=write',
        tools: ['tasks-github API', 'GITHUB_PAT'],
      },
      {
        title: '2. Pull',
        description: 'Read tasks.md from GitHub repo, parse markdown into structured tasks',
        tools: ['GitHub API', 'Markdown parsing'],
      },
      {
        title: '3. Merge',
        description: 'Compare with local tasks, merge changes by updated_at timestamp (newest wins)',
        tools: ['Supabase', 'Conflict resolution'],
      },
      {
        title: '4. Push',
        description: 'Write updated tasks.md back to GitHub with completed/new tasks',
        tools: ['GitHub API', 'tasks-github API'],
      },
    ],
  },
  {
    id: 'email',
    steps: [
      {
        title: '1. Trigger',
        description: 'Run /sync-email Claude Code skill to fetch emails via MS365 MCP',
        tools: ['Claude Code', 'MS365 MCP'],
        tip: 'Uses MCP instead of OAuth due to Entra ID admin consent restrictions',
      },
      {
        title: '2. Extract',
        description: 'Claude extracts action items from email content and metadata',
        tools: ['Claude Haiku', 'MS365 MCP'],
      },
      {
        title: '3. Ingest',
        description: '/api/email-ingest receives extracted tasks with email source_ids',
        tools: ['email-ingest API', 'INGEST_API_KEY'],
      },
      {
        title: '4. Dedup',
        description: 'Insert only with dedup by source_id, check dismissals',
        tools: ['Supabase', 'task_dismissals'],
      },
    ],
  },
  {
    id: 'calendar',
    steps: [
      {
        title: '1. Trigger',
        description: 'Run /sync-calendar Claude Code skill to fetch MS365 calendar events',
        tools: ['Claude Code', 'MS365 MCP'],
      },
      {
        title: '2. Fetch',
        description: 'Pull calendar events with attendees, times, and meeting details',
        tools: ['MS365 MCP', 'calendar-helpers.js'],
      },
      {
        title: '3. Match',
        description: 'Match attendees to existing contacts via matchAttendeeToContact()',
        tools: ['contacts table', 'calendar-helpers.js'],
      },
      {
        title: '4. Ingest',
        description: 'POST events to /api/sync-trigger for task creation',
        tools: ['sync-trigger API', 'Supabase'],
      },
    ],
  },
];
