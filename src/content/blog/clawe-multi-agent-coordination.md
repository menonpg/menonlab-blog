---
title: "Clawe: Trello for AI Agents — Built on the OpenClaw Phenomenon"
description: "The viral AI agent framework that amassed 200K+ GitHub stars now has a multi-agent coordination layer. Deploy squads of agents that share a Kanban board."
date: "2026-02-18"
tags: ["ai-agents", "multi-agent", "openclaw", "automation", "coordination"]
---


## The Rise of OpenClaw

If you've been following the AI agent space, you've probably heard of OpenClaw — even if you knew it by its earlier names.

It started as **Clawdbot**, a personal AI assistant created by Austrian engineer Peter Steinberger in November 2025. Named after Anthropic's Claude (with a lobster twist), it was designed as "an AI that actually does things" — an autonomous agent that executes tasks via LLMs, using messaging platforms like WhatsApp, Telegram, and Discord as its interface.

Then came the trademark complaints from Anthropic. Clawdbot became **Moltbot** on January 27, 2026. Three days later, Steinberger renamed it again to **OpenClaw** because "Moltbot never quite rolled off the tongue."

What happened next was explosive.

Entrepreneur Matt Schlicht launched **Moltbook** — a social network designed *exclusively* for AI agents. The viral combination of Moltbook's novelty and OpenClaw's open-source licensing created a perfect storm. The project amassed over **200,000 GitHub stars** and **35,000 forks**. Companies in Silicon Valley and China adopted it; developers in China adapted it for DeepSeek and domestic super-apps.

Wired, TechCrunch, CNBC, Axios, Platformer — everyone covered it. Casey Newton called it "incredible" and "terrifying" in the same breath. On February 14, 2026, Steinberger announced he was joining OpenAI, and the project would move to an open-source foundation.

OpenClaw became the de facto standard for personal AI agents.

## The Multi-Agent Problem

But here's the thing about single-agent systems: they hit walls.

One agent trying to do everything — research, writing, design, SEO, coding — becomes context-overloaded. It can't parallelize work. It lacks specialization. The promise of AI agents was supposed to be *teams*, not just assistants.

The question became: **How do you coordinate multiple autonomous agents working together?**

## Enter Clawe

[Clawe](https://github.com/getclawe/clawe) is the answer. Built on top of OpenClaw, it's essentially **Trello for AI agents** — a multi-agent coordination system that lets you deploy squads of agents with distinct roles, schedules, and personalities.

Instead of one overloaded assistant, you spin up specialized agents:

- **🦞 Clawe** — Squad Lead, coordinates the team
- **✍️ Inky** — Content Editor, handles writing
- **🎨 Pixel** — Designer, creates visuals  
- **🔍 Scout** — SEO specialist, optimizes discoverability

Each agent wakes on its own cron schedule (default: every 15 minutes, staggered to avoid rate limits), checks for assigned tasks, and gets to work. They coordinate through a shared Convex backend and can @mention each other for handoffs.

## How It Works

The architecture leverages everything OpenClaw already does well:

```
┌─────────────────────────────────────────────────────────────┐
│                     DOCKER COMPOSE                          │
├─────────────────┬─────────────────────┬─────────────────────┤
│    squadhub     │      watcher        │       clawe         │
│                 │                     │                     │
│  Agent Gateway  │  • Register agents  │   Web Dashboard     │
│  with 4 agents  │  • Setup crons      │   • Squad status    │
│                 │  • Deliver notifs   │   • Task board      │
│                 │                     │   • Agent chat      │
└────────┬────────┴──────────┬──────────┴──────────┬──────────┘
         │                   │                     │
         └───────────────────┼─────────────────────┘
                             │
                   ┌─────────▼─────────┐
                   │      CONVEX       │
                   │     (Backend)     │
                   │  • Agents         │
                   │  • Tasks          │
                   │  • Notifications  │
                   └───────────────────┘
```

1. **Kanban Board** — A web dashboard (Next.js) shows all tasks with statuses, assignments, and subtasks
2. **Agent Gateway** — A Docker container runs all agents via OpenClaw's multi-session support
3. **Watcher Service** — Registers agents, sets up cron schedules, and delivers notifications in real-time
4. **Convex Backend** — Stores agents, tasks, notifications, and activity feeds

## The CLI: Agent-to-Agent Communication

Agents use the `clawe` CLI to participate in the coordination system:

```bash
clawe check

# List and view tasks
clawe tasks --status in_progress
clawe task:view <task-id>

# Update status and add comments
clawe task:status <task-id> review
clawe task:comment <task-id> "Draft complete, ready for review"

# Register deliverables
clawe deliver <task-id> "Final Report" --path ./report.md

clawe notify <session-key> "Need your eyes on this"
```

This CLI-first approach means agents can integrate coordination into their normal workflow — just like OpenClaw agents use file-based memory and heartbeats.

## Isolated Workspaces, Shared Context

Each agent gets an isolated workspace with the familiar OpenClaw file structure:

```
/data/workspace-{agent}/
├── AGENTS.md      # Instructions
├── SOUL.md        # Identity and personality
├── HEARTBEAT.md   # What to do on wake
├── MEMORY.md      # Long-term memory
└── shared/        # Symlink to team state
    ├── WORKING.md   # Current team status
    └── WORKFLOW.md  # Standard procedures
```

The `shared/` directory is the key innovation — a symlinked folder all agents can read/write. Agents can leave notes, share drafts, and coordinate without relying solely on the database. It's file-based collaboration for AI agents.

## Routines: Recurring Work

Beyond ad-hoc tasks, Clawe supports scheduled routines that automatically create inbox items:

- Configure day/time schedules per routine
- 1-hour trigger window for crash tolerance  
- Tasks created with Clawe (the Squad Lead) as creator

Set up "Monday morning content planning" or "Daily SEO audit" and the right agent automatically gets the work.

## Getting Started

Deployment is straightforward with Docker Compose:

```bash
git clone https://github.com/getclawe/clawe.git
cd clawe
cp .env.example .env
# Add your ANTHROPIC_API_KEY, CONVEX_URL, SQUADHUB_TOKEN
./scripts/start.sh
```

The start script handles everything: generating tokens, validating env vars, building packages, and spinning up the containers. Dashboard lands at `http://localhost:3000`.

## Why This Matters

OpenClaw proved that personal AI agents work. Over 200,000 developers starred the repo because it solved a real problem — an AI that actually *does* things.

Clawe is the next logical step: from solo agents to agent teams. Instead of opaque multi-agent communication, you get a dashboard showing who's working on what, a notification system for handoffs, and a CLI for agents to update their status.

If OpenClaw is the OS for AI agents, Clawe is the project management layer.

---

**Links:**
- Clawe GitHub: [github.com/getclawe/clawe](https://github.com/getclawe/clawe)
- OpenClaw: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)
- OpenClaw on Wikipedia: [en.wikipedia.org/wiki/OpenClaw](https://en.wikipedia.org/wiki/OpenClaw)
- Backend: [Convex](https://convex.dev)
