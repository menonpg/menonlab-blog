---
title: "Add Persistent Memory to Any Project in 5 Minutes"
description: "Give any codebase or document collection an AI assistant that remembers context across sessions. Two files, zero infrastructure."
date: "2026-03-02"
tags: ["soul-py", "ai-agents", "developer-tools", "tutorial", "open-source"]
---

*Updated for soul-agent 0.1.2 on PyPI*

> **Version note:** `pip install soul-agent` gives you version 0.1.2, which includes both the simple `Agent` class (pure markdown) and the `HybridAgent` class (RAG+RLM routing). The "v2.0" mentioned in demos refers to the HybridAgent architecture, not a separate package.

Your AI forgets everything when you close the terminal.

You spend 10 minutes explaining your project context. The AI gives great help. You close the session. Tomorrow, it's a stranger again.

soul.py fixes this in two files.

## The Fix

```python
from soul import Agent

# First conversation
agent = Agent()
agent.ask("My name is Prahlad and I'm building a Flask app for task management.")
# → "Nice! What's the first feature you're working on?"

# Close Python. Go to lunch. Come back tomorrow.

# New session — memory persists
agent = Agent()
agent.ask("What do you know about my project?")
# → "You're Prahlad, building a Flask task management app."
```

That's it. Memory survives across sessions. No database. No server running in the background.

## How It Works

soul.py uses two markdown files:

```
your-project/
├── src/
├── docs/
├── SOUL.md      ← Who the agent is
├── MEMORY.md    ← What it remembers
└── README.md
```

**SOUL.md** — The agent's identity:

```markdown
# Project Assistant

I am the AI assistant for this Flask project.

## How I Help
- Answer questions about the codebase
- Remember project decisions
- Help debug issues

## Style
- Reference specific files when helpful
- Acknowledge when I'm uncertain
```

**MEMORY.md** — Conversation history (grows automatically):

```markdown
# Memory

## 2026-03-02 10:00
Q: My name is Prahlad and I'm building a Flask app for task management.
A: Nice! What's the first feature you're working on?

## 2026-03-02 10:15
Q: We decided to use SQLite for the database.
A: Good choice for a task app — simple and serverless.
```

Every `agent.ask()` call reads these files, calls the LLM, and appends the exchange to MEMORY.md.

## Quick Start

```bash
pip install soul-agent
soul init
soul chat   # NEW in v0.1.2 — interactive CLI!
```

Or use the Python API:

```bash
soul init
```

The wizard asks:
- What's your agent's name?
- Which provider? (anthropic / openai / openai-compatible)

Creates SOUL.md and MEMORY.md in your current directory.

Then use it in Python:

```python
from soul import Agent

agent = Agent()
response = agent.ask("How should I structure the routes?")
print(response)
```

## Configuration

Configuration happens in Python, not config files:

```python
# Anthropic (default)
agent = Agent(provider="anthropic")

# OpenAI
agent = Agent(provider="openai")

# Local with Ollama (free, private, no API key)
agent = Agent(
    provider="openai-compatible",
    base_url="http://localhost:11434/v1",
    model="llama3.2",
    api_key="ollama"
)
```

You can also specify custom file paths:

```python
agent = Agent(
    soul_path="docs/SOUL.md",
    memory_path="docs/MEMORY.md"
)
```

## The Persistence Demo

This is the whole point. Let me show it clearly:

**Session 1:**
```python
from soul import Agent

agent = Agent()
agent.ask("I'm debugging a CORS issue in the API")
# Agent helps with CORS

agent.ask("Fixed it — needed to allow credentials")
# "Great! I'll remember that for future API questions."
```

**Close Python. New terminal. New day.**

**Session 2:**
```python
from soul import Agent

agent = Agent()
agent.ask("I'm having another API issue")
# "Is this related to the CORS issue you fixed yesterday 
#  with credentials? Or something new?"
```

The agent remembers because MEMORY.md persisted.

## What's in the Package (soul-agent 0.1.2)

`pip install soul-agent` gives you two classes:

| Class | Import | What it does |
|-------|--------|--------------|
| `Agent` | `from soul import Agent` | Simple markdown injection — reads SOUL.md + MEMORY.md, injects into prompt |
| `HybridAgent` | `from hybrid_agent import HybridAgent` | RAG+RLM routing — vector search for large memories, automatic query classification |

**Start with `Agent`** if your memory is small (<100 entries). **Use `HybridAgent`** when memory grows large or you want semantic search.

**Package features (0.1.2):**
- Reads SOUL.md and MEMORY.md from current directory
- Injects both into the system prompt
- Calls your chosen LLM provider (Anthropic, OpenAI, Ollama)
- Appends every exchange to MEMORY.md with timestamp
- **NEW:** `soul chat` — interactive CLI, no Python code needed
- **NEW:** `soul status` — check your memory file stats
- **NEW:** ChromaDB local vector search for large memories
- **NEW:** Direct OpenAI embeddings (not just Azure)

**What it doesn't do:**
- No automatic codebase indexing (you paste relevant code)
- No git integration (yet)

The simplicity is intentional. ~300 lines of Python. No infrastructure.

## The CLI Experience (v0.1.2)

You don't need to write Python anymore. Just chat:

```bash
soul chat
```

```
🧠 soul.py (HybridAgent mode)
   Soul:   SOUL.md
   Memory: MEMORY.md (12 entries)
   Commands: /memory  /reset  /help  exit

You: What did we decide about the database schema?
Assistant: Based on our conversations, you decided to use SQLAlchemy 
with SQLite for development. The Task model has: id, title, description, 
status (enum: todo/doing/done), due_date, and user_id foreign key.
[RAG · 847ms]

You: /memory
📝 MEMORY.md — 12 entries, 4.2KB

You: exit
👋 Memory saved. See you next time.
```

Check memory stats anytime:

```bash
soul status
```

```
🧠 soul.py status

✅ SOUL.md     — 15 lines
✅ MEMORY.md   — 47 entries, 8.3KB
```

## When Memory Gets Large: Vector Search

v0.1 injects your entire MEMORY.md into the LLM context. This works great for months of use, but eventually you'll hit context limits.

v0.1.2 adds **ChromaDB** — a local vector database that runs on your machine with zero configuration:

```bash
pip install soul-agent[chromadb]
```

```python
from hybrid_agent import HybridAgent

agent = HybridAgent(
    mode="auto",  # Automatically chooses RAG vs RLM per query
)
```

Now when you ask a question, soul.py:
1. **Routes the query** — Is this a specific fact lookup (RAG) or synthesis question (RLM)?
2. **Retrieves relevant memories** — Vector search finds the top-k most similar entries
3. **Generates response** — Only relevant context goes to the LLM

This scales to thousands of memory entries without hitting token limits.

## Vector Database Deep Dive

Under the hood, soul.py supports multiple vector backends:

| Backend | Install | Best For |
|---------|---------|----------|
| **BM25** | Built-in | Small memories, offline, zero deps |
| **ChromaDB** | `pip install soul-agent[chromadb]` | Local dev, medium memories |
| **Qdrant** | Cloud or self-hosted | Production, large scale |

### How Collections Work

Each agent gets its own **collection** (like a database table) in the vector store:

```python
agent = HybridAgent(
    collection_name="my_project_memory",  # Your collection name
    # Defaults to "soul_v2_memory" if not specified
)
```

**What goes in a collection:**
- Each entry from MEMORY.md becomes a vector
- Entries are embedded using your configured provider (OpenAI, Azure)
- Vectors are stored with the original text as payload

**Querying:**
```
Your question: "What database did we choose?"
         ↓
    Embed question → vector [0.12, -0.45, 0.78, ...]
         ↓
    Search collection for similar vectors
         ↓
    Return top-5 most similar memory entries
         ↓
    Inject into LLM prompt as context
```

### Configuring Qdrant (Production)

For production deployments, use Qdrant Cloud:

```python
agent = HybridAgent(
    qdrant_url="https://your-cluster.qdrant.io:6333",
    qdrant_api_key="your-api-key",
    azure_embedding_endpoint="https://your-azure.openai.azure.com",
    azure_embedding_key="your-key",
    collection_name="prod_agent_memory",
)
```

Or set via environment variables:
```bash
export QDRANT_URL=https://your-cluster.qdrant.io:6333
export QDRANT_API_KEY=xxx
export AZURE_EMBEDDING_ENDPOINT=https://xxx.openai.azure.com
export AZURE_EMBEDDING_KEY=xxx
```

### Using OpenAI Embeddings Directly

New in v0.1.2 — you don't need Azure anymore:

```python
agent = HybridAgent(
    openai_api_key="sk-...",  # Direct OpenAI, not Azure
)
```

Uses `text-embedding-3-small` (1536 dimensions) by default.

## RAG vs RLM: The Query Router

soul.py v2.0 doesn't just do RAG. It automatically routes queries:

| Query Type | Route | Method |
|------------|-------|--------|
| "What's my name?" | **RAG** | Vector search, return top matches |
| "Summarize all our decisions" | **RLM** | Read ALL memories, synthesize |

**RAG (Retrieval-Augmented Generation):**
- Fast (~500ms)
- Finds specific facts
- Good for: "What did we decide about X?"

**RLM (Retrieval + Learning Memory):**
- Slower (~5-10s)
- Processes everything recursively
- Good for: "Give me a summary of the whole project"

The router is a lightweight LLM call that classifies your query, then dispatches to the right retrieval strategy.

**Try it live:** [soulv2.themenonlab.com](https://soulv2.themenonlab.com)

## Team Usage (Convention, Not Feature)

For team projects, a useful pattern:

**Share identity, keep separate memories:**

```gitignore
# .gitignore
MEMORY.md          # Each dev has their own history
```

Commit SOUL.md so the team shares agent identity. Gitignore MEMORY.md so each developer has their own conversation history.

**Or share everything:**

Don't gitignore MEMORY.md. The team builds shared institutional knowledge:

```markdown
## Key Decisions
- 2026-02-15: Chose SQLite over PostgreSQL (Sarah)
- 2026-02-20: Moving auth to Clerk (Prahlad)
```

This isn't a built-in feature — it's just how files work. That's the point.

## Why This Matters

Most AI coding assistants are stateless. You explain context, get help, close the tab — gone.

With soul.py:
- Context accumulates over time
- Decisions are remembered
- The assistant *knows* your project
- It's all in readable files you control

You can open MEMORY.md in any text editor. Edit it. Delete things. Add context manually. It's just markdown.

**Try it now:**
```bash
pip install soul-agent
soul init
```

Then start a Python session and talk to your agent.

---

**Repo:** [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

**Live demo:** [soul.themenonlab.com](https://soul.themenonlab.com)

**v2.0 demo (with RAG):** [soulv2.themenonlab.com](https://soulv2.themenonlab.com)
