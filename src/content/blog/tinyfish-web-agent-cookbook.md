---
title: "TinyFish: The Web Agent That Just Beat Everyone on Mind2Web"
description: "TinyFish scored 90% on the Mind2Web benchmark—beating Gemini by 21 points, OpenAI by 29, and Anthropic by 34. Here's how it turns any website into an API."
date: "2026-02-21"
tags: ["web-agents", "ai-agents", "automation", "browser-automation", "api"]
---

# TinyFish: The Web Agent That Just Beat Everyone on Mind2Web

Web scraping is tedious. You write selectors, handle dynamic content, manage proxies, deal with rate limits, and watch everything break when a site changes its HTML. Browser automation frameworks help, but you're still fighting the DOM.

[TinyFish](https://github.com/tinyfish-io/tinyfish-cookbook) takes a different approach: send a URL and a goal in plain English, get structured JSON back. No selectors. No headless browser management. No proxy rotation. Just results.

And the results are good. TinyFish [just scored 90% on the Mind2Web benchmark](https://tinyfish.ai/blog/mind2web), outperforming Gemini by 21 points, OpenAI by 29, and Anthropic by 34. They ran all 300 tasks in parallel and published every single run publicly.

## How It Works

TinyFish exposes web automation as an API. You describe what you want in natural language, and it handles the browser, navigation, forms, filters, and multi-step flows:

```python
import requests

response = requests.post(
    "https://agent.tinyfish.ai/v1/automation/run-sse",
    headers={
        "X-API-Key": os.getenv("TINYFISH_API_KEY"),
        "Content-Type": "application/json",
    },
    json={
        "url": "https://example-site.com",
        "goal": "Find all subscription plans and their prices. Return as JSON",
    },
    stream=True,
)
```

The agent navigates the site, clicks through menus, extracts the data, and returns structured JSON. It works across sites—no site-specific configuration needed.

## The Cookbook

The [TinyFish Cookbook repository](https://github.com/tinyfish-io/tinyfish-cookbook) is a collection of ready-to-use recipes for common automation tasks:

| Recipe | What It Does |
|--------|--------------|
| **fast-qa** | No-code QA testing with parallel execution and live browser previews |
| **competitor-analysis** | Live competitive pricing intelligence dashboard |
| **loan-decision-copilot** | AI-powered loan comparison across banks and regions |
| **logistics-sentry** | Port congestion and carrier risk tracking |
| **scholarship-finder** | Live scholarship discovery from official university websites |
| **openbox-deals** | Real-time deal aggregation across 8 retailers |
| **research-sentry** | Voice-first academic research co-pilot scanning ArXiv and PubMed |

Each recipe is a standalone project you can fork and customize.

## Why This Matters

The shift here is from *procedural automation* to *goal-oriented automation*. Instead of scripting exact steps ("click this button, wait 2 seconds, extract this element"), you describe outcomes ("find all pricing plans and return them as JSON").

This is the same shift we've seen in code generation (describe what you want vs. write every line), image generation (prompt vs. Photoshop), and now web automation.

**For QA teams**: Instead of maintaining brittle Selenium scripts, describe test scenarios in English and let the agent figure out the navigation.

**For data teams**: Turn any website into an API endpoint without building custom scrapers. Sites without APIs become programmable.

**For ops teams**: Build monitoring dashboards that pull data from competitor sites, government portals, or any source that doesn't offer an API.

## Production Features

TinyFish isn't just a demo—it's built for production workloads:

- **Built-in stealth**: Rotating proxies and stealth browser profiles included at no extra cost
- **Full observability**: Production-grade logs and debugging for every run
- **Parallel execution**: Run hundreds of tasks simultaneously
- **MCP integration**: Works as an MCP server for Claude and Cursor

The same infrastructure powers enterprise deployments at Google, DoorDash, and ClassPass.

## Getting Started

1. Sign up at [tinyfish.ai](https://tinyfish.ai) for an API key
2. Clone the [cookbook repo](https://github.com/tinyfish-io/tinyfish-cookbook)
3. Pick a recipe or write your own goal

The simplest test—a single cURL:

```bash
curl -X POST https://agent.tinyfish.ai/v1/automation/run-sse \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://news.ycombinator.com",
    "goal": "Get the top 5 stories with their titles and point counts"
  }'
```

If you've ever spent hours wrestling with Puppeteer or Playwright, this is a different world.

**Links:**
- [GitHub Cookbook](https://github.com/tinyfish-io/tinyfish-cookbook)
- [TinyFish Platform](https://tinyfish.ai)
- [Documentation](https://docs.tinyfish.ai/)
- [Mind2Web Benchmark Results](https://tinyfish.ai/blog/mind2web)
