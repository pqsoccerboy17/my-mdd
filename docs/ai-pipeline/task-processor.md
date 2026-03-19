---
sidebar_position: 2
title: Task Processor
sidebar_label: Task Processor
---

# Task Processor

The task processor is a Vercel serverless function (`/api/task-process`) that runs on a 5-minute cron schedule. It claims one pending task from the queue, executes the appropriate AI executor, and stores the result. The design prioritizes reliability over throughput -- one task at a time, with atomic claiming to prevent double-processing.

## Endpoint Details

| Property | Value |
|---|---|
| Path | `/api/task-process` |
| Method | GET |
| Trigger | Vercel cron (every 5 minutes) |
| Auth | `CRON_SECRET` header validation |
| Processing | One task per invocation |
| Timeout | Vercel serverless function limit |

## Processing Flow

The task processor follows a strict sequence on every invocation:

### 1. Authentication

The endpoint validates the `CRON_SECRET` header to ensure only Vercel's cron scheduler can trigger it. Manual invocations must also provide this secret.

### 2. Atomic Claim

The processor claims a single task from the `task_queue` table using an atomic update:

```sql
UPDATE task_queue
SET status = 'claimed', started_at = NOW()
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT 1
RETURNING *
```

This query is atomic -- it finds the oldest pending task and claims it in a single operation. If two cron invocations overlap (edge case with Vercel cron), only one will claim the task. The other will find no pending tasks and exit cleanly.

:::info
The `eq('status', 'pending')` + `limit(1)` pattern is the key to safe concurrent processing. It prevents race conditions without requiring external locking mechanisms.
:::

### 3. Status Update

Once claimed, the task status is updated to `processing` and the `current_step` field is set to describe what the processor is doing:

| Step | Description |
|---|---|
| `claiming` | Task has been claimed from the queue |
| `dispatching` | Determining which executor to run |
| `executing` | Running the AI executor |
| `storing` | Saving executor results |
| `completing` | Marking the task as complete |

The `progress_pct` field is updated at each step so the frontend can show processing progress.

### 4. Executor Dispatch

The processor reads the `task_type` field from the claimed task and dispatches to the corresponding executor:

| task_type | Executor | Description |
|---|---|---|
| `classify` | classifyExecutor | Reclassify task type and priority |
| `dev` | devExecutor | Generate technical specifications |
| `research` | researchExecutor | AI research with persistence |
| `comms` | commsExecutor | Draft email (never auto-sends) |
| `section` | sectionExecutor | Suggest section move |
| `enrich` | enrichExecutor | Contact enrichment |
| `follow-up` | followUpExecutor | Draft follow-up email |
| `deal-score` | dealScoreExecutor | Score deal health |
| `briefing` | briefingExecutor | Generate client briefing |

### 5. Execution

The selected executor runs with the task's `params` JSONB field as input. Each executor:

1. Reads relevant context from Supabase (task data, client data, past decisions)
2. Constructs a prompt for Claude Haiku
3. Calls the Anthropic API
4. Parses the structured response
5. Returns the result to the processor

### 6. Result Storage

The executor result is stored back in the `task_queue` record:

| Field | Value |
|---|---|
| `status` | `completed` or `failed` |
| `result_summary` | Human-readable summary of the result |
| `progress_pct` | 100 (on completion) |
| `current_step` | `completed` or error description |
| `completed_at` | Current timestamp |
| `error_message` | Error details (only on failure) |

### 7. Cleanup

On successful completion, the processor exits cleanly. The result is available for the frontend to display in the human review UI.

## Error Handling

The processor handles errors at multiple levels:

### Executor Errors

If an executor throws an error (API timeout, invalid response, parsing failure):

1. The error is caught by the processor
2. The task status is set to `failed`
3. The `error_message` field stores the error details
4. The task is NOT retried automatically

:::note
Failed tasks do not retry automatically. This is intentional -- the same input is likely to produce the same error. A human should review the failure and either fix the input or retry manually.
:::

### Infrastructure Errors

If the serverless function itself fails (timeout, out of memory):

1. The claimed task remains in `claimed` status
2. On the next cron cycle, the processor checks for stale claimed tasks
3. Tasks claimed more than 15 minutes ago are reset to `pending`
4. This allows them to be re-claimed and re-processed

### No Pending Tasks

If the queue has no pending tasks, the processor exits immediately with a 200 status code and a message indicating no work was found. This is the most common outcome -- the queue is empty most of the time.

## task_queue Table

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `task_type` | text | Executor type to run |
| `title` | text | Human-readable task description |
| `params` | jsonb | Input parameters for the executor |
| `status` | text | pending, claimed, processing, completed, failed |
| `progress_pct` | integer | 0-100 progress indicator |
| `current_step` | text | Current processing step description |
| `result_summary` | text | Executor result summary |
| `error_message` | text | Error details (null on success) |
| `requested_by` | text | Who queued the task |
| `started_at` | timestamp | When processing began |
| `completed_at` | timestamp | When processing finished |
| `created_at` | timestamp | When the task was queued |

## Frontend Integration

The frontend interacts with the task queue through the `useTaskQueue` hook:

### Dispatching Tasks

```js
const { dispatch } = useTaskQueue();

// Queue a classification task
dispatch({
  task_type: 'classify',
  title: 'Classify: Update API docs',
  params: { taskId: 'abc-123' }
});
```

### Monitoring Progress

The hook subscribes to real-time updates on the `task_queue` table:

- When a task moves to `processing`, the UI shows a progress indicator
- The `progress_pct` and `current_step` fields update in real-time
- When a task completes, the result is displayed for human review

### Handling Results

Completed tasks trigger a notification in the UI with the result summary. The user can then accept, reject, or modify the result through the appropriate review interface.

## Cron Configuration

The task processor cron is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/task-process",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs the processor every 5 minutes. The 5-minute interval balances responsiveness (tasks are processed within a few minutes of being queued) with cost efficiency (not running unnecessarily when the queue is empty).

## Performance Characteristics

| Metric | Value |
|---|---|
| Processing interval | Every 5 minutes |
| Tasks per cycle | 1 |
| Maximum throughput | 12 tasks/hour, 288 tasks/day |
| Typical executor latency | 1-10 seconds |
| Stale claim timeout | 15 minutes |
| Queue depth (typical) | 0-3 pending tasks |

## Related Pages

- [Pipeline Overview](./overview) - Full pipeline architecture
- [Executors](./executors) - Individual executor details
- [API Overview](../api/overview) - All serverless endpoints
- [Vercel Deployment](../config/vercel-deployment) - Cron configuration
