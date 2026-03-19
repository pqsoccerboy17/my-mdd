---
sidebar_position: 4
title: Keyboard Shortcuts
sidebar_label: Keyboard Shortcuts
---

# Keyboard Shortcuts

MDD HQ includes a comprehensive keyboard shortcut system for fast navigation and common actions. All shortcuts are registered through the `KeyboardShortcutProvider` context and can be discovered via the shortcuts help overlay.

## Global Shortcuts

These shortcuts work from any page in the application.

| Shortcut | Action | Description |
|---|---|---|
| `Cmd + K` | Open Command Palette | Search and execute any action |
| `Cmd + B` | Toggle Sidebar | Show or hide the navigation sidebar |
| `Cmd + Shift + L` | Cycle Theme | Rotate through light, dark, and system themes |
| `Cmd + /` | Shortcuts Help | Open the keyboard shortcuts reference overlay |
| `Esc` | Close Overlay | Dismiss any open modal, panel, or overlay |

## Command Palette

The command palette (`Cmd + K`) is the fastest way to navigate and act in MDD HQ. It provides a fuzzy-search interface for:

- **Navigation** - Jump to any route: Dashboard, Tasks, Consulting, Financial Health, CC Tracker
- **Actions** - Toggle dark mode, refresh data, open settings
- **Task operations** - Create a task, filter tasks, switch view modes
- **Feature access** - Quick access to any feature regardless of sidebar state

### How It Works

1. Press `Cmd + K` from anywhere in the app
2. Type to fuzzy-search available commands
3. Use arrow keys to navigate results
4. Press `Enter` to execute the selected command
5. Press `Esc` to dismiss without acting

The command palette is powered by the `CommandPaletteProvider` context. Commands are registered by individual feature modules, so the available commands change based on which features are enabled via [feature flags](../config/feature-flags).

:::tip
The command palette is the recommended way to navigate MDD HQ. It is faster than clicking through the sidebar for experienced users.
:::

## View-Specific Shortcuts

Some pages register additional shortcuts that only work when that view is active.

### Task Manager Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + N` | Create new task |
| `Cmd + F` | Focus filter search |
| `1` - `4` | Switch view mode (list, board, timeline, calendar) |

### Consulting Portal Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + N` | Create new client/deal/contact (context-dependent) |
| `Cmd + F` | Focus search |

## Theme Cycling

The `Cmd + Shift + L` shortcut cycles through three theme modes:

1. **Light** - Default light theme
2. **Dark** - Full dark mode
3. **System** - Follow the operating system preference

Theme preference is persisted to localStorage and synced across tabs. The `ThemeProvider` context manages theme state and applies the appropriate CSS classes to the document root.

:::info
Dark mode is also controlled by the `DARK_MODE` feature flag. If the flag is disabled, the theme toggle shortcut still works but defaults to light mode.
:::

## Shortcuts Help Overlay

Press `Cmd + /` to open the shortcuts help overlay. This modal displays all currently registered keyboard shortcuts grouped by category. The overlay itself can be dismissed with `Esc`.

The help overlay dynamically reflects the current state -- it only shows shortcuts for features that are enabled and views that are accessible.

## Implementation Details

### KeyboardShortcutProvider

The global keyboard shortcut system is implemented as a React context provider that wraps the entire application. Key implementation details:

- Shortcuts are registered with a `key`, `modifiers` array, `handler` function, and `description`
- The provider attaches a single `keydown` event listener to the document
- Shortcuts are matched by key code and modifier combination
- View-specific shortcuts register on mount and unregister on unmount
- Conflicts are resolved by specificity -- more modifiers take priority

### Preventing Browser Conflicts

Some `Cmd` shortcuts conflict with browser defaults. MDD HQ uses `preventDefault()` on matched shortcuts to override browser behavior. The shortcuts were chosen to avoid conflicts with critical browser functions like `Cmd + W` (close tab) and `Cmd + T` (new tab).

### Accessibility

All shortcut-triggered actions are also accessible via mouse/touch interaction. Keyboard shortcuts are an acceleration layer, not a requirement. The command palette provides full functionality for users who prefer search-based navigation over memorizing shortcuts.

## Related Pages

- [Platform Features](../features/platform) - Command palette and other platform capabilities
- [Feature Flags](../config/feature-flags) - How flags affect available shortcuts
