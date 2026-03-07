---
title: "langchain-soul & llamaindex-soul: Full Soul Ecosystem for Your Framework"
description: "Drop-in persistent memory for LangChain and LlamaIndex. Same soul-agent RAG+RLM, same SoulMate cloud option, same SchemaMemory for database intelligence."
date: "2026-03-06"
tags: ["langchain", "llamaindex", "soul", "memory", "ai-agents", "rag", "open-source"]
---

Today we're releasing **langchain-soul** and **llamaindex-soul** — bringing the full Soul ecosystem to LangChain and LlamaIndex users.

One `pip install`. Full stack: persistent memory, hybrid RAG+RLM retrieval, database schema intelligence, and managed cloud option.

## The Problem

You're building with LangChain or LlamaIndex. Your agent works great... until the conversation ends. Then it forgets everything.

Built-in memory solutions are either:
- **Too simple** — just stores recent messages, no semantic search
- **Too complex** — requires spinning up vector databases, managing embeddings
- **Not human-readable** — can't inspect or edit what your agent "knows"

## The Solution

```bash
pip install langchain-soul   # or llamaindex-soul
```

That's it. You get:

| Feature | What It Does |
|---------|--------------|
| **soul-agent** | RAG + RLM hybrid retrieval — auto-routes queries to the right strategy |
| **soul-schema** | Database semantic layer — your agent understands your data warehouse |
| **SoulMate API** | Managed cloud option — zero infrastructure, same interface |
| **Markdown storage** | Human-readable, git-versionable, editable memory files |

## Quick Start: LangChain

```python
from langchain_soul import SoulMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

# Markdown-based memory with full RAG+RLM
memory = SoulMemory()
chain = ConversationChain(llm=ChatOpenAI(), memory=memory)

response = chain.predict(input="Hello!")
# Conversation saved to MEMORY.md — human-readable!
```

For production, switch to managed cloud:

```python
from langchain_soul import SoulMateMemory

memory = SoulMateMemory(api_key="your-key")  # We handle infrastructure
```

## Quick Start: LlamaIndex

```python
from llamaindex_soul import SoulChatStore
from llama_index.core.memory import ChatMemoryBuffer

chat_store = SoulChatStore()
memory = ChatMemoryBuffer.from_defaults(
    token_limit=3000,
    chat_store=chat_store,
    chat_store_key="user1",
)

# Use with any LlamaIndex agent
from llama_index.core.agent import FunctionAgent
agent = FunctionAgent(tools=tools, llm=llm)
await agent.run("Hello!", memory=memory)
```

## Database Schema Intelligence

Both packages include **SchemaMemory** — give your agents understanding of your database:

```python
from langchain_soul import SchemaMemory  # or llamaindex_soul

schema = SchemaMemory("postgresql://user:pass@host/db")
schema.generate()  # Auto-generates semantic descriptions via LLM

# Get context for natural language queries
context = schema.context_for("Show me revenue by region")
# Returns formatted markdown with relevant tables/columns
```

This is powered by [soul-schema](https://github.com/menonpg/soul-schema) — the same tool that documents data warehouses in minutes.

## Choose Your Backend

| Setup | Best For | Storage |
|-------|----------|---------|
| **Local** (default) | Development, git-tracked projects | `MEMORY.md` files |
| **SoulMate** (managed) | Production, teams, zero-infra | Cloud API |

Both use the same soul-agent RAG+RLM under the hood. Same interface, different storage.

```python
from langchain_soul import create_memory

# Switch backends with one line
memory = create_memory("local")      # File-based
memory = create_memory("soulmate")   # Managed cloud
```

## Why This Matters

**Before:** Memory was an afterthought. Vector databases were a separate project.

**After:** One package handles it all — from development (markdown files you can `cat` and `grep`) to production (managed API with zero ops).

The Soul ecosystem now covers:
- **[soul-agent](https://github.com/menonpg/soul.py)** — Core library, works with any LLM
- **[crewai-soul](https://github.com/menonpg/crewai-soul)** — CrewAI integration
- **[langchain-soul](https://github.com/menonpg/langchain-soul)** — LangChain integration (NEW)
- **[llamaindex-soul](https://github.com/menonpg/llamaindex-soul)** — LlamaIndex integration (NEW)
- **[soul-schema](https://github.com/menonpg/soul-schema)** — Database semantic layer
- **[SoulMate](https://menonpg.github.io/soulmate)** — Managed cloud service

## Get Started

```bash
# LangChain users
pip install langchain-soul

# LlamaIndex users  
pip install llamaindex-soul
```

PyPI:
- [langchain-soul](https://pypi.org/project/langchain-soul/)
- [llamaindex-soul](https://pypi.org/project/llamaindex-soul/)

GitHub:
- [langchain-soul](https://github.com/menonpg/langchain-soul)
- [llamaindex-soul](https://github.com/menonpg/llamaindex-soul)

Both MIT licensed. Both tested. Both ready for production.

Your agents finally remember — in whatever framework you prefer.
