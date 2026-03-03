---
title: "Introducing SoulMate: Persistent AI Memory as a Service"
description: "soul.py was the open-source primitive. SoulMate is what enterprises need — hosted memory infrastructure for AI agents. BYOK model: bring your LLM key, we handle the memory."
date: "2026-03-03"
tags: ["soulmate", "soul-py", "enterprise", "ai-memory", "api", "saas"]
---

![soul.py logo](/images/soul-py/logo.jpg)

We built [soul.py](/blog/soul-py-persistent-memory-llm-agents) to solve a fundamental problem: AI agents forget everything between sessions. Two markdown files — SOUL.md for identity, MEMORY.md for memory — and suddenly your agent remembers who it is and who it's talking to.

The response was overwhelming. The library hit [#1 on r/ollama](https://www.reddit.com/r/ollama/comments/1ri4d80/soulpy_persistent_memory_for_any_llm_in_10_lines/) with 50,000+ views. Developers started building with it immediately.

Then the enterprise requests started coming in.

## The Enterprise Problem

soul.py works beautifully for individual developers and small teams. But enterprises have different requirements:

**Scale.** Not one agent remembering one user — millions of customers, each with their own persistent context. A telecom company handling support calls needs per-customer memory for every subscriber.

**Compliance.** Healthcare needs HIPAA. Finance needs SOC 2. GDPR requires the ability to delete customer data on request. Memory infrastructure has to support all of this.

**Operations.** Self-hosting is overhead. Enterprises want managed infrastructure — APIs they can call, not servers they have to maintain.

**Integration.** Engineering teams don't want to learn a new framework. They want a REST API that fits into their existing stack.

soul.py is the primitive. Enterprises need the platform.

## Introducing SoulMate

**SoulMate** is persistent AI memory as a service. The architecture is simple:

**You bring the LLM.** Use your existing Anthropic, OpenAI, or Ollama setup. Keep your model relationships, your rate limits, your enterprise agreements. SoulMate doesn't touch your LLM tokens.

**We handle the memory.** Per-customer persistent memory, managed and scaled. Every customer interaction builds context. Every conversation remembers the last one. No database setup, no vector store configuration, no infrastructure to maintain.

Think of it like Pinecone for memory. Pinecone charges for vector storage, not the embedding model. SoulMate charges for memory operations, not the LLM. You keep control of the AI; we handle what it remembers.

## How It Works

The SoulMate API is a REST service with a simple mental model:

```python
from soulmate import SoulMateClient

# Initialize with your API key and LLM credentials
sm = SoulMateClient(
    api_key="sm_live_xxxxx",           # Your SoulMate key
    llm_provider="anthropic",           # Your LLM provider
    llm_key="sk-ant-api03-..."          # Your LLM key (BYOK)
)

# Every call maintains per-customer memory
response = sm.ask("customer_123", "What's my account status?")
# SoulMate remembers this customer's entire history

# Later, same customer, memory persists
response = sm.ask("customer_123", "What about that issue I mentioned last week?")
# Context from "last week" is automatically available
```

Under the hood, SoulMate:

1. Maintains a persistent memory store for each `customer_id`
2. Retrieves relevant context using [RAG + RLM hybrid routing](/blog/soul-py-v2-rag-rlm-hybrid)
3. Constructs the prompt with identity (SOUL.md) and relevant memories
4. Calls your LLM with the enriched context
5. Stores the interaction for future reference

You get persistent, context-aware AI without managing any of the memory infrastructure.

## The API

SoulMate exposes a clean REST API:

| Endpoint | Purpose |
|----------|---------|
| `POST /v1/ask` | Send a message, get a response with memory |
| `GET /v1/memory/{customer_id}` | Retrieve a customer's stored memory |
| `DELETE /v1/memory/{customer_id}` | GDPR delete — remove all customer data |
| `POST /v1/souls` | Upload SOUL.md configurations |
| `GET /v1/usage` | Track your API usage |

Full OpenAPI docs at `/docs` once deployed.

## Use Cases

We're seeing early interest in verticals where customer relationships matter and context compounds:

**Telecom Support**
Verizon, AT&T, and T-Mobile handle millions of support calls monthly. Imagine if the AI already knew each customer's plan, devices, history, and previous issues before they said a word. No more "let me pull up your account." Handle time drops 40-60%.

**Healthcare**
Patient-facing AI that remembers medical history, care preferences, and prior interactions. HIPAA-compliant via self-hosted deployment option. Reduces intake friction, improves care continuity.

**Financial Services**
Wealth management AI that knows each client's portfolio, risk tolerance, life events, and goals. Personalization at scale without relationship manager overhead.

**Retail & E-Commerce**
Shopping AI that remembers preferences, past purchases, size profiles, and gift occasions. True relationship commerce across every touchpoint.

## Pricing Model

SoulMate uses consumption-based pricing:

- **Memory operations** — reads, writes, deletes
- **Storage** — per-customer memory footprint
- **No LLM markup** — your tokens, your costs

Free tier for developers to experiment. Enterprise tiers with SLAs, dedicated support, and compliance certifications.

## The Ecosystem

SoulMate sits in a layered architecture:

```
┌─────────────────────────────────────────┐
│           Your Application              │
├─────────────────────────────────────────┤
│    SoulMate API (hosted memory)         │  ← Enterprise
├─────────────────────────────────────────┤
│         soul.py (open source)           │  ← Developers
├─────────────────────────────────────────┤
│     LLM Provider (Anthropic/OpenAI)     │  ← You choose
└─────────────────────────────────────────┘
```

**soul.py stays open source.** It's the credibility engine, the community funnel, and the foundation everything builds on. If you want to self-host and manage your own memory infrastructure, soul.py gives you everything you need.

**SoulMate is for teams that want managed infrastructure.** Less ops, more building. The same persistent memory patterns, hosted and scaled.

## Get Started

**Developers:**
```bash
pip install soul-agent --upgrade
```

```python
from soulmate import SoulMateClient
# Get an API key at soulmate-api.up.railway.app/docs
```

**Enterprise:**
Book a call to discuss your use case, compliance requirements, and deployment options.

**[→ Learn more about SoulMate](https://menonpg.github.io/soulmate/)**

---

## Related

- [soul.py: Persistent Memory for LLM Agents](/blog/soul-py-persistent-memory-llm-agents) — The open-source foundation
- [soul.py v2.0: RAG + RLM Hybrid](/blog/soul-py-v2-rag-rlm-hybrid) — How the retrieval works
- [Meet Darwin: The Soul Book Companion](/blog/meet-darwin-soul-book-ai-companion) — See persistent memory in action
- [Open Source Projects](/open-source) — All Menon Lab releases
