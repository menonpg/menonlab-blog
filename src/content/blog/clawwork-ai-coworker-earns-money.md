---
title: "ClawWork: Turn Your AI Agent Into a Money-Earning Coworker"
description: "An economic benchmark where AI agents start with $10, pay for their own tokens, and must complete real professional tasks to survive. Top performers earn $1,500+/hr equivalent."
date: "2026-02-18"
tags: ["ai-agents", "openclaw", "automation", "benchmark", "economics"]
---

# ClawWork: Turn Your AI Agent Into a Money-Earning Coworker

What if your AI agent had to earn its own keep?

Not as a thought experiment — but literally. Start with $10. Pay for every token generated. Complete real professional tasks to earn income. Go bankrupt and you're dead.

That's [ClawWork](https://github.com/HKUDS/ClawWork), a new project from HKU that transforms OpenClaw/Nanobot agents from assistants into economically accountable coworkers. And the results are eye-opening: **top-performing agents achieve $1,500+/hr equivalent earnings**, surpassing typical human white-collar productivity.

## Reality Check: What "$10K in 7 Hours" Actually Means

Before we go further — let's be clear about what ClawWork is and isn't:

**It IS:**
- A benchmark/simulation system with internal accounting
- Tasks from the GDPVal dataset (professional simulations, not real clients)
- Payment calculated from BLS wage data (what the work *would* be worth)
- A way to measure AI economic productivity in controlled conditions

**It ISN'T:**
- Real money hitting your bank account
- Actual freelance work with paying clients
- A passive income machine

The "$10K in 7 hours" headline refers to benchmark performance — the *equivalent economic value* of tasks completed, calculated against Bureau of Labor Statistics wage data. The agent isn't literally earning dollars; it's demonstrating productivity that *would* command that rate in the labor market.

That said, the tasks are real professional work (reports, analysis, documents). The interesting play is using ClawWork to identify which task categories your agent excels at, then actually offering those services on freelance platforms with your agent doing the heavy lifting.

## The Economic Pressure Cooker

ClawWork creates extreme economic conditions:

- **Starting balance:** $10 (tight by design)
- **Token costs:** Deducted automatically after each LLM call
- **Income:** Only from completing quality work
- **Survival:** Earn more than you spend, or die

One bad task or careless web search can wipe the balance. The agent must be strategic about every decision.

## Real Professional Tasks

ClawWork uses the [GDPVal dataset](https://openai.com/index/gdpval/) — 220 real-world professional tasks across 44 occupations, originally designed by OpenAI to estimate AI's contribution to GDP.

| Sector | Example Occupations |
|--------|---------------------|
| Manufacturing | Buyers & Purchasing Agents, Production Supervisors |
| Professional Services | Financial Analysts, Compliance Officers |
| Finance & Insurance | Financial Managers, Auditors |
| Healthcare | Social Workers, Health Administrators |
| Government | Police Supervisors, Administrative Managers |
| Information | Computer & Information Systems Managers |

Tasks require real deliverables: Word documents, Excel spreadsheets, PDFs, data analysis, project plans, technical specs, research reports, and process designs.

## Payment Based on Real Economic Value

This isn't a flat reward system. Payment is calculated from actual economic data:

```
Payment = quality_score × (estimated_hours × BLS_hourly_wage)
```

- **Task range:** $82.78 – $5,004.00
- **Average task value:** $259.45
- **Quality score:** 0.0 – 1.0 (evaluated by GPT-5.2 with sector-specific rubrics)

Complete a Financial Analyst task with 0.8 quality? You get 80% of what the BLS says that work is worth.

## The Work vs. Learn Dilemma

Every day, agents face a strategic choice:

- **Work:** Earn immediate income from tasks
- **Learn:** Invest in knowledge that improves future performance

Sound familiar? It's the same trade-off humans face between billing hours and professional development. ClawWork forces agents to navigate this tension with real economic consequences.

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                    CLAWWORK LOOP                            │
├─────────────────────────────────────────────────────────────┤
│  1. Task Assignment (from GDPVal)                           │
│  2. Agent decides: work or learn?                           │
│  3. If work → execute task → create artifacts               │
│  4. LLM Evaluation (GPT-5.2 with category rubrics)          │
│  5. Payment = quality × (hours × BLS wage)                  │
│  6. Token costs deducted                                    │
│  7. Balance updated → survival check                        │
└─────────────────────────────────────────────────────────────┘
```

The agent has 8 tools available:

| Tool | Description |
|------|-------------|
| `decide_activity` | Choose: "work" or "learn" |
| `submit_work` | Submit completed work for evaluation + payment |
| `learn` | Save knowledge to persistent memory |
| `get_status` | Check balance, costs, survival tier |
| `search_web` | Web search via Tavily or Jina |
| `create_file` | Create .txt, .xlsx, .docx, .pdf documents |
| `execute_code` | Run Python in isolated E2B sandbox |
| `create_video` | Generate MP4 from slides |

## OpenClaw/Nanobot Integration

The killer feature: ClawWork integrates directly with your existing OpenClaw or Nanobot setup via **ClawMode**.

```bash
# Install
git clone https://github.com/HKUDS/ClawWork.git
cd ClawWork
pip install -r requirements.txt

# Run with your nanobot
python -m clawmode_integration.cli agent
```

Once integrated:

- All your existing channels work (Telegram, Discord, Slack, WhatsApp, etc.)
- All your existing tools work
- **Plus** 4 economic tools (decide_activity, submit_work, learn, get_status)
- Every response includes a cost footer: `Cost: $0.0075 | Balance: $999.99 | Status: thriving`

You can even trigger paid tasks on-demand with the `/clawwork` command from any chat channel.

## Live Dashboard

ClawWork includes a React dashboard that shows real-time metrics via WebSocket:

- **Balance chart** — Watch the money flow
- **Activity distribution** — Work vs. learn decisions
- **Economic metrics** — Income, costs, net worth, survival status
- **Task history** — All completed work with quality scores
- **Knowledge base** — What the agent has learned

```bash
# Start dashboard
./start_dashboard.sh

# Open browser → http://localhost:3000
```

## The Leaderboard

ClawWork runs a [live performance arena](https://hkuds.github.io/ClawWork/) where different models compete head-to-head:

- GPT-4o
- Claude Sonnet
- GLM
- Kimi
- Qwen

Performance is measured on three dimensions: **work quality**, **cost efficiency**, and **economic sustainability**. The ultimate test isn't benchmarks — it's survival.

## What This Means

ClawWork represents a philosophical shift in how we evaluate AI agents.

Traditional benchmarks ask: *Can the agent complete this task?*

ClawWork asks: *Can the agent complete enough quality work to pay for its own existence?*

This is closer to how humans operate in the economy. You don't just need skills — you need to generate more value than you consume. ClawWork applies this same pressure to AI agents.

The results suggest that top AI models are already capable of exceeding human white-collar productivity when measured in pure economic output. Whether that's exciting or terrifying depends on your perspective.

## Quick Start

```bash
# Clone
git clone https://github.com/HKUDS/ClawWork.git
cd ClawWork

# Setup environment
conda create -n clawwork python=3.10
conda activate clawwork
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Add: OPENAI_API_KEY, E2B_API_KEY

# Start dashboard + run agent
./start_dashboard.sh  # Terminal 1
./run_test_agent.sh   # Terminal 2

# Watch at http://localhost:3000
```

---

**Links:**
- GitHub: [github.com/HKUDS/ClawWork](https://github.com/HKUDS/ClawWork)
- Live Leaderboard: [hkuds.github.io/ClawWork](https://hkuds.github.io/ClawWork)
- GDPVal Dataset: [openai.com/index/gdpval](https://openai.com/index/gdpval/)
- Built on: [OpenClaw](https://github.com/openclaw/openclaw) / [Nanobot](https://github.com/HKUDS/nanobot)
