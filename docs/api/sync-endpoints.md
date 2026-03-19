---
sidebar_position: 2
title: Sync Endpoints
sidebar_label: Sync Endpoints
---

# Sync Endpoints

The sync endpoints form the data ingestion layer of MDD HQ. They pull tasks from external sources, normalize them into the common task schema, handle deduplication, and write results to Supabase. All sync endpoints are idempotent -- running them multiple times produces the same result.

## sync-trigger

The orchestrator endpoint that triggers all sync operations in sequence.

| Property | Value |
|---|---|
| **Path** | `/api/sync-trigger` |
| **Method** | POST |
| **Auth** | `INGEST_API_KEY` (x-api-key header) |
| **Trigger** | Manual (command palette, external script) |

### What It Does

1. Validates the API key
2. Calls `sync-notion` and waits for completion
3. Calls `sync-granola` and waits for completion
4. Calls `sync-apple` if Apple sync is configured
5. Returns a summary of all sync results

### Request

```bash
curl -X POST https://mdd-hq.vercel.app/api/sync-trigger \
  -H "x-api-key: YOUR_INGEST_API_KEY"
```

### Response

```json
{
  "status": "completed",
  "results": {
    "notion": { "synced": 12, "new": 3, "updated": 2, "skipped": 7 },
    "granola": { "synced": 5, "new": 2, "updated": 0, "skipped": 3 },
    "apple": { "synced": 0, "new": 0, "updated": 0, "skipped": 0 }
  },
  "duration_ms": 4500
}
```

### Error Handling

If any individual sync fails, the trigger continues with the remaining syncs and includes the error in the response:

```json
{
  "status": "partial",
  "results": {
    "notion": { "error": "Notion API rate limited" },
    "granola": { "synced": 5, "new": 2, "updated": 0, "skipped": 3 }
  }
}
```

:::tip
Use `sync-trigger` instead of calling individual sync endpoints directly. It handles sequencing and delay between syncs to avoid API rate limits.
:::

---

## sync-notion

Syncs tasks from the Notion Tasks database to the MDD `tasks` table.

| Property | Value |
|---|---|
| **Path** | `/api/sync-notion` |
| **Method** | GET |
| **Auth** | `CRON_SECRET` (Authorization header) |
| **Trigger** | Vercel cron (daily at 14:00 UTC) |

### What It Reads

- Notion Tasks database (identified by `NOTION_TASKS_DB_ID`)
- All pages with their properties: title, status, priority, tags, dates, assignments
- Only pages modified since the last sync (delta sync via `sync_state`)

### What It Writes

| Table | Operation | Description |
|---|---|---|
| `tasks` | Upsert | Creates new tasks or updates existing ones |
| `sync_state` | Update | Records the sync timestamp for `notion` source |
| `task_dismissals` | Read | Checks dismissed source_ids to skip |

### Processing Steps

1. Read `sync_state` for the `notion` source to get `last_synced_at`
2. Query the Notion API for pages modified after `last_synced_at`
3. For each page:
   a. Map Notion properties to MDD task schema
   b. Check if `source_id` exists in `task_dismissals` (skip if dismissed)
   c. Check if a task with this `source_id` already exists
   d. If new: insert with source `notion`
   e. If existing and Notion is newer: update the task
   f. If existing and MDD is newer: check for conflict
4. Handle completion push-back (MDD done -> Notion done)
5. Update `sync_state` with current timestamp

### Conflict Detection

If a task has been modified in both Notion and MDD since the last sync:

- The `sync_conflict` field in `task_meta` is populated
- The task is NOT overwritten in either direction
- The user must manually resolve the conflict in the UI

### Environment Variables Used

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Notion API authentication |
| `NOTION_TASKS_DB_ID` | Target Notion database |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_SERVICE_KEY` | Database auth (bypasses RLS) |

---

## sync-granola

Syncs meeting notes and action items from Granola (via its Notion database) to MDD tasks.

| Property | Value |
|---|---|
| **Path** | `/api/sync-granola` |
| **Method** | GET |
| **Auth** | `CRON_SECRET` (Authorization header) |
| **Trigger** | Vercel cron (daily at 14:15 UTC) |

### What It Reads

- Granola Notes database in Notion (identified by `NOTION_GRANOLA_DB_ID`)
- Meeting note pages with action items, participants, and meeting metadata
- Only notes modified since the last sync

### What It Writes

| Table | Operation | Description |
|---|---|---|
| `tasks` | Insert only | Creates new tasks (does not update existing) |
| `sync_state` | Update | Records the sync timestamp for `granola` source |
| `task_dismissals` | Read | Checks dismissed source_ids to skip |

### Processing Steps

1. Read `sync_state` for the `granola` source
2. Query the Notion API for Granola note pages modified since last sync
3. For each note:
   a. Extract action items from the note content
   b. For each action item, create a `source_id` using `granola-{noteId}-{index}`
   c. Check if dismissed or already exists
   d. Insert new tasks with source `granola`
4. Update `sync_state`

### Key Differences from Notion Sync

| Aspect | sync-notion | sync-granola |
|---|---|---|
| Sync mode | `upsert` (bidirectional) | `insert_only` (one-way) |
| Push-back | Yes (completion push-back) | No |
| Conflict detection | Yes | No (insert only) |
| Source key | `notion` | `granola` |
| Database | Tasks DB | Granola Notes DB |

:::info
The 15-minute offset between Notion sync (14:00 UTC) and Granola sync (14:15 UTC) prevents both endpoints from competing for Notion API rate limits simultaneously.
:::

### Environment Variables Used

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Notion API authentication |
| `NOTION_GRANOLA_DB_ID` | Target Granola Notion database |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_SERVICE_KEY` | Database auth |

---

## sync-apple

Syncs Apple Reminders into MDD tasks via Apple Shortcuts webhooks.

| Property | Value |
|---|---|
| **Path** | `/api/sync-apple` |
| **Method** | POST (webhook) / GET (cron) |
| **Auth** | `INGEST_API_KEY` |
| **Trigger** | Apple Shortcut webhook + backup cron |

### How Apple Integration Works

Apple Reminders does not have a public API. The integration uses Apple Shortcuts as a bridge:

1. An Apple Shortcut runs on the user's iPhone/Mac
2. The Shortcut reads reminders and formats them as JSON
3. The Shortcut sends a POST request to `/api/sync-apple` with the reminder data
4. MDD processes the data and creates/updates tasks

### What It Reads (from request body)

```json
{
  "reminders": [
    {
      "id": "apple-reminder-uuid",
      "title": "Pick up dry cleaning",
      "dueDate": "2024-01-20T10:00:00Z",
      "priority": 1,
      "completed": false,
      "list": "Personal"
    }
  ]
}
```

### What It Writes

| Table | Operation | Description |
|---|---|---|
| `tasks` | Upsert | Creates or updates tasks from reminders |
| `sync_state` | Update | Records sync timestamp for `apple` source |
| `task_dismissals` | Read | Checks dismissed source_ids |

### Processing Steps

1. Validate the API key
2. Parse the reminder data from the request body
3. For each reminder:
   a. Use the Apple reminder ID as `source_id`
   b. Check dismissals
   c. Map reminder fields to MDD task schema
   d. Upsert into the tasks table
4. Update sync_state

### Reminder to Task Mapping

| Apple Field | MDD Field | Notes |
|---|---|---|
| `id` | `source_id` | Prefixed with source key |
| `title` | `title` | Direct copy |
| `dueDate` | `task_meta.due_date` | Stored in metadata |
| `priority` | `task_meta.apple_priority` | 1=high, 5=medium, 9=low |
| `completed` | `completed` | Direct mapping |
| `list` | `task_meta.apple_list` | The reminder list name |

### GET Method (Backup Cron)

The GET method allows a scheduled cron to trigger the sync. Since Apple Shortcuts may not always fire reliably, the cron provides a backup mechanism. The GET handler checks if there is cached reminder data from a recent POST and reprocesses it if the last sync is stale.

### Environment Variables Used

| Variable | Purpose |
|---|---|
| `INGEST_API_KEY` | Webhook authentication |
| `SUPABASE_URL` | Database connection |
| `SUPABASE_SERVICE_KEY` | Database auth |

---

## Common Patterns

### Idempotency

All sync endpoints are idempotent. The `source` + `source_id` combination uniquely identifies each external item. Running a sync multiple times with the same source data produces the same database state.

### Deduplication

```
1. Fetch items from source
2. For each item, compute source_id
3. Check: is source_id in task_dismissals? -> skip
4. Check: does a task with this source + source_id exist?
   a. No -> insert new task
   b. Yes + source is newer -> update task
   c. Yes + MDD is newer -> skip (or flag conflict)
```

### Error Isolation

Each sync endpoint handles its own errors independently. A failure in `sync-notion` does not affect `sync-granola`. The `sync-trigger` orchestrator captures errors and continues with remaining syncs.

## Related Pages

- [API Overview](./overview) - All endpoints reference
- [Data Sources](../features/task-data-sources) - Source-level documentation
- [Notion Sync](../integrations/notion-sync) - Detailed Notion integration
- [Tasks Schema](../data/tasks-schema) - Task table structure
