---
title: "Adding Persistent Memory to n8n AI Workflows with soul.py"
description: "How to make your n8n AI nodes remember everything — from automatic RAG+RLM routing to simple file-based memory for prototyping."
date: "2026-03-01"
tags: ["ai-agents", "n8n", "automation", "llm", "memory"]
---

Someone asked how to integrate [soul.py](https://github.com/menonpg/soul.py) into an n8n pipeline. The short answer: it works beautifully as a drop-in Python node.

## Quick Start: Try It Locally First

Before wiring into n8n, test it from the terminal:

```bash
pip install soul-agent
soul init  # creates SOUL.md and MEMORY.md
```

```python
from hybrid_agent import HybridAgent

agent = HybridAgent()

while True:
    q = input("You: ")
    result = agent.ask(q)
    print(f"Agent: {result['answer']}\n")
```

Memory persists automatically between runs — kill the script, restart it, and the agent picks up exactly where it left off. Everything's stored in plain `MEMORY.md` in your working directory, so you can read or edit it with any text editor.

Once you've confirmed it works, wire it into n8n.

---

## The Problem

n8n's AI nodes are stateless by default. Each workflow execution starts fresh — your agent has no memory of previous conversations. For simple automations, that's fine. For anything resembling a persistent assistant, it's a dealbreaker.

## The Solution: HybridAgent

soul.py's `HybridAgent` automatically picks the right retrieval strategy per query:

- **RAG** (~90% of queries): Fast semantic search for specific lookups
- **RLM** (~10% of queries): Recursive synthesis for questions like "summarize everything we've discussed"

You don't configure anything — the router decides.

### n8n Integration

Create a Python wrapper script on your n8n server:

```python
# soul_node.py
import sys, json
from hybrid_agent import HybridAgent

agent = HybridAgent()  # auto-detects RAG vs RLM per query
query = sys.argv[1]
result = agent.ask(query)

print(json.dumps({
    "response": result["answer"],
    "route": result["route"],  # "RAG" or "RLM"
}))
```

In your n8n workflow, use an **Execute Command** node:

```bash
python /path/to/soul_node.py "{{ $json.message }}"
```

The agent:
1. Reads `SOUL.md` for identity and `MEMORY.md` for context
2. Routes to RAG or RLM based on query type
3. Responds with the answer and which route it took
4. Appends the exchange to memory

Next workflow execution? It remembers everything.

### Forcing a Mode

For high-volume pipelines where you want consistent latency, you can force a specific mode:

```python
agent = HybridAgent(mode="rag")   # always RAG (faster)
agent = HybridAgent(mode="rlm")   # always RLM (exhaustive)
agent = HybridAgent(mode="auto")  # router decides (default)
```

### Vector Store Setup (Optional)

HybridAgent works best with Qdrant + Azure embeddings for semantic search:

```python
agent = HybridAgent(
    qdrant_url=os.environ.get("QDRANT_URL"),
    qdrant_api_key=os.environ.get("QDRANT_API_KEY"),
    azure_embedding_endpoint=os.environ.get("AZURE_EMBEDDING_ENDPOINT"),
    azure_embedding_key=os.environ.get("AZURE_EMBEDDING_KEY"),
)
```

**No Qdrant?** It automatically falls back to BM25 (keyword-based retrieval). Not as good as vector search, but still works.

## n8n Cloud (No Filesystem)

If you're on n8n Cloud without persistent filesystem access, store `MEMORY.md` contents in a database or n8n variable:

```python
# soul_cloud_node.py
import sys, json

memory_content = sys.argv[1]
query = sys.argv[2]

# Write memory to temp file
with open("/tmp/MEMORY.md", "w") as f:
    f.write(memory_content)

from hybrid_agent import HybridAgent
agent = HybridAgent(memory_path="/tmp/MEMORY.md")
result = agent.ask(query)

# Return both response and updated memory
updated_memory = open("/tmp/MEMORY.md").read()
print(json.dumps({
    "response": result["answer"],
    "route": result["route"],
    "memory": updated_memory
}))
```

Then use n8n's **Set** node to persist `memory` back to your storage after each call.

## Lite Option: Simple Agent (v0.1)

For prototyping or when your memory will stay small (<1500 tokens), the simple `Agent` class skips the routing layer entirely:

```python
from soul import Agent

agent = Agent(provider="anthropic")  # or "openai"
result = agent.ask(query)
```

This injects the full `MEMORY.md` into the system prompt. Zero infrastructure, zero configuration. Great for learning, but won't scale to large memory files.

## Which Should You Use?

| Use Case | Recommendation |
|----------|----------------|
| Production workflows | `HybridAgent` (auto mode) |
| High-volume pipelines | `HybridAgent(mode="rag")` |
| Prototyping / learning | `Agent` (simple mode) |
| Large memory files | `HybridAgent` with Qdrant |

Both use the same `SOUL.md` and `MEMORY.md` format — upgrade from simple to hybrid without changing your data.

## Try It

```bash
pip install soul-agent
soul init
```

Live demos:
- [soulv2.themenonlab.com](https://soulv2.themenonlab.com) — HybridAgent with RAG+RLM routing
- [soul.themenonlab.com](https://soul.themenonlab.com) — Simple Agent

GitHub: [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

---

*Your AI workflows deserve memory. soul.py gives them one.*
