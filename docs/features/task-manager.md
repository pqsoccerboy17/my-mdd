---
sidebar_position: 1
title: Task Manager
sidebar_label: Task Manager
---

# Task Manager

The Task Manager is the central feature of MDD HQ, providing a unified inbox for tasks arriving from 6 different data sources. It supports 4 view modes, 8-dimension filtering, drag-and-drop pipeline management, real-time sync, and AI-powered task processing.

Route: `/tasks`

## Overview

The task manager is not a simple to-do list. It is a multi-source ingestion system that normalizes tasks from Notion, Granola meeting notes, Apple Reminders, GitHub issues, email, and calendar events into a single interface. Each task carries metadata about its origin, type, and AI classification.

## Core Hooks

The task manager is built on 4 primary custom hooks that separate concerns cleanly:

| Hook | Responsibility |
|---|---|
| `useTaskManager` | Top-level orchestrator. Combines all other hooks and exposes the unified task management API. Handles CRUD operations, section transitions, and undo. |
| `useTaskSync` | Manages Supabase persistence and real-time subscriptions. Handles optimistic updates, conflict resolution (newest `updated_at` wins), and localStorage caching. |
| `useTaskFilters` | Manages all 8 filter dimensions. Persists active filters to localStorage. Computes filtered task lists from the full task set. |
| `useTaskPipeline` | Handles the dev task pipeline -- stages, transitions, drag-and-drop reordering, and pipeline-specific views. |

### Hook Composition

```
useTaskManager
  ├── useTaskSync (Supabase + localStorage + real-time)
  ├── useTaskFilters (8-dimension filtering)
  └── useTaskPipeline (dev pipeline stages)
```

## Sections

Tasks are organized into 4 sections that represent their lifecycle state:

| Section | Purpose | Behavior |
|---|---|---|
| `active` | Tasks actively being worked on | Default section for new tasks |
| `waiting` | Tasks blocked or waiting on someone else | Displayed but visually distinct |
| `someday` | Tasks deferred for future consideration | Hidden from default views unless filtered |
| `done` | Completed tasks | Marked with `completed: true` |

Section transitions are available via right-click context menu, keyboard shortcuts, or the AI `section` executor.

## Task Types

Each task has a `task_type` that determines how it is displayed and which AI executors are applicable:

| Type | Description | AI Executors |
|---|---|---|
| `dev` | Development tasks (code, bugs, features) | classify, dev, section |
| `comms` | Communication tasks (emails, follow-ups) | classify, comms, section |
| `research` | Research and analysis tasks | classify, research, section |
| `manual` | General tasks that don't fit other categories | classify, section |

## 8-Dimension Filtering

The filter system supports combining multiple filter dimensions simultaneously. All filters are AND-combined -- a task must match every active filter to appear.

| Dimension | Options | Description |
|---|---|---|
| Section | active, waiting, someday, done | Which lifecycle stage to show |
| Type | dev, comms, research, manual | Task type classification |
| Source | manual, email, notion, granola, github, apple, notion-stakeholders, ms365, monarch | Where the task originated |
| Status | pending, in-progress, done | Current work status |
| Priority | high, medium, low | Task priority level |
| Pipeline | backlog, ready, in-progress, review, done | Dev pipeline stage |
| Date Range | today, this week, this month, custom | When the task was created or due |
| Search | free text | Full-text search across title and description |

:::tip
Filters persist to localStorage. When you return to the task manager, your last filter configuration is restored automatically.
:::

## View Modes

The task manager supports 4 view modes, switchable via the view mode toggle or keyboard shortcuts `1` through `4`:

### List View (Default)
A flat, scrollable list of tasks grouped by section. Each task shows its title, type badge, source indicator, and action buttons. This is the most information-dense view.

### Board View
A Kanban-style board with columns for each section (active, waiting, someday, done). Tasks can be dragged between columns to change their section. Powered by `@hello-pangea/dnd`.

### Pipeline View
Specifically for `dev` type tasks. Shows pipeline stages as columns: backlog, ready, in-progress, review, done. Tasks can be dragged between stages. Only visible when the pipeline filter is active or dev tasks exist.

### Calendar View
Tasks plotted on a calendar by their due date. Tasks without due dates appear in an "unscheduled" bucket. Useful for time-based planning.

## Pipeline Stages

Dev tasks have an additional `pipeline_status` field that tracks their progress through the development pipeline:

| Stage | Description |
|---|---|
| `backlog` | Identified but not prioritized |
| `ready` | Prioritized and ready to start |
| `in-progress` | Actively being worked on |
| `review` | Work complete, awaiting review |
| `done` | Fully complete |

Pipeline transitions support drag-and-drop via the Board/Pipeline views. The `useTaskPipeline` hook manages stage transitions and persists them to Supabase.

:::info
The pipeline view is controlled by the `PIPELINE_DND` feature flag. When disabled, dev tasks still have pipeline status but the drag-and-drop board is not rendered.
:::

## Sorting

Tasks can be sorted by multiple criteria:

| Sort Option | Description |
|---|---|
| `sort_order` | Manual drag-and-drop ordering (default) |
| `updated_at` | Most recently modified first |
| `created_at` | Newest first |
| `priority` | High to low |
| `title` | Alphabetical |

Manual sort order is maintained per-section. When a task moves between sections, it gets a new sort order at the top of the destination section.

## Undo Behavior

Destructive task operations (delete, complete, dismiss) support undo via toast notifications:

1. User performs an action (e.g., completes a task)
2. The task is immediately updated (optimistic update)
3. A toast appears with an "Undo" button
4. If the user clicks "Undo" within the timeout, the action is reversed
5. If the timeout expires, the change is finalized in Supabase

The undo system stores the previous task state in memory and restores it on undo. It handles edge cases like undoing a section change that also modified the sort order.

## Data Sources

Tasks arrive from 6 external sources plus manual creation. Each source has a dedicated sync endpoint that normalizes data into the task schema. See [Task Data Sources](./task-data-sources) for the full breakdown.

| Source | Sync Method | Frequency |
|---|---|---|
| Manual | User creates in UI | On demand |
| Notion | `/api/sync-notion` | Daily cron (14:00 UTC) |
| Granola | `/api/sync-granola` | Daily cron (14:15 UTC) |
| Apple Reminders | `/api/sync-apple` | Webhook + cron |
| GitHub | `/api/tasks-github` | On demand |
| Email | `/api/email-ingest` | Webhook |
| Calendar | `/api/email-ingest` | Via email integration |

## Real-Time Sync

The task manager uses Supabase real-time channels to stay synchronized:

- **Cross-tab sync** - Changes in one browser tab are instantly reflected in all other open tabs
- **Server-side updates** - When a cron job syncs new tasks from Notion or Granola, they appear in the UI without a page refresh
- **Conflict resolution** - When the same task is modified in multiple places, the version with the newest `updated_at` timestamp wins

## Related Pages

- [Task Data Sources](./task-data-sources) - Detailed source-by-source documentation
- [AI Automation](./ai-automation) - How AI processes tasks
- [Task Processor](../ai-pipeline/task-processor) - The cron-based AI processing loop
- [Tasks Schema](../data/tasks-schema) - Database table documentation
