---
title: "OpenLLM: Run Any Open-Source LLM as an API with One Command"
description: "Host DeepSeek, Llama, Qwen, and more as OpenAI-compatible API endpoints in seconds"
date: "2026-02-24"
tags: ["ai", "llm", "api", "self-hosted", "open-source"]
---

# OpenLLM: Run Any Open-Source LLM as an API with One Command

Want to run DeepSeek R1, Llama 3.3, or Qwen2.5 as your own private API? **OpenLLM** makes it trivially easy — one command, and you have an OpenAI-compatible endpoint ready to go.

## Why This Matters

The gap between "I want to use an open-source LLM" and "I have a production-ready API endpoint" has traditionally involved a lot of infrastructure work. OpenLLM collapses that gap to a single command.

## Quick Start

```bash
pip install openllm
openllm hello  # Interactive demo
```

To serve a model:

```bash
openllm serve llama3.2:1b
```

That's it. You now have an API at `http://localhost:3000` that's compatible with OpenAI's client libraries.

## The Model Library

OpenLLM supports the latest open-source models:

| Model | Parameters | GPU Required |
|-------|------------|--------------|
| DeepSeek R1 | 671B | 80G x16 |
| Llama 4 | 17B | 80G x8 |
| Llama 3.3 | 70B | 80G x2 |
| Qwen 2.5 | 7B | 24G |
| Phi 4 | 14B | 80G |
| Gemma 3 | 3B | 12G |

The full list lives in [bentoml/openllm-models](https://github.com/bentoml/openllm-models).

## Use It Like OpenAI

Since OpenLLM exposes an OpenAI-compatible API, you can use it with any existing OpenAI tooling:

```python
from openai import OpenAI

client = OpenAI(
    base_url='http://localhost:3000/v1',
    api_key='na'  # Not required for local
)

response = client.chat.completions.create(
    model="meta-llama/Llama-3.2-1B-Instruct",
    messages=[{"role": "user", "content": "Explain quantum computing"}],
    stream=True
)
```

Works with LlamaIndex, LangChain, and any framework that supports OpenAI-compatible APIs.

## Built-in Chat UI

OpenLLM includes a web chat interface at `/chat`. No need to build your own frontend for testing.

## Cloud Deployment

For production, OpenLLM integrates with BentoCloud:

```bash
openllm deploy llama3.2:1b --env HF_TOKEN
```

This gives you autoscaling, observability, and managed infrastructure.

## Custom Models

You can add your own models by creating a custom repository following the BentoML format. This makes OpenLLM extensible beyond the default model catalog.

## When to Use OpenLLM

**Use OpenLLM when:**
- You want OpenAI API compatibility with open-source models
- You need to self-host for privacy/compliance
- You want quick prototyping with different models
- You need cloud deployment with autoscaling

**Consider alternatives when:**
- You just need local inference (Ollama might be simpler)
- You need maximum performance tuning (vLLM directly)
- You're already deep in another serving framework

## The Bottom Line

OpenLLM is the fastest path from "I want to try this open-source LLM" to "I have a production API." The BentoML team has done the infrastructure work so you don't have to.

**GitHub:** [bentoml/OpenLLM](https://github.com/bentoml/OpenLLM)

---

*What's your go-to setup for serving LLMs? Share your stack in the comments.*
