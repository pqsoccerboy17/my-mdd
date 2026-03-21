---
sidebar_position: 4
title: Apple Reminders
sidebar_label: Apple Reminders
---

# Apple Reminders

MDD HQ syncs bidirectionally with Apple Reminders through Apple Shortcuts webhooks. Unlike API-based integrations, Apple Reminders relies on an on-device Shortcut that pushes reminders to MDD and pulls back completions -- enabling capture from Siri, Apple Watch, or any Apple device.

## Sync Overview

| Property | Value |
|---|---|
| Endpoint | `/api/sync-apple` |
| Methods | `POST` (ingest), `GET` (fetch completions) |
| Direction | Bidirectional |
| Auth | `INGEST_API_KEY` (POST), `CRON_SECRET` (GET) |
| Source Key | `apple` |
| Schedule | On-demand (triggered by Apple Shortcut) |

## How It Works

The Apple Reminders sync uses a webhook-based architecture rather than direct API access, since Apple does not expose a public Reminders API. An Apple Shortcut runs on your device, collects reminders, and POSTs them to MDD.

### Sync Flow

1. **Apple Shortcut runs** -- Collects reminders from specified lists on the device
2. **POST to MDD** -- Sends reminders as JSON or pipe-delimited text to `/api/sync-apple`
3. **MDD ingests** -- Creates new tasks, updates changed ones, marks Apple completions in MDD
4. **MDD responds** -- Returns any tasks completed in MDD that need marking done in Apple
5. **Shortcut marks done** -- The Shortcut reads the response and completes those reminders locally

### Sync Loop Prevention

Bidirectional completion sync creates a potential loop: MDD marks a task done, pushes to Apple, Apple sends it back as completed, MDD tries to mark it done again. The `apple_synced_completion` flag in `task_meta` prevents this:

- When MDD pushes a completion to Apple, it sets `apple_synced_completion` with a timestamp
- When Apple sends back a completed reminder, MDD checks for this flag
- If the flag exists, MDD knows it originated the completion and skips the update

:::info
The Apple sync is event-driven, not scheduled. It only runs when the Apple Shortcut is triggered -- either manually or via an automation on the device.
:::

## Endpoints

### POST /api/sync-apple

Ingests reminders from the Apple Shortcut. Accepts two payload formats and returns completions to sync back.

**JSON payload:**

```json
{
  "reminders": [
    {
      "id": "reminder-uuid",
      "title": "Call dentist",
      "notes": "Schedule cleaning",
      "list": "Personal",
      "completed": false,
      "due_date": "2024-02-15"
    }
  ]
}
```

**Pipe-delimited text payload:**

For simpler Shortcut configurations, reminders can be sent as plain text with `|||` delimiters, one per line:

```
Call dentist|||Schedule cleaning|||Personal
Buy groceries|||Milk, eggs, bread|||Shopping
```

Format: `title|||notes|||list_name`

When using the text format, the reminder ID is auto-generated from `title:list_name`.

**Response:**

```json
{
  "source": "apple",
  "pull": {
    "created": 3,
    "skipped": 1,
    "completed": 0,
    "updated": 1
  },
  "complete_in_apple": ["reminder-uuid-1", "reminder-uuid-2"]
}
```

The `complete_in_apple` array contains reminder IDs that the Shortcut should mark as done in Apple Reminders.

### GET /api/sync-apple

Returns Apple-sourced tasks that were completed in MDD but not yet synced back to Reminders. Used by the Shortcut to poll for completions.

```json
{
  "complete_in_apple": [
    { "reminder_id": "uuid-1", "title": "Call dentist" },
    { "reminder_id": "uuid-2", "title": "Buy groceries" }
  ]
}
```

## Task Mapping

| Apple Field | MDD Column | Notes |
|---|---|---|
| `id` | `source_id` | Prefixed with `apple:` |
| `title` | `title` | Direct copy |
| `notes` | `description` | Truncated to 500 characters |
| `list` | `task_meta.apple_list` | Defaults to "Reminders" |
| `completed` | `completed` + `section` | Maps to `done` section |
| `due_date` | `task_meta.due_date` | Stored in metadata |
| - | `task_type` | Auto-classified via `classifyTask()` |
| - | `source` | Always `apple` |

## Ingest Behavior

The POST handler processes each reminder individually:

| Reminder State | MDD Action |
|---|---|
| New + active | Insert as new task in `active` section |
| New + completed | Skip (no need to import already-done items) |
| Existing + active + title changed | Update title in MDD |
| Existing + active + notes changed | Update description in MDD |
| Existing + completed in Apple | Mark done in MDD (unless `apple_synced_completion` set) |

:::tip
Notes are truncated to 500 characters on ingest. Keep reminder notes concise for the best sync experience.
:::

## Environment Variables

| Variable | Purpose |
|---|---|
| `INGEST_API_KEY` | Shared secret for POST auth (used in Shortcut headers) |
| `CRON_SECRET` | Auth token for GET completions endpoint |

## Related Pages

- [Data Sources](../features/task-data-sources) -- All task source overview
- [Sync Endpoints](../api/sync-endpoints) -- API endpoint documentation
- [Notion Sync](./notion-sync) -- Another bidirectional task sync
- [Tasks Schema](../data/tasks-schema) -- Task table details
