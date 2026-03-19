---
sidebar_position: 3
title: Consulting Portal
sidebar_label: Consulting Portal
---

# Consulting Portal

The Consulting Portal is a full-featured CRM built specifically for independent consulting operations. Unlike enterprise CRM tools, it is designed for a solo consultant managing a small number of high-value client relationships.

Route: `/consulting`

## Module Overview

The consulting portal is organized into 8 functional modules:

| Module | Description | Key Capabilities |
|---|---|---|
| **Clients** | Client company management | Company profiles, engagement history, health scoring |
| **Pipeline** | Deal tracking and forecasting | Stage-based pipeline, drag-and-drop, revenue forecasting |
| **Contacts** | Contact management by company | Contact profiles, roles, enrichment, communication history |
| **Activity** | Activity logging and tracking | Meetings, emails, calls, notes -- linked to clients and deals |
| **Analytics** | Business intelligence | Revenue trends, pipeline velocity, win rates, client concentration |
| **Proposals** | Proposal generation | Template-based proposals with pricing and scope |
| **Documents** | Document management | SOWs, contracts, invoices linked to clients/deals |
| **SNP** | Shortcuts and Proposals | Local Express server for proposal tooling |

## Routes

The consulting portal uses nested routes within `/consulting`:

| Route | View |
|---|---|
| `/consulting` | Main consulting dashboard with overview metrics |
| `/consulting/clients` | Client list and detail views |
| `/consulting/pipeline` | Deal pipeline board |
| `/consulting/contacts` | Contact directory |
| `/consulting/activity` | Activity feed and log |
| `/consulting/analytics` | Analytics dashboards |
| `/consulting/proposals` | Proposal builder |

## Client Management

Each client record tracks:

- **Company name** and basic info
- **Engagement status** (prospect, active, past, churned)
- **Health score** - Computed from recent activity, deal status, and communication frequency
- **Associated deals** - All deals linked to this client
- **Associated contacts** - People at this company
- **Activity history** - Full timeline of interactions
- **Client intelligence** - AI-generated insights stored in the `client_intelligence` table

### Inline Editing

Client fields support inline editing -- click on a field value to edit it in place without opening a separate form. Changes are saved to Supabase on blur.

## Deal Pipeline

The deal pipeline uses a stage-based Kanban board with drag-and-drop:

| Stage | Description |
|---|---|
| Lead | Initial interest identified |
| Qualified | Confirmed budget, authority, need, timeline |
| Proposal | Proposal sent, awaiting response |
| Negotiation | Terms being discussed |
| Active | Engagement underway |
| Closed Won | Deal completed successfully |
| Closed Lost | Deal did not proceed |

### DealDetailPanel

Clicking a deal card opens the `DealDetailPanel`, a slide-out panel showing:

- Deal title, value, and stage
- Associated client and contacts
- Activity timeline for this deal
- Deal score (AI-generated via the `deal-score` executor)
- Notes and next steps
- Stage transition history

:::info
The pipeline drag-and-drop is controlled by the `PIPELINE_DND` feature flag. When disabled, deals can still be moved between stages via the detail panel, but the Kanban drag interaction is removed.
:::

### Deal Scoring

The AI `deal-score` executor analyzes deal data and generates a health score based on:

- Time in current stage vs. historical averages
- Recent activity frequency
- Contact engagement level
- Proposal response time
- Deal value relative to historical wins

Scores are stored in the `deal_scores` table and displayed in the DealDetailPanel.

## Contact Management

Contacts are organized by company and track:

- **Name, email, phone, title, role**
- **Company association** - Linked to a client record
- **Communication history** - Emails, meetings, calls
- **Enrichment data** - AI-gathered information stored in `contact_enrichment`

### Contact Enrichment Batch

The `enrich` executor can process contacts in batch by company. When triggered:

1. All contacts for a given company are gathered
2. The AI researches each contact's background, role, and recent activity
3. Enrichment data is written to the `contact_enrichment` table
4. The contact profile in the UI updates with the enriched information

This batch operation is useful before a client meeting -- enriching all contacts at a company gives you a briefing on everyone you might interact with.

## Activity Tracking

Activities are logged against clients and deals with the following types:

| Activity Type | Description |
|---|---|
| Meeting | In-person or video meetings |
| Email | Email exchanges |
| Call | Phone calls |
| Note | Internal notes and observations |
| Proposal | Proposal sent or updated |
| Follow-up | Follow-up action taken |

Activities are displayed in a chronological feed with filters for type and date range. The `activity_summaries` table stores AI-generated summaries of activity clusters for quick review.

## Analytics

The analytics module provides consulting business intelligence:

- **Revenue trends** - Monthly and quarterly revenue charts
- **Pipeline velocity** - Average time in each stage
- **Win rates** - Deal conversion rates by stage
- **Client concentration** - Revenue distribution across clients (important for risk assessment)
- **Activity metrics** - Communication frequency trends

:::info
Analytics drill-down features are controlled by the `ANALYTICS_DRILL_DOWN` feature flag. When enabled, clicking on chart elements reveals underlying data.
:::

## AI Features

Several AI capabilities enhance the consulting portal when the `CONSULTING_AI_FEATURES` flag is enabled:

| Feature | Executor | Description |
|---|---|---|
| Deal scoring | `deal-score` | AI health scores for active deals |
| Client intelligence | `research` | AI research persisted to `client_intelligence` |
| Contact enrichment | `enrich` | Batch enrichment by company |
| Follow-up generation | `follow-up` | Draft follow-up emails |
| Client briefings | `briefing` | Pre-meeting client briefings |
| Cost intelligence | `research` | Market rate and competitive intelligence |

:::warning
The `CONSULTING_COST_INTEL` flag controls cost intelligence features separately from other AI features. Both flags must be enabled for cost intelligence to appear.
:::

## Database Tables

The consulting portal uses these Supabase tables:

| Table | Purpose |
|---|---|
| `clients` | Client company records |
| `deals` | Deal/opportunity records |
| `contacts` | Contact/person records |
| `activities` | Activity log entries |
| `activity_summaries` | AI-generated activity summaries |
| `client_intelligence` | AI research results per client |
| `deal_scores` | AI deal health scores |
| `pipeline_forecasts` | Revenue forecast data |
| `contact_enrichment` | AI-enriched contact data |
| `follow_up_queue` | Pending follow-up drafts |

## Related Pages

- [AI Automation](./ai-automation) - How AI enhances the consulting portal
- [Executors](../ai-pipeline/executors) - Detailed executor documentation
- [Schema Overview](../data/overview) - Full database schema
- [Feature Flags](../config/feature-flags) - Consulting-specific flags
