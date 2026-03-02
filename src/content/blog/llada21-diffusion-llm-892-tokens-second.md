---
title: "LLaDA2.1: The Diffusion LLM That Hits 892 Tokens Per Second"
description: "Ant Group's new diffusion language model introduces a draft-and-edit paradigm that makes it 3.5x faster than comparable autoregressive models while improving quality."
date: "2026-03-02"
tags: ["llm", "diffusion-models", "performance", "research", "inference"]
---

Every large language model you use today generates text one token at a time. Left to right. Like a typewriter that never looks back. This autoregressive approach works, but it has a fundamental speed ceiling.

Diffusion language models (dLLMs) take a different path. Instead of writing sequentially, they start with a canvas of masked tokens and fill everything in parallel — like a photograph developing in a darkroom, the entire image sharpening at once.

The catch? When you fill in many words simultaneously, some clash. And in previous diffusion models, once a token was placed, it was frozen forever. Errors locked in. No way back.

**LLaDA2.1** from Ant Group (February 2026) tackles this with a deceptively simple idea: let the model go back and edit its own mistakes.

## The Breakthrough: Draft-and-Edit

Standard diffusion LLMs suffer from "exposure bias." An early mistake poisons downstream context. The model sees its own flawed output, loses confidence, and slows down. Imagine a writer who makes a typo in paragraph one and then hesitates on every sentence afterward — but cannot scroll up and fix it.

LLaDA2.1 introduces two operations during generation:

- **Mask-to-Token (M2T)**: The standard move. A masked position gets filled with a predicted token. This is *drafting*.
- **Token-to-Token (T2T)**: The new move. An already-placed token gets swapped for a better one. This is *editing*.

Both operations are governed by confidence thresholds. This creates a configurable speed-quality dial:

- **Speedy Mode**: Low thresholds. Draft fast, fix later. Optimized for throughput.
- **Quality Mode**: Conservative thresholds. Fewer tokens per step, but higher accuracy. Editing remains a safety net.

Same model, two operational personalities. Choose speed for code generation. Choose quality for complex reasoning.

## The Numbers

Three results capture the impact:

1. **Quality improves too.** In Quality Mode, LLaDA2.1 surpasses LLaDA2.0 benchmark averages for both model sizes (16B Mini and 100B Flash). Editing doesn't just enable speed — it improves output quality.

2. **Tokens-per-forward nearly doubles.** 5.93 vs. 3.08 TPF for the Flash model in Speedy Mode.

3. **892 tokens per second on HumanEval+.** The 100B Flash model with quantization substantially outpaces comparable autoregressive models:
   - LLaDA2.1 Flash: **892 TPS**
   - Qwen3-30B-A3B: 240 TPS
   - Ling-flash-2.0: 257 TPS

That's roughly **3.5x faster** than the competition on coding benchmarks.

## How They Made It Work

The editing mechanism required training changes across three stages:

**Stage 1 — Continual Pre-Training:** The model trains on two objectives simultaneously. The standard "predict masked tokens" task (M2T) plus a new objective that introduces random noise into existing tokens and asks the model to correct them (T2T). This builds drafting and error-correction instincts from the ground up.

**Stage 2 — Supervised Fine-Tuning:** The same dual objective continues with instruction-following data. Multi-Turn Forward (MTF) training exposes the model to diverse editing scenarios.

**Stage 3 — Reinforcement Learning:** LLaDA2.1 implements what the authors describe as the first large-scale RL framework for diffusion language models. Standard policy gradients require sequence-level log-likelihoods, which are intractable for diffusion models. Their solution: ELBO-based Block-level Policy Optimization uses the Evidence Lower Bound as a tractable proxy, parallelized via Vectorized Likelihood Estimation.

## Why This Matters

Autoregressive models have dominated because they work. But their sequential nature means inference speed is fundamentally bounded — you can't generate the next token until you've generated this one.

Diffusion models break that constraint by generating in parallel. LLaDA2.1 shows that with the right training and decoding strategy, you can have both parallelism *and* error correction. The speed-quality tradeoff becomes a dial rather than a cliff.

For production inference, this has real implications. Code completion, where throughput matters more than latency per token, is an obvious win. But any high-volume generation task benefits.

The 100B parameter scale also matters. LLaDA2.0 proved diffusion could work at scale. LLaDA2.1 proves it can be fast at scale.

## What's Next

This is research from Ant Group, not a product launch. But the paper is out, and the techniques are documented. Expect to see these ideas absorbed into open-source implementations.

For those following the diffusion LLM space: this is probably the most significant advancement since the original LLaDA scaling work in December. The typewriter model of language generation may finally have competition.

[Read the technical deep-dive on Qubytes](https://qubytes.substack.com/p/llada21-introduces-a-draft-and-edit) | [LLaDA2.0 paper on arXiv](https://arxiv.org/abs/2512.15745)
