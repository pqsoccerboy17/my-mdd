---
sidebar_position: 3
title: GitHub Sync
sidebar_label: GitHub Sync
---

# GitHub Sync

MDD HQ maintains a bidirectional sync with a `TASKS.md` file in GitHub, enabling a developer task pipeline that flows from the Task Manager UI through GitHub Issues and Pull Requests. The consolidated endpoint handles reading, writing, dispatching tasks to repos, and managing PRs -- all through a single API surface.

## Sync Overview

| Property | Value |
|---|---|
| Endpoint | `/api/tasks-github` |
| Methods | `POST` (5 actions), `GET` (read shortcut) |
| Direction | Bidirectional |
| Auth | `GITHUB_PAT` (Personal Access Token) |
| Source Key | `github` |
| Target File | `repos/pqsoccerboy17/Mycel/contents/TASKS.md` |

## How It Works

The GitHub integration serves two purposes:

1. **Task File Sync** -- Keep a `TASKS.md` file in your Mycel repo in sync with MDD tasks
2. **Dev Pipeline** -- Dispatch tasks as GitHub Issues, then merge or discard the resulting PRs

### TASKS.md Sync

The `TASKS.md` file in the Mycel repo acts as a portable, plaintext mirror of your active tasks. MDD can read and write this file via the GitHub Contents API, using SHA-based conflict detection to prevent overwrites.

### Dev Task Pipeline

When a task requires code changes, MDD can dispatch it directly to any GitHub repo as an Issue:

1. **Dispatch** -- MDD creates a GitHub Issue with the task spec and a `[Task Build]` title prefix
2. **Build** -- The issue body includes an `@claude implement this` tag for automated implementation
3. **Review** -- Once a PR is created, you review from MDD
4. **Merge or Discard** -- MDD can squash-merge the PR or close it and delete the branch

## Endpoint Actions

The `/api/tasks-github` endpoint consolidates 5 formerly separate endpoints into a single POST handler with an `action` parameter.

| Action | Purpose | Required Params |
|---|---|---|
| `read` | Fetch current TASKS.md content and SHA | None |
| `write` | Update TASKS.md with new content | `content`, `sha`, optional `message` |
| `dispatch` | Create a GitHub Issue from a task | `taskId`, `targetRepo`, `spec`, `title` |
| `merge` | Squash-merge a PR | `taskId`, `prUrl` |
| `discard` | Close a PR and delete its branch | `taskId`, `prUrl` |

:::tip
`GET /api/tasks-github` is a shortcut for the `read` action, providing backward compatibility with the original `tasks-read` endpoint.
:::

### Read

Fetches the current `TASKS.md` content from GitHub, decoding it from base64. Returns the file content and its current SHA (needed for writes).

```json
// Response
{
  "content": "# TASKS\n- [ ] Update API docs\n...",
  "sha": "abc123..."
}
```

### Write

Updates `TASKS.md` in the repo. Requires the current SHA to prevent conflicting writes -- if the file has changed since you last read it, the GitHub API returns a `409 Conflict`.

```json
// Request
{
  "action": "write",
  "content": "# TASKS\n- [ ] Updated task list\n...",
  "sha": "abc123...",
  "message": "chore: sync TASKS.md from MDD HQ"
}
```

If no commit message is provided, it defaults to `chore: sync TASKS.md from MDD HQ`.

### Dispatch

Creates a GitHub Issue in the specified target repository. The issue is tagged with the `task-build` label and includes an `@claude implement this` directive in the body.

```json
// Request
{
  "action": "dispatch",
  "taskId": "uuid-here",
  "targetRepo": "pqsoccerboy17/my-mdd",
  "spec": "Add dark mode toggle to sidebar...",
  "title": "Add dark mode toggle"
}
```

```json
// Response
{
  "issueUrl": "https://github.com/pqsoccerboy17/my-mdd/issues/42",
  "issueNumber": 42
}
```

### Merge

Squash-merges a Pull Request. The PR URL is parsed to extract the owner, repo, and PR number. On success, returns a link to the deploy URL.

```json
// Request
{
  "action": "merge",
  "taskId": "uuid-here",
  "prUrl": "https://github.com/pqsoccerboy17/my-mdd/pull/42"
}
```

### Discard

Closes a Pull Request without merging and deletes the associated branch. This is a two-step operation: close the PR via PATCH, then delete the head ref.

```json
// Request
{
  "action": "discard",
  "taskId": "uuid-here",
  "prUrl": "https://github.com/pqsoccerboy17/my-mdd/pull/42"
}
```

## Conflict Handling

The `write` action uses GitHub's SHA-based optimistic concurrency:

1. Read the file to get the current SHA
2. Submit the write with that SHA
3. If the file changed between read and write, GitHub returns `409 Conflict`
4. The client must re-read, resolve the conflict, and retry

:::warning
Always read the current SHA immediately before writing. Stale SHAs will cause write failures.
:::

## Environment Variables

| Variable | Purpose |
|---|---|
| `GITHUB_PAT` | GitHub Personal Access Token with repo scope |

## Related Pages

- [Data Sources](../features/task-data-sources) -- All task source overview
- [Sync Endpoints](../api/sync-endpoints) -- API endpoint documentation
- [AI Pipeline](../ai-pipeline/overview) -- How dispatched tasks trigger automated builds
- [Tasks Schema](../data/tasks-schema) -- Task table details
