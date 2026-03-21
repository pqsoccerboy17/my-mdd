---
sidebar_position: 7
title: Calendar Sync
sidebar_label: Calendar Sync
---

# Calendar Sync

MDD HQ syncs calendar events from MS365 Outlook into the `activities` table, creating a timeline of meetings alongside email and other interactions. Each event is mapped to an activity record with attendee-to-contact matching, enabling CRM-style views of client engagement.

## Sync Overview

| Property | Value |
|---|---|
| Module | `_lib/calendar-helpers.js` |
| Direction | MS365 to MDD (one-way) |
| Source Key | `ms365` |
| Activity Type | `meeting` |
| Target Table | `activities` |
| Sync State Key | `calendar-ms365` |

## How It Works

The calendar sync is a library module called by the sync orchestrator. It receives raw calendar events (in MS365 format), maps them to activity records, matches attendees to known contacts, and upserts into the activities table.

### Sync Flow

1. **Events fetched** -- The sync orchestrator retrieves calendar events via the MS365 MCP server
2. **Events mapped** -- Each event is transformed to the MDD activity schema via `mapCalendarEvent`
3. **Attendees matched** -- Attendee emails are checked against the contacts table
4. **Activities upserted** -- New events are inserted; changed events are updated

:::info
Like the email sync, calendar access is handled by the MS365 MCP server rather than direct OAuth. MDD does not store Outlook tokens -- it processes events provided by the MCP layer.
:::

## Event Mapping

The `mapCalendarEvent` function transforms a raw MS365 calendar event into an MDD activity record.

### Input (MS365 Format)

```json
{
  "id": "AAMkAGI2...",
  "subject": "Q1 Planning Call",
  "bodyPreview": "Agenda: Review Q1 targets and resource allocation...",
  "start": { "dateTime": "2024-01-15T14:00:00Z" },
  "end": { "dateTime": "2024-01-15T15:00:00Z" },
  "location": { "displayName": "Conference Room A" },
  "attendees": [
    { "emailAddress": { "address": "john@client.com" } },
    { "emailAddress": { "address": "michael@yelin.io" } }
  ],
  "organizer": { "emailAddress": { "address": "michael@yelin.io" } },
  "webLink": "https://outlook.office.com/...",
  "isAllDay": false
}
```

### Output (MDD Activity)

```json
{
  "activity_type": "meeting",
  "title": "Q1 Planning Call",
  "summary": "Agenda: Review Q1 targets and resource allocation...",
  "occurred_at": "2024-01-15T14:00:00Z",
  "source": "ms365",
  "source_id": "ms365:AAMkAGI2...",
  "metadata": {
    "end_time": "2024-01-15T15:00:00Z",
    "location": "Conference Room A",
    "attendees": ["john@client.com", "michael@yelin.io"],
    "organizer": "michael@yelin.io",
    "calendar_link": "https://outlook.office.com/...",
    "is_all_day": false
  }
}
```

### Field Mapping Table

| MS365 Field | MDD Field | Notes |
|---|---|---|
| `subject` or `title` | `title` | Falls back to "Untitled Meeting" |
| `bodyPreview` or `body` | `summary` | Meeting description or agenda |
| `start.dateTime` or `start` | `occurred_at` | Event start time |
| `end.dateTime` or `end` | `metadata.end_time` | Event end time |
| `location.displayName` | `metadata.location` | Meeting room or virtual link |
| `attendees[].emailAddress.address` | `metadata.attendees` | Array of email strings |
| `organizer.emailAddress.address` | `metadata.organizer` | Who scheduled the meeting |
| `webLink` | `metadata.calendar_link` | Direct link to Outlook event |
| `isAllDay` | `metadata.is_all_day` | All-day event flag |
| `id` | `source_id` | Prefixed with `ms365:` |
| - | `activity_type` | Always `meeting` |
| - | `source` | Always `ms365` |

## Contact Matching

The `matchAttendeeToContact` function links calendar events to CRM contacts and clients.

### How It Works

1. **Extract attendee emails** -- Pull all email addresses from the event's attendee list
2. **Query contacts table** -- For each attendee email, check the `contacts` table for a match
3. **Return first match** -- The first attendee that matches a known contact provides the `contact_id` and `client_id`
4. **Attach to activity** -- The matched IDs are set as foreign keys on the activity record

```
Event attendees: [john@client.com, michael@yelin.io, jane@client.com]
                        |
                  contacts table lookup
                        |
                  Match: john@client.com -> contact_id: uuid-1, client_id: uuid-2
                        |
                  Activity.contact_id = uuid-1
                  Activity.client_id = uuid-2
```

:::tip
The matcher stops at the first contact found. If a meeting has multiple known contacts, only the first match is linked. To see all attendees, check the `metadata.attendees` array on the activity record.
:::

## Upsert Behavior

The sync handles both new and existing events:

| Scenario | Behavior |
|---|---|
| New event (no matching `source_id`) | Insert with contact/client matching |
| Existing event, title changed | Update title, summary, and metadata |
| Existing event, summary changed | Update title, summary, and metadata |
| Existing event, metadata changed | Update title, summary, and metadata |
| Existing event, no changes | Skip |
| Event missing `occurred_at` | Skip (invalid record) |

After processing all events, the sync state is updated under the key `calendar-ms365` with created, updated, and skipped counts.

:::warning
Events without a start time (`occurred_at`) are skipped entirely. This can happen with malformed calendar entries or cancelled events that lack proper time data.
:::

## Sync State

The sync records its state after each run:

| Field | Value |
|---|---|
| Key | `calendar-ms365` |
| Stats | `{ created, updated, skipped }` |

This state is stored via `updateSyncState` and can be queried to monitor sync health.

## Environment Variables

| Variable | Purpose |
|---|---|
| `SUPABASE_URL` | Database connection (shared) |
| `SUPABASE_SERVICE_KEY` | Database auth (shared) |

:::note
Calendar event access is handled by the MS365 MCP server. No additional calendar-specific environment variables are needed in MDD.
:::

## Related Pages

- [Email Sync](./email-sync) -- MS365 email integration (same activity table and contact matching)
- [Notion Sync](./notion-sync) -- Contact sync that enables attendee-to-contact linking
- [Consulting Portal](../features/consulting-portal) -- CRM views powered by activity data
- [Sync Endpoints](../api/sync-endpoints) -- API endpoint documentation
- [Supabase](./supabase) -- Database integration details
