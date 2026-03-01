---
title: "soul.py v2.0: We Added a Brain to the Memory"
description: "From simple markdown injection to intelligent query routing. soul.py now automatically decides when to use RAG vs RLM — and you can watch it happen in real time."
date: "2026-03-01"
tags: ["ai-agents", "llm", "rag", "rlm", "open-source", "python"]
---

Three weeks ago, we shipped [soul.py v0.1](/blog/soul-py-persistent-memory-llm-agents/) — persistent memory for LLMs using nothing but markdown files. No database, no vector store, no infrastructure. It worked beautifully for small to medium memory files.

Today we're shipping v2.0, and it's a fundamentally different beast.

## The Problem v0.1 Couldn't Solve

v0.1 injected the entire `MEMORY.md` file into the system prompt on every call. Simple. Elegant. But it had an obvious ceiling: once your memory file exceeded the context window, you were stuck.

The standard answer is "just add RAG" — embed your memories, retrieve relevant chunks, inject those instead. And yes, that works for most queries. But not all of them.

Ask your agent "What's my name?" — RAG handles it instantly. Ask "What patterns do you notice across all our conversations?" — RAG falls apart. It retrieves fragments but can't synthesize across the full corpus.

This is the insight from our [RAG + RLM architecture post](/blog/rag-plus-rlm-complete-knowledge-base-architecture/): **~90% of queries are focused lookups (RAG territory), but ~10% require exhaustive reasoning over the entire memory (RLM territory).** You need both.

## v2.0: The Query Router

soul.py v2.0 adds a query router that automatically dispatches to the right retrieval strategy:

```
Your query
    ↓
Router (fast LLM call)
├── FOCUSED (~90%) → RAG — vector search, sub-second
└── EXHAUSTIVE (~10%) → RLM — recursive synthesis, thorough
```

The router is a single cheap LLM call that classifies the query. It's fast enough that you don't notice it, and accurate enough that it rarely gets it wrong.

```python
from hybrid_agent import HybridAgent

agent = HybridAgent()
result = agent.ask("What do you know about me?")

print(result["answer"])  # The response
print(result["route"])   # "RAG" or "RLM"
```

You can see exactly which path it took. No magic, no black boxes.

## Watch It Work — Three Live Demos

We deployed all three versions so you can see the progression:

| Version | Demo | What it shows |
|---------|------|---------------|
| v0.1 | [soul.themenonlab.com](https://soul.themenonlab.com) | Memory persists across sessions |
| v1.0 | [soulv1.themenonlab.com](https://soulv1.themenonlab.com) | Semantic RAG retrieval |
| v2.0 | [soulv2.themenonlab.com](https://soulv2.themenonlab.com) | Auto query routing: RAG + RLM |

Try asking the v2.0 demo a focused question ("What's my name?") and then an exhaustive one ("What themes appear across our conversations?"). Watch the route indicator change.

## The Branch Structure

You can still use any version. We've organized the repo so you can pin to exactly what you need:

| Branch | Description | Best for |
|--------|-------------|----------|
| `main` | v2.0 — RAG + RLM hybrid (default) | Production use |
| `v2.0-rag-rlm` | Same as main, versioned | Pinning to v2 |
| `v1.0-rag` | RAG only, no RLM | Simpler setup |
| `v0.1-stable` | Pure markdown, zero deps | Learning / prototyping |

If you loved v0.1's simplicity and your memory files are small, keep using it:

```bash
git clone -b v0.1-stable https://github.com/menonpg/soul.py
```

No pressure to upgrade. Every version is maintained.

## What's New in the API

v2.0 gives you visibility into the routing decision:

```python
result = agent.ask("What is my name?")

result["answer"]        # the response
result["route"]         # "RAG" or "RLM"
result["router_ms"]     # router latency
result["retrieval_ms"]  # retrieval latency
result["total_ms"]      # total latency
result["rag_context"]   # retrieved chunks (RAG path)
result["rlm_meta"]      # chunk stats (RLM path)
```

You can also force a specific route:

```python
agent = HybridAgent(mode="rag")   # always RAG
agent = HybridAgent(mode="rlm")   # always RLM
agent = HybridAgent(mode="auto")  # router decides (default)
```

## Setup

v2.0 works best with a vector store (Qdrant) and embeddings (Azure OpenAI), but falls back to BM25 keyword search if you don't configure them:

```python
agent = HybridAgent(
    soul_path="SOUL.md",
    memory_path="MEMORY.md",
    qdrant_url="...",              # or QDRANT_URL env var
    qdrant_api_key="...",          # or QDRANT_API_KEY
    azure_embedding_endpoint="...", # or AZURE_EMBEDDING_ENDPOINT
    azure_embedding_key="...",      # or AZURE_EMBEDDING_KEY
)
```

For local experimentation without any external services, v0.1-stable still works with zero configuration.

## The Philosophy Hasn't Changed

soul.py is still a primitive, not a framework. It does one thing — persistent identity and memory — and does it well. v2.0 just makes it smarter about *how* it retrieves that memory.

- **Human-readable**: `SOUL.md` and `MEMORY.md` are still plain text
- **Version-controllable**: `git diff` your agent's memories
- **Composable**: Use just the parts you need
- **No lock-in**: Works with any LLM provider

## Get Started

```bash
pip install soul-agent
soul init
```

Or try the live demo: [soulv2.themenonlab.com](https://soulv2.themenonlab.com)

Star the repo: [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

---

*v0.1 gave your AI memory. v2.0 gives it a brain that knows how to use it.*
