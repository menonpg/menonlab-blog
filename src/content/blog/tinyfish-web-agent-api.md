---
title: "TinyFish: Turn Any Website Into an API With Natural Language"
description: "A web agent infrastructure that treats real websites like programmable surfaces — send a URL and a goal in plain English, get structured JSON back"
date: "2026-02-19"
tags: ["web-agents", "automation", "api", "ai-agents", "web-scraping"]
---

What if you could turn any website into an API endpoint? Not by reverse-engineering their backend, but by describing what you want in plain English and letting an AI agent navigate the site for you. That's what **TinyFish** does.

## The Problem with Web Automation

Traditional web scraping is fragile. You write selectors, handle edge cases, manage headless browsers, rotate proxies, and pray the site doesn't change its HTML structure. For dynamic sites with JavaScript rendering, forms, filters, and multi-step flows, the complexity explodes.

Web automation frameworks like Playwright and Puppeteer help, but you're still writing imperative code: click this, wait for that, extract this element. When the site changes, your code breaks.

## The TinyFish Approach

TinyFish abstracts away the browser automation layer entirely. You send an API request with:
- A URL (or multiple URLs)
- A goal in natural language

The service handles navigation, form filling, filtering, waiting for dynamic content, and returns structured JSON.

```bash
curl -X POST https://agent.tinyfish.ai/v1/automation/run-sse \
  -H "X-API-Key: $TINYFISH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example-store.com",
    "goal": "Find all laptop models under $1000 with their specs. Return as JSON."
  }'
```

The response streams back events as the agent works, then delivers structured data when complete. No selectors, no DOM manipulation, no browser lifecycle management.

## What Powers It

TinyFish claims state-of-the-art performance on Mind2Web, a benchmark for web agents. They report 90% accuracy — beating Gemini by 21 points, OpenAI by 29, and Anthropic by 34. They published all 300 test runs publicly, which is unusual transparency for a commercial service.

The infrastructure includes:
- **Managed browser fleet**: Real browsers, not just headless instances
- **Built-in stealth**: Rotating proxies and fingerprint management at no extra cost
- **Multi-step reasoning**: The agent can navigate complex flows across multiple pages
- **Parallel execution**: Run many tasks simultaneously

They mention Google, DoorDash, and ClassPass as enterprise customers, suggesting the infrastructure handles production scale.

## The Cookbook

The TinyFish Cookbook repository showcases what you can build:

**fast-qa**: A no-code QA testing platform with parallel test execution and live browser previews. Describe your tests in natural language, run them against your app.

**competitor-analysis**: Live competitive pricing intelligence. Point it at competitor sites, get structured pricing data without maintaining scrapers.

**research-sentry**: An academic research assistant that scans ArXiv, PubMed, and other sources based on voice queries.

**loan-decision-copilot**: Compare loan terms across banks by having the agent navigate each bank's rate calculator.

**logistics-sentry**: Track port congestion and carrier risk by pulling data from shipping and logistics portals.

Each recipe is a standalone project demonstrating a use case. The variety shows the flexibility — from e-commerce price monitoring to academic research to logistics intelligence.

## API Integration

TinyFish works via HTTP API, so it integrates with any stack:

```python
import requests

response = requests.post(
    "https://agent.tinyfish.ai/v1/automation/run-sse",
    headers={
        "X-API-Key": os.getenv("TINYFISH_API_KEY"),
        "Content-Type": "application/json",
    },
    json={
        "url": "https://target-site.com",
        "goal": "Extract all product listings with prices and availability",
    },
    stream=True,
)

for line in response.iter_lines():
    if line:
        event = json.loads(line.decode("utf-8")[6:])
        print(event)
```

They also provide an MCP server for integration with Claude and Cursor, making it usable directly from AI coding assistants.

## Use Cases

The natural fit is anywhere you'd otherwise build and maintain scrapers:

- **Price monitoring**: Track competitor pricing across retail sites
- **Lead generation**: Extract contact information from directories
- **Research aggregation**: Pull data from multiple sources into unified formats
- **QA automation**: Describe test scenarios, run them against web apps
- **Data enrichment**: Fill in missing fields by looking up information across the web

The value proposition is trading API costs for engineering time. If maintaining scrapers costs more than the API calls, TinyFish wins.

## Limitations to Consider

- **Latency**: An AI agent navigating a site takes longer than a direct API call. This is for batch jobs and background tasks, not real-time user-facing features.

- **Cost**: API pricing scales with usage. High-volume scraping might still be cheaper with traditional methods.

- **Reliability**: Web agents can fail on unusual sites or complex interactions. The 90% benchmark accuracy means 10% failure — acceptable for many use cases, not for others.

- **Terms of Service**: Automating access to websites may violate their ToS. TinyFish provides the capability; legal compliance is your responsibility.

## Getting Started

Sign up at [tinyfish.ai](https://tinyfish.ai) for API access. The cookbook repository has working examples to learn from.

For those building AI-powered automation, this represents a meaningful shift. Instead of writing code that breaks when websites change, you describe intent and let the agent figure out the implementation.

**Links:**
- Cookbook: [github.com/tinyfish-io/tinyfish-cookbook](https://github.com/tinyfish-io/tinyfish-cookbook)
- Website: [tinyfish.ai](https://tinyfish.ai)
- Docs: [docs.mino.ai](https://docs.mino.ai)

---

*The Menon Lab covers tools that change how developers work. Follow along for more on AI-powered automation.*
