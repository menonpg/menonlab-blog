---
title: "soul-stack: One Docker Command to Give n8n Persistent Memory"
description: "n8n is stateless by design. soul-stack adds the missing memory layer — n8n + soul.py + Jupyter in a single container. Works with Anthropic, OpenAI, or 100% local with Ollama."
date: "2026-03-01"
tags: ["n8n", "automation", "soul.py", "docker", "self-hosted", "memory", "soul-stack"]
---

*Updated March 2026: soul-stack now includes soul-agent 0.1.2 with `soul chat` CLI, ChromaDB backend, and configurable vector storage via `SOUL_BACKEND` env var.*

n8n is incredible. 50,000+ GitHub stars. Self-hosted automation that rivals Zapier. Workflows that can do almost anything.

Except remember.

## The Stateless Problem

Every n8n workflow execution starts fresh. No memory of previous runs. No context about the user. No learning from outcomes.

This is fine for simple automations: "When email arrives → send Slack message." But the moment you want intelligence, you hit a wall:

- **Customer support bot** — Can't remember previous tickets from the same customer
- **Sales outreach** — Can't recall what was discussed last week
- **Research assistant** — Can't build on previous findings
- **Personal automation** — Can't learn your preferences over time

You end up hacking around it: storing state in Airtable, passing JSON between runs, building complex branching logic. It works, but it's fragile and exhausting.

What if your workflows could just... remember?

## soul-stack: The Missing Memory Layer

[soul-stack](https://github.com/menonpg/soul-stack) is a single Docker container that gives n8n persistent memory:

```bash
docker run -d \
  -p 8000:8000 -p 8888:8888 -p 5678:5678 \
  -e OPENAI_API_KEY=sk-your-key \
  pgmenon/soul-stack:latest
```

Works with **OpenAI, Anthropic, or 100% local with Ollama** — your choice.

One command. Three services:

| Port | Service | Purpose |
|------|---------|---------|
| 5678 | **n8n** | Your workflow automation |
| 8000 | **soul.py API** | Persistent memory for any LLM |
| 8888 | **Jupyter Lab** | Experimentation and debugging |

The magic is in how they connect.

## How It Works

In any n8n workflow, drop a Python node:

```python
import requests

# Ask soul.py — it remembers everything
response = requests.post("http://localhost:8000/ask", json={
    "message": f"Customer {customer_email} is asking about {topic}. What do we know about them?"
})

context = response.json()["response"]
# → "This customer contacted us twice last month about billing issues. 
#    They prefer email over phone. Last interaction was positive."
```

That's it. Your workflow now has memory.

The soul.py API maintains `MEMORY.md` — a persistent log of every interaction. It survives restarts, accumulates context, and makes your automations dramatically smarter.

## Real Examples

### Customer Support with Context

**Before:** Every ticket is treated as a first contact.

**After:**
```
Workflow: New Zendesk ticket
→ Python node: "What do we know about this customer?"
→ soul.py: "Contacted 3x in past month. Frustrated about delivery delays. 
   VIP customer ($2,400 LTV). Prefers direct solutions, not templates."
→ AI drafts personalized response with full context
```

### Sales Follow-up That Remembers

**Before:** "Just following up on our conversation..." (what conversation?)

**After:**
```
Workflow: 7-day follow-up trigger
→ Python node: "Summarize my last interaction with {lead}"
→ soul.py: "Discussed pricing on March 1. Main objection was implementation 
   timeline. They mentioned Q2 budget approval. Decision maker is the CTO."
→ AI drafts contextual follow-up referencing actual conversation
```

### Research Assistant That Builds Knowledge

**Before:** Every research session starts from scratch.

**After:**
```
Workflow: Daily news digest
→ Fetch articles on tracked topics
→ Python node: "What have we learned about {topic} so far?"
→ soul.py: "Previous research identified 3 key players, 2 emerging trends,
   and a regulatory change coming in April. Today's articles add..."
→ Accumulating intelligence, not just alerts
```

## Zero Cloud Option

Don't want to send data to Anthropic/OpenAI? Run everything locally with Ollama:

```yaml
# docker-compose.yml
services:
  soul-stack:
    image: pgmenon/soul-stack:latest
    ports:
      - "8000:8000"
      - "8888:8888"
      - "5678:5678"
    environment:
      - OLLAMA_HOST=ollama:11434
  
  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
```

```bash
docker compose up -d
docker exec -it ollama ollama pull llama3.2
```

100% local. Zero API costs. Full memory.

## The Stack

**soul.py** is the memory layer — two markdown files (`SOUL.md` for identity, `MEMORY.md` for history) that persist across sessions. [Full details here](/blog/soul-py-persistent-memory-llm-agents).

**n8n** is the automation engine — connect to 500+ services, build complex workflows, self-hosted.

**Jupyter** is for experimentation — test prompts, debug memory, explore what the agent knows.

Together, they're more than the sum of their parts. n8n gets memory. soul.py gets automation triggers. You get stateful agents that actually work.

## Get Started

soul-stack works with **any LLM provider** — cloud or local.

### Option A: Anthropic (Claude)

```bash
docker run -d \
  -p 8000:8000 -p 8888:8888 -p 5678:5678 \
  -e ANTHROPIC_API_KEY=sk-ant-your-key \
  -e ANTHROPIC_MODEL=claude-sonnet-4-20250514 \
  pgmenon/soul-stack:latest
```

Default model is `claude-sonnet-4-20250514` if not specified. Other options: `claude-opus-4-20250514`, `claude-3-haiku-20240307`.

### Option B: OpenAI (GPT-4, etc.)

```bash
docker run -d \
  -p 8000:8000 -p 8888:8888 -p 5678:5678 \
  -e OPENAI_API_KEY=sk-your-key \
  -e OPENAI_MODEL=gpt-4o \
  pgmenon/soul-stack:latest
```

Default model is `gpt-4o` if not specified. Other options: `gpt-4-turbo`, `gpt-3.5-turbo`.

### Option C: Both Providers

Pass both keys and select per-request, or let soul.py use whichever is available:

```bash
docker run -d \
  -p 8000:8000 -p 8888:8888 -p 5678:5678 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OPENAI_API_KEY=sk-... \
  pgmenon/soul-stack:latest
```

### Option D: 100% Local with Ollama (Zero API Costs)

For completely private, offline operation — see the docker-compose section below.

---

**Then open:**
- **n8n:** http://localhost:5678
- **soul.py API:** http://localhost:8000/docs
- **Jupyter:** http://localhost:8888

The image auto-updates on every push to main. Fully automated CI/CD.

## New in v0.1.2: Backend Selection & CLI

The latest soul-stack image includes **soul-agent 0.1.2** with several new options:

### Choose Your Vector Backend

Set `SOUL_BACKEND` to control how memory is stored and searched:

```bash
docker run -d \
  -e SOUL_BACKEND=chromadb \
  -e OPENAI_API_KEY=sk-... \
  pgmenon/soul-stack:latest
```

| Backend | Best For | Config |
|---------|----------|--------|
| `bm25` | Zero-config, small memories | Default, no setup needed |
| `chromadb` | Local vector search, medium scale | Just set the env var |
| `qdrant` | Production, large scale | Add `QDRANT_URL` + `QDRANT_API_KEY` |

### OpenAI Embeddings

Now you can use OpenAI for embeddings directly (not just Azure):

```bash
docker run -d \
  -e SOUL_BACKEND=chromadb \
  -e OPENAI_API_KEY=sk-... \
  -e OPENAI_EMBEDDING_MODEL=text-embedding-3-small \
  pgmenon/soul-stack:latest
```

### Interactive CLI Inside Container

The `soul chat` and `soul status` commands are now available:

```bash
docker exec -it <container> soul chat
docker exec -it <container> soul status
```

Useful for debugging memory state without hitting the API.

## Links

- **Docker Hub:** [pgmenon/soul-stack](https://hub.docker.com/r/pgmenon/soul-stack)
- **GitHub:** [github.com/menonpg/soul-stack](https://github.com/menonpg/soul-stack)
- **soul.py:** [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)
- **n8n docs:** [docs.n8n.io](https://docs.n8n.io)

---

**Related:** For a deeper technical dive on integrating soul.py's HybridAgent directly into n8n Python nodes (including RAG vs RLM mode selection and cloud deployment), see [Adding Persistent Memory to n8n AI Workflows with soul.py](/blog/soul-py-n8n-persistent-memory-workflows).

---

Your n8n workflows shouldn't have amnesia. Give them memory.
