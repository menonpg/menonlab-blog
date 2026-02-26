---
title: "AI Hedge Fund: What Happens When Buffett, Burry, and Cathie Wood Are All Agents"
description: "A multi-agent system where each AI embodies a famous investor's philosophy. Educational proof-of-concept for agentic financial analysis."
date: "2026-02-25"
tags: ["ai-agents", "finance", "multi-agent", "open-source"]
---

What if you could get Warren Buffett, Michael Burry, and Cathie Wood to analyze the same stock — simultaneously, with no ego, and for free?

That's the premise behind [AI Hedge Fund](https://github.com/virattt/ai-hedge-fund), a multi-agent system where each agent embodies a famous investor's philosophy. It's a proof-of-concept, not a trading system, but it's a fascinating architecture for anyone building agentic systems.

## The Agent Roster

The system has 12 investor personas, each with distinct strategies:

**Value investors:**
- **Warren Buffett** — Wonderful companies at fair prices
- **Charlie Munger** — Quality businesses, fair valuations
- **Ben Graham** — Deep value, margin of safety
- **Michael Burry** — Contrarian, hunts deep value

**Growth investors:**
- **Cathie Wood** — Innovation and disruption
- **Peter Lynch** — "Ten-baggers" in everyday businesses
- **Phil Fisher** — Deep "scuttlebutt" research

**Other styles:**
- **Bill Ackman** — Activist, bold positions
- **Stanley Druckenmiller** — Macro, asymmetric bets
- **Aswath Damodaran** — Story + numbers + valuation
- **Mohnish Pabrai** — Dhandho (doubles at low risk)
- **Rakesh Jhunjhunwala** — India's "Big Bull"

Plus six functional agents: Valuation, Sentiment, Fundamentals, Technicals, Risk Manager, and Portfolio Manager (who makes final decisions).

## How It Works

Each investor agent analyzes the same data but through their philosophical lens. The Buffett agent looks for moats and quality. The Burry agent hunts for market mispricing. The Wood agent evaluates disruption potential.

The functional agents handle the quantitative work — pulling financial data, calculating technicals, assessing sentiment. The Risk Manager sets position limits. The Portfolio Manager synthesizes everything into a final decision.

It's essentially a debate among investment philosophies, mediated by an LLM.

## The Tech Stack

- **LLM flexibility**: OpenAI, Anthropic, Groq, DeepSeek, or local via Ollama
- **Financial data**: Financial Datasets API (free for AAPL, GOOGL, MSFT, NVDA, TSLA)
- **Backtester included**: Test strategies over historical periods
- **Web UI**: Visual interface for non-CLI users

Running it is straightforward:

```bash
poetry install
poetry run python src/main.py --ticker AAPL,MSFT,NVDA
```

Or with local models:

```bash
poetry run python src/main.py --ticker AAPL,MSFT,NVDA --ollama
```

## Why This Architecture Matters

The interesting part isn't the financial analysis — it's the multi-agent pattern.

**Encoding expertise as personas**: Each agent has a system prompt that captures an investor's philosophy. This is a clean way to get diverse perspectives from the same underlying model.

**Structured debate**: Rather than asking one LLM for "the answer," you get multiple viewpoints that must be reconciled. The Portfolio Manager agent acts as the synthesis layer.

**Composable agents**: Functional agents (valuation, risk) can be reused across different persona configurations. You could swap out investor agents or add new ones without changing the core infrastructure.

This pattern generalizes beyond finance. Any domain with multiple schools of thought — medical diagnosis, legal analysis, strategic planning — could use a similar architecture.

## Limitations

The disclaimer is clear: this is educational, not for real trading. Some constraints:

- LLMs can hallucinate financial data
- No real-time market data or execution
- Backtesting != future performance
- The "philosophies" are simplified interpretations

But as a reference implementation for multi-agent decision systems, it's solid.

## The Bigger Picture

We're seeing more systems like this — agents with distinct personas collaborating on complex tasks. The value isn't in any single agent being brilliant; it's in the structured disagreement and synthesis.

For anyone building agentic systems, this repo is worth studying. Not for the finance, but for the architecture.

---

**Links:**
- [GitHub repo](https://github.com/virattt/ai-hedge-fund)
- [Author's Twitter](https://twitter.com/virattt)
