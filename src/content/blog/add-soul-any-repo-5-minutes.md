---
title: "Add Persistent Memory to Any Repo in 5 Minutes"
description: "Give any codebase or document collection an AI assistant that remembers context across sessions. Three files, zero infrastructure."
date: "2026-03-02"
tags: ["soul-py", "ai-agents", "developer-tools", "tutorial", "open-source"]
---

You can give any project — a codebase, documentation, a research folder — an AI assistant that actually remembers your conversations.

No database. No complex setup. Three files.

## The Pattern

```
your-project/
├── src/                    ← Your existing code
├── docs/                   ← Your existing docs
├── .soul/                  ← Add this folder
│   ├── SOUL.md            ← Agent identity
│   ├── MEMORY.md          ← Conversation history
│   └── config.yaml        ← Model settings
└── README.md
```

## Quick Start (60 Seconds)

```bash
pip install soul-agent
cd your-project
soul init --quick
soul chat
```

That's it. Your project now has an AI assistant with persistent memory.

## What the Files Do

### SOUL.md — Identity

```markdown
# Project Assistant

I am the AI assistant for my-flask-app.
I have read all code and docs in this repository.

## How I Help
- Answer questions about the codebase
- Explain design decisions
- Help debug issues
```

This is *who* the agent is. Edit it to shape personality and expertise.

### MEMORY.md — Memory

```markdown
# Memory

## 2026-03-02 10:00
Q: How do we handle authentication?
A: You use Flask-Login with a custom User model...

## 2026-03-02 10:15
Q: Remember: we're switching to JWT next sprint
A: Got it — I'll keep that in mind for future auth questions.
```

This is *what* the agent remembers. Grows automatically with each conversation.

### config.yaml — Configuration

```yaml
# Which model to use
provider: anthropic
model: claude-sonnet-4-20250514
api_key_env: ANTHROPIC_API_KEY

# Memory strategy
memory:
  strategy: rlm        # Full injection (no database)
  max_tokens: 50000

# What files to read
sources:
  - README.md
  - "docs/**/*.md"
  - "src/**/*.py"
```

## Configuration Options Explained

### Choosing a Provider

**Anthropic (Claude):**
```yaml
provider: anthropic
model: claude-sonnet-4-20250514
api_key_env: ANTHROPIC_API_KEY
```

**OpenAI:**
```yaml
provider: openai
model: gpt-4-turbo
api_key_env: OPENAI_API_KEY
```

**Local with Ollama (free, private):**
```yaml
provider: openai-compatible
model: llama3.2
base_url: http://localhost:11434/v1
api_key: ollama
```

### Memory Strategy: RLM vs RAG

**RLM (Retrieval-Less Memory)** — The default. Injects entire memory file into context.

```yaml
memory:
  strategy: rlm
  max_tokens: 50000
```

✅ Perfect recall — nothing missed  
✅ Zero infrastructure — just files  
✅ Works offline  
⚠️ Limited by context window  

Best for: Most projects. Works for months of daily use.

**RAG (Retrieval-Augmented Generation)** — For large memory needs.

```yaml
memory:
  strategy: rag

rag:
  backend: chromadb          # Vector database
  collection: my_project     # Collection name
  embedding_model: text-embedding-3-small
  top_k: 10                  # Results to retrieve
```

✅ Unlimited memory  
✅ Semantic search  
⚠️ Requires vector DB  
⚠️ Can miss context  

Best for: Years of history, large document collections.

**Hybrid** — Best of both worlds.

```yaml
memory:
  strategy: hybrid
  rlm_tokens: 10000    # Recent always included
  rag_tokens: 20000    # Historical retrieved
```

### Vector Database Options

If using RAG:

```yaml
# Local, zero-config
rag:
  backend: chromadb
  persist_path: .soul/chroma/

# PostgreSQL (existing infra)
rag:
  backend: pgvector
  connection_string_env: DATABASE_URL

# Cloud (Pinecone)
rag:
  backend: pinecone
  api_key_env: PINECONE_API_KEY
  index: my-project
```

## Real Examples

### Python Codebase

```bash
cd ~/projects/my-flask-app
soul init
soul chat

> What's the database schema?
# Agent reads models.py, explains the schema

> We need to add a "tags" field to Post
# Agent suggests the migration, references existing patterns
```

### Documentation Site

```yaml
# .soul/config.yaml
sources:
  - "**/*.md"
  - "**/*.mdx"

memory:
  strategy: rag      # Docs can be large
```

```bash
soul chat

> How do I configure authentication?
# Agent finds and explains relevant docs

> What's the difference between v1 and v2 API?
# Agent compares sections from multiple files
```

### Research Papers Folder

```yaml
# .soul/config.yaml  
sources:
  - "papers/**/*.pdf"
  - "notes/**/*.md"

memory:
  strategy: hybrid
```

```bash
soul chat

> What papers discuss attention mechanisms?
# Agent searches your collection, summarizes findings

> Remember: the Smith 2024 paper is especially relevant
# Agent saves this to MEMORY.md for next time
```

## The Persistence Demo

Session 1:
```
> My name is Prahlad and I'm the lead on this project
# Saved to MEMORY.md
```

*Close terminal. Go to lunch. Come back.*

Session 2:
```
> What do you know about me?
# "You're Prahlad, the lead on this project."
```

That's the whole point. Context persists.

## Team Usage

**Option 1: Personal memories (recommended)**

```gitignore
# .gitignore
.soul/MEMORY.md
.soul/chroma/
```

Each developer has their own conversation history. SOUL.md and config are shared.

**Option 2: Shared memories**

Don't gitignore MEMORY.md. The team builds shared knowledge:

```markdown
## Key Decisions
- 2026-02-15: Chose SQLite over PostgreSQL (Sarah)
- 2026-02-20: Moving to TypeScript (Prahlad)
```

## Why This Matters

Most AI coding assistants are stateless. You explain context, get help, close the tab — gone.

With soul.py:
- Context accumulates over time
- Decisions are remembered
- The assistant *knows* your project
- It's all in readable files you control

Three files. Five minutes. Your repo has a soul.

---

**Get started:** [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

**Full docs:** The configuration guide above covers 90% of use cases. For edge cases, check the repo.
