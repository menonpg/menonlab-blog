---
title: "Mercury 2: The First Reasoning Diffusion LLM Is Live — And It's 5x Faster"
description: "Inception's Mercury 2 breaks the reasoning speed barrier with diffusion-based architecture. 1,009 tokens/sec, OpenAI API compatible, and priced for production. This changes the math on deploying reasoning systems."
date: "2026-03-02"
tags: ["llm", "diffusion-models", "reasoning", "inference", "production-ai"]
---

Reasoning models have a problem: they're slow.

OpenAI's o1 and o3. DeepSeek-R1. Anthropic's extended thinking. They're powerful — genuinely better at complex tasks — but that power comes from test-time compute. More thinking steps. Longer chains. More retries. And all of it sequential, one token at a time.

For a single query, the latency is tolerable. For production systems running thousands of agentic loops, RAG pipelines, and real-time voice interactions? The cost compounds fast.

**Mercury 2** from Inception Labs claims to break that tradeoff. It's the first reasoning-grade diffusion LLM available for production use — and the benchmarks are striking.

## The Numbers

- **Speed:** 1,009 tokens/sec on NVIDIA Blackwell GPUs
- **Pricing:** $0.25/1M input tokens · $0.75/1M output tokens
- **Context:** 128K tokens
- **Features:** Tunable reasoning, native tool use, schema-aligned JSON output
- **API:** OpenAI-compatible — drop-in replacement, no rewrites

That speed claim needs context. Inception says Mercury 2 is **5x faster than leading speed-optimized models** like Claude 4.5 Haiku and GPT-5.2 Mini. Not 5x faster than reasoning models (which would be easy) — 5x faster than models already optimized for speed.

## Why Diffusion Changes Reasoning Economics

Standard autoregressive LLMs generate text sequentially. Token by token. Left to right. Like a typewriter that can't look back.

Diffusion LLMs work differently. They start with a canvas of masked tokens and refine everything in parallel — multiple tokens simultaneously, converging over a small number of steps. Less typewriter, more editor revising a full draft at once.

This architectural difference has always promised speed. But previous diffusion LLMs (like [LLaDA2.1](/blog/llada21-diffusion-llm-892-tokens-second), which we covered recently) focused on general-purpose generation. Mercury 2 is the first to target **reasoning specifically**.

The implication: reasoning-grade quality inside real-time latency budgets.

Today, if you want better reasoning, you pay for it with more test-time compute — longer chains, more samples, more retries. Mercury 2 argues that diffusion architecture can deliver that quality without the latency tax.

## Where This Matters Most

Inception is positioning Mercury 2 for latency-sensitive production workloads. Their customer quotes reveal the target use cases:

### Agentic Loops

Agentic workflows chain dozens of inference calls per task. Each call's latency compounds. If you can cut latency per call significantly, you can either deliver faster results or afford more steps — more tool calls, more verification, more sophisticated reasoning.

> "Mercury 2 is at least twice as fast as GPT-5.2, which is a game changer for us."
> — Suchintan Singh, CTO, Skyvern

### Real-Time Voice

Voice interfaces have the tightest latency budgets in AI. Users expect natural conversation cadence. Any pause breaks the illusion.

> "Mercury 2 has been a big unlock in our voice stack: fast, consistent text generation that keeps the whole experience feeling natural and human."
> — Max Sapo, CEO, Happyverse AI

### Coding and Editing

Autocomplete, next-edit suggestions, refactors, interactive code agents — anywhere the developer is in the loop and waiting breaks flow.

> "Suggestions land fast enough to feel like part of your own thinking, not something you have to wait for."
> — Max Brunsfeld, Co-Founder, Zed

### RAG Pipelines

Multi-hop retrieval, reranking, and summarization latencies stack fast. Adding reasoning to search has historically meant blowing your latency budget. Mercury 2 aims to change that math.

## How It Compares to LLaDA

We recently covered [LLaDA2.1](/blog/llada21-diffusion-llm-892-tokens-second) from Ant Group — another diffusion LLM hitting 892 tokens/sec with an innovative draft-and-edit mechanism.

The projects are complementary, not competing:

| | LLaDA2.1 | Mercury 2 |
|---|---|---|
| **Origin** | Ant Group research | Inception Labs (commercial) |
| **Focus** | Training innovations (M2T + T2T) | Production deployment |
| **Speed** | 892 TPS | 1,009 TPS |
| **Availability** | Research paper | Live API, OpenAI-compatible |
| **Target** | General generation | Reasoning workloads |

LLaDA2.1 advances the science of how diffusion LLMs can be trained for speed and quality. Mercury 2 packages diffusion into a production-ready reasoning system you can deploy today.

## The Bigger Picture

The reasoning model landscape is fragmenting by deployment constraint:

- **Quality ceiling:** o1, o3, DeepSeek-R1 — maximum capability, latency be damned
- **Speed floor:** Haiku, GPT-4o-mini — fast enough for production, reasoning limited
- **Middle ground:** Mercury 2 — reasoning-grade quality at speed-tier latency

If Mercury 2 delivers on its claims, it doesn't replace o3 for the hardest problems. But it could make reasoning viable for the 90% of production workloads where latency matters more than peak capability.

The OpenAI API compatibility is strategic. No migration cost. No rewrite. Point your existing code at a new endpoint and test whether the speed-quality tradeoff works for your use case.

## Getting Started

Mercury 2 is live now at [inceptionlabs.ai](https://www.inceptionlabs.ai/). The API is OpenAI-compatible, so integration is straightforward:

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.inceptionlabs.ai/v1",
    api_key="your-inception-key"
)

response = client.chat.completions.create(
    model="mercury-2",
    messages=[{"role": "user", "content": "Your prompt here"}]
)
```

For enterprise evaluations, Inception offers workload fit analysis and performance validation under expected serving constraints.

---

Diffusion LLMs have been "almost ready" for years. Mercury 2 is the first to ship a reasoning-focused model at production scale with production pricing. Whether it holds up under real workloads remains to be seen — but the architecture finally matches the ambition.

The typewriter model of text generation may finally have competition.

---

**Related:** [LLaDA2.1: The Diffusion LLM That Hits 892 Tokens Per Second](/blog/llada21-diffusion-llm-892-tokens-second) — the research innovations making this possible.
