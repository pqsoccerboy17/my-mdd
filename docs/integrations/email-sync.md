---
sidebar_position: 6
title: Email Sync
sidebar_label: Email Sync
---

# Email Sync

MDD HQ has a two-part email integration: task ingest for creating tasks from emails, and activity sync for logging email interactions in the CRM timeline. Both use MS365 Outlook as the email source, accessed through the MS365 MCP server rather than direct OAuth.

## Sync Overview

| Feature | Task Ingest | Activity Sync |
|---|---|---|
| Endpoint | `/api/email-ingest` | `email-activity-helpers.js` (library) |
| Method | `POST` | Called by sync orchestrator |
| Direction | MS365 to MDD | MS365 to MDD |
| Auth | `INGEST_API_KEY` | Service client |
| Source Key | `email` | `ms365` |
| Target Table | `tasks` | `activities` |

:::info
MDD uses the MS365 MCP server to read emails rather than implementing OAuth directly. The MCP server handles authentication and provides email data that MDD then processes into tasks and activities.
:::

## Part 1: Task Ingest

The `/api/email-ingest` endpoint accepts email-derived tasks -- typically created when you flag an email as needing follow-up or extract action items from a message.

### How It Works

1. **Email identified** -- An email is flagged for follow-up (via MCP or manual trigger)
2. **Task extracted** -- The email subject and relevant details are formatted as a task
3. **POST to MDD** -- The task payload is sent to `/api/email-ingest`
4. **Deduplicate and insert** -- MDD checks `source_id` for duplicates and inserts new tasks

### Endpoint: POST /api/email-ingest

Accepts an array of tasks derived from emails:

```json
{
  "tasks": [
    {
      "title": "Reply to proposal feedback",
      "description": "John's comments on the Q1 proposal need addressing",
      "source_id": "email:AAMkAGI2...",
      "task_meta": {
        "from": "john@client.com",
        "subject": "Re: Q1 Proposal",
        "received_at": "2024-01-15T10:30:00Z"
      }
    }
  ]
}
```

**Validation rules:**
- Each task must have `title` and `source_id`
- The `source` field is always set to `email` automatically
- The `task_type` is always set to `comms`
- Description and task_meta are optional

**Response:**

```json
{
  "created": 2,
  "skipped": 1
}
```

### Task Properties

| Property | Source | Value |
|---|---|---|
| Title | Email subject or extracted text | Provided by caller |
| Description | Email body preview or context | Optional, provided by caller |
| Source | - | Always `email` |
| Source ID | Email message ID | Prefixed with `email:` |
| Task Type | - | Always `comms` |
| Section | - | Default `active` |
| Task Meta | Email metadata | From, subject, timestamps |

## Part 2: Activity Sync

The activity sync logs email interactions into the `activities` table, creating a CRM-style timeline of all email communication with contacts and clients.

### How It Works

1. **Emails fetched** -- The sync orchestrator retrieves recent emails via the MS365 MCP server
2. **Direction detected** -- Each email is classified as `email_sent` or `email_received` based on the sender
3. **Contact matched** -- The counterparty email is matched against the contacts table
4. **Activity upserted** -- The email is logged as an activity, linked to the matched contact and client

### Direction Detection

The `mapEmailToActivity` function determines email direction by comparing the sender to the owner email:

| Condition | Activity Type |
|---|---|
| From address matches owner email or `@yelin.io` domain | `email_sent` |
| From address is any other address | `email_received` |

The counterparty (the person who is not the owner) is used for contact matching:
- For sent emails, the counterparty is the `to` address
- For received emails, the counterparty is the `from` address

### Activity Record

Each email maps to an activity record:

```json
{
  "activity_type": "email_received",
  "title": "Re: Q1 Proposal",
  "summary": "Thanks for sending over the updated numbers...",
  "occurred_at": "2024-01-15T10:30:00Z",
  "source": "ms365",
  "source_id": "email:AAMkAGI2...",
  "metadata": {
    "from": "john@client.com",
    "from_name": "John Smith",
    "to": "michael@yelin.io",
    "has_attachments": true,
    "email_link": "https://outlook.office.com/..."
  },
  "contact_id": "uuid-of-matched-contact",
  "client_id": "uuid-of-matched-client"
}
```

### Contact and Client Linking

When a new email activity is created, the sync attempts to link it to existing records:

1. **Extract counterparty email** -- Determine which address belongs to the external party
2. **Query contacts table** -- Look up the email in the `contacts` table
3. **Resolve client** -- If a contact is found, pull its `client_id` for the company link
4. **Set foreign keys** -- Attach `contact_id` and `client_id` to the activity record

If no contact match is found, the activity is still created but without the contact/client links.

:::tip
Keep your contacts table up to date via the [Notion Sync](./notion-sync) contact sync. The more contacts MDD knows about, the better the email activity linking works.
:::

### Upsert Behavior

The activity sync handles existing records:

| Scenario | Behavior |
|---|---|
| New email (no matching `source_id`) | Insert with contact/client linking |
| Existing email, title or summary changed | Update title, summary, and metadata |
| Existing email, no changes | Skip |
| Missing or undefined message ID | Skip (invalid source_id) |

## Environment Variables

| Variable | Purpose |
|---|---|
| `INGEST_API_KEY` | Auth for the email-ingest POST endpoint |
| `SUPABASE_URL` | Database connection (shared) |
| `SUPABASE_SERVICE_KEY` | Database auth (shared) |

:::note
Email access is handled by the MS365 MCP server, which manages its own authentication. MDD does not store Outlook OAuth tokens directly.
:::

## Related Pages

- [Calendar Sync](./calendar-sync) -- MS365 calendar event integration (same activity table)
- [Notion Sync](./notion-sync) -- Contact sync that enables email-to-contact linking
- [Data Sources](../features/task-data-sources) -- All task source overview
- [Sync Endpoints](../api/sync-endpoints) -- API endpoint documentation
- [Consulting Portal](../features/consulting-portal) -- CRM views powered by activity data
