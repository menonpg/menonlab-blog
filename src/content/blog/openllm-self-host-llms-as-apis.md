---
title: "OpenLLM: Self-Host Any Open-Source LLM as an OpenAI-Compatible API"
description: "Turn Llama, Qwen, Mistral, or any open-source model into a drop-in OpenAI API replacement with a single command. Here's why OpenLLM is the missing piece between Ollama and production."
date: "2026-02-26"
tags: ["llm", "self-hosting", "open-source", "inference", "api"]
---

You've got Ollama for local experimentation. You've got vLLM for raw inference speed. But what if you want both — local simplicity with production-ready APIs?

That's where [OpenLLM](https://github.com/bentoml/OpenLLM) comes in.

## What OpenLLM Actually Does

OpenLLM, built by the BentoML team, lets you serve any open-source LLM as an OpenAI-compatible API with a single command:

```bash
pip install openllm
openllm serve llama3.2:1b
```

That's it. You now have a server at `localhost:3000` that speaks the OpenAI API protocol. Your existing code using the OpenAI Python client? It just works:

```python
from openai import OpenAI

client = OpenAI(base_url='http://localhost:3000/v1', api_key='na')

response = client.chat.completions.create(
    model="meta-llama/Llama-3.2-1B-Instruct",
    messages=[{"role": "user", "content": "Explain RAG in one paragraph"}],
    stream=True,
)
```

No code changes. No adapter libraries. Just swap the base URL.

## Why Not Just Use Ollama?

Ollama is fantastic for local development. I use it daily. But it has limitations:

- **Custom API format** — not fully OpenAI-compatible
- **Limited production features** — no built-in autoscaling, observability, or enterprise deployment
- **Single-user focus** — designed for developers, not teams

OpenLLM fills the gap between "running models on my laptop" and "serving models in production." It uses vLLM as the inference backend (the same engine powering most production LLM deployments) and adds:

- **Full OpenAI API compatibility** — streaming, function calling, the works
- **Built-in Chat UI** — hit `/chat` and you've got a web interface
- **Docker/Kubernetes ready** — one command to containerize
- **BentoCloud integration** — managed deployment with autoscaling

## Supported Models

The model support is impressive. DeepSeek R1, Llama 4, Qwen 2.5, Mistral, Phi-4, Gemma 3 — basically any model worth running in 2026:

| Model | Command |
|-------|---------|
| Llama 3.3 70B | `openllm serve llama3.3:70b` |
| DeepSeek R1 | `openllm serve deepseek:r1-671b` |
| Qwen 2.5 7B | `openllm serve qwen2.5:7b` |
| Mistral 8B | `openllm serve mistral:8b-2410` |
| Phi-4 14B | `openllm serve phi4:14b` |

For gated models (like Llama), you'll need a Hugging Face token:

```bash
export HF_TOKEN=your_token_here
openllm serve llama3.2:1b
```

## The Production Path

Here's where OpenLLM shines. You've prototyped locally. Now you need to deploy.

**Option 1: Docker**

OpenLLM models are packaged as "Bentos" — BentoML's deployment units. Export to Docker and you're container-ready.

**Option 2: BentoCloud**

One command deployment with autoscaling:

```bash
openllm deploy llama3.2:1b --env HF_TOKEN
```

You get managed infrastructure, automatic scaling, and a dashboard. It's the "Vercel for LLMs" experience — deploy in seconds, scale automatically, pay for what you use.

## Custom Models

Running a fine-tuned model? OpenLLM supports custom model repositories. Build your model as a Bento, push to your repo, and serve it the same way:

```bash
openllm repo add my-models https://github.com/myorg/my-models
openllm serve my-custom-llama:v1
```

This is crucial for enterprises. You can maintain a private catalog of approved, fine-tuned models and deploy them with the same tooling.

## When to Use What

Here's my mental model:

- **Ollama** — Local development, quick experiments, personal use
- **vLLM** — Maximum performance, custom inference pipelines, research
- **OpenLLM** — Production APIs, team deployment, OpenAI-compatible endpoints

If you're building an application that calls OpenAI today but want the option to switch to open-source models tomorrow, OpenLLM makes that migration trivial. Same API, different backend.

## The Bottom Line

The LLM serving landscape is maturing fast. We've moved past "can we run these models" to "how do we run them well in production."

OpenLLM represents the next step: production-grade inference with zero API changes. Your code stays the same. Your infrastructure scales. Your costs drop.

If you're still paying OpenAI prices for tasks that Llama 3.3 handles fine, OpenLLM is your exit ramp. One command to start, one command to deploy.

That's the pitch. [Check out the repo](https://github.com/bentoml/OpenLLM) and give it a spin.
