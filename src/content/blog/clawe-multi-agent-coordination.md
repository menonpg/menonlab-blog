---
title: "Clawe: Trello for AI Agents — Multi-Agent Coordination Done Right"
description: "Deploy a squad of AI agents that wake on schedules, claim tasks from a shared board, and collaborate through files and real-time notifications."
pubDate: 2026-02-18
tags: ["ai-agents", "multi-agent", "openclaw", "automation", "coordination"]
---

# Clawe: Trello for AI Agents — Multi-Agent Coordination Done Right

The AI agent landscape is shifting from single assistants to collaborative teams. But coordinating multiple autonomous agents presents unique challenges: How do they divide work? How do they communicate? How do you track what's happening?

[Clawe](https://github.com/getclawe/clawe) offers an elegant answer: it's essentially Trello for AI agents — a multi-agent coordination system built on top of OpenClaw that lets you deploy squads of agents with distinct roles, schedules, and personalities.

## The Vision: AI Teams, Not Just AI Assistants

Instead of one overloaded assistant trying to do everything, Clawe lets you spin up specialized agents:

- **🦞 Clawe** — Squad Lead, coordinates the team
- **✍️ Inky** — Content Editor, handles writing
- **🎨 Pixel** — Designer, creates visuals  
- **🔍 Scout** — SEO specialist, optimizes discoverability

Each agent wakes on its own cron schedule (default: every 15 minutes, staggered to avoid rate limits), checks for assigned tasks, and gets to work. They coordinate through a shared Convex backend and can @mention each other for handoffs.

## How It Actually Works

The architecture is beautifully simple:

1. **Kanban Board** — A web dashboard (Next.js) shows all tasks with statuses, assignments, and subtasks
2. **Agent Gateway** — A Docker container runs all agents via OpenClaw's multi-session support
3. **Watcher Service** — Registers agents, sets up cron schedules, and delivers notifications in real-time
4. **Convex Backend** — Stores agents, tasks, notifications, and activity feeds

When you create a task and assign it to Pixel, the watcher notices and delivers a notification. On Pixel's next heartbeat, they see the assignment, update status to "in progress," and start working. When done, they can @mention Inky for review, triggering another notification.

## The CLI: How Agents Interact

Agents use the `clawe` CLI to participate in the coordination system:

```bash
# Check for notifications
clawe check

# List and view tasks
clawe tasks --status in_progress
clawe task:view <task-id>

# Update status and add comments
clawe task:status <task-id> review
clawe task:comment <task-id> "Draft complete, ready for review"

# Register deliverables
clawe deliver <task-id> "Final Report" --path ./report.md

# Notify teammates
clawe notify <session-key> "Need your eyes on this"
```

This CLI-first approach means agents can integrate coordination into their normal workflow without complex API integrations.

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

The `shared/` directory is the key innovation — it's a symlinked folder all agents can read/write, enabling file-based collaboration. Agents can leave notes, share drafts, and coordinate without relying solely on the database.

## Routines: Recurring Work

Beyond ad-hoc tasks, Clawe supports scheduled routines — recurring work that automatically creates inbox items:

- Configure day/time schedules per routine
- 1-hour trigger window for crash tolerance  
- Tasks created with Clawe (the Squad Lead) as creator

This means you can set up "Monday morning content planning" or "Daily SEO audit" and the right agent will automatically get the work.

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

Single-agent systems hit walls. They can't parallelize work, they lack specialization, and they become context-overloaded trying to do everything. Multi-agent systems promise a solution, but coordination is hard.

Clawe makes coordination visible and manageable. Instead of agents talking to each other in opaque ways, you have a dashboard showing who's working on what, a notification system for handoffs, and a CLI for agents to update their status.

It's the missing project management layer for the AI agent era.

---

**Links:**
- GitHub: [github.com/getclawe/clawe](https://github.com/getclawe/clawe)
- Built on: [OpenClaw](https://github.com/openclaw/openclaw)
- Backend: [Convex](https://convex.dev)
