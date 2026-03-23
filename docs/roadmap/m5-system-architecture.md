---
title: M5 System Architecture
sidebar_label: M5 System Plan
sidebar_position: 4
---

:::info Archived
This spec has been archived as of March 2026. M5 infrastructure is selectively deferred per the [Q2 2026 Roadmap](/roadmap/visual-planner). Key components will be revisited based on throughput needs.
:::

# M5 System Architecture -- Master Plan

**Status:** Planning (pre-arrival) | **Hardware:** MacBook Pro 14", M5 Pro | **Expected:** Late March 2026

The M5 Pro is the hardware foundation for a three-tier AI operating system: local inference (zero marginal cost), agent fleet (horizontal scaling), and automated workflows (n8n orchestration).

---

## Executive Summary

The M5 Pro (18-core CPU, 20-core GPU, Neural Engine, 48GB unified memory, 2TB SSD) enables a fundamentally different development model. Instead of "Mike + Claude Code writing code," the target state is "Mike as CEO, Claude Code as tech lead, Devin + Codex as developers, local models for zero-cost inference and review."

This plan covers six systems that compose together:

1. **Local AI Inference** -- Ollama + MLX running 20-32B models at zero marginal cost
2. **LLM Call Logging** -- every inference call logged and queryable (ported from simonw/llm)
3. **RAG Pipeline** -- consulting documents searchable via sqlite-vec
4. **Agent Fleet** -- Devin + Codex as autonomous developers, Claude Code as tech lead
5. **Workflow Automation** -- n8n self-hosted for email triage, deal tracking, daily briefings
6. **Mastra Orchestration** -- TypeScript agent framework upgrading ad-hoc skills to durable workflows

---

## 1. Local AI Inference Layer

### Model Sizing for 48GB Unified Memory

| Model | Quantization | VRAM | Speed | Role |
|-------|-------------|------|-------|------|
| Mistral 7B | Q8 | ~8GB | 80-100 t/s | Fast utility tasks |
| Qwen2.5 14B | Q8 | ~16GB | 45-60 t/s | General purpose |
| **Mistral Small 3.1 24B** | Q4 | ~14GB | 30-45 t/s | **Sweet spot** |
| **Qwen3 32B** | Q4 | ~20GB | 20-30 t/s | **Sweet spot** |
| Llama 3.3 70B | Q4 | ~40GB | 12-18 t/s | Maximum capability |

The sweet spot is 20-32B models at Q4/Q5 quantization -- fast enough for interactive use, smart enough for real work. Running two models simultaneously (24B + 7B) fits comfortably with ~22GB total.

### Framework Stack

| Framework | Role | Why |
|-----------|------|-----|
| **MLX** | Primary inference | Apple's framework, optimized for Metal + Neural Engine. 20-30% faster than llama.cpp on Apple Silicon |
| **Ollama** | Model management | Easiest setup, REST API, multi-model management |
| **llm CLI** | Unified interface | Simon Willison's tool -- logs every call to SQLite, plugin system for all providers |

### Day 1 Installation

```bash
# Ollama + models
brew install ollama
ollama pull mistral-small:24b-instruct-2501-q4_K_M
ollama pull qwen2.5:14b-instruct-q8_0
ollama pull nomic-embed-text  # Embeddings for RAG

# MLX
pip install mlx-lm

# Simon Willison's LLM CLI (logging + unified interface)
pip install llm
llm install llm-ollama
llm install llm-mlx
llm install llm-claude
```

---

## 2. LLM Call Logging

Ported from [simonw/llm](https://github.com/simonw/llm) -- every LLM call across all three businesses gets logged, queryable, and auditable.

### SQLite Schema

The `llm` CLI maintains `logs.db` with these core tables:

```
conversations: id, name, model
responses: conversation_id, prompt, output, input_tokens, output_tokens
tool_calls: response_id, tool_name, arguments
tool_results: tool_call_id, result, exception
attachments: response_id, content (multimodal)
fragments: hash, content, source (reusable context)
```

And `embeddings.db` for vector storage:
```
collections: id, name, model_id
embeddings: collection_id, vector, metadata
```

### Plugin Architecture

The `llm` CLI uses pluggy hooks -- one CLI logs calls to Ollama, MLX, AND Claude API:

- `register_models()` -- add providers
- `register_embedding_models()` -- nomic-embed-text via Ollama
- `register_tools()` -- custom tool definitions
- `register_commands()` -- extend CLI
- `register_template_loaders()` -- prompt template management

### Integration Path

- **Phase 1:** Use llm CLI directly (zero custom code, immediate logging)
- **Phase 2:** Port schema to Supabase for cloud-queryable LLM logs in MDD dashboard
- **Phase 3:** Build "LLM Activity" view showing calls per business unit

---

## 3. RAG Architecture

### sqlite-vec vs ChromaDB

| Criteria | sqlite-vec | ChromaDB |
|----------|-----------|----------|
| Setup | Single file, pip install | Server process, Docker |
| Scale limit | ~100K-500K vectors | Millions+ |
| Dependencies | Zero (SQLite extension) | Several |
| Willison endorsement | Yes | No |
| Mastra support | Yes (LibSQLVector) | Yes (ChromaVector) |

**Decision:** Start with sqlite-vec. Evaluate ChromaDB only if scale exceeds ~100K documents.

### Collections per Business Unit

| Collection | Content | Estimated Docs |
|-----------|---------|----------------|
| mdd-consulting | Client proposals, research, meeting notes | ~500 |
| treehouse | Property docs, financial records, deal memos | ~200 |
| tap | Product specs, market research | ~50 |
| shared | CLAUDE.md files, memory/, cross-cutting knowledge | ~100 |

### Query Pattern

```sql
SELECT doc_id, distance
FROM doc_embeddings
WHERE embedding MATCH ?       -- query vector
  AND business_unit = 'mdd'   -- partition by business
ORDER BY distance
LIMIT 5;
```

---

## 4. Agent Fleet Architecture

### Target Organization

```text
You (CEO / Visionary)
  => Claude Code Max (Tech Lead + Quality Gate)
        |-- Devin (Developer 1 -- routine features, tests, bugs)
        |-- Codex (Developer 2 -- async batch tasks, prototyping)
        |-- Local Models (Code review pre-filter, RAG queries)

Cross-cutting:
  DeepWiki => Codebase intelligence for all agents
  GitHub   => All work flows through PRs
  CI/CD    => SonarCloud + Semgrep + tests catch regressions
```

### Devin (Primary Autonomous Developer)

- **Cost:** $20/mo + ~$2.25/ACU (~15 min work) = ~$70-120/mo
- **Best for:** Test coverage, JSDoc comments, loading skeletons, accessibility, component polish
- **Avoid:** Sync architecture, Supabase real-time, design system decisions, multi-system integrations
- **Setup:** devin.ai -> connect GitHub -> Slack integration -> #devin-runs channel

### Codex (Async Batch Worker)

- **Cost:** Included in ChatGPT Pro ($20/mo)
- **Best for:** Fire-and-forget batch tasks, quick prototyping, documentation, code migration
- **Setup:** ChatGPT settings -> enable Codex -> connect GitHub

### PR Review Pipeline

```text
Agent opens PR
  => CI runs (tests, lint, SonarCloud, Semgrep)
  => Local model pre-filter (convention check)
  => Claude Code deep review (architecture, patterns)
  => You review for intent
  => Merge
```

### Role Time Allocation (Target State)

| Activity | % Time | What |
|----------|--------|------|
| Vision + planning | 20% | Features, roadmap, business strategy |
| Architecture with Claude Code | 30% | Design, trade-offs, complex integrations |
| PR review | 40% | Quality gate -- every agent PR reviewed |
| Task assignment | 10% | GitHub Issues, Slack tags, backlog priority |

---

## 5. n8n Automation Layer

Self-hosted on M5 via Docker:

```bash
docker run -d --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Target Workflows

| Workflow | Trigger | Output |
|----------|---------|--------|
| Email triage | Cron (hourly) | Sorted inbox, tasks created |
| Deal tracking | Notion webhook | Pipeline alerts |
| Daily briefing | Cron (7am CT) | Morning summary |
| Content pipeline | Manual | Blog/LinkedIn drafts |
| Financial sync | Cron (weekly) | Updated Supabase data |

---

## 6. Mastra Workflow Orchestration

Upgrade path from ad-hoc Mycel skills to structured, durable TypeScript workflows with built-in RAG, MCP integration, and state persistence.

### Migration Map

| Current Skill | Mastra Workflow | Priority |
|--------------|----------------|----------|
| /next-steps | daily-briefing (4 steps) | High |
| /call-prep | meeting-prep (3 steps) | High |
| /research | deep-research (3 steps) | Medium |
| /outreach | outreach-sequence (2 steps) | Medium |
| /pipeline | pipeline-review (2 steps) | Low |
| /update-project | project-sync (5 steps) | Low |

### Key Mastra Features

- **Three-tier memory:** working, observational, semantic recall
- **Workflow orchestration:** createWorkflow/createStep with state persistence
- **Execution engines:** In-memory (dev), Inngest (production, durable)
- **Suspend/resume:** Human approval gates matching existing trust model
- **Vector DB support:** LibSQLVector (sqlite-vec) and ChromaVector built-in

---

## 7. Open Source Steal List

### Tier 1 -- Port Code/Patterns

| Source Repo | What to Steal | Port Target | Effort |
|------------|--------------|-------------|--------|
| tremorlabs/tremor | KPI cards, chart color mapping, CategoryBar | Dashboard command center | M |
| recharts/recharts | ComposedChart for deal metrics, custom tooltips | Treehouse deal charts | S |
| maybe-finance/maybe | Account type hierarchy, LOCF balance calc | Financial health module | L |
| simonw/llm | SQLite logging schema, plugin architecture | LLM audit trail | M |
| simonw/sqlite-vec | vec0 virtual table, kNN queries | Consulting RAG layer | M |
| mastra-ai/mastra | Workflow orchestration, 3-tier memory | Agent fleet backbone | XL |
| ml-explore/mlx-examples | LLM inference config, quantization | M5 model optimization | S |

### Tier 2 -- Product Intelligence (Tap specs)

| Source | Output |
|--------|--------|
| twentyhq/twenty | CRM data model requirements |
| calcom/cal.com | Multi-tenant white-label spec |
| dubinc/dub | SaaS billing/workspace spec |

---

## 8. DeepWiki Research Sessions

Run through Claude Code CLI with DeepWiki MCP on M5:

**Session 1 -- Dashboard Foundation:** Tremor component inventory, dark theme patterns, KPI card loading states

**Session 2 -- Financial View:** Maybe Finance data model, net worth tracking, LOCF algorithm, allocation charts

**Session 3 -- LLM Logging:** simonw/llm SQLite schema, plugin system, embedding storage

**Session 4 -- n8n Custom Nodes:** Custom node framework, sub-workflow execution, webhook reliability

**Session 5 -- Agent Workflows:** Mastra agent definitions, workflow state persistence, error recovery

---

## 9. Implementation Phases

### Phase 0: Pre-Arrival (this week)
- Research and planning (this document)
- DeepWiki intelligence plan reviewed
- Agent architecture designed
- GitHub Issue templates drafted

### Phase 1: Day 1 -- Environment Setup
- Clone repos, transfer env files and MCP configs
- Install Ollama + MLX, pull models
- Install llm CLI with providers
- Verify Claude Code on M5

### Phase 2: Week 1 -- Local AI Foundation
- MLX model evaluation
- LLM logging active
- First sqlite-vec prototype
- DeepWiki private repo indexing
- Devin first test task

### Phase 3: Week 2 -- Agent Fleet
- Devin + Codex fully configured
- review-agent-pr skill built
- First batch of agent Issues

### Phase 4: Week 3 -- Automation
- n8n Docker setup
- Email triage + daily briefing workflows

### Phase 5: Week 4+ -- Intelligence
- Mastra foundation
- RAG pipeline operational
- Command center dashboard

---

## 10. Success Metrics (30-Day)

| Metric | Baseline | Target |
|--------|----------|--------|
| PR throughput | ~5/week | 15-20/week |
| Test coverage | 74% statements | 82%+ |
| LLM calls logged | 0 | All calls |
| RAG docs indexed | 0 | 500+ |
| n8n workflows | 0 | 3 active |
| Local model speed | N/A | Under 3s for 24B queries |

---

## 11. Cost Summary

| Tool | Monthly | Notes |
|------|---------|-------|
| Claude Max | Already paying | Claude Code + API |
| Devin Core | ~$70-120 | 5-10 hrs autonomous dev |
| ChatGPT Pro (Codex) | $20 | Async batch tasks |
| n8n Self-Hosted | $0 | Docker on M5 |
| Ollama/MLX | $0 | Local inference |
| DeepWiki | $0 | Included with Devin |
| **New total** | **~$90-140/mo** | Horizontal scaling |

---

## 12. AI Leaders Alignment

| Practitioner | Endorses | Pushback |
|-------------|----------|----------|
| **Karpathy** | MLX on Silicon, 80/20 AI ratio, parallel sessions | Might question n8n complexity |
| **Swyx** | Mastra for TS agents, Claude Code primary, DeepWiki | Would want IMPACT framework per agent |
| **Willison** | llm CLI, sqlite-vec, anti-slop review pipeline | Insists on human review (we do) |
| **Cherny** | Parallel sessions, CLAUDE.md compounding, plan-first | Would skip Devin -- "more Claude Code" |

**Consensus stack:** Claude Code + parallel sessions + CLAUDE.md + local models. Our additions (Devin, Codex, n8n, Mastra) extend horizontally.

---

*Full spec with code examples: `MDD/specs/archive/m5-system-architecture.md`*
*Open source research playbook: `MDD/specs/archive/deepwiki-intelligence-plan.md`*
*Updated: 2026-03-21*
