#!/usr/bin/env node

/**
 * Changelog Sync -- fetches MDD HQ commits via GitHub API,
 * summarizes them into narrative eras via Claude API,
 * and writes the result to src/data/changelog-sync.json.
 *
 * Environment variables:
 *   GITHUB_TOKEN     - GitHub PAT with repo read access
 *   ANTHROPIC_API_KEY - Claude API key for era summarization
 *   MDD_REPO         - GitHub repo (default: pqsoccerboy17/MDD)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SYNC_FILE = resolve(__dirname, '../src/data/changelog-sync.json');
const PROJECT_START = new Date('2026-02-22T00:00:00-06:00');
const MIN_COMMITS_FOR_ERA = 3;
const MDD_REPO = process.env.MDD_REPO || 'pqsoccerboy17/MDD';

// ---- HTTP helpers ----

function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}: ${data.slice(0, 500)}`));
        } else {
          resolve({ data: JSON.parse(data), headers: res.headers });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function githubGet(path) {
  const url = new URL(path, 'https://api.github.com');
  return httpsRequest(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'changelog-sync',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}

async function claudeMessage(systemPrompt, userPrompt) {
  const body = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const { data } = await httpsRequest(
    new URL('https://api.anthropic.com/v1/messages'),
    {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    },
    body,
  );

  const textBlock = data.content?.find((b) => b.type === 'text');
  if (!textBlock) throw new Error('No text block in Claude response');
  return textBlock.text;
}

// ---- Data helpers ----

function readSyncFile() {
  try {
    return JSON.parse(readFileSync(SYNC_FILE, 'utf-8'));
  } catch {
    return {
      lastSyncedSha: 'a584232',
      lastSyncedDate: '2026-03-21T00:00:00Z',
      pending: [],
      eras: [],
    };
  }
}

function writeSyncFile(data) {
  writeFileSync(SYNC_FILE, JSON.stringify(data, null, 2) + '\n');
}

function dayNumber(dateStr) {
  const commitDate = new Date(dateStr);
  const diffMs = commitDate.getTime() - PROJECT_START.getTime();
  return Math.ceil(diffMs / 86400000);
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isNoiseCommit(message) {
  const lower = message.toLowerCase();
  return (
    lower.startsWith('merge branch') ||
    lower.startsWith('merge pull request') ||
    lower.startsWith('chore: update dev metrics') ||
    lower.includes('[changelog-sync]') ||
    lower.startsWith('chore(changelog-sync)')
  );
}

// ---- Fetch commits from GitHub ----

async function fetchNewCommits(since) {
  const allCommits = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const path = `/repos/${MDD_REPO}/commits?sha=main&since=${since}&per_page=${perPage}&page=${page}`;
    const { data } = await githubGet(path);

    if (!Array.isArray(data) || data.length === 0) break;
    allCommits.push(...data);

    if (data.length < perPage) break;
    page++;
  }

  return allCommits;
}

// ---- Claude era summarization ----

const SYSTEM_PROMPT = `You are a changelog narrator for a software project called MDD HQ -- a personal productivity dashboard.
You write in the style of a mountaineering expedition journal. Each development phase is an "era" with a thematic name and narrative description.

You MUST respond with ONLY valid JSON (no markdown, no code fences) matching this exact schema:
{
  "id": "kebab-case-unique-id",
  "title": "2-3 Word Thematic Name",
  "subtitle": "3-5 Word Technical Description",
  "description": "1-2 sentence narrative summary of what was accomplished in this era.",
  "changes": [
    {
      "text": "Concise past-tense description of what was built or fixed",
      "category": "feature" | "infrastructure" | "quality" | "design",
      "notable": true or false
    }
  ]
}

Rules:
- Group related commits into a single change entry
- Mark at most 40% of changes as notable (true for major additions)
- Use past tense, no emojis, no em dashes (use hyphens instead)
- Collapse sequences of fixes for the same feature into one entry
- Drop commits that are purely CI retry attempts or version bumps
- The id must be unique and kebab-case
- Do NOT wrap the JSON in markdown code fences`;

async function summarizeEra(commits, dayStart, dayEnd, dateStart, dateEnd, existingTitles) {
  const commitList = commits
    .map((c) => `- ${c.message.split('\n')[0]}`)
    .join('\n');

  const userPrompt = `Summarize these ${commits.length} commits into one era.
Do not reuse these existing era titles: ${existingTitles.join(', ')}

Date range: ${dateStart} - ${dateEnd}
Day range: Days ${dayStart}-${dayEnd}

Commits:
${commitList}`;

  const response = await claudeMessage(SYSTEM_PROMPT, userPrompt);

  // Parse JSON -- handle potential code fences
  let cleaned = response.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  const era = JSON.parse(cleaned);

  // Add stats that Claude doesn't generate
  era.stats = {
    commits: commits.length,
    dayRange: dayStart === dayEnd ? `Day ${dayStart}` : `Days ${dayStart}-${dayEnd}`,
    dateRange: dateStart === dateEnd ? dateStart : `${dateStart} - ${dateEnd}`,
    highlights: era.changes.filter((c) => c.notable).length,
  };
  era.trailPosition = 0; // sentinel -- TrailMap auto-computes

  return era;
}

// ---- Main ----

async function main() {
  // Validate env
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN not set');
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY not set');
    process.exit(1);
  }

  const syncData = readSyncFile();
  console.log(`Last synced: ${syncData.lastSyncedSha.slice(0, 7)} (${syncData.lastSyncedDate})`);

  // Fetch new commits
  const rawCommits = await fetchNewCommits(syncData.lastSyncedDate);
  console.log(`Fetched ${rawCommits.length} commits from GitHub`);

  if (rawCommits.length === 0) {
    console.log('No new commits. Exiting.');
    return;
  }

  // Filter and deduplicate
  const seenShas = new Set([syncData.lastSyncedSha]);
  syncData.eras.forEach((era) => {
    // Track SHAs we've already processed (none stored, but prevent re-processing)
  });

  const newCommits = rawCommits
    .filter((c) => !seenShas.has(c.sha))
    .filter((c) => c.parents?.length <= 1) // drop merges
    .filter((c) => !isNoiseCommit(c.commit.message))
    .map((c) => ({
      sha: c.sha,
      message: c.commit.message,
      date: c.commit.author.date,
      day: dayNumber(c.commit.author.date),
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log(`After filtering: ${newCommits.length} new commits`);

  // Combine with pending
  const allPending = [...(syncData.pending || []), ...newCommits];

  if (allPending.length < MIN_COMMITS_FOR_ERA) {
    console.log(`Only ${allPending.length} commits (need ${MIN_COMMITS_FOR_ERA}). Storing as pending.`);
    syncData.pending = allPending;
    if (newCommits.length > 0) {
      syncData.lastSyncedSha = rawCommits[0].sha; // most recent
      syncData.lastSyncedDate = rawCommits[0].commit.author.date;
    }
    writeSyncFile(syncData);
    return;
  }

  // Generate era from accumulated commits
  const dayStart = Math.min(...allPending.map((c) => c.day));
  const dayEnd = Math.max(...allPending.map((c) => c.day));
  const dateStart = formatDate(allPending[0].date);
  const dateEnd = formatDate(allPending[allPending.length - 1].date);

  const existingTitles = syncData.eras.map((e) => e.title);

  console.log(`Generating era for Days ${dayStart}-${dayEnd} (${allPending.length} commits)...`);

  const era = await summarizeEra(allPending, dayStart, dayEnd, dateStart, dateEnd, existingTitles);
  console.log(`Era generated: "${era.title}" - ${era.subtitle}`);

  // Append era, update cursor, clear pending
  syncData.eras.push(era);
  syncData.pending = [];
  syncData.lastSyncedSha = rawCommits[0].sha;
  syncData.lastSyncedDate = rawCommits[0].commit.author.date;

  writeSyncFile(syncData);
  console.log(`Wrote ${syncData.eras.length} total synced eras to ${SYNC_FILE}`);
}

main().catch((err) => {
  console.error('Changelog sync failed:', err.message);
  process.exit(1);
});
