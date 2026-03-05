---
title: "soul.py: Your AI Remembers Nothing. This Fixes It in 10 Lines."
description: "A 150-line Python library that gives any LLM persistent identity and memory using plain markdown files. No database, no vector store, no infrastructure."
date: "2026-03-01"
tags: ["ai-agents", "llm", "python", "open-source", "memory"]
---

> **📚 The Book is Here!** Everything in this post (and much more) is now in *Soul: Building AI Agents That Remember Who They Are* — **[Available on Amazon →](https://a.co/d/02T0WadG)**

Every AI conversation starts the same way: "Hi, I'm Claude/GPT/Llama, how can I help you today?"

You've talked to this model a hundred times. You've told it your name, your projects, your preferences. It doesn't matter. The moment the session ends, it forgets everything. Tomorrow, you start from zero.

This is the most basic failure mode in AI agents, and somehow we've normalized it.

## The 10-Line Fix

```python
from soul import Agent

agent = Agent()
agent.ask("My name is Prahlad and I'm building an AI research lab.")
# → "That's exciting — what are you working on first?"

# Later. New process. New session. Memory persists.
agent = Agent()
agent.ask("What do you know about me?")
# → "You're Prahlad, building an AI research lab."
```

That's [soul.py](https://github.com/menonpg/soul.py). Memory survives across processes—no database, no server, nothing running in the background.

## How It Actually Works

soul.py uses two markdown files as the agent's persistent state:

| File | Purpose |
|------|---------|
| `SOUL.md` | Identity — who the agent is, how it behaves |
| `MEMORY.md` | Memory — timestamped log of past exchanges |

Every `agent.ask()` call:
1. Reads `SOUL.md` + `MEMORY.md` into the system prompt
2. Calls the LLM
3. Appends the exchange to `MEMORY.md` with a timestamp

That's the entire architecture. 150 lines of Python.

## What MEMORY.md Looks Like

After a few conversations:

```markdown
# MEMORY.md

## 2026-03-01 08:00
Q: My name is Prahlad and I'm building an AI research lab.
A: That's exciting — what are you working on first?

## 2026-03-01 09:15
Q: What should I focus on today?
A: Based on your AI lab work, you mentioned the memory paper 
   was the priority...
```

Human-readable. Version-controllable. Editable by hand. `git diff` your agent's memories if you want.

## The Setup

```bash
pip install soul-agent

soul init
```

The wizard asks two questions:
- What's your agent's name?
- Which provider? (anthropic / openai / openai-compatible)

Creates `SOUL.md` and `MEMORY.md` in your current directory. You're done.

## Works With Everything

```python
# Anthropic (default)
agent = Agent(provider="anthropic")

# OpenAI
agent = Agent(provider="openai")

# Local Ollama — no API key needed
agent = Agent(
    provider="openai-compatible",
    base_url="http://localhost:11434/v1",
    model="llama3.2",
    api_key="ollama"
)
```

## Why Not LangChain / MemGPT / Clawdbot?

Those are frameworks. soul.py is a primitive.

- **LangChain** — orchestration layer, requires significant setup
- **LlamaIndex** — document indexing, needs vector store infrastructure  
- **MemGPT** — impressive but opinionated about the full agent stack
- **Clawdbot / OpenClaw** — full agent runtime with tools, channels, scheduling, approval gates

The last category is worth expanding on. Tools like Clawdbot give you a complete agent infrastructure: Telegram/Discord/Slack integration, browser automation, cron jobs, exec sandboxing, the works. If you're building a production agent that needs to *do things* in the world, that's the right choice.

But what if you just want your Python script to remember who it's talking to?

soul.py is the answer when:
- You're building something custom and don't want a framework
- You want memory without buying into an entire agent architecture
- You need to drop persistent identity into an existing codebase
- You want files you can read, edit, and `git diff`

It's the difference between "I need a car" and "I need wheels." Sometimes you just need wheels.

## What v0.1 Doesn't Do (Yet)

Once `MEMORY.md` gets very large (thousands of entries), it'll overflow the context window. That's the v2.0 problem — solved with RAG retrieval.

For most use cases, v0.1 runs indefinitely. A typical daily exchange is ~200 words. You'd hit the context limit after roughly **6 months of daily use**. Plenty of runway.

The versions:
- **v0.1**: Markdown-native, zero infrastructure
- **v2.0**: RAG + RLM hybrid with query routing (uses Qdrant + Azure embeddings)

Try v2.0: [soulv2.themenonlab.com](https://soulv2.themenonlab.com)

## The Philosophy

The best infrastructure is no infrastructure.

Vector databases are powerful. They're also another service to run, another thing to break, another dependency to manage. For most agent use cases—personal assistants, research companions, project copilots—you don't need them. You need a text file that persists.

soul.py starts there. When you outgrow it, the upgrade path exists. But most people won't need it for months.

## Try It Now — No Install Required

**Live demo:** [soul.themenonlab.com](https://soul.themenonlab.com)

Chat with a soul.py agent and watch `MEMORY.md` fill up in real time. Ask it something, then try "What do you know about me so far?" — you'll see exactly how the memory injection works under the hood.

No API key needed. No signup. Just try it.

*(Demo source is also open: [soul.py-demo](https://github.com/menonpg/soul.py-demo) — ~150 lines of FastAPI if you want to self-host)*

## Get Started Locally

```bash
pip install soul-agent
soul init
```

Star the repo: [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)

Your AI shouldn't have amnesia. Fix it in 10 lines.

---

## Community Response

Within hours of sharing soul.py on Reddit, it became the **#1 post of all time** on [r/ollama](https://www.reddit.com/r/ollama/) — a community of 100K+ developers running local LLMs.

**The numbers (first 9 hours):**
- 📈 **24,000+ views**
- 🏆 **#1 post on r/ollama**
- 🌍 Readers from 50+ countries (37% US, 7% Germany, 5% Canada)
- 💬 Dozens of questions and feature discussions

<blockquote class="reddit-embed-bq" data-embed-height="500">
  <a href="https://www.reddit.com/r/ollama/comments/1ri4d80/soulpy_persistent_memory_for_any_llm_in_10_lines/">soul.py — Persistent memory for any LLM in 10 lines (works with Ollama, no database)</a>
  <br>by <a href="https://www.reddit.com/user/the_ai_scientist/">u/the_ai_scientist</a> in <a href="https://www.reddit.com/r/ollama/">r/ollama</a>
</blockquote>
<script async src="https://embed.reddit.com/widgets.js" charset="UTF-8"></script>

The response validated something we suspected: developers want memory without complexity. Not every project needs a vector database. Sometimes you just need a text file that persists.

Thanks to everyone who tried it, asked questions, and pushed us to add v2.0's RAG support. This is just the beginning.

---

## The Book

Everything in this post — and much more — is now in **"Soul: Building AI Agents That Remember Who They Are"**.

The book covers:
- Why agents forget (architectural deep dive)
- Identity vs Memory (SOUL.md vs MEMORY.md philosophy)
- The RLM Pattern (when RAG isn't enough)
- Multi-agent identity coordination
- The Darwinian approach to evolving agent identity
- Complete working code in every chapter

**[→ Get "Soul" on Amazon](https://a.co/d/02T0WadG)**

Try the live demo: **[Ask Darwin](https://soul-book.themenonlab.com)** — an AI companion built with the same architecture the book teaches.
