---
sidebar_position: 6
title: AI Automation
sidebar_label: AI Automation
---

# AI Automation

MDD HQ integrates AI-powered automation through a purpose-built pipeline that uses Claude Haiku for task classification, research, email drafting, contact enrichment, and more. The system follows a strict **human-in-the-loop** principle -- AI suggests, humans decide, nothing executes without approval.

## Core Principle: Human-in-the-Loop

:::warning
MDD HQ's AI never auto-executes actions. Every AI-generated result goes through human review before anything happens. The AI **never auto-sends emails**, **never auto-completes tasks**, and **never auto-modifies client data** without explicit user approval.
:::

This is a deliberate architectural decision. AI is used for acceleration -- reducing the time to draft, classify, and research -- not for autonomous action. The human always has the final say.

## AI Capabilities

| Capability | Executor | Input | Output | Auto-Executes? |
|---|---|---|---|---|
| Task classification | `classify` | Task title + description | Type, section, priority | No - human reviews |
| Dev task specs | `dev` | Task description | Technical specifications | No - human reviews |
| Research | `research` | Research question + context | Research summary + sources | No - human reviews |
| Email drafting | `comms` | Email context + history | Draft email text | **Never** - human must send |
| Section suggestion | `section` | Task with context | Suggested section move | No - human confirms |
| Contact enrichment | `enrich` | Contact name + company | Enriched profile data | No - human reviews |
| Follow-up drafting | `follow-up` | Client/deal context | Draft follow-up email | **Never** - human must send |
| Deal scoring | `deal-score` | Deal data + activity | Health score + reasoning | Automatic (score only) |
| Client briefing | `briefing` | Client data + recent activity | Meeting prep briefing | No - human reviews |

## How It Works

The AI automation system has 6 stages:

### 1. Ingestion

Tasks arrive from any of the 6 data sources (Notion, Granola, Apple, GitHub, Email, Calendar). New tasks that need AI processing are identified based on their source and current state.

### 2. Classification

The `classify` executor analyzes the task title, description, and metadata to determine:

- **Task type** (dev, comms, research, manual)
- **Suggested section** (active, waiting, someday)
- **Priority level** (high, medium, low)
- **Confidence score** (how sure the AI is about its classification)

### 3. Queueing

When a user requests an AI action (via the task action menu or command palette), the request is added to the `task_queue` table with status `pending`. The queue stores:

- What type of executor to run
- The input parameters
- Who requested it
- When it was queued

### 4. Processing

The `task-process` cron runs every 5 minutes. It claims one pending task from the queue using atomic database operations, runs the appropriate executor, and stores the result. See [Task Processor](../ai-pipeline/task-processor) for the detailed processing architecture.

### 5. Human Review

Results are presented to the user in the UI:

- Classification results show the suggested type, section, and priority with an accept/reject interface
- Draft emails show the full text with an edit/send/discard interface
- Research results show the summary with a save/discard interface
- Enrichment results show the new data with a merge/discard interface

### 6. Decision Logging

Every human decision (accept, reject, modify) is logged in the `task_decisions` table. This data feeds back into the [Learning Flywheel](../ai-pipeline/learning-flywheel) to improve future suggestions.

## Model Selection

All AI executors use **Claude Haiku** from Anthropic. Haiku was chosen for:

- **Speed** - Fast response times for interactive use
- **Cost** - Economical for frequent, smaller operations
- **Quality** - Sufficient for classification, drafting, and research tasks
- **Consistency** - Reliable structured output for programmatic parsing

The API key is stored as `ANTHROPIC_API_KEY` in Vercel environment variables (server-side only). AI calls are never made from the frontend -- they always go through the serverless function layer.

## Feature Flags

AI features are gated behind feature flags for safety:

| Flag | What It Controls |
|---|---|
| `CONSULTING_AI_FEATURES` | Client intelligence, deal scoring, contact enrichment, briefings |
| `CONSULTING_COST_INTEL` | Cost and competitive intelligence (requires AI features flag too) |

Both flags default to OFF. They must be explicitly enabled in LaunchDarkly to activate AI features.

## Triggering AI Actions

Users can trigger AI actions through:

1. **Task action menu** - Right-click or action button on a task to classify, research, or draft
2. **Command palette** - `Cmd+K` then search for AI actions
3. **Batch operations** - Select multiple contacts and trigger batch enrichment
4. **Automatic queueing** - Some sources automatically queue classification on ingestion (controlled by `AUTO_ENRICH_ON_SYNC`)

## Cost and Usage

AI usage is tracked but not explicitly budgeted in the application. Since all calls go through Claude Haiku and the task-process cron processes one task at a time with a 5-minute interval, costs are naturally throttled. A typical day of usage processes 10-50 AI tasks.

## Safety Guarantees

The system provides several safety guarantees:

1. **No auto-send** - Email drafts are never sent automatically. The user must explicitly click send.
2. **No auto-modify** - Client and contact records are never modified without human confirmation.
3. **Atomic processing** - Only one AI task is processed at a time, preventing runaway execution.
4. **Error isolation** - If an executor fails, the error is logged and the task is marked as failed. It does not retry automatically.
5. **Audit trail** - Every AI action and human decision is logged in the database.

## Related Pages

- [Pipeline Overview](../ai-pipeline/overview) - Full pipeline architecture with diagrams
- [Task Processor](../ai-pipeline/task-processor) - Cron-based processing details
- [Executors](../ai-pipeline/executors) - Detailed executor documentation
- [Learning Flywheel](../ai-pipeline/learning-flywheel) - How the system learns from decisions
- [Feature Flags](../config/feature-flags) - AI-related feature flags
