---
sidebar_position: 7
title: Platform Features
sidebar_label: Platform
---

# Platform Features

Beyond the core feature areas (Tasks, Consulting, Financial Health, CC Tracker), MDD HQ includes several platform-level capabilities that enhance the overall experience: a command palette, keyboard shortcuts, dark mode, feature flags, and developer metrics.

## Command Palette (Cmd+K)

The command palette is a fuzzy-search launcher accessible from anywhere in the app via `Cmd+K`. It provides fast access to:

- **Navigation** - Jump to any route without clicking through the sidebar
- **Actions** - Toggle features, refresh data, create new items
- **Search** - Find tasks, clients, contacts, and deals by name
- **Settings** - Quick access to theme toggle and feature flag overrides

### Architecture

The command palette is powered by the `CommandPaletteProvider` context:

1. Feature modules register their commands on mount
2. The palette aggregates all registered commands into a searchable index
3. User input triggers fuzzy matching against command titles and descriptions
4. Arrow keys navigate results, Enter executes the selected command
5. Esc dismisses the palette without action

Commands are dynamically registered -- if a feature is disabled via a feature flag, its commands do not appear in the palette. This keeps the command list relevant to what is actually available.

:::tip
The command palette is the fastest way to navigate MDD HQ. Power users rarely touch the sidebar after learning the command palette.
:::

## Keyboard Shortcuts

MDD HQ has a comprehensive keyboard shortcut system documented in [Keyboard Shortcuts](../overview/keyboard-shortcuts). The highlights:

| Shortcut | Action |
|---|---|
| `Cmd+K` | Open command palette |
| `Cmd+B` | Toggle sidebar |
| `Cmd+Shift+L` | Cycle theme (light/dark/system) |
| `Cmd+/` | Show shortcuts help |
| `Esc` | Close any overlay |

The `KeyboardShortcutProvider` context manages shortcut registration and event handling at the document level. Individual views can register view-specific shortcuts that are only active when that view is mounted.

## Dark Mode

Dark mode is a first-class feature with full support across all components:

### Theme Options

| Mode | Behavior |
|---|---|
| Light | Default light theme |
| Dark | Full dark theme with adjusted contrast |
| System | Follow the OS preference (macOS dark mode) |

### Implementation

- The `ThemeProvider` context manages theme state
- Theme preference is persisted to localStorage
- Theme changes apply a CSS class to the document root
- Tailwind CSS 4 dark mode utilities handle component-level styling
- Cross-tab sync ensures all open tabs reflect the same theme

### Feature Flag

The `DARK_MODE` feature flag controls whether the theme toggle is available. When disabled, the app stays in light mode regardless of localStorage state. This flag is useful for ensuring consistent appearance during demos.

## Feature Flags

MDD HQ uses [LaunchDarkly](https://launchdarkly.com/) for feature flag management. Flags are evaluated client-side using the LaunchDarkly React SDK.

### Flag Registry

| Flag | Default | Controls |
|---|---|---|
| `CONSULTING_AI_FEATURES` | OFF | AI capabilities in the consulting portal |
| `CONSULTING_COST_INTEL` | OFF | Cost and competitive intelligence features |
| `ACTIVITY_CENTER` | OFF | Activity center UI component |
| `DARK_MODE` | ON | Theme toggle availability |
| `PIPELINE_DND` | ON | Drag-and-drop on pipeline boards |
| `ANALYTICS_DRILL_DOWN` | OFF | Click-to-drill analytics charts |
| `PERSONAL_FINANCE` | OFF | Financial health dashboard visibility |
| `DEMO_MODE` | OFF | Demo mode with sample data |

### Components

Two components provide flag-based rendering:

**`useFeatureFlag(flagKey)`** - A hook that returns the boolean value of a flag:

```jsx
const isEnabled = useFeatureFlag('CONSULTING_AI_FEATURES');
if (isEnabled) {
  // render AI features
}
```

**`FeatureGate`** - A component that conditionally renders children based on a flag:

```jsx
<FeatureGate flag="PERSONAL_FINANCE">
  <FinancialHealthDashboard />
</FeatureGate>
```

### Security-Sensitive Flags

Flags that gate access to sensitive data default to OFF:

- `PERSONAL_FINANCE` - Financial data requires explicit opt-in
- `CONSULTING_AI_FEATURES` - AI features that access client data
- `CONSULTING_COST_INTEL` - Competitive intelligence data

See [Feature Flags](../config/feature-flags) for the complete configuration reference.

## Demo Mode

The `DEMO_MODE` flag enables a presentation-safe version of MDD HQ:

- Sample data replaces real data for all features
- No real API calls are made to external services
- Financial data shows example figures
- Client names and deal values are anonymized

Demo mode is useful for presentations, screen recordings, and documentation screenshots.

## Dev Metrics

MDD HQ includes a developer metrics page that tracks code quality and test health:

### Quality Score

The quality score is a composite metric based on:

| Metric | Weight | Current |
|---|---|---|
| Test count | - | 1,831 tests |
| Test files | - | 193 files |
| Lint errors | Pass/fail | 0 errors |
| Semgrep findings | Pass/fail | 0 findings |
| Statement coverage | Threshold | 74% |
| Branch coverage | Threshold | 63% |
| Function coverage | Threshold | 63% |
| Line coverage | Threshold | 76% |
| **Quality Score** | **Composite** | **100/100** |

### Metrics Display

The dev metrics page shows:

- Current quality score with trend
- Test suite summary (total tests, pass rate, duration)
- Coverage breakdown by threshold category
- Lint error count with trend
- Semgrep finding count with trend
- Build time and bundle size

## LaunchDarkly Integration

The LaunchDarkly integration is initialized in the app's root component:

1. The `VITE_LAUNCHDARKLY_CLIENT_ID` environment variable provides the SDK key
2. The `FeatureFlagProvider` wraps the app and initializes the LaunchDarkly client
3. Flags are evaluated against the current user context
4. Flag changes in the LaunchDarkly dashboard are reflected in real-time (no deploy needed)

:::note
Flag overrides can be set in localStorage for development purposes. These overrides take precedence over LaunchDarkly values, making it easy to test flag combinations locally.
:::

## Related Pages

- [Keyboard Shortcuts](../overview/keyboard-shortcuts) - Full shortcut reference
- [Feature Flags](../config/feature-flags) - Complete flag configuration
- [Testing](../guides/testing) - Quality baseline details
- [Dev Setup](../config/dev-setup) - Local development configuration
