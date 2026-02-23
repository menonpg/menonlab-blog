---
title: "AgentField: Build AI Agents Like Microservices"
description: "An open-source control plane that treats AI agents as first-class backend services. Routing, async execution, built-in memory, and cryptographic identity — production infrastructure for autonomous AI."
date: "2026-02-23"
tags: ["ai-agents", "infrastructure", "microservices", "open-source", "devops"]
---

AI agents are moving from chatbots into backends. They're approving refunds, coordinating supply chains, managing portfolios — making real decisions that affect real systems.

But most agent frameworks are built for prototypes, not production. They're prompt wrappers that work great in demos and fall apart under load.

[AgentField](https://github.com/Agent-Field/agentfield) is infrastructure built for the reality of production AI: agents that run for hours, coordinate with each other, and need cryptographic audit trails for compliance.

## The Problem: Agents Need Infrastructure, Not Frameworks

When you're building a chatbot, LangChain is fine. When you're building an autonomous system that processes thousands of requests, coordinates multiple agents, and needs to prove what it did to auditors — you need something else.

Traditional agent frameworks give you:
- Synchronous execution that times out
- Manual message passing between agents
- External dependencies for memory (Redis, Pinecone)
- Logs as your only audit trail ("trust me, this happened")

Production agents need:
- Tasks that run for hours or days
- Service discovery so agents can find each other
- Built-in memory with vector search
- Cryptographic proof of every action

AgentField provides the second list.

## What AgentField Actually Does

Think of it as **Kubernetes + Okta, rebuilt for AI agents**.

### Scale Infrastructure

**Routing & Discovery:** Agents register their capabilities with a central control plane. Other agents find and call them through standard REST APIs — no hardcoded endpoints.

**Async Execution:** Fire-and-forget tasks that run for minutes, hours, or days. Webhooks with automatic retries. Backpressure handling when downstream services are slow.

**Durable State:** Built-in memory with vector search. No Redis or Pinecone required. Memory scoped to global, agent, session, or run.

**Observability:** Every execution path automatically visualized as a DAG. Prometheus metrics out of the box. Structured logs for everything.

### Trust Infrastructure

**W3C DIDs:** Every agent gets a cryptographic identity — not a shared API key. This is how you know *which* agent took an action.

**Verifiable Credentials:** Tamper-proof receipts for every action. Export the full audit trail for any workflow with one API call.

**Policy Enforcement:** "Only agents signed by 'Finance' can access this tool." Boundaries enforced by infrastructure, not prompts.

## Build in Any Language

AgentField isn't locked to Python. Write agents in Python, Go, TypeScript, or call via REST from any language.

**Python:**
```python
from agentfield import Agent, AIConfig

app = Agent(node_id="researcher", ai_config=AIConfig(model="gpt-4o"))

@app.skill()
def fetch_url(url: str) -> str:
    return requests.get(url).text

@app.reasoner()
async def summarize(url: str) -> dict:
    content = fetch_url(url)
    return await app.ai(f"Summarize: {content}")

app.run()  # → POST /api/v1/execute/researcher.summarize
```

**TypeScript:**
```typescript
const agent = new Agent({
  nodeId: 'researcher',
  agentFieldUrl: 'http://localhost:8080',
});

agent.reasoner('summarize', async (ctx, input: { url: string }) => {
  const content = await fetch(input.url).then(r => r.text());
  return await ctx.ai(`Summarize: ${content}`);
});

agent.run();
```

**REST (Any Language):**
```bash
curl -X POST http://localhost:8080/api/v1/execute/researcher.summarize \
  -H "Content-Type: application/json" \
  -d '{"input": {"url": "https://example.com"}}'
```

Every agent is an API endpoint. Frontend developers can `fetch()` agents without touching Python.

## Multi-Agent Coordination

The real power shows when agents work together. AgentField handles discovery, routing, and tracking automatically.

```python
# Agent A calls Agent B — routed through control plane, fully traced
analysis = await app.call("analyst.evaluate", input={"data": dataset})
report = await app.call("writer.summarize", input={"analysis": analysis})
```

The control plane tracks the entire execution graph. Every call between agents is logged and visualized. When something goes wrong, you see exactly where.

## SWE-AF: Proof It Works

The most impressive demonstration is [SWE-AF](https://github.com/Agent-Field/SWE-AF) — an autonomous software engineering system built on AgentField.

One API call spins up a full engineering fleet: PM, architect, coders, QA, reviewers, and merger. They plan, build, test, and ship complex software end-to-end.

The benchmarks are striking:
- **SWE-AF (with Haiku):** 95/100
- **Claude Code (Sonnet):** 73/100
- **Codex:** 62/100

Same benchmark, cheaper model, better results. The infrastructure matters.

Real proof: [PR #179](https://github.com/Agent-Field/agentfield/pull/179) was built entirely by SWE-AF — 10 issues resolved, 217 tests passing, $19.23 total cost.

## Performance at Scale

AgentField is built for production workloads:

| Metric | Go | TypeScript | Python |
|--------|-----|------------|--------|
| Registration (100k handlers) | 17 ms | 14 ms | ~5.7 s |
| Memory per Handler | 280 B | 276 B | 7.5 KB |
| Throughput | 8.2M req/s | 4.0M req/s | 6.7M req/s |

Compared to agent frameworks (1,000 handlers):

| | AgentField | LangChain | CrewAI | Mastra |
|--|-----------|-----------|--------|--------|
| Registration | 57 ms | 483 ms | 200 ms | 365 ms |
| Memory/Handler | 7.5 KB | 10.8 KB | 14.3 KB | 1.8 KB |

These are handler registration and invocation overhead — no LLM latency included. The framework layer should be negligible compared to model calls, and AgentField keeps it that way.

## Quick Start

```bash
# Install
curl -fsSL https://agentfield.ai/install.sh | bash

# Create an agent
af init my-agent --defaults
cd my-agent && pip install -r requirements.txt

# Terminal 1: Start control plane
af server  # Dashboard at http://localhost:8080

# Terminal 2: Start your agent
python main.py  # Auto-registers with control plane

# Test it
curl -X POST http://localhost:8080/api/v1/execute/my-agent.demo_echo \
  -H "Content-Type: application/json" \
  -d '{"input": {"message": "Hello!"}}'
```

## Is AgentField for You?

**Yes if:**
- You're building agents that make decisions, not just answer questions
- You need multi-agent coordination at scale
- You need production infrastructure: async, retries, observability
- You want agents as standard backend services with REST APIs
- You need audit trails for compliance

**Not yet if:**
- You're building a single chatbot (LangChain is fine for that)
- You're prototyping and don't need production concerns

## The AI Backend Thesis

AgentField's creators argue we're witnessing the emergence of a new backend layer — not frontend, not traditional backend, but a "reasoning layer" that sits alongside your services making decisions that used to be hardcoded.

The comparison to Kubernetes is apt. Containers existed before Kubernetes, but orchestration infrastructure made them production-ready. AI agents exist today, but they need orchestration infrastructure to be production-ready.

AgentField is betting that infrastructure — not frameworks — is what autonomous AI needs to cross the production gap.

---

**Links:**
- [GitHub Repository](https://github.com/Agent-Field/agentfield)
- [Documentation](https://agentfield.ai/docs)
- [SWE-AF (Autonomous Software Engineering)](https://github.com/Agent-Field/SWE-AF)
- [The AI Backend (Blog Post)](https://agentfield.ai/blog/posts/ai-backend/)
