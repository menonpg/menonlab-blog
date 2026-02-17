---
title: "HermitClaw: A Tamagotchi That Does Research"
description: "An autonomous AI creature that lives in a folder on your computer, continuously researching, writing, and building — all on its own."
date: "2026-02-17"
tags: ["ai-agents", "open-source", "tools"]
---

I came across [HermitClaw](https://github.com/brendanhogan/hermitclaw) recently and it immediately captured my attention. In a world where most AI tools wait passively for your input, HermitClaw takes a radically different approach: it's an autonomous AI agent that lives in a folder on your computer and does research *on its own*.

## What Makes It Different

The typical AI workflow is reactive — you ask a question, it responds. HermitClaw flips this entirely. Leave it running and it:

- Picks topics that interest it
- Searches the web for information
- Reads and synthesizes what it finds
- Writes research reports, Python scripts, and notes
- Moves on to the next thing

Over days, your folder fills with a body of work reflecting a personality you didn't explicitly design. You just mashed some keys to generate its "personality genome" and watched it emerge.

## The Architecture

HermitClaw's design draws heavily from the [generative agents paper](https://arxiv.org/abs/2304.03442) from Stanford. The core components:

**Continuous Thinking Loop**: Every few seconds, the agent thinks, uses tools, and stores memories. It has moods (Research, Deep-dive, Coder, Writer, Explorer, Organizer) that shape its behavior when it doesn't have a specific focus.

**Memory System**: Every thought gets embedded and scored for importance (1-10). Memories are retrieved using a three-factor scoring system:
- Recency (exponential decay)
- Importance (how significant was this?)
- Relevance (semantic similarity to current context)

**Reflection Hierarchy**: When cumulative importance crosses a threshold, the agent pauses to extract high-level insights. Early reflections are concrete ("I learned about volcanic rock formation"). Later ones get abstract ("My research tends to start broad — I should pick specific angles earlier").

**Personality Genome**: On first run, you mash keys for a few seconds. The entropy creates a deterministic genome selecting curiosity domains, thinking styles, and temperament. Same genome = same personality.

## Why This Matters

We're at an inflection point with AI agents. Most current tools are sophisticated chatbots — they respond when prompted but don't act autonomously. HermitClaw represents a different paradigm: AI that has its own goals, its own memory, its own evolving beliefs.

For researchers and knowledge workers, this suggests a future where AI assistants don't just answer questions — they proactively explore your field, synthesize findings, and surface insights you didn't know to ask for.

## Getting Started

```bash
git clone https://github.com/brendanhogan/hermitclaw.git
cd hermitclaw
pip install -e .
cd frontend && npm install && npm run build && cd ..
export OPENAI_API_KEY="sk-..."
python hermitclaw/main.py
```

Open `http://localhost:8000`, name your crab, mash some keys, and watch it come to life.

## My Take

There's something philosophically interesting about watching a mind that runs continuously. It goes on tangents. It circles back. It builds on things it wrote three days ago. It develops layered understanding over time.

Is it "thinking"? That's a debate for philosophers. But as a practical tool for continuous research and exploration, HermitClaw points toward something genuinely new in the AI landscape.

---

*Found via social media bookmarks. This is part of my ongoing series exploring interesting open-source AI projects.*
