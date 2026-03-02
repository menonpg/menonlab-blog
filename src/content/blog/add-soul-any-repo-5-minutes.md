---
title: "Add Persistent Memory to Any Project in 5 Minutes"
description: "Give any codebase or document collection an AI assistant that remembers context across sessions. Two files, zero infrastructure."
date: "2026-03-02"
tags: ["soul-py", "ai-agents", "developer-tools", "tutorial", "open-source"]
---

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
```

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

## What soul.py Actually Does (v0.1)

Let's be precise about the current version:

**What it does:**
- Reads SOUL.md and MEMORY.md from current directory
- Injects both into the system prompt
- Calls your chosen LLM provider
- Appends the exchange to MEMORY.md with timestamp

**What it doesn't do (yet):**
- No automatic codebase reading (you paste relevant code into conversations)
- No vector database / RAG (that's v2.0 — live at [soulv2.themenonlab.com](https://soulv2.themenonlab.com))
- No CLI chat command (Python API only)

The simplicity is the point. 150 lines of Python. No infrastructure.

## v2.0: When Memory Gets Large

v0.1 injects your entire MEMORY.md into context. This works great until the file exceeds your context window (~6 months of daily use).

v2.0 adds RAG for large memory files — semantic search to retrieve relevant memories instead of injecting everything.

**Try v2.0:** [soulv2.themenonlab.com](https://soulv2.themenonlab.com)

For most projects, v0.1 is plenty. Start simple.

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
