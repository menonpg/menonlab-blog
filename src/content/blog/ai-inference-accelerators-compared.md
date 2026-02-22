---
title: "The AI Inference Wars: Comparing Taalas, Cerebras, Groq, Etched, and NVIDIA"
description: "Custom AI chips are crushing NVIDIA GPUs on inference speed. Taalas HC1 hits 17,000 tokens/s, Etched Sohu claims 500,000 tokens/s. Here's how they all compare."
date: "2026-02-22"
tags: ["ai-hardware", "inference", "llm", "accelerators", "nvidia"]
---

# The AI Inference Wars: Custom Silicon vs. NVIDIA

NVIDIA dominates AI training. But inference? That's where the challengers are winning.

A new wave of custom AI accelerators is delivering 10-100x the inference speed of NVIDIA's best GPUs. The tradeoff: flexibility for raw performance. If you know exactly what model you're running, specialized silicon destroys general-purpose GPUs.

Let's break down the contenders.

## The Speed Leaderboard (Tokens/Second Per User)

| Chip | Tokens/s | Model | Architecture |
|------|----------|-------|--------------|
| **Taalas HC1** | ~17,000 | Llama 3.1 8B (hardwired) | Model-specific ASIC |
| **Etched Sohu** | ~62,500* | Llama 70B (8-chip server) | Transformer ASIC |
| **Cerebras WSE-3** | ~2,100 | Llama 8B | Wafer-scale |
| **SambaNova** | ~932 | Various | Dataflow architecture |
| **Groq LPU** | ~594 | Various | TSP architecture |
| **NVIDIA B200** | ~353 | Various | General GPU |
| **NVIDIA H200** | ~230 | Various | General GPU |

*Etched claims 500,000 tokens/s for an 8-chip server, so ~62,500 per chip

## Taalas HC1: The Hardwired Approach

[Taalas](https://taalas.com/), a Finnish startup, took the most radical approach: **burn the model directly into silicon**.

The HC1 chip has Llama 3.1 8B literally hardwired into the hardware. No flexibility to run other models, but insane performance:

- **17,000 tokens/s** per user
- **10x faster** than Cerebras
- **20x cheaper** to build than competing solutions
- **10x less power** consumption

**How it works:** Traditional chips separate memory and compute. Memory bandwidth is the bottleneck for LLMs—you spend most of your time moving weights around, not computing. Taalas unifies storage and compute on a single chip at DRAM-level density, eliminating the memory wall.

**Specs:**
- TSMC 6nm process
- 815mm² die size
- 53 billion transistors
- Designed for 2.5kW servers

**The catch:** Only works with Llama 3.1 8B (for now). You can fine-tune via LoRAs and adjust context window, but you can't run GPT-4 or Claude on it.

**Try it:** [chatjimmy.ai](https://chatjimmy.ai) — their public demo shows real-time performance (~15,000+ tokens/s)

**Roadmap:** Second model (mid-sized reasoning LLM) in Q2 2026, HC2 silicon platform by end of 2026.

## Etched Sohu: Transformers Only

[Etched](https://www.etched.com/) bet that transformer architecture would dominate AI for years. So they built an ASIC that does *only* transformers—and nothing else.

**The claim:** An 8-chip Sohu server generates **500,000+ tokens/s on Llama 70B**, versus ~23,000 for an 8-GPU H100 system. That's 20x faster.

**Why it works:** By removing all the hardware needed for non-transformer neural networks (CNNs, RNNs, etc.), they pack more transformer-specific compute into the same silicon. It's like comparing a GPU to a CPU for graphics—specialization wins.

**The risk:** If transformers get replaced by a fundamentally different architecture (state-space models? something new?), Etched's chips become expensive paperweights. They're betting transformers are the endgame.

**Status:** Raised $120M at $800M valuation in 2024, shipping to early customers.

## Cerebras WSE-3: The Wafer-Scale Giant

[Cerebras](https://www.cerebras.ai/) took the opposite approach from Taalas: instead of shrinking, they went huge.

The Wafer-Scale Engine (WSE-3) is the largest chip ever built:
- **4 trillion transistors**
- **900,000 AI cores**
- **44GB of on-chip SRAM**
- **Entire 300mm wafer = one chip**

**Performance:** ~1,800-2,100 tokens/s for Llama 8B, ~450 tokens/s for Llama 70B

**Why it's fast:** By putting everything on one massive chip, there's no chip-to-chip communication overhead. The entire model fits in on-chip memory with 7,000x more memory bandwidth than an H100.

**The downside:** Expensive, power-hungry, requires custom cooling. This is datacenter hardware, not edge deployment.

**Cloud access:** Available via [Cerebras Cloud](https://cloud.cerebras.ai/) with OpenAI-compatible API.

## Groq LPU: The Deterministic Approach

[Groq](https://groq.com/) (not to be confused with Grok, the AI) built the Language Processing Unit (LPU) with a focus on **deterministic performance**.

**Performance:** ~275-284 tokens/s for Llama 70B, consistent regardless of context length

**Architecture:** Tensor Streaming Processor (TSP) with software-defined scheduling. The key insight: by making execution completely predictable, you eliminate the memory bandwidth bottleneck differently than the brute-force approaches.

**Developer-friendly:** Free API tier available at [groq.com](https://groq.com). OpenAI-compatible endpoints. Easy to try.

**Tradeoff:** Not as fast as the specialized ASICs, but runs any transformer model without hardware modifications.

## SambaNova: The Dataflow Architecture

[SambaNova](https://sambanova.ai/) uses a reconfigurable dataflow architecture (RDU) that sits between general-purpose GPUs and hardwired ASICs.

**Performance:** ~932 tokens/s per user (per the benchmark chart)

**Architecture:** The chip can be reconfigured for different model architectures, but optimizes dataflow patterns for AI workloads specifically.

**Focus:** Enterprise deployments, especially for companies wanting to run models on-premise with better efficiency than NVIDIA.

## NVIDIA: The General-Purpose Baseline

For comparison, NVIDIA's latest:

| GPU | Tokens/s | Notes |
|-----|----------|-------|
| H100 | ~150-200 | Previous gen |
| H200 | ~230 | More HBM memory |
| B200 (Blackwell) | ~350 | Latest architecture |

**Why NVIDIA "loses" on inference:** GPUs are designed for flexibility. They can train models, run inference, do graphics, scientific computing—anything. That generality comes at a cost when you *only* need inference.

**Why NVIDIA still matters:** Training. None of these inference chips can train large models efficiently. NVIDIA owns training, and training determines which models exist. The inference chips just run what NVIDIA hardware created.

## The Tradeoff Matrix

| Chip | Speed | Flexibility | Power | Cost | Availability |
|------|-------|-------------|-------|------|--------------|
| Taalas HC1 | ⭐⭐⭐⭐⭐ | ⭐ (1 model) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Demo |
| Etched Sohu | ⭐⭐⭐⭐⭐ | ⭐⭐ (transformers) | ⭐⭐⭐⭐ | ⭐⭐⭐ | Early access |
| Cerebras | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ | Cloud |
| Groq | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | Free API |
| SambaNova | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | Enterprise |
| NVIDIA | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | Everywhere |

## When Speed Matters

Why would you need 17,000 tokens/s?

**Voice AI:** Natural conversation requires ~50-100 tokens/s minimum. But serving 1000 concurrent users on one chip? Now you need throughput.

**Robotics:** Real-time decision making with LLMs. Every millisecond of latency affects responsiveness.

**Speculative decoding:** Generate multiple candidate responses in parallel, pick the best one. More tokens/s = better quality at same latency.

**Cost:** If you're serving billions of inference requests, 10x speed means 10x fewer chips. The economics compound.

## The Future

The inference market is fragmenting:

- **General purpose:** NVIDIA (and AMD, Intel) for flexibility
- **Transformer specialists:** Etched, Groq for any transformer model
- **Model specialists:** Taalas for specific hardwired models
- **Wafer-scale:** Cerebras for maximum single-chip performance

The question: will transformers remain dominant long enough for the specialists to win? If a new architecture emerges (state-space models, liquid neural networks, something else), the flexible chips survive while the ASICs become obsolete.

For now, though, the specialists are winning on inference. And inference is where the money is.

**Links:**
- [Taalas Demo](https://chatjimmy.ai)
- [Cerebras Cloud](https://cloud.cerebras.ai/)
- [Groq API](https://groq.com)
- [Etched](https://www.etched.com/)
- [SambaNova](https://sambanova.ai/)

---

*The Menon Lab tracks emerging AI hardware and infrastructure. [Get in touch](mailto:prahlad.menon@gmail.com) for AI strategy consulting.*
