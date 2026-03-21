---
sidebar_position: 5
title: Granola Sync
sidebar_label: Granola Sync
---

# Granola Sync

MDD HQ imports action items from Granola meeting notes through a 3-hop pipeline: Granola writes notes to a Notion database, MDD reads that database and extracts action items, then inserts them as tasks. This read-only integration ensures every follow-up from a meeting lands in your task list automatically.

## Sync Overview

| Property | Value |
|---|---|
| Endpoint | `/api/sync-granola` |
| Method | `GET` |
| Direction | Notion to MDD (one-way) |
| Auth | `CRON_SECRET` |
| Source Key | `granola` |
| Schedule | Daily at 14:15 UTC (cron) |
| Sync Mode | `upsert` |

## Architecture: The 3-Hop Pipeline

Granola does not have a direct API. Instead, it syncs meeting notes to a dedicated Notion database, which MDD then reads.

```
Granola App  -->  Notion (Granola DB)  -->  MDD (tasks table)
   Hop 1              Hop 2                    Hop 3
```

1. **Hop 1: Granola to Notion** -- Granola's native integration pushes meeting notes (title, date, attendees, content) to a Notion database
2. **Hop 2: Notion query** -- MDD queries the Granola Notion database for pages edited since the last sync
3. **Hop 3: Action item extraction** -- MDD parses each page's block content, extracts action items, and inserts them as tasks

:::info
The Granola sync runs 15 minutes after the Notion task sync (14:15 UTC vs 14:00 UTC) to avoid Notion API rate limit contention.
:::

## How It Works

The `syncGranolaTasks` function in `notion-sync.js` handles the extraction and import.

### Step 1: Query Notion

Fetches pages from the Granola Notes database that have been edited since the last sync:

- Uses `NOTION_GRANOLA_DB_ID` as the database target
- Filters by `last_edited_time` after the stored sync state timestamp
- Fetches up to 20 pages per run, sorted by most recent first

### Step 2: Extract Action Items

For each meeting note page, MDD fetches the page's block children (up to 100 blocks) and scans for action items in three formats:

| Block Type | Detection Pattern |
|---|---|
| `to_do` (unchecked) | Any unchecked to-do block with text |
| `paragraph` | Lines starting with `action:`, `todo:`, `follow-up:`, `next step:`, or `task:` |
| `bulleted_list_item` | Same prefix patterns as paragraphs |

The action item text is cleaned by stripping the prefix keyword and delimiter before storing.

### Step 3: Insert Tasks

Each extracted action item becomes an MDD task:

```json
{
  "title": "Send proposal draft to client",
  "description": "From meeting: Q1 Planning Call (2024-01-15)",
  "source": "granola",
  "source_id": "granola:page-id:block-id",
  "task_type": "comms",
  "section": "active",
  "task_meta": {
    "meeting_title": "Q1 Planning Call",
    "meeting_date": "2024-01-15",
    "notion_url": "https://notion.so/pageid",
    "notion_page_id": "page-id",
    "source_updated_at": "2024-01-15T16:00:00Z"
  }
}
```

## Deduplication

Granola tasks use a block-ID based `source_id` format for stable deduplication:

```
granola:{notion_page_id}:{block_id}
```

This approach has key advantages over hash-based deduplication:

- **Stable across text edits** -- If you fix a typo in an action item, the block ID stays the same, so MDD updates the existing task instead of creating a duplicate
- **Unique per action item** -- Each to-do block or tagged paragraph has its own Notion block ID
- **Supports upsert** -- Because the ID is stable, the sync uses `upsert` mode and can update existing tasks when the source note changes

:::note
Earlier versions of the Granola sync used `insert_only` mode with hash-based IDs (note ID + action item index). The current implementation uses `upsert` mode with block-ID based source IDs for better accuracy.
:::

## Task Properties

| Property | Source | Mapping |
|---|---|---|
| Title | Action item text | Cleaned of prefix keywords |
| Description | Meeting metadata | `From meeting: {title} ({date})` |
| Source | - | Always `granola` |
| Source ID | Notion block ID | `granola:{page_id}:{block_id}` |
| Section | - | Default `active` |
| Task Type | - | Auto-classified via `classifyTask()` |
| Meeting Title | Page title property | Stored in `task_meta` |
| Meeting Date | Page date property | Falls back to page created_time |
| Notion URL | Page ID | Constructed link to the source note |

## Sync State

After each run, the sync records metadata for monitoring:

| Field | Value |
|---|---|
| `last_pull_at` | Timestamp of this sync run |
| `pull_stats` | Created, updated, skipped counts |
| `meetings_scanned` | Number of Notion pages processed |
| `action_items_found` | Total action items extracted |

## Environment Variables

| Variable | Purpose |
|---|---|
| `NOTION_API_KEY` | Notion integration token (shared with Notion sync) |
| `NOTION_GRANOLA_DB_ID` | Notion database ID for Granola meeting notes |
| `CRON_SECRET` | Auth token for cron-triggered endpoint |

## Related Pages

- [Notion Sync](./notion-sync) -- Parent Notion integration and sync infrastructure
- [Data Sources](../features/task-data-sources) -- All task source overview
- [Sync Endpoints](../api/sync-endpoints) -- API endpoint documentation
- [AI Pipeline](../ai-pipeline/overview) -- How imported tasks are classified
- [Tasks Schema](../data/tasks-schema) -- Task table details
