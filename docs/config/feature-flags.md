---
sidebar_position: 2
title: Feature Flags
sidebar_label: Feature Flags
---

# Feature Flags

MDD HQ uses [LaunchDarkly](https://launchdarkly.com/) for feature flag management. Flags control feature visibility, gate security-sensitive data, enable demo mode, and allow safe rollout of new capabilities without redeployment.

## LaunchDarkly Integration

### Setup

The LaunchDarkly React SDK is initialized in the app's root component using the `VITE_LAUNCHDARKLY_CLIENT_ID` environment variable. The `FeatureFlagProvider` wraps the entire application tree.

### Flag Evaluation

Flags are evaluated client-side. When the LaunchDarkly dashboard is updated, changes propagate to all connected clients in real-time via WebSocket -- no deployment required.

### Local Overrides

During development, flag values can be overridden via localStorage:

```js
// Override a flag locally
localStorage.setItem('ff_override_PERSONAL_FINANCE', 'true');

// Remove the override
localStorage.removeItem('ff_override_PERSONAL_FINANCE');
```

Local overrides take precedence over LaunchDarkly values. This is useful for testing features that are disabled in the dashboard.

## Flag Registry

| Flag | Default | Type | What It Controls |
|---|---|---|---|
| `CONSULTING_AI_FEATURES` | OFF | boolean | AI capabilities in the consulting portal: deal scoring, client intelligence, contact enrichment, briefings, follow-up generation |
| `CONSULTING_COST_INTEL` | OFF | boolean | Cost and competitive intelligence features within the consulting portal. Requires `CONSULTING_AI_FEATURES` to also be ON |
| `ACTIVITY_CENTER` | OFF | boolean | Activity center UI component showing recent activity feed |
| `DARK_MODE` | ON | boolean | Theme toggle availability. When OFF, app stays in light mode |
| `PIPELINE_DND` | ON | boolean | Drag-and-drop interaction on pipeline boards (deal pipeline and dev task pipeline) |
| `ANALYTICS_DRILL_DOWN` | OFF | boolean | Click-to-drill on analytics charts in the consulting portal |
| `PERSONAL_FINANCE` | OFF | boolean | Financial health dashboard visibility. Security-sensitive -- gates access to financial data |
| `DEMO_MODE` | OFF | boolean | Demo mode with sample data, anonymized names, and no real API calls |

## Flag Details

### CONSULTING_AI_FEATURES

Controls all AI capabilities within the consulting portal:

- Deal scoring via the `deal-score` executor
- Client intelligence via the `research` executor
- Contact enrichment via the `enrich` executor
- Client briefing generation via the `briefing` executor
- Follow-up draft generation via the `follow-up` executor
- AI action buttons in the consulting UI

:::warning
This flag defaults to **OFF** because AI features access and process client data. Enable only when you want AI to analyze client, deal, and contact information.
:::

### CONSULTING_COST_INTEL

A sub-flag that controls cost and competitive intelligence features. This flag has a dependency:

- `CONSULTING_AI_FEATURES` must be ON **and** `CONSULTING_COST_INTEL` must be ON for cost intelligence to appear
- If `CONSULTING_AI_FEATURES` is OFF, `CONSULTING_COST_INTEL` has no effect

Cost intelligence includes market rate analysis, competitive positioning data, and pricing recommendations.

### ACTIVITY_CENTER

Controls the visibility of the activity center component, which shows a feed of recent activities across all feature areas (tasks completed, deals moved, contacts enriched, etc.).

### DARK_MODE

Controls whether the theme toggle (light/dark/system) is available. When this flag is OFF:

- The theme toggle button is hidden
- The app renders in light mode only
- The `Cmd+Shift+L` shortcut is disabled
- localStorage theme preference is ignored

This flag is useful for screenshots, demos, and presentations where a consistent light appearance is desired.

### PIPELINE_DND

Controls drag-and-drop interaction on Kanban boards:

- Deal pipeline board (consulting portal)
- Dev task pipeline board (task manager)

When OFF:
- Pipeline boards render in read-only mode
- Stage changes are made via detail panel dropdowns instead of dragging
- Board layout is preserved, just the drag interaction is disabled

### ANALYTICS_DRILL_DOWN

Controls click-to-drill behavior on analytics charts in the consulting portal. When enabled, clicking on a chart element (bar, segment, data point) reveals the underlying data records.

### PERSONAL_FINANCE

Controls visibility of the entire Financial Health dashboard (`/financial-health` route).

:::warning
This flag defaults to **OFF** and is security-sensitive. When OFF:
- The Financial Health link is hidden from the sidebar
- The `/financial-health` route renders a "Feature not enabled" message
- No financial data queries are made to Supabase
- The `FinancialDataProvider` does not initialize
:::

### DEMO_MODE

Enables a presentation-safe version of the application:

- All real data is replaced with sample/demo data
- Client names, deal values, and contact details are anonymized
- No real API calls are made to external services (Notion, GitHub, Claude)
- Financial data shows example figures
- Sync operations are simulated

Demo mode is useful for live presentations, screen recordings, and documentation.

## Components

### useFeatureFlag Hook

The primary way to check flag values in component code:

```jsx
import { useFeatureFlag } from '../hooks/useFeatureFlag';

function MyComponent() {
  const aiEnabled = useFeatureFlag('CONSULTING_AI_FEATURES');
  const financeEnabled = useFeatureFlag('PERSONAL_FINANCE');

  return (
    <div>
      {aiEnabled && <AIPanel />}
      {financeEnabled && <FinancialLink />}
    </div>
  );
}
```

### FeatureGate Component

A declarative wrapper that conditionally renders children based on a flag:

```jsx
import { FeatureGate } from '../components/FeatureGate';

function App() {
  return (
    <div>
      <FeatureGate flag="PERSONAL_FINANCE">
        <FinancialHealthDashboard />
      </FeatureGate>

      <FeatureGate flag="ACTIVITY_CENTER">
        <ActivityCenter />
      </FeatureGate>
    </div>
  );
}
```

`FeatureGate` accepts an optional `fallback` prop for rendering alternative content when the flag is OFF:

```jsx
<FeatureGate flag="PERSONAL_FINANCE" fallback={<FeatureDisabledMessage />}>
  <FinancialHealthDashboard />
</FeatureGate>
```

## Security Model

Flags are categorized by their security sensitivity:

| Category | Flags | Default | Rationale |
|---|---|---|---|
| Security-sensitive | PERSONAL_FINANCE, CONSULTING_AI_FEATURES, CONSULTING_COST_INTEL | OFF | Gate access to sensitive data (financial, client) |
| UX features | DARK_MODE, PIPELINE_DND | ON | UI preferences, safe to enable by default |
| Experimental | ACTIVITY_CENTER, ANALYTICS_DRILL_DOWN | OFF | Features still being refined |
| Presentation | DEMO_MODE | OFF | Only for demos and screenshots |

:::note
Security-sensitive flags defaulting to OFF ensures that if LaunchDarkly is unreachable (network issue, SDK failure), sensitive features remain hidden. This is a fail-closed security posture.
:::

## Related Pages

- [Platform Features](../features/platform) - How flags affect the UI
- [Environment Variables](./environment) - LaunchDarkly SDK key
- [AI Automation](../features/ai-automation) - AI feature flag usage
- [Financial Health](../features/financial-health) - Finance flag details
