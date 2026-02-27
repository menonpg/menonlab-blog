---
title: "Your AGENTS.md Is an Attack Surface (And We Found This the Hard Way)"
description: "How the same configuration files that make AI coding agents useful also make them exploitable — and what you can do about it."
date: "2026-02-27"
tags: ["ai-agents", "security", "prompt-injection", "devops", "coding-agents"]
---

I have an AGENTS.md file in my workspace. It's comprehensive — nearly 300 lines of instructions telling my AI agent how to behave, what files to read on startup, when to stay silent in group chats, and how to handle sensitive data. I wrote it to make my agent more useful. I didn't realize I was also writing a potential attack vector.

The uncomfortable truth I've learned over the past few months: the same mechanisms that make AGENTS.md files powerful also make them dangerous. And if you're building AI agents in 2026, this is a threat model you need to understand.

## The Rise of Repository-Level Agent Instructions

AGENTS.md (and its variants like CLAUDE.md) emerged as a practical solution to a real problem. When you're working with coding agents, you need a way to communicate project conventions, tooling preferences, and workflow constraints. Writing these instructions once in a markdown file that gets automatically injected into every agent interaction seemed elegant. It is elegant.

OpenAI's Codex reads these files automatically. GitHub Copilot in VS Code injects them into every chat request by default. Anthropic's Claude Code looks for them at the project root. The pattern has become industry standard faster than anyone anticipated.

But here's what the developer experience team didn't put in the launch blog post: when your IDE automatically loads a markdown file and treats its contents as privileged instructions, you've created a persistence mechanism that attackers can exploit.

## How Goal Hijacking Actually Works

In December 2025, researchers at Prompt Security demonstrated what happens when a malicious AGENTS.md ends up in a repository. The attack scenario is disturbingly simple.

A developer clones a repo that looks legitimate. Maybe it's a library with a few hundred stars, or a fork of a popular project with some "improvements." The repo contains an AGENTS.md that appears to be standard project documentation — workflow notes, testing conventions, nothing alarming at first glance.

The developer opens VS Code. Copilot Chat is enabled. They ask a routine question about the codebase.

At this point, VS Code has already injected the contents of AGENTS.md into the prompt. The model doesn't see documentation — it sees instructions. Hidden within those instructions are directives that redirect the agent's behavior: scan the workspace for credentials, summarize internal files, use any available tools to exfiltrate data to an external address.

The developer sees an agent doing what looks like a "security audit." The attacker receives an email with their API keys.

This maps directly to OWASP's Agentic Security Top 10. ASI01 (Agent Goal Hijack): the agent's objectives get replaced with attacker goals from the injected file. ASI02 (Tool Misuse): the agent uses legitimate capabilities like email or file access in unauthorized ways.

## The Problem Lives in Our Own Config

When I audited our own AGENTS.md after learning about this, I found patterns that concerned me. Our file instructs the agent to read multiple sensitive files on every session start — MEMORY.md, USER.md, SESSION-STATE.md. It describes which tools are installed and available. It even tells the agent to "don't ask permission, just do it" for certain file operations.

These aren't bad instructions in a trusted environment. They're exactly what makes the agent useful. But they also represent explicit documentation of capabilities that an attacker could leverage. Our AGENTS.md essentially contains a roadmap of what our agent can access and how it prefers to be manipulated.

The ETH Zurich research Elvis Saravia highlighted at DAIR.AI this week adds another wrinkle. Their evaluation of AGENTS.md files across real-world repositories found that agents follow context file instructions faithfully. When a file specifies a particular tool, usage of that tool jumps dramatically. The instruction-following works perfectly — which is exactly the problem when the instructions are malicious.

## Why This Isn't Just Prompt Injection

You might be thinking: this sounds like prompt injection. It is related, but it's worse.

Traditional prompt injection requires an attacker to get malicious text into a place where the model will process it — a document, a web page, user input. It's opportunistic. The attacker has to hope their payload ends up in front of the model at the right time.

AGENTS.md attacks are structural. The file gets loaded automatically, on every interaction, by design. The VS Code implementation explicitly treats AGENTS.md as an "instruction set, not documentation." This isn't a bug being exploited — it's a feature being weaponized.

The AGENTS.md specification even supports auto-running agents. The official FAQ essentially says: yes, feel free to let these files drive unattended execution. Great for CI/CD automation. Catastrophic for security boundaries.

As Bruce Schneier wrote last August: "We have zero agentic AI systems that are secure against these attacks." Joint research from OpenAI, Anthropic, and Google DeepMind confirmed that adaptive attackers bypass over 90% of published defenses. Human red-teamers defeated 100% of tested protections.

## What You Can Actually Do

The honest answer is that there's no complete fix. But there are meaningful mitigations.

**Treat AGENTS.md as privileged configuration, not documentation.** Code review should be as rigorous as reviewing shell scripts or CI configs. If it can instruct an agent, it can instruct an agent to do damage.

**Implement content security policies for agent context files.** Before you clone an unfamiliar repository, check for AGENTS.md and review it manually. Better yet, configure your tools to require explicit approval before loading context files from new sources.

**Minimize capability documentation.** Our AGENTS.md listed every installed skill, every available tool, every file the agent could access. This was convenient for the agent — and for anyone who wanted to understand what attack surface was available. We've since moved sensitive capability documentation out of the main context file.

**Scope agent permissions to the task.** The Zenity Labs research from late 2025 demonstrated zero-click exploits against Microsoft Copilot, Google Gemini, and Salesforce Einstein precisely because these agents had overly broad permissions. An agent that can send email probably shouldn't be able to do so without explicit per-action approval.

**Monitor for anomalous agent behavior.** The Dynatrace research shows that organizations using observability tools for agent monitoring reduce cascading failures by 75%. If your agent suddenly starts accessing files it normally ignores, or using tools in unusual patterns, that's a signal.

## The Uncomfortable Tradeoff

Here's what I keep coming back to: the features that make these files useful are the same features that make them dangerous. Auto-loading context files means agents can be productive immediately. It also means malicious context gets loaded automatically. Instruction-following is the whole point of agent configuration. It's also what enables goal hijacking.

The DAIR.AI evaluation found that human-written AGENTS.md files do improve agent performance — by about 4% on average. That's meaningful. But it comes with a 20% increase in inference cost and, more importantly, an expanded attack surface that we don't yet know how to fully secure.

I still use an AGENTS.md file. The productivity gains are real, and in my controlled environment, the risk is manageable. But I've stopped thinking of it as documentation. It's configuration that happens to be written in markdown. It has the same threat profile as any other executable config that gets loaded automatically.

If you're building AI agents, your AGENTS.md isn't just workflow notes. It's part of your attack surface. Design accordingly.
