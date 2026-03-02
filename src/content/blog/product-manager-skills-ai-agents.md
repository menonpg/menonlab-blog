---
title: "Product Manager Skills: 46 Battle-Tested Frameworks for AI Agents"
description: "A comprehensive skills framework that transforms AI agents into capable product management assistants using proven methodologies from Teresa Torres, Geoffrey Moore, and Amazon."
date: "2026-03-02"
tags: ["ai-agents", "product-management", "frameworks", "claude", "openai"]
---

There's a pattern I see constantly with AI coding assistants: developers ask them to "write a PRD" or "help prioritize features," and they get... something. Generic. Template-ish. The kind of output that technically meets the request but misses the craft.

The problem isn't the AI—it's that we're asking it to improvise product management instead of giving it actual frameworks to follow.

[Product Manager Skills](https://github.com/deanpeters/Product-Manager-Skills) fixes this. It's a collection of 46 PM frameworks packaged as skills that AI agents can load and use. Instead of hoping Claude or Codex figures out how to run a customer discovery interview, you give it the actual methodology.

## Why This Matters

Product management isn't about filling out templates. It's about knowing which framework to apply when, asking the right questions in the right order, and making decisions with incomplete information. That's hard to improvise, even for capable AI systems.

This repo takes battle-tested methodologies—Teresa Torres's Opportunity Solution Trees, Geoffrey Moore's positioning framework, Amazon's working-backwards process, MITRE's technology assessment approaches—and structures them as executable knowledge for AI agents.

The result: when you ask for a PRD, the agent knows what questions to ask stakeholders, how to structure the document, and which prioritization framework applies to your situation.

## What's Included

The 46 skills span the full PM toolkit:

**Discovery and Research**
- Customer interview frameworks
- Jobs-to-be-done analysis
- Opportunity solution trees
- Assumption testing protocols

**Strategy and Prioritization**
- TAM/SAM/SOM calculators
- ICE and RICE scoring
- Kano model analysis
- Feature prioritization workflows

**Documentation**
- PRD generation with proper structure
- User story creation with acceptance criteria
- Epic breakdown patterns
- Technical specification frameworks

**Career Development**
The most recent additions cover the PM career arc—from IC to Director to VP/CPO—with frameworks for navigating transitions, executive onboarding playbooks, and readiness assessments.

## How It Works

Each skill is a structured SKILL.md file that AI agents can load. The format works with Claude Code, Cowork, OpenAI Codex, ChatGPT, Gemini—essentially any AI that can read structured instructions.

The skills follow a facilitation protocol: they don't just generate output, they guide you through the process. Ask for a PRD and the agent walks you through stakeholder questions, helps you identify assumptions, and structures the document progressively.

There's also a Streamlit beta interface for test-driving skills locally before integrating them into your agent workflow:

```bash
pip install -r app/requirements.txt
streamlit run app/main.py
```

## The Facilitation Protocol

One detail I appreciate: the repo includes a standardized facilitation protocol that ensures interactive flows actually feel interactive. Skills that involve discovery or decision-making walk through questions step-by-step rather than dumping everything at once.

This was actually a bug fix in v0.4—they found that a brevity-focused rewrite had stripped out the guided facilitation behavior. The fix standardized how skills handle context, interruptions, and decision points.

It's the kind of attention to UX that separates "a collection of prompts" from "a usable toolkit."

## Who Should Use This

This is valuable for:

- **Product managers** who want AI assistants that understand PM methodology
- **AI agent developers** building tools for product teams
- **Anyone** who's tired of getting generic output from "write me a PRD" prompts

The skills are licensed CC BY-NC-SA 4.0, so you can adapt them for your own use. The repo is actively maintained with new frameworks being added regularly.

## Getting Started

Clone the repo, pick a skill that matches what you're working on, and point your AI agent at it. The README includes setup instructions for different agent frameworks.

If you've been treating AI assistants as fancy autocomplete for PM work, this repo shows what's possible when you give them actual methodology to follow. The output quality difference is substantial.

[Explore the repo on GitHub](https://github.com/deanpeters/Product-Manager-Skills)
