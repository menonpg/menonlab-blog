---
title: "Adding Persistent Memory to n8n AI Workflows with soul.py"
description: "Two approaches to making your n8n AI nodes remember everything — from simple file-based memory to production RAG+RLM hybrid retrieval."
date: "2026-03-01"
tags: ["ai-agents", "n8n", "automation", "llm", "memory"]
---

Someone asked how to integrate [soul.py](https://github.com/menonpg/soul.py) into an n8n pipeline. The short answer: it works beautifully. The longer answer: you have two options depending on your needs.

## The Problem

n8n's AI nodes are stateless by default. Each workflow execution starts fresh — your agent has no memory of previous conversations. For simple automations, that's fine. For anything resembling a persistent assistant, it's a dealbreaker.

soul.py solves this with two approaches:

| Mode | Best for | Infrastructure |
|------|----------|----------------|
| **Simple (v0.1)** | Small memory files, quick setup | Filesystem only |
| **Hybrid (v2.0)** | Large memory, production use | Optional: Qdrant + embeddings |

## Option 1: Simple File-Based Memory

This is the zero-infrastructure approach. soul.py reads `SOUL.md` (identity) and `MEMORY.md` (memory) from the filesystem, injects them into the system prompt, and appends new exchanges after each call.

### Setup

```bash
pip install soul-agent
soul init  # creates SOUL.md and MEMORY.md
```

### n8n Integration

Create a Python wrapper script on your n8n server:

```python
# soul_node.py
import sys
import json
from soul import Agent

agent = Agent(provider="anthropic")  # or "openai", "openai-compatible"
query = sys.argv[1]
result = agent.ask(query)

print(json.dumps({"response": result}))
```

In your n8n workflow, use an **Execute Command** node:

```bash
python /path/to/soul_node.py "{{ $json.message }}"
```

That's it. The agent:
1. Reads `SOUL.md` for its identity
2. Reads `MEMORY.md` for context
3. Responds to the query
4. Appends the exchange to `MEMORY.md`

Next workflow execution? It remembers everything.

### Limitations

Simple mode injects the *entire* `MEMORY.md` into the context window. Works great until your memory file exceeds ~6000 characters (roughly 1500 tokens). After that, you need the hybrid approach.

## Option 2: Hybrid RAG + RLM (Production)

For larger memory files, soul.py v2.0 uses intelligent retrieval:

- **RAG** (~90% of queries): Vector search retrieves relevant chunks
- **RLM** (~10% of queries): Recursive synthesis for questions that need the full picture

A query router automatically decides which path to take.

### Setup

```bash
pip install soul-agent
```

You'll need:
- **Qdrant** (vector store) — cloud or self-hosted
- **Azure OpenAI embeddings** (or falls back to BM25 keyword search)

### n8n Integration

```python
# soul_hybrid_node.py
import sys
import json
import os
from hybrid_agent import HybridAgent

# Configure via environment or hardcode for testing
agent = HybridAgent(
    soul_path="SOUL.md",
    memory_path="MEMORY.md",
    mode="auto",  # auto-routes between RAG and RLM
    qdrant_url=os.environ.get("QDRANT_URL"),
    qdrant_api_key=os.environ.get("QDRANT_API_KEY"),
    azure_embedding_endpoint=os.environ.get("AZURE_EMBEDDING_ENDPOINT"),
    azure_embedding_key=os.environ.get("AZURE_EMBEDDING_KEY"),
)

query = sys.argv[1]
result = agent.ask(query)

print(json.dumps({
    "response": result["answer"],
    "route": result["route"],  # "RAG" or "RLM"
    "latency_ms": result["total_ms"],
}))
```

The response tells you which retrieval path was used — useful for debugging and optimization.

### No Qdrant? BM25 Fallback

If you don't configure Qdrant/Azure, the HybridAgent automatically falls back to BM25 (keyword-based retrieval). Not as good as vector search, but still better than injecting the entire file:

```python
agent = HybridAgent(
    soul_path="SOUL.md",
    memory_path="MEMORY.md",
    mode="rag",  # force RAG mode with BM25 fallback
)
```

## n8n Cloud Consideration

If you're on n8n Cloud (no persistent filesystem), you'll need to:

1. Store `MEMORY.md` contents in a database or n8n variable
2. Pass it to the script as input
3. Capture the updated memory from output
4. Write it back to storage

```python
# soul_cloud_node.py
import sys
import json

memory_content = sys.argv[1]
query = sys.argv[2]

# Write memory to temp file
with open("/tmp/MEMORY.md", "w") as f:
    f.write(memory_content)

from soul import Agent
agent = Agent(memory_path="/tmp/MEMORY.md")
result = agent.ask(query)

# Return both response and updated memory
updated_memory = open("/tmp/MEMORY.md").read()
print(json.dumps({
    "response": result,
    "memory": updated_memory
}))
```

Then use n8n's **Set** node to persist `memory` back to your storage.

## Which Should You Use?

**Start with Simple (v0.1)** if:
- Your memory will stay under ~1500 tokens
- You want zero infrastructure
- You're prototyping or learning

**Use Hybrid (v2.0)** if:
- Memory will grow large over time
- You need fast retrieval at scale
- You're building for production

Both share the same `SOUL.md` and `MEMORY.md` format — you can upgrade from v0.1 to v2.0 without changing your data.

## Try It

```bash
pip install soul-agent
soul init
```

Live demos:
- [soul.themenonlab.com](https://soul.themenonlab.com) — v0.1 simple mode
- [soulv2.themenonlab.com](https://soulv2.themenonlab.com) — v2.0 hybrid mode

GitHub: [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

---

*Your AI workflows deserve memory. soul.py gives them one.*
