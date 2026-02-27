---
title: "Google Workspace MCP: Control Gmail, Calendar, Drive, and More with AI"
description: "A comprehensive MCP server that gives AI agents full control over Google Workspace — Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Tasks, and Chat. Here's what it does and how to set it up."
date: "2026-02-27"
tags: ["mcp", "google-workspace", "ai-agents", "productivity", "gmail", "automation"]
---

What if your AI assistant could actually *do* things in Google Workspace? Not just draft emails for you to send, but send them. Not just suggest calendar times, but book them. Not just summarize documents, but create and edit them.

That's exactly what the Google Workspace MCP server delivers — and it's the most feature-complete implementation available.

## What It Does

This MCP server connects AI assistants (Claude, Cursor, any MCP-compatible client) to the full Google Workspace suite:

| Service | Capabilities |
|---------|-------------|
| **Gmail** | Read, compose, send, search, label, archive — complete email management |
| **Calendar** | Create events, check availability, manage invites, recurring events |
| **Drive** | Upload, download, organize, share files with Office format support |
| **Docs** | Create documents, edit content, manage comments, fine-grained formatting |
| **Sheets** | Read/write cells, create spreadsheets, flexible range operations |
| **Slides** | Create presentations, add/edit slides, manage content |
| **Forms** | Create forms, configure settings, retrieve responses |
| **Tasks** | Manage task lists, create/complete tasks, hierarchy support |
| **Chat** | Space management, send messages (Workspace plans) |
| **Contacts** | People API integration, contact groups |
| **Apps Script** | Execute custom automation, manage deployments |

The coverage is exhaustive. This isn't a proof-of-concept with a few API calls — it's production-ready infrastructure for AI-driven productivity.

## Why This Matters

MCP servers are becoming the standard interface between AI agents and external tools. We've covered MCP for databases, MCP for code, MCP for commerce. Google Workspace is where knowledge workers actually *live*.

The practical impact:

**Email triage at scale.** "Go through my inbox, archive newsletters, flag anything from my team that needs response, and draft replies to the urgent ones."

**Calendar coordination.** "Find a time next week when both Sarah and I are free for 90 minutes, and send her an invite for a project sync."

**Document workflows.** "Create a project brief in Docs based on our last three meeting notes, share it with the team, and add a task to my list to review it Friday."

**Research and synthesis.** "Search my Drive for all Q4 reports, summarize the key metrics into a new spreadsheet, and email it to finance."

These aren't hypotheticals — they're the kind of compound tasks that AI agents can execute when given proper tool access.

## Setup

The server supports multiple deployment modes:

### Quick Start (Single User, Local)

```bash
# Install
pip install workspace-mcp

# Set credentials
export GOOGLE_OAUTH_CLIENT_ID="your-client-id"
export GOOGLE_OAUTH_CLIENT_SECRET="your-client-secret"

# Run with core tools
uvx workspace-mcp --tool-tier core
```

### Claude Desktop (One-Click)

The project includes a `.dxt` extension file for Claude Desktop — download, install, configure your Google OAuth credentials in the extension pane, and you're connected.

### Tool Tiers

Not every use case needs every tool. The server supports tiered access:

- **Core** — Essential tools (Gmail, Calendar, Drive basics)
- **Extended** — Core + Docs, Sheets, Tasks
- **Complete** — Everything including Forms, Chat, Apps Script

```bash
# Choose your tier
uvx workspace-mcp --tool-tier extended

# Or pick specific services
uv run main.py --tools gmail drive calendar
```

### Multi-User (OAuth 2.1)

For applications serving multiple users, the server supports OAuth 2.1 with bearer token authentication:

```bash
export MCP_ENABLE_OAUTH21=true
export EXTERNAL_OAUTH21_PROVIDER=true
```

This enables stateless operation where each request includes user credentials — essential for building multi-tenant AI applications.

## Google Cloud Setup

You'll need OAuth credentials from Google Cloud Console:

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable the APIs you need (Gmail, Calendar, Drive, etc.)
3. Create OAuth 2.0 credentials (Desktop app type — no redirect URIs needed)
4. Copy Client ID and Client Secret to your environment

The server handles token refresh, session management, and all the OAuth complexity automatically.

## Architecture Notes

Built on FastMCP for performance, the server includes:

- **Service caching** — Authenticated service objects are cached and reused
- **Automatic token refresh** — No manual re-authentication
- **Transport-aware callbacks** — Works across stdio, HTTP, and SSE transports
- **CORS proxy architecture** — For browser-based clients

The codebase is well-documented (the README notes it was written with AI assistance and human verification — a nice meta touch for an AI tooling project).

## The Bigger Picture

Google Workspace MCP is part of a broader trend: every major productivity platform is becoming MCP-accessible. We're seeing:

- Database MCP servers (Google Cloud, MindsDB)
- Code/IDE MCP servers (filesystem, git, terminals)
- Commerce MCP (UCP builds on MCP for checkout)
- And now, full office suite access

The end state is AI agents that can operate across your entire digital workspace — not as toys that draft text, but as capable assistants that execute multi-step workflows across systems.

This server is a significant step toward that future.

---

*Google Workspace MCP is open source and available at [github.com/taylorwilsdon/google_workspace_mcp](https://github.com/taylorwilsdon/google_workspace_mcp). Documentation and managed cloud options at [workspacemcp.com](https://workspacemcp.com).*
