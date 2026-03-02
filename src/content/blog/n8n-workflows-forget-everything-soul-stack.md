---
title: "Why Your n8n Workflows Forget Everything — And How to Fix It"
description: "n8n is stateless by design. Every workflow execution starts fresh. soul-stack adds the missing memory layer — make your automations remember."
date: "2026-03-01"
tags: ["n8n", "automation", "soul.py", "docker", "self-hosted", "memory"]
---

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
  -e ANTHROPIC_API_KEY=your-key \
  pgmenon/soul-stack:latest
```

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

```bash
docker run -d \
  -p 8000:8000 -p 8888:8888 -p 5678:5678 \
  -e ANTHROPIC_API_KEY=your-key \
  pgmenon/soul-stack:latest
```

Then open:
- **n8n:** http://localhost:5678
- **soul.py API:** http://localhost:8000/docs
- **Jupyter:** http://localhost:8888

The image auto-updates on every push to main. Fully automated CI/CD.

## Links

- **Docker Hub:** [pgmenon/soul-stack](https://hub.docker.com/r/pgmenon/soul-stack)
- **GitHub:** [github.com/menonpg/soul-stack](https://github.com/menonpg/soul-stack)
- **soul.py:** [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)
- **n8n docs:** [docs.n8n.io](https://docs.n8n.io)

---

Your n8n workflows shouldn't have amnesia. Give them memory.
