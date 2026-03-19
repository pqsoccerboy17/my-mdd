---
sidebar_position: 2
title: Tasks Schema
sidebar_label: Tasks Schema
---

# Tasks Schema

This page documents the database tables that power the task management system and AI pipeline: `tasks`, `task_queue`, `task_decisions`, `task_dismissals`, and `sync_state`.

## tasks

The core table storing all tasks from every source. This is the most queried table in the database.

### Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `title` | text | No | - | Task title |
| `description` | text | Yes | null | Task description or details |
| `section` | text | No | 'active' | Lifecycle section (see enum below) |
| `completed` | boolean | No | false | Whether the task is done |
| `sort_order` | integer | No | 0 | Manual sort position within section |
| `updated_at` | timestamptz | No | now() | Last modification timestamp |
| `created_at` | timestamptz | No | now() | Record creation timestamp |
| `task_type` | text | Yes | null | Task type classification (see enum below) |
| `pipeline_status` | text | Yes | null | Dev pipeline stage (see enum below) |
| `source` | text | No | 'manual' | Where the task originated (see enum below) |
| `source_id` | text | Yes | null | Unique ID from the source system |
| `task_meta` | jsonb | Yes | null | Flexible metadata (AI fields, sync data) |

### Section Enum

| Value | Description |
|---|---|
| `active` | Actively being worked on |
| `waiting` | Blocked or waiting on someone |
| `someday` | Deferred for future consideration |
| `done` | Completed |

### Task Type Enum

| Value | Description |
|---|---|
| `dev` | Development tasks (code, bugs, features) |
| `comms` | Communication tasks (emails, follow-ups) |
| `research` | Research and analysis tasks |
| `manual` | General tasks |

### Pipeline Status Enum

Only applicable when `task_type` is `dev`:

| Value | Description |
|---|---|
| `backlog` | Identified but not prioritized |
| `ready` | Prioritized and ready to start |
| `in-progress` | Actively being worked on |
| `review` | Awaiting review |
| `done` | Fully complete |

### Source Enum

| Value | Description |
|---|---|
| `manual` | Created directly in the UI |
| `email` | Ingested from email |
| `notion` | Synced from Notion Tasks database |
| `granola` | Synced from Granola meeting notes |
| `github` | Synced from GitHub issues/PRs |
| `apple` | Synced from Apple Reminders |
| `notion-stakeholders` | Synced from Notion Contacts |
| `ms365` | Synced from MS365 Calendar |
| `monarch` | Related to Monarch Money financial data |

### task_meta JSONB Fields

The `task_meta` column stores flexible metadata. Common fields include:

#### AI Classification Fields

| Field | Type | Description |
|---|---|---|
| `ai_type` | string | AI-suggested task type |
| `ai_section` | string | AI-suggested section |
| `ai_priority` | string | AI-suggested priority |
| `ai_confidence` | number | Classification confidence (0.0-1.0) |
| `classified_at` | string | ISO timestamp of last classification |
| `classification_version` | number | Version of the classification model |

#### Sync Fields

| Field | Type | Description |
|---|---|---|
| `sync_conflict` | object | Conflict data when MDD and source diverge |
| `notion_page_id` | string | Notion page ID (for Notion-sourced tasks) |
| `notion_url` | string | Direct link to the Notion page |
| `github_url` | string | Direct link to the GitHub issue/PR |
| `github_repo` | string | Repository name for GitHub tasks |
| `granola_note_id` | string | Granola note ID |
| `email_from` | string | Sender address for email tasks |
| `email_subject` | string | Original email subject |
| `last_synced_at` | string | ISO timestamp of last sync |

#### Pipeline Fields

| Field | Type | Description |
|---|---|---|
| `pipeline_entered_at` | string | When the task entered the pipeline |
| `stage_history` | array | Array of objects with stage and entered_at fields |
| `estimated_effort` | string | AI-estimated effort (small, medium, large) |

---

## task_queue

The AI processing queue. Each record represents a request for an AI executor to process something.

### Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `task_type` | text | No | - | Executor type to run (classify, dev, research, etc.) |
| `title` | text | No | - | Human-readable description of the queued action |
| `params` | jsonb | Yes | null | Input parameters for the executor |
| `status` | text | No | 'pending' | Queue status: pending, claimed, processing, completed, failed |
| `progress_pct` | integer | Yes | 0 | Progress percentage (0-100) |
| `current_step` | text | Yes | null | Current processing step description |
| `result_summary` | text | Yes | null | Executor result summary |
| `error_message` | text | Yes | null | Error details (null on success) |
| `requested_by` | text | Yes | null | Who queued the task |
| `started_at` | timestamptz | Yes | null | When processing began |
| `completed_at` | timestamptz | Yes | null | When processing finished |
| `created_at` | timestamptz | No | now() | When the task was queued |

### params JSONB Fields

The `params` field varies by executor type:

| Executor | Common params Fields |
|---|---|
| classify | `taskId`, `currentType`, `currentSection` |
| dev | `taskId`, `description`, `repoContext` |
| research | `taskId`, `question`, `clientId` |
| comms | `taskId`, `recipientEmail`, `conversationHistory` |
| section | `taskId`, `currentSection`, `taskAge` |
| enrich | `contactId`, `companyId`, `batchMode` |
| follow-up | `clientId`, `dealId`, `lastActivityDate` |
| deal-score | `dealId`, `includeHistory` |
| briefing | `clientId`, `meetingDate` |

### Status Lifecycle

```
pending -> claimed -> processing -> completed
                                 -> failed
```

- **pending** - Waiting to be picked up by the task-process cron
- **claimed** - Atomically claimed by a processor instance
- **processing** - Executor is running
- **completed** - Executor finished successfully
- **failed** - Executor encountered an error

---

## task_decisions

Stores every human decision on AI suggestions for the learning flywheel.

### Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | uuid | No | gen_random_uuid() | Primary key |
| `task_id` | uuid | Yes | null | Reference to the task |
| `queue_id` | uuid | Yes | null | Reference to the task_queue record |
| `executor_type` | text | No | - | Which executor produced the suggestion |
| `decision` | text | No | - | accepted, rejected, or modified |
| `ai_suggestion` | jsonb | Yes | null | What the AI suggested |
| `human_result` | jsonb | Yes | null | What the human chose (for modifications) |
| `context` | jsonb | Yes | null | Additional context at decision time |
| `created_at` | timestamptz | No | now() | When the decision was made |

### Decision Values

| Value | Description |
|---|---|
| `accepted` | User accepted the AI suggestion as-is |
| `rejected` | User rejected the AI suggestion entirely |
| `modified` | User modified the suggestion before accepting |

---

## task_dismissals

Tracks dismissed synced tasks to prevent them from being re-imported on the next sync cycle.

### Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `source_id` | text | No | - | **Primary key** - the source_id of the dismissed task |
| `dismissed_at` | timestamptz | No | now() | When the task was dismissed |

:::note
This table uses `source_id` as its primary key, not a UUID. This makes lookups during sync operations efficient -- the sync function can check if a source_id exists in this table with a simple primary key lookup.
:::

### How Dismissals Work

1. User dismisses a synced task in the UI
2. The task's `source_id` is inserted into `task_dismissals`
3. On the next sync cycle, the sync endpoint queries `task_dismissals`
4. Any incoming tasks whose `source_id` matches a dismissal are skipped
5. The dismissed task never reappears in the MDD inbox

---

## sync_state

Tracks the last successful sync timestamp for each data source.

### Columns

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `source` | text | No | - | **Primary key** - the data source name |
| `last_synced_at` | timestamptz | No | now() | Last successful sync timestamp |
| `last_result` | jsonb | Yes | null | Summary of the last sync (items synced, errors) |
| `updated_at` | timestamptz | No | now() | When this record was last modified |

### Source Values

| Value | Description |
|---|---|
| `notion` | Notion task sync |
| `granola` | Granola notes sync |
| `apple` | Apple Reminders sync |
| `github` | GitHub sync |
| `email` | Email ingestion |
| `contacts` | Notion contacts sync |

### Usage

The sync_state table enables delta syncs. Instead of re-processing all source data on every run, sync endpoints can query only items modified after `last_synced_at`. This reduces API calls and processing time.

---

## Indexes

Key indexes on the tasks table:

| Index | Columns | Purpose |
|---|---|---|
| Primary key | `id` | Record lookup |
| Source lookup | `source`, `source_id` | Deduplication during sync |
| Section filter | `section` | Section-based queries |
| Updated sort | `updated_at` | Conflict resolution, recent items |
| Type filter | `task_type` | Type-based filtering |

## Related Pages

- [Schema Overview](./overview) - Entity-relationship diagram
- [Task Manager](../features/task-manager) - How tasks are displayed
- [Task Processor](../ai-pipeline/task-processor) - How task_queue is processed
- [Learning Flywheel](../ai-pipeline/learning-flywheel) - How task_decisions feed back
- [Notion Sync](../integrations/notion-sync) - How sync_state is used
