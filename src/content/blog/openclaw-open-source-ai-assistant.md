---
title: "OpenClaw: Run Your Own Personal AI Assistant Anywhere"
description: "An open-source AI assistant that connects to WhatsApp, Telegram, Slack, Discord, and more — running entirely on your own devices"
date: "2026-02-24"
tags: ["ai-assistant", "open-source", "self-hosted", "chatbot", "multi-platform"]
---

What if you could have a personal AI assistant that runs on your own hardware, connects to all your messaging platforms, and isn't locked into any single provider? **OpenClaw** makes this real.

## What is OpenClaw?

OpenClaw is an open-source personal AI assistant you run on your own devices. It's not another chatbot wrapper — it's a complete control plane that connects AI to the channels you already use:

- **Messaging**: WhatsApp, Telegram, Slack, Discord, Signal, iMessage, Microsoft Teams, Google Chat
- **Voice**: Always-on speech recognition on macOS, iOS, and Android
- **Visual**: Live Canvas for agent-driven visual workspaces
- **Automation**: Cron jobs, browser control, multi-agent routing

Think of it as your own Jarvis, but open-source and running locally.

## Why Run Your Own Assistant?

### Privacy and Control
Your conversations stay on your devices. No third-party service sees your messages, files, or context. For sensitive use cases — legal, medical, financial — this matters.

### Multi-Channel Presence
Instead of context-switching between ChatGPT, Claude, and various apps, one assistant follows you across every platform. Ask a question on WhatsApp, continue the conversation on Slack, get results pushed to Telegram.

### Customization
Add your own tools, skills, and workflows. Connect to internal APIs, automate repetitive tasks, build agent behaviors that fit how you work.

### Model Flexibility
Use any LLM — Anthropic Claude, OpenAI GPT, open-source models via Ollama. Switch models per conversation or let the system route based on task type.

## Architecture

OpenClaw uses a **Gateway** as its control plane:

```
┌─────────────────────────────────────────────┐
│                  Gateway                     │
│  (sessions, channels, tools, events, cron)  │
└─────────────────────────────────────────────┘
        │              │              │
   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
   │WhatsApp │    │ Slack   │    │ Discord │
   └─────────┘    └─────────┘    └─────────┘
```

The Gateway handles:
- **Sessions**: Isolated conversation contexts per channel/user
- **Channels**: Adapters for each messaging platform
- **Tools**: Browser control, file operations, API calls
- **Cron**: Scheduled tasks and reminders
- **Security**: DM policies, allowlists, pairing codes

## Getting Started

**Requirements**: Node.js ≥22

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

The onboarding wizard walks you through:
1. API key setup (Anthropic, OpenAI, or both)
2. Channel connections (start with one, add more later)
3. Workspace configuration
4. Security policies

For **Windows users**, there's a [Docker-based setup](https://github.com/francismdpro/openclaw_docker_windows) with batch scripts that handle container management (more on this below).

## Channel Setup Examples

### WhatsApp
Uses the Baileys library for WhatsApp Web protocol. Scan a QR code, and your assistant is live on WhatsApp.

### Telegram
Create a bot via @BotFather, add the token to config, done. Full support for groups, threads, and media.

### Slack/Discord
OAuth app setup with granular permission scopes. The assistant joins workspaces and responds to mentions or DMs.

### iMessage
Via BlueBubbles (recommended) or legacy imsg integration. Your assistant texts you back on your Mac or iPhone.

## Security Model

OpenClaw takes security seriously — it's connecting to real messaging surfaces where anyone could DM you.

**Default behavior**:
- Unknown senders receive a pairing code
- Messages aren't processed until you approve the sender
- Approved users are stored in a local allowlist

**Commands**:
```bash
# See pending pairing requests
openclaw pairing list

openclaw pairing approve

# Check for security misconfigurations
openclaw doctor
```

You can relax these defaults for specific use cases, but the safe defaults prevent prompt injection attacks from random inbound messages.

## Voice and Visual

### Voice Wake
On macOS, iOS, and Android, OpenClaw can listen for wake words and respond with speech. Uses ElevenLabs for natural voice synthesis.

### Live Canvas
The Canvas is an agent-controlled visual workspace. Think of it as a shared screen where the assistant can:
- Render charts and diagrams
- Show progress on tasks
- Display interactive UI elements

This enables use cases beyond text chat — visual debugging, data exploration, collaborative documents.

## Multi-Agent Routing

For complex setups, you can route different channels or users to different agents:

```yaml
agents:
  work:
    workspace: ~/work-agent
    channels: [slack, teams]
  personal:
    workspace: ~/personal-agent  
    channels: [whatsapp, telegram]
```

Each agent has isolated context, tools, and memory. Your work assistant doesn't see your personal conversations.

## Skills and Tools

OpenClaw comes with bundled skills:
- **Browser**: Navigate, click, extract, screenshot
- **GitHub**: Issues, PRs, repo management
- **Weather**: Forecasts without API keys
- **Reminders**: Cron-based scheduling
- **Apple Notes/Reminders**: Native macOS integration

Add custom skills by dropping a `SKILL.md` into your workspace. The skill system is designed for agents writing instructions for agents.

## Production Considerations

**Uptime**: The daemon installs as a launchd (macOS) or systemd (Linux) service. It stays running through restarts.

**Updates**: `openclaw update --channel stable` handles updates. Run `openclaw doctor` after updating to catch configuration drift.

**Monitoring**: The web UI (`http://localhost:18789`) shows active sessions, channel status, and logs.

**Backups**: Your config and session data live in `~/.openclaw`. Back up this directory.

## WebClaw: Fast Web Client

Want a polished web interface for managing your OpenClaw instance? **WebClaw** provides exactly that — a fast, modern web client currently in beta.

**One-command setup:**

```bash
npx webclaw
```

The CLI prompts for:
- Project name
- Gateway URL and auth (token or password)
- Port to run on

Then it creates the folder and starts the WebClaw server.

WebClaw connects to your OpenClaw gateway, giving you a browser-based interface for:
- Managing active sessions
- Viewing conversation history
- Configuring channels
- Monitoring agent activity

**Environment variables:**
- `CLAWDBOT_GATEWAY_URL` — your gateway endpoint
- `CLAWDBOT_GATEWAY_TOKEN` or `CLAWDBOT_GATEWAY_PASSWORD` — authentication

WebClaw is particularly useful when you want to manage OpenClaw from a different machine or share access with others without giving them CLI access.

**GitHub:** [ibelick/webclaw](https://github.com/ibelick/webclaw)  
**Live demo:** [webclaw.dev](https://webclaw.dev)

## Docker Containerization on Windows

Running OpenClaw in a Docker container adds an important security layer—especially on Windows where the assistant has access to your file system and can execute commands.

The [openclaw_docker_windows](https://github.com/francismdpro/openclaw_docker_windows) project provides simple utilities to run OpenClaw safely in containers:

```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw

# Copy OpenClaw_Launcher.bat and OpenClaw_Pairing.bat to the openclaw folder
```

**Why containerize?**

- **Isolation**: The agent can only access files and resources you explicitly mount
- **Reproducibility**: Same environment across machines
- **Easy cleanup**: Delete the container, start fresh
- **Network control**: Restrict what the agent can reach

**Setup:**

1. Run `OpenClaw_Launcher.bat` — it creates the Docker containers automatically
2. Access the interface at `http://localhost:18789/`
3. For pairing issues, use `OpenClaw_Pairing.bat`

The config directory lives in `config/` (not `~/.openclaw`) when running containerized, making it easy to version control your setup separately from the application.

For production Windows deployments where security matters, Docker containerization is the recommended approach.

## Memory: From Stateless to Compounding

Here's what separates a useful assistant from a truly powerful one: **persistent memory**.

Out of the box, most AI assistants are stateless—each conversation starts fresh. OpenClaw supports a memory protocol that transforms your agent into a compounding system that gets better over time.

### The Cognitive Infrastructure Protocol

This memory structure turns your workspace into persistent cognition:

```
/mind/
    /logs/
        YYYY-MM-DD.md    # Daily activity logs
    PROFILE.md           # Who you are, preferences, context
    PROJECTS.md          # Active work, goals, status
    DECISIONS.md         # Past decisions and rationale
    ERRORS.md            # What went wrong, lessons learned
```

**All files are mandatory. All sessions begin by loading them.**

### Session Boot Sequence

Before the agent responds to anything, it should:

1. Read `PROFILE.md` — understand who it's helping
2. Read `PROJECTS.md` — know what's active
3. Read `DECISIONS.md` — remember what was decided
4. Read `ERRORS.md` — avoid repeating mistakes
5. Read today's log file (or create it)

**No execution before context. No advice without state awareness.**

### Why This Matters

Without structured memory:
- You repeat yourself constantly
- The agent forgets decisions you made together
- There's no learning from mistakes
- Every session starts at zero

With structured memory:
- Context compounds over time
- Decisions are documented and retrievable
- Errors become lessons, not repeated failures
- The agent develops genuine understanding of your work

### The Core Principles

> If it is not written, it does not exist.
> If it is not reviewed, it does not compound.
> If it is not structured, it cannot scale.

This isn't just about the agent remembering things—it's about building a knowledge system where human and AI collaborate with shared persistent state.

Set up the `/mind/` directory in your OpenClaw workspace, and you'll notice the difference within days. Your assistant stops feeling like autocomplete and starts feeling like a partner who actually knows your work.

## When OpenClaw Makes Sense

**Good fit**:
- You want a unified assistant across multiple platforms
- Privacy/data sovereignty matters
- You need custom integrations and tools
- You're comfortable with self-hosting

**Less ideal**:
- You want zero setup (use ChatGPT/Claude apps instead)
- You need enterprise support and SLAs
- You're not comfortable with command-line tools

## The Open Source Advantage

OpenClaw is fully open source. You can:
- Audit the code for security
- Contribute features and fixes
- Fork for specialized use cases
- Run without vendor lock-in

The project has an active Discord community and regular releases.

## Getting Started Today

```bash
# Install
npm install -g openclaw@latest

openclaw onboard --install-daemon

# Start chatting
openclaw agent --message "Hello, what can you do?"
```

Documentation: [docs.openclaw.ai](https://docs.openclaw.ai)  
Source: [github.com/openclaw/openclaw](https://github.com/openclaw/openclaw)  
Community: [Discord](https://discord.gg/clawd)

Your personal AI assistant doesn't have to live in someone else's cloud. With OpenClaw, it lives wherever you want it.

---

*The Menon Lab covers open-source AI tools that put you in control. Follow along for more on self-hosted AI.*
