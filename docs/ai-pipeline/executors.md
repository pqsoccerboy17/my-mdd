---
sidebar_position: 3
title: Executors
sidebar_label: Executors
---

# Executors

Executors are the individual AI processing units in the MDD pipeline. Each executor handles a specific type of task, calling Claude Haiku with a specialized prompt and returning structured results for human review.

## Executor Reference

| Executor | Input | Output | Model | Persistence |
|---|---|---|---|---|
| `classify` | Task title + description + metadata | task_type, section, priority, confidence | Claude Haiku | Updates task record |
| `dev` | Task description + codebase context | Technical spec with requirements | Claude Haiku | Stored in result_summary |
| `research` | Research question + client context | Research summary + key findings | Claude Haiku | client_intelligence table |
| `comms` | Email context + conversation history | Draft email text | Claude Haiku | Stored in result_summary |
| `section` | Task with full context | Suggested section + reasoning | Claude Haiku | Stored in result_summary |
| `enrich` | Contact name + company + role | Enriched profile data | Claude Haiku | contact_enrichment table |
| `follow-up` | Client/deal context + activity history | Draft follow-up email | Claude Haiku | follow_up_queue table |
| `deal-score` | Deal data + activity frequency + stage timing | Health score (0-100) + reasoning | Claude Haiku | deal_scores table |
| `briefing` | Client data + recent activities + deal status | Meeting prep briefing document | Claude Haiku | Stored in result_summary |

## Detailed Executor Documentation

### classify

The classify executor analyzes a task and determines its type, section, and priority. It is the most frequently used executor because new tasks from all sources pass through classification.

**Input:**
- Task title and description
- Source metadata (where the task came from)
- Few-shot examples from past human decisions (via the learning flywheel)

**Processing:**
1. Constructs a classification prompt with the task context
2. Includes 3-5 recent human decisions as few-shot examples
3. Calls Claude Haiku with structured output requirements
4. Parses the response into type, section, priority, and confidence

**Output:**
- `task_type` - dev, comms, research, or manual
- `section` - active, waiting, or someday
- `priority` - high, medium, or low
- `confidence` - 0.0 to 1.0 (how certain the classification is)

**Re-classification:** Tasks can be re-classified at any time. The classify executor also handles reclassification and rescoring when a user's context about a task changes.

:::tip
Classification confidence below 0.7 triggers a visual indicator in the UI, suggesting the user should review and confirm the classification manually.
:::

### dev

The dev executor generates technical specifications for development tasks.

**Input:**
- Task title and description
- Related code context (if available)
- Project and repository information

**Processing:**
1. Analyzes the task description to understand the development need
2. Generates a structured technical specification
3. Includes acceptance criteria, implementation notes, and potential risks

**Output:**
- Technical specification document
- Acceptance criteria list
- Implementation suggestions
- Estimated complexity

**Use case:** When a task comes in from GitHub or is manually created as a dev task, the dev executor can generate a spec that clarifies what needs to be built, tested, and delivered.

### research

The research executor performs AI-powered research on topics related to clients, industries, or technologies.

**Input:**
- Research question or topic
- Client context (if client-related)
- Existing intelligence (to avoid duplicating known information)

**Processing:**
1. Analyzes the research question and context
2. Generates a comprehensive research summary using Claude's knowledge
3. Structures findings into key points, implications, and action items

**Output:**
- Research summary with key findings
- Relevant data points and insights
- Suggested action items based on findings

**Persistence:** Research results for client-related topics are stored in the `client_intelligence` table, building a knowledge base over time. This intelligence is available in the Consulting Portal's client detail view.

### comms

The comms executor drafts email communications based on task context.

**Input:**
- Task context (what the email is about)
- Recipient information
- Conversation history (if this is a reply)
- Tone and style preferences

**Processing:**
1. Analyzes the communication need
2. Reviews any conversation history for context
3. Drafts an email that is professional, concise, and action-oriented
4. Formats with appropriate greeting, body, and sign-off

**Output:**
- Draft email text (subject + body)
- Suggested recipients
- Tone classification (formal, casual, urgent)

:::warning
The comms executor **NEVER** auto-sends emails. The draft is always presented in the review UI where the user can edit, approve, and explicitly send -- or discard entirely.
:::

### section

The section executor suggests moving a task to a different section based on its current state and context.

**Input:**
- Full task data including current section
- Task age and recent activity
- Related task context

**Processing:**
1. Analyzes whether the task is in the right section
2. Considers factors like staleness, dependency status, and urgency changes
3. Generates a section recommendation with reasoning

**Output:**
- Suggested section (active, waiting, someday, or done)
- Reasoning for the suggestion
- Confidence score

**Use cases:**
- Moving stale active tasks to someday
- Promoting waiting tasks to active when their blocker resolves
- Suggesting completion for tasks that appear done

### enrich

The enrich executor performs contact enrichment, gathering additional information about a contact from available context.

**Input:**
- Contact name, company, and role
- Existing contact data
- Company information from the clients table

**Processing:**
1. Analyzes available information about the contact
2. Uses Claude's knowledge to infer additional context
3. Generates enriched profile data

**Output:**
- Enhanced role description
- Background and experience summary
- Communication preferences (if inferable)
- Relevant notes for relationship management

**Batch mode:** The enrich executor supports batch processing by company. When triggered for a company, it processes all contacts at that company in sequence, sharing cross-contact context to produce more coherent enrichment.

**Persistence:** Enrichment results are stored in the `contact_enrichment` table and displayed in the contact profile within the Consulting Portal.

### follow-up

The follow-up executor generates follow-up email drafts based on client and deal context.

**Input:**
- Client and deal information
- Recent activity history
- Time since last communication
- Deal stage and status

**Processing:**
1. Reviews the relationship history and current deal status
2. Identifies appropriate follow-up timing and topic
3. Drafts a natural, relationship-appropriate follow-up email

**Output:**
- Draft follow-up email (subject + body)
- Suggested send timing
- Follow-up category (check-in, status update, next steps)

**Persistence:** Follow-up drafts are stored in the `follow_up_queue` table until the user reviews and sends (or discards) them.

:::warning
Like the comms executor, follow-up drafts are **NEVER** auto-sent. The user must explicitly review and send each one.
:::

### deal-score

The deal-score executor evaluates the health of active deals.

**Input:**
- Deal data (value, stage, creation date, expected close date)
- Activity frequency for this deal
- Time in current stage vs. historical averages
- Contact engagement level

**Processing:**
1. Analyzes deal health factors
2. Compares against historical patterns
3. Generates a composite health score with reasoning

**Output:**
- Health score (0-100)
- Risk factors identified
- Positive indicators
- Suggested actions to improve deal health

**Persistence:** Scores are stored in the `deal_scores` table with timestamps, allowing trend analysis. Deal score history is visible in the DealDetailPanel.

**Auto-save:** Deal scores are the one executor type that auto-saves results without human review, since they are informational scores that do not modify any external-facing data.

### briefing

The briefing executor generates client meeting preparation documents.

**Input:**
- Client profile and history
- Recent activities (last 30 days)
- Active deals and their status
- Contact roster for the client
- Any recent client intelligence

**Processing:**
1. Compiles all available client context
2. Identifies key discussion topics and recent developments
3. Generates a structured briefing document

**Output:**
- Client overview and relationship summary
- Recent activity highlights
- Active deal status and next steps
- Key contacts and their roles
- Suggested talking points
- Open items requiring discussion

**Use case:** Run the briefing executor before a client meeting to get a comprehensive prep document. Particularly valuable when meetings are infrequent and you need to quickly recall the full relationship context.

## Error Handling

All executors share common error handling:

| Error Type | Handling |
|---|---|
| API timeout | Task marked as failed with timeout message |
| Invalid response | Task marked as failed with parse error |
| Missing context | Executor returns partial results with warnings |
| Rate limiting | Task marked as failed, eligible for manual retry |

Failed tasks are never retried automatically. The user can review the error and retry from the UI.

## Related Pages

- [Pipeline Overview](./overview) - Full pipeline architecture
- [Task Processor](./task-processor) - How executors are invoked
- [Learning Flywheel](./learning-flywheel) - How decisions improve executors
- [AI Automation](../features/ai-automation) - Feature-level AI overview
