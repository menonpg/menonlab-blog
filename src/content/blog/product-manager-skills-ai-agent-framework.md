---
title: "Product Manager Skills: 46 Battle-Tested Frameworks for AI Agents"
description: "Train your AI agents to do product management work like a pro with this open-source collection of PM frameworks for Claude Code, Codex, and beyond."
date: "2026-02-28"
tags: ["ai-agents", "product-management", "frameworks", "open-source"]
---

If you've ever asked an AI to "write a PRD" and received something that technically checked the boxes but missed the strategic nuance, you're not alone. The gap between what AI agents can do and what experienced product managers actually need is real—and it's exactly what [Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) aims to close.

## What Is It?

Product-Manager-Skills is an open-source repository containing 46 ready-to-use PM frameworks designed specifically for AI agents. Created by Dean Peters, the collection draws from battle-tested methodologies by Teresa Torres, Geoffrey Moore, Amazon, MITRE, and other product management heavyweights.

The key insight here is simple but powerful: instead of explaining your process to an AI every single time, you give it structured knowledge upfront. The agent then knows *how* to approach the work, not just *what* to produce.

## Why This Matters

Generic prompting has a ceiling. You can ask Claude or GPT to "prioritize these features" a hundred different ways, but without a framework, you'll get a hundred variations of the same shallow output. Product-Manager-Skills changes that equation by embedding professional-grade methodologies directly into the agent's working context.

With these skills loaded, an AI agent already knows:

- How to structure a PRD with the right sections and stakeholder questions
- Which prioritization framework fits your situation (RICE, ICE, MoSCoW, and when each applies)
- How to run customer discovery interviews using Teresa Torres's Continuous Discovery approach
- How to break down epics using proven decomposition patterns
- How to facilitate workshops with proper progression and decision points

The result is faster iteration, better consistency, and output that actually reflects how experienced PMs think.

## What's Inside

The repository organizes skills into several categories:

**Discovery & Research** — Frameworks for opportunity identification, customer interviews, and market sizing (including a TAM/SAM/SOM calculator with deterministic scripts).

**Strategy & Prioritization** — Geoffrey Moore's positioning work, JTBD analysis, and multiple prioritization frameworks with clear guidance on when each applies.

**Documentation** — PRD templates, user story scaffolding, and epic breakdown patterns that go beyond checkbox structures.

**Career & Leadership** — This is where it gets interesting. The v0.5 release includes a full leadership skills suite covering the PM-to-Director transition, VP/CPO readiness, and a 30-60-90 day executive onboarding playbook. These were distilled from The Product Porch podcast and include specific frameworks like the Altitude-Horizon model for understanding scope and time shifts as you level up.

**Facilitation** — A canonical workshop facilitation protocol that handles session structure, interruption management, and decision-point recommendations.

## The Streamlit Playground

For those who want to test-drive before committing, the repo includes a local Streamlit interface. It supports multiple providers (Anthropic, OpenAI, Ollama), handles multi-phase workflows, and lets you experiment with different skills interactively.

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

It's still in beta, but it's a solid way to understand how the skills work before integrating them into your production agent setup.

## Compatibility

The skills work with Claude Code, Cowork, OpenAI Codex, ChatGPT, Gemini, and essentially any AI agent that can ingest structured knowledge files. The format is straightforward SKILL.md files that agents can reference during conversations.

## The Bigger Picture

What I find compelling about this project isn't just the frameworks themselves—it's the approach. We're moving from "prompt engineering" (tweaking inputs) to "agent education" (giving agents genuine domain expertise). That's a meaningful shift.

Product management requires contextual judgment that's hard to prompt for but relatively easy to teach through structured methodologies. By packaging that knowledge in a format AI agents can consume, we get closer to AI that actually augments professional work rather than producing first-draft approximations.

If you're building AI-assisted PM workflows—or just tired of explaining what a good PRD looks like for the twentieth time—[Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) is worth exploring.

---

*Found via Apple Notes research. Repository by [Dean Peters](https://linkedin.com/in/deanpeters).*
