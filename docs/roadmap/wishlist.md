---
sidebar_position: 1
title: Wishlist
sidebar_label: Wishlist
---

# Wishlist

Planned features, integrations to explore, and ideas under consideration for MDD HQ. Items are prioritized by impact and feasibility.

## Planned Features

| Feature | Priority | Status | Target Area | Notes |
|---|---|---|---|---|
| Calendar view for tasks | High | In progress | Task Manager | Full calendar visualization with drag-to-reschedule |
| Mobile-responsive layout | High | Planned | Platform | Tailwind responsive breakpoints for tablet/phone |
| Notification center | Medium | Planned | Platform | Centralized view for sync results, AI completions, reminders |
| Task dependencies | Medium | Research | Task Manager | Link tasks as blockers/blocked-by relationships |
| Recurring tasks | Medium | Planned | Task Manager | Support for daily/weekly/monthly recurring tasks |
| Time tracking | Medium | Research | Task Manager | Track time spent on tasks, especially consulting billable hours |
| Invoice generation | Medium | Research | Consulting | Generate invoices from tracked time and project data |
| Email integration (MS365 native) | Medium | Planned | Data Sources | Direct MS365 API integration replacing email forwarding |
| Dashboard widgets | Low | Backlog | Dashboard | Customizable widget layout for the home dashboard |
| Natural language task creation | Low | Backlog | Task Manager | Use AI to parse "Call John about the deal tomorrow at 3pm" |
| Offline mode (full) | Low | Backlog | Platform | Service worker for full offline capability, not just localStorage |
| Multi-user support | Low | Not planned | Platform | Would require fundamental architecture changes |

## Integrations to Explore

| Integration | Category | Potential Value | Feasibility |
|---|---|---|---|
| Linear | Task sync | Dev task management with richer project tracking | High - well-documented API |
| Slack | Communication | Receive tasks via Slack messages, send notifications | High - webhook-friendly |
| Google Calendar | Calendar | Alternative to MS365 for personal calendar sync | High - mature API |
| Toggl / Harvest | Time tracking | Professional time tracking with reporting | Medium - API available |
| Stripe | Financial | Invoice payment tracking and revenue data | Medium - good API, narrow use case |
| Plaid | Financial | Direct bank connection as alternative to Monarch | Medium - complex setup, regulatory |
| Zapier | Automation | Connect any service without custom code | Medium - adds dependency |
| Obsidian | Notes | Sync notes and knowledge base content | Low - local-first, complex sync |
| Airtable | Data | Alternative to Notion for structured data | Low - overlaps with existing Notion sync |

## Evaluation Criteria

When evaluating new features or integrations, consider these factors:

### Impact Assessment

| Factor | Weight | Questions to Ask |
|---|---|---|
| Daily use frequency | High | Will I use this every day? |
| Time saved | High | How many minutes per day does this save? |
| Data quality | Medium | Does this improve decision-making? |
| Complexity reduction | Medium | Does this eliminate context-switching? |
| Maintenance burden | Medium | How much ongoing work does this create? |
| Dependency risk | Low | Does this add a critical external dependency? |

### Feasibility Assessment

| Factor | Questions to Ask |
|---|---|
| API quality | Is the API well-documented, stable, and rate-limit-friendly? |
| Auth complexity | Is authentication straightforward (API key, OAuth)? |
| Data model fit | Does the external data map cleanly to MDD's schema? |
| Serverless compatible | Can it run within Vercel's function limits (10s timeout, 1024MB)? |
| Function slot cost | Does it require a new serverless function (only 3 remaining)? |
| Privacy implications | Does it handle sensitive data that needs extra protection? |

### Decision Framework

A feature or integration should be built when:

1. **Impact is clear** - It solves a real, recurring problem (not a theoretical one)
2. **Feasibility is confirmed** - A proof-of-concept validates the integration works
3. **Maintenance is manageable** - The ongoing cost is proportional to the benefit
4. **No simpler alternative** - There is not an easier way to solve the same problem

:::note
MDD HQ is a personal tool. Features are evaluated against one user's needs, not market demand. If a feature would be used less than weekly, it probably does not justify the maintenance cost.
:::

## Architecture Considerations

### Serverless Function Limits

With only 3 remaining serverless function slots on the Vercel Hobby plan, new integrations that require dedicated endpoints need to either:

1. Share an existing endpoint (e.g., extend `email-ingest` to handle Slack webhooks)
2. Run as a scheduled task within `task-process` (if they can queue work)
3. Run as a local script (like Monarch Money sync)
4. Justify upgrading to the Vercel Pro plan

### Database Table Growth

Adding tables to Supabase is not resource-constrained, but each new table needs:

- RLS policies
- Real-time subscription (if the frontend reads from it)
- Test coverage for CRUD operations
- Documentation in the schema reference

### Feature Flag Strategy

New features should be introduced behind a feature flag:

1. Create the flag in LaunchDarkly (default OFF)
2. Build the feature with `FeatureGate` or `useFeatureFlag` checks
3. Test with the flag ON locally
4. Enable in production when ready
5. Remove the flag once the feature is stable (promoted to always-on)

## Ideas Under Consideration

These are ideas that have been discussed but not committed to:

- **AI task summarization** - Generate daily/weekly summaries of completed tasks
- **Client health dashboard** - Visual health scores for all clients on one page
- **Proposal templates library** - Reusable consulting proposal templates
- **Data export** - Export tasks, clients, and activities to CSV/JSON
- **Keyboard macro system** - User-defined keyboard shortcuts for common workflows
- **Browser extension** - Quick-capture tasks from any web page
- **Voice input** - Use speech-to-text for task creation via mobile

## Related Pages

- [Changelog](./changelog) - What has already been built
- [Architecture](../overview/architecture) - System constraints
- [Vercel Deployment](../config/vercel-deployment) - Function limits
- [Feature Flags](../config/feature-flags) - Flag-based rollout strategy
