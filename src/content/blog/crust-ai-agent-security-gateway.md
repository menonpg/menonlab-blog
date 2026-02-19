---
title: "Crust: A Security Gateway That Protects You From Your Own AI Agents"
description: "An open-source tool that intercepts and blocks dangerous AI agent behaviors before they can access your secrets, delete files, or exfiltrate data"
date: "2026-02-19"
tags: ["ai-security", "ai-agents", "open-source", "developer-tools", "llm-safety"]
---

AI agents are increasingly powerful. They can execute code, read files, make API calls, and interact with your entire system. But with that power comes real risk — and **Crust** is designed to be the last line of defense between your agents and disaster.

## The Problem with Unrestricted Agents

When you give an AI agent tool access, you're trusting it not to:

- Run destructive commands (`rm -rf /` is one hallucination away)
- Read sensitive files (`.env`, SSH keys, cloud credentials)
- Exfiltrate data (nothing stops an agent from `curl`-ing your secrets somewhere)
- Get hijacked by prompt injection from malicious content

Most agent frameworks assume you trust the model completely. But models hallucinate, get confused, and can be manipulated. The question isn't whether your agent *wants* to harm you — it's whether you've built guardrails for when things go wrong.

## What Crust Does

Crust is a transparent proxy that sits between your AI agents and their LLM providers. Every tool call passes through Crust, where it's inspected against security rules before being allowed to execute.

The architecture is simple:

```
Your Agent → Crust → LLM Provider
               ↓
         🛡️ Security Check
         📊 Telemetry
         ✅ Safe calls pass
         🚫 Dangerous calls blocked
```

Critically, Crust runs 100% locally. Your data never leaves your machine.

## Why Guard Tool Calls Specifically?

An LLM by itself is just next-token prediction. It's the tool calls that make it agentic — the bridge between "thinking" and "doing." Crust guards this exact chokepoint.

Even when a previous response contains malicious content, the agent can't act on it without issuing a new tool call request. By intercepting requests (not responses), Crust catches threats at the moment of action, before anything touches the real world.

## Getting Started

Installation is one command:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/BakeLens/crust/main/install.sh)"
```

Then start the gateway:

```bash
# Auto mode — routes to correct provider based on model name
crust start --auto

# Or manual mode with a specific upstream
crust start --endpoint https://api.openai.com/v1 --api-key sk-xxx
```

Point your agent to `http://localhost:9090` instead of the LLM API URL. That's it — no code changes required.

## Built-In Protection

Crust ships with battle-tested rules out of the box:

- **Credential theft** — blocks access to `.env`, SSH keys, cloud credentials, browser passwords
- **Shell history** — protects `.bash_history`, `.zsh_history`
- **Persistence prevention** — blocks modifications to shell RC files, `authorized_keys`
- **Self-protection** — agents can't disable Crust itself
- **Private key detection** — content-based detection of key exfiltration attempts

You can add custom rules with a simple YAML schema:

```yaml
rules:
  # Simple pattern
  - block: "**/.env"

  # With exceptions
  - block: "**/.ssh/id_*"
    except: "**/*.pub"

  # Regex matching
  - name: block-rm-rf
    match:
      command: "re:rm\\s+-rf\\s+/"
    message: "Blocked: destructive command"
```

Rules hot-reload without restarting — your protection evolves as fast as your threats.

## Performance

Written in Go, Crust adds near-zero latency to your API calls. Your agents won't notice it's there.

## Universal Compatibility

Crust works with any agent framework:

- Claude Code / OpenCode
- OpenAI and Anthropic Agent SDKs
- LangChain / LangGraph
- AutoGPT / AutoGen
- Custom implementations

In auto mode, the gateway resolves providers from model names and passes through client authentication. No configuration needed for standard providers.

## Two-Layer Security

Crust operates at two layers:

- **Layer 0 (Request)**: Scans tool calls in conversation history — catches patterns of bad agent behavior
- **Layer 1 (Response)**: Scans LLM-generated tool calls against security rules before execution

All activity logs to encrypted local storage for review.

## When You Need This

If you're running AI agents with real system access — coding assistants, automation tools, anything with shell or file access — Crust adds a meaningful safety layer.

It's not about distrusting AI. It's about building defense in depth. The same reason you use firewalls even when you trust your internal services.

The project is open source (Elastic License 2.0) and actively developed. If you're working on agent safety, contributing custom rules is a great way to help the community.

**Links:**
- GitHub: [github.com/BakeLens/crust](https://github.com/BakeLens/crust)
- Website: [getcrust.io](https://getcrust.io)

---

*The Menon Lab explores open-source AI tools for developers. Follow along for more on building safer, more capable AI systems.*
