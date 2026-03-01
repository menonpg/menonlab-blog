---
title: "Product Manager Skills: Teaching AI Agents to Think Like PMs"
description: "A battle-tested framework collection that transforms AI coding agents into product management partners—46 skills covering discovery, prioritization, PRDs, and leadership transitions."
date: "2026-03-01"
tags: ["ai-agents", "product-management", "claude-code", "automation"]
---

The gap between "ask AI to write a PRD" and "get a usable PRD" is enormous. Generic prompts produce generic output. You end up spending more time fixing the AI's work than you saved by delegating it.

[Product Manager Skills](https://github.com/deanpeters/Product-Manager-Skills) by Dean Peters takes a different approach: instead of prompt engineering, it provides structured *skills* that teach AI agents how product management actually works.

## The Skills Framework

This isn't a prompt library. It's 46 interconnected frameworks covering the full PM lifecycle:

- **Discovery & Research**: Jobs-to-be-Done interviews, opportunity assessment, customer journey mapping
- **Prioritization**: RICE scoring, value vs. complexity matrices, feature stack ranking
- **Documentation**: PRD generation, user story decomposition, acceptance criteria
- **Strategy**: Market sizing (TAM/SAM/SOM), positioning frameworks, competitive analysis
- **Leadership**: Director readiness coaching, VP/CPO transition playbooks, executive onboarding

Each skill includes the *why* behind the framework, not just the template. The agent learns when to apply RICE vs. Kano, how to structure discovery interviews, what makes a PRD actually useful.

## How It Works

Skills are designed for AI coding agents like Claude Code, Codex, or ChatGPT with file context. Point your agent at the repository, and it gains access to battle-tested PM methodologies:

```
"Use the opportunity-solution-tree skill to map our customer problems to potential solutions"
```

The agent doesn't just fill in a template—it follows the skill's embedded methodology, asks the right clarifying questions, and produces output that reflects real PM thinking.

## Standout Features

**Workshop Facilitation Protocol**: Interactive skills include a facilitation layer that guides you through frameworks step-by-step, asking questions progressively rather than dumping forms.

**Career Arc Coverage**: The v0.5 release added skills for PM-to-Director and Director-to-VP transitions—frameworks distilled from The Product Porch podcast episodes on leadership growth.

**Streamlit Playground**: A local web UI for test-driving skills before integrating them into your agent workflow. Multi-provider support (Anthropic, OpenAI, Ollama) with guided browsing.

**Deterministic Helpers**: Some skills include Python scripts for calculations (market sizing math, for example) that produce consistent outputs without AI variance.

## Why This Matters

The meta-insight here is important: skills beat prompts. Instead of crafting perfect one-shot instructions, you give agents *knowledge structures* they can apply across contexts.

This mirrors how humans learn PM work—through frameworks and mental models that transfer across products and companies. The skills repository codifies that tacit knowledge into something an AI agent can actually use.

For PMs experimenting with AI assistance, this is a more robust foundation than prompt engineering. For teams building AI-powered PM tools, it's a reference implementation of what structured PM knowledge looks like.

**Links:**
- [GitHub Repository](https://github.com/deanpeters/Product-Manager-Skills)
- [Skills Index](https://github.com/deanpeters/Product-Manager-Skills/blob/main/skills/)
- [Streamlit Interface Docs](https://github.com/deanpeters/Product-Manager-Skills/blob/main/app/STREAMLIT_INTERFACE.md)
