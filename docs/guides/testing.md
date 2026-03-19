---
sidebar_position: 2
title: Testing
sidebar_label: Testing
---

# Testing

MDD HQ maintains a comprehensive test suite with **1,831 tests across 193 files**. The project uses Vitest as the test runner, React Testing Library for component tests, and jsdom for browser environment simulation.

## Test Suite Overview

| Metric | Value |
|---|---|
| Total tests | 1,831 |
| Test files | 193 |
| Test runner | Vitest |
| Environment | jsdom |
| Component testing | React Testing Library |
| Quality score | 100/100 |
| Lint errors | 0 |
| Semgrep findings | 0 |

## Running Tests

### All Tests (Once)

```bash
npm test
```

Runs the complete test suite once and exits. A full run typically takes 30-60 seconds depending on machine performance.

### Watch Mode

```bash
npm run test:watch
```

Starts Vitest in watch mode. Tests re-run automatically when source files change. Only affected tests are re-run for fast feedback during development.

### Single File

```bash
npx vitest run src/features/tasks/hooks/useTaskManager.test.js
```

Run tests from a specific file. Useful for focused development on a single module.

### With Coverage

```bash
npm run test:coverage
```

Runs the full suite and generates a coverage report. The report is output to the terminal and as an HTML report in `coverage/`.

### Vitest UI

```bash
npm run test:ui
```

Opens the Vitest browser-based UI for interactive test exploration. Shows test files, results, and coverage in a graphical interface.

## Coverage Thresholds

Coverage thresholds are enforced in the Vitest configuration. Tests fail if coverage drops below these minimums:

| Metric | Threshold | Description |
|---|---|---|
| Statements | 74% | Percentage of code statements executed |
| Branches | 63% | Percentage of conditional branches covered |
| Functions | 63% | Percentage of functions called |
| Lines | 76% | Percentage of code lines executed |

These thresholds are configured in `vitest.config.js`:

```js
export default defineConfig({
  test: {
    coverage: {
      thresholds: {
        statements: 74,
        branches: 63,
        functions: 63,
        lines: 76
      }
    }
  }
});
```

:::warning
If you add new code without tests and coverage drops below the threshold, the `npm run test:coverage` command will fail. Either add tests for the new code or adjust thresholds (with justification).
:::

## Test Organization

Tests live alongside the code they test, following the `*.test.js` or `*.test.jsx` naming convention:

```
src/
  features/
    tasks/
      hooks/
        useTaskManager.js
        useTaskManager.test.js
        useTaskSync.js
        useTaskSync.test.js
      components/
        TaskList.jsx
        TaskList.test.jsx
  hooks/
    useFeatureFlag.js
    useFeatureFlag.test.js
  utils/
    dateHelpers.js
    dateHelpers.test.js
api/
  sync-notion.js
  sync-notion.test.js
  _lib/
    syncAndUpsert.js
    syncAndUpsert.test.js
```

### Test Categories

| Category | Count (approx) | What They Cover |
|---|---|---|
| Hook tests | ~400 | Custom React hooks (useTaskManager, useTaskSync, etc.) |
| Component tests | ~600 | UI component rendering and interaction |
| Utility tests | ~300 | Pure functions, helpers, formatters |
| API tests | ~200 | Serverless function handlers |
| Integration tests | ~331 | Multi-module interaction scenarios |

## Test Helpers

### mockReq

A helper for creating mock HTTP request objects in API tests:

```js
import { mockReq } from './test-helpers';

const req = mockReq({
  method: 'POST',
  headers: { 'x-api-key': 'test-key' },
  body: { taskId: 'abc-123' }
});
```

### mockRes

A helper for creating mock HTTP response objects with chainable methods:

```js
import { mockRes } from './test-helpers';

const res = mockRes();

// After calling the handler
expect(res.status).toHaveBeenCalledWith(200);
expect(res.json).toHaveBeenCalledWith({ status: 'ok' });
```

### Supabase Mocks

Tests mock the Supabase client to avoid hitting the real database:

```js
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: mockTasks,
        error: null
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null })
    })
  })
}));
```

### Render Helpers

Component tests use custom render helpers that wrap components with required providers:

```jsx
import { renderWithProviders } from './test-utils';

test('TaskList renders tasks', () => {
  renderWithProviders(<TaskList tasks={mockTasks} />);
  expect(screen.getByText('Update docs')).toBeInTheDocument();
});
```

The `renderWithProviders` helper wraps the component with `SupabaseProvider`, `ThemeProvider`, `FeatureFlagProvider`, and other required contexts.

## Test Patterns

### Hook Testing

Custom hooks are tested using `renderHook` from React Testing Library:

```jsx
import { renderHook, act } from '@testing-library/react';
import { useTaskManager } from './useTaskManager';

test('adds a task', () => {
  const { result } = renderHook(() => useTaskManager());

  act(() => {
    result.current.addTask({ title: 'New task' });
  });

  expect(result.current.tasks).toHaveLength(1);
  expect(result.current.tasks[0].title).toBe('New task');
});
```

### Component Testing

Components are tested for rendering, user interaction, and state changes:

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

test('shows task title', () => {
  render(<TaskCard task={{ title: 'Fix bug', type: 'dev' }} />);
  expect(screen.getByText('Fix bug')).toBeInTheDocument();
});

test('calls onComplete when checkbox clicked', () => {
  const onComplete = vi.fn();
  render(<TaskCard task={mockTask} onComplete={onComplete} />);
  fireEvent.click(screen.getByRole('checkbox'));
  expect(onComplete).toHaveBeenCalledWith(mockTask.id);
});
```

### API Testing

Serverless function handlers are tested with mock request/response objects:

```js
import handler from './sync-notion';
import { mockReq, mockRes } from './_lib/test-helpers';

test('returns 401 without auth', async () => {
  const req = mockReq({ method: 'GET' });
  const res = mockRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
});

test('syncs tasks from Notion', async () => {
  const req = mockReq({
    method: 'GET',
    headers: { authorization: 'Bearer test-secret' }
  });
  const res = mockRes();

  await handler(req, res);

  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({ synced: expect.any(Number) })
  );
});
```

## ESLint Configuration

ESLint enforces code quality with zero tolerance for errors:

| Rule Category | Description |
|---|---|
| React rules | React-specific best practices |
| Hooks rules | Exhaustive deps, rules of hooks |
| Import rules | Import ordering and resolution |
| Accessibility | jsx-a11y rules for accessible components |
| General | No unused variables, no console.log in production code |

Run the linter:

```bash
npm run lint
# Auto-fix where possible
npm run lint:fix
```

## Semgrep Scanning

[Semgrep](https://semgrep.dev/) performs static analysis for security vulnerabilities:

- **0 findings** is the enforced baseline
- Scans for common vulnerability patterns (XSS, injection, secrets)
- Runs as part of the CI pipeline
- Custom rules supplement the default OWASP ruleset

## Quality Score

The quality score is a composite metric:

| Component | Weight | Current Status |
|---|---|---|
| All tests passing | Required | 1,831/1,831 |
| Coverage above thresholds | Required | All 4 metrics pass |
| Zero lint errors | Required | 0 errors |
| Zero Semgrep findings | Required | 0 findings |
| **Quality Score** | **Composite** | **100/100** |

The quality score is displayed on the dev metrics page in the app and checked in CI.

:::info
The 100/100 quality score means all four components are passing. If any component fails (test failure, coverage drop, lint error, or security finding), the quality score reflects the degradation.
:::

## CI Pipeline

Tests run automatically on every push via GitHub Actions:

1. **Install** - `npm ci` for deterministic installs
2. **Lint** - `npm run lint` (must pass with 0 errors)
3. **Test** - `npm test` (all 1,831 tests must pass)
4. **Coverage** - `npm run test:coverage` (must meet thresholds)
5. **Build** - `npm run build` (must succeed)

If any step fails, the PR cannot be merged.

## Related Pages

- [Getting Started](./getting-started) - Initial setup guide
- [Dev Setup](../config/dev-setup) - Development environment details
- [Tech Stack](../overview/tech-stack) - Testing tools in context
