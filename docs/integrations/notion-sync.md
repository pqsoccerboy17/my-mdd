---
sidebar_position: 2
title: Notion Sync
sidebar_label: Notion Sync
---

# Notion Sync

MDD HQ maintains a bidirectional sync with Notion for tasks, meeting notes (via Granola), and contacts. The sync system handles status mapping, conflict detection, and completion push-back -- ensuring both systems stay consistent without manual intervention.

## Sync Overview

| Sync Type | Endpoint | Direction | Schedule | Source Key |
|---|---|---|---|---|
| Tasks | `/api/sync-notion` | Bidirectional | Daily 14:00 UTC | `notion` |
| Granola Notes | `/api/sync-granola` | Notion to MDD | Daily 14:15 UTC | `granola` |
| Contacts | `sync-contacts.js` | Notion to MDD | Manual | `notion-stakeholders` |

## Task Sync: syncNotionTasks

The `syncNotionTasks` function is the core of the Notion task integration. It performs bidirectional sync between the Notion Tasks database and the MDD tasks table.

### Read Direction (Notion to MDD)

1. **Query Notion** - Fetch all pages from the Notion Tasks database using the Notion API
2. **Map properties** - Convert Notion page properties to MDD task schema fields
3. **Detect duplicates** - Check `source_id` (Notion page ID) against existing tasks
4. **Upsert** - Insert new tasks or update existing ones if the Notion version is newer
5. **Update sync_state** - Record the sync timestamp for next-run delta detection

### Write Direction (MDD to Notion)

When a task is completed in MDD:

1. **Detect completion** - The sync function identifies tasks marked `completed: true` that were sourced from Notion
2. **Push back** - Updates the corresponding Notion page status to the "Done" equivalent
3. **Confirm** - Verifies the Notion update succeeded before marking the push-back complete

This completion push-back ensures that tasks completed in MDD do not reappear as active on the next sync.

## Status Mapping

Notion and MDD use different status taxonomies. Helper functions map between them:

### Notion to MDD Mapping

| Notion Status | MDD Section | MDD Completed |
|---|---|---|
| Not Started | `active` | false |
| In Progress | `active` | false |
| Blocked | `waiting` | false |
| On Hold | `waiting` | false |
| Deferred | `someday` | false |
| Later | `someday` | false |
| Done | `done` | true |
| Archived | `done` | true |

### MDD to Notion Mapping

| MDD Section + Completed | Notion Status |
|---|---|
| `active` + false | In Progress |
| `waiting` + false | Blocked |
| `someday` + false | Deferred |
| `done` + true | Done |

The mapping functions are maintained as helpers that can be updated when either system's status options change.

## syncAndUpsert Modes

The `syncAndUpsert()` function supports two modes for handling existing records:

| Mode | Behavior | Use Case |
|---|---|---|
| `insert_only` | Only create new records, never update existing ones | First-time imports, sources where MDD edits should not be overwritten |
| `upsert` | Create new records and update existing ones if source is newer | Regular sync where the external source is authoritative |

### Mode Selection

- **Notion tasks** use `upsert` mode because Notion may have updates that should flow to MDD
- **Granola notes** use `insert_only` mode because once a meeting note action item is imported, MDD owns it
- **Contacts** use `upsert` mode to keep contact information current

## Conflict Detection

When a task has been modified in both Notion and MDD since the last sync, a conflict is detected:

### Detection Logic

1. Compare the task's `updated_at` in MDD with the Notion page's `last_edited_time`
2. Compare both against the last successful sync timestamp from `sync_state`
3. If both have changed since the last sync, flag as a conflict

### Conflict Handling

When a conflict is detected:

- A `sync_conflict` flag is set in the task's `task_meta` JSONB field
- The conflict includes both the MDD version and the Notion version
- The task appears with a conflict indicator in the Task Manager UI
- The user can manually resolve by choosing which version to keep

```json
{
  "sync_conflict": {
    "detected_at": "2024-01-15T14:00:00Z",
    "mdd_version": {
      "title": "Update API documentation",
      "section": "active",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "notion_version": {
      "title": "Update API docs (priority)",
      "status": "In Progress",
      "last_edited_time": "2024-01-15T11:00:00Z"
    }
  }
}
```

:::note
Conflicts are rare in practice because MDD is the primary work surface for tasks. They typically occur when someone edits a Notion page directly (e.g., via mobile) while MDD is also being used.
:::

## Granola Sync: syncGranolaTasks

Granola is a meeting notes application that syncs its output to a dedicated Notion database. MDD reads from this Notion database to import action items.

### How It Works

1. **Query Notion** - Fetch pages from the Granola Notes database (`NOTION_GRANOLA_DB_ID`)
2. **Extract action items** - Parse meeting note content for action items and follow-ups
3. **Map to tasks** - Convert each action item to an MDD task with source `granola`
4. **Insert only** - Use `insert_only` mode (Granola notes do not update after creation)
5. **Deduplication** - Use the Granola note ID + action item index as `source_id`

### Granola Task Properties

| Property | Source | Mapping |
|---|---|---|
| Title | Action item text | Direct copy |
| Description | Meeting context + participants | Constructed from note metadata |
| Source | - | Always `granola` |
| Section | - | Default `active` |
| Task type | - | Determined by classify executor |
| Source ID | Granola note ID + index | e.g., `granola-abc123-0` |

## Contact Sync: sync-contacts.js

Contact sync pulls stakeholder data from a Notion contacts database into the MDD `contacts` table.

### How It Works

1. **Query Notion** - Fetch pages from the Contacts database (`NOTION_CONTACTS_DB_ID`)
2. **Map properties** - Convert Notion properties (name, email, company, role) to MDD contact schema
3. **Match companies** - Link contacts to existing MDD client records by company name
4. **Upsert** - Create new contacts or update existing ones

### Contact Properties

| Notion Property | MDD Column | Notes |
|---|---|---|
| Name | `name` | Full name |
| Email | `email` | Primary email |
| Company | `company` + client link | Matched against clients table |
| Title | `title` | Job title |
| Phone | `phone` | Phone number |
| Notes | `notes` | Free-form notes |

## Rate Limiting

The Notion API has rate limits (3 requests per second for the standard plan). The sync functions handle this:

- **Sequential pagination** - Pages are fetched sequentially, not in parallel
- **Backoff on 429** - If a rate limit response is received, the sync waits before retrying
- **Batch size** - Each sync processes all pages but with controlled request pacing
- **Daily schedule** - The daily cron schedule naturally limits how often the API is called

:::tip
If you need to trigger a manual sync, use the `/api/sync-trigger` endpoint rather than calling `/api/sync-notion` directly. The trigger endpoint orchestrates all syncs in sequence with appropriate delays.
:::

## Environment Variables

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Notion integration token |
| `NOTION_TASKS_DB_ID` | Notion Tasks database ID |
| `NOTION_GRANOLA_DB_ID` | Notion Granola Notes database ID |
| `NOTION_CONTACTS_DB_ID` | Notion Contacts database ID |

## Related Pages

- [Data Sources](../features/task-data-sources) - All task source overview
- [Sync Endpoints](../api/sync-endpoints) - API endpoint documentation
- [Tasks Schema](../data/tasks-schema) - Task table details
- [Supabase](./supabase) - Database integration details
