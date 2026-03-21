---
title: DeepWiki Intelligence Plan
sidebar_label: DeepWiki Research
sidebar_position: 5
---

# DeepWiki Intelligence Plan

**Purpose:** Use DeepWiki to study, deconstruct, and port the best open source work into our stack.

> **Scope clarity:**
> - MDD site + dashboard -- we build this
> - Treehouse deal/portfolio tools -- we build this
> - Tap marketing site -- we build this
> - Tap CRM product -- we DO NOT build; we spec, configure, and operate it
> - Agent/automation layer (n8n, Claude Code workflows) -- we build this

---

## What DeepWiki Unlocks

DeepWiki (by Cognition / Devin) turns any public GitHub repo into interactive, AI-generated documentation you can talk to in natural language.

**Access pattern:**
```
github.com/twentyhq/twenty => deepwiki.com/twentyhq/twenty
```

**DeepWiki MCP Server** -- plugged into Claude Code sessions:
- Tools: `ask_question`, `read_wiki_contents`, `read_wiki_structure`
- Add to MCP config: `mcp.deepwiki.com/mcp`
- Agents can query foreign codebases mid-session, zero context switching

**Three modes:**
1. Standard wiki -- architecture overview, component docs, flow diagrams
2. Ask mode -- natural language Q&A grounded in actual source code
3. Deep Research -- comprehensive analysis, cross-repo comparison

---

## Tier 1 -- Build Repos (Port Code)

### 1. tremorlabs/tremor
**Why:** React + Tailwind dashboard component library. KPI cards, charts, tables.

**What to steal:** KPI card patterns, chart color mapping utility, CategoryBar for pipeline visualization, dark theme approach with Tailwind.

**What NOT to steal:** Radix UI primitives (we already have modal/drawer/tooltip).

**DeepWiki questions:**
- "What dashboard components exist and what props do they take?"
- "How does the color theming system work with Tailwind?"
- "How does the AreaChart component handle responsive sizing?"

**Port target:** MDD dashboard command center

---

### 2. recharts/recharts
**Why:** The chart library under Tremor and most React dashboards.

**What to steal:** ComposedChart for overlaying deal metrics, custom tooltip patterns, reference line and area fill.

**DeepWiki questions:**
- "How does ComposedChart combine bar and line charts?"
- "How do you build a custom tooltip component?"
- "How does ResponsiveContainer handle parent div resizing?"

**Port target:** Treehouse deal analysis charts

---

### 3. maybe-finance/maybe
**Why:** Open source personal finance dashboard. Net worth, portfolio, accounts.

**What to steal:** Account type hierarchy (Depository, Investment, Credit, Loan, Property), LOCF balance calculation, Valuation entry concept.

**What NOT to steal:** Plaid integration (we use Monarch), Rails view layer (we're React), Synth Finance API.

**DeepWiki questions:**
- "What is the data model for accounts and holdings?"
- "How is net worth calculated and displayed over time?"
- "How are transactions categorized and stored?"

**Port target:** Treehouse portfolio tracker, financial health extensions

---

### 4. simonw/llm
**Why:** Simon Willison's Unix-composable LLM CLI. SQLite logging is the key insight.

**What to steal:** SQLite logging schema, plugin architecture for providers (Ollama, MLX, Claude), embedding storage, template/prompt management.

**DeepWiki questions:**
- "What's the SQLite schema for logging LLM interactions?"
- "How does the plugin system work for adding new LLM providers?"
- "How does the embedding command store results?"

**Port target:** LLM call audit log for all three business units

---

### 5. simonw/sqlite-vec
**Why:** Vector search inside SQLite. No server. No Docker. Just a file.

**What to steal:** vec0 virtual table pattern, kNN query syntax, metadata filtering with vector search.

**DeepWiki questions:**
- "How do you store and query vector embeddings in SQLite?"
- "What's the kNN query syntax for similarity search?"
- "What's the practical scale limit before Chroma becomes necessary?"

**Port target:** Lightweight RAG for consulting documents

---

### 6. n8n-io/n8n
**Why:** We run n8n for email triage, deal tracking, briefings, content pipeline.

**What to steal:** Custom node development framework, credential encryption, sub-workflow execution, queue/retry system.

**DeepWiki questions:**
- "How do I build a custom n8n node from scratch?"
- "How does the sub-workflow execution pattern work?"
- "How does n8n handle webhook reliability and retries?"

**Port target:** MDD task ingest node, email triage pipeline

---

### 7. mastra-ai/mastra
**Why:** TypeScript-native agent framework. Replit production: 80% to 96% task success. Swyx consensus pick.

**What to steal:** Agent definition with tools/memory/RAG, workflow orchestration with state, MCP server integration, vector DB wiring.

**DeepWiki questions:**
- "How do you define a TypeScript agent with RAG and MCP tools?"
- "How does workflow state persist between steps?"
- "What's the error recovery pattern for long-running workflows?"

**Port target:** Structured agent workflows replacing ad-hoc skills

---

### 8. ml-explore/mlx-examples
**Why:** Apple MLX framework. M5 Pro Neural Engine optimization.

**What to steal:** LLM inference config for Apple Silicon, batch embedding generation, quantization settings for 32B models on 48GB.

**DeepWiki questions:**
- "What's the recommended inference config for 32B models on Apple Silicon?"
- "How does the batch embedding pipeline work?"
- "How does quantization affect quality for business document use cases?"

---

## Tier 2 -- Product Intelligence (Tap Specs)

These inform what we require from whoever builds the Tap CRM product. DeepWiki sessions produce spec documents, not PRs.

| Repo | What to Extract |
|------|----------------|
| twentyhq/twenty | CRM data model -- contacts, companies, deals, RBAC |
| marmelab/atomic-crm | Lean CRM patterns -- what minimal looks like |
| calcom/cal.com | Multi-tenant white-label patterns |
| dubinc/dub | SaaS billing, workspace model, Vercel Edge |

---

## Tier 3 -- Reference Repos

| Repo | What to Learn |
|------|--------------|
| shadcn-ui/ui | Component composition, theming |
| modelcontextprotocol/servers | Custom MCP server patterns |
| ollama/ollama | Memory allocation, Apple Silicon tuning |
| chroma-core/chroma | Collection isolation, batch ops |

---

## Port Priority Map

| Building | Primary Source | Secondary |
|----------|---------------|-----------|
| Dashboard KPI cards | tremorlabs/tremor | recharts |
| Dashboard charts | recharts | tremor |
| Treehouse deal charts | recharts | maybe-finance |
| Portfolio tracker | maybe-finance | tremor |
| LLM call logging | simonw/llm | -- |
| Consulting RAG | simonw/sqlite-vec | chroma |
| n8n custom nodes | n8n-io/n8n | -- |
| Agent workflows | mastra-ai/mastra | -- |
| Local model tuning | ml-explore/mlx-examples | ollama |
| Custom MCP servers | modelcontextprotocol/servers | -- |
| Tap product spec | twentyhq/twenty | calcom |

---

## Research Session Template

For each Tier 1 repo:

1. Open deepwiki.com/[repo]
2. Read architecture overview first (mandatory)
3. Find the specific module you want
4. Ask: "How does [feature] work end to end?"
5. Ask: "What are the key files for [feature]?"
6. Ask: "What are the edge cases or gotchas?"
7. Document findings in the feature branch
8. Brief Claude Code with findings, then build

---

## Code Attribution Convention

When porting from DeepWiki findings:

```typescript
// SOURCE: deepwiki.com/[repo]/[page]
// PATTERN: [what we're adapting]
// ADAPTED: [what we changed for our stack]
```

---

*Update this doc after each research session with findings, dead ends, and confirmed ports.*
*Full spec: MDD/specs/deepwiki-intelligence-plan.md*
