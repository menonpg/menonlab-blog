---
title: "Unsloth: Fine-Tune LLMs from VS Code Using Free Colab GPUs"
description: "How to fine-tune LLMs directly from your IDE using Unsloth and Google Colab's free GPUs—no expensive hardware required"
date: "2026-02-19"
tags: ["llm", "fine-tuning", "open-source", "machine-learning", "vscode"]
---

Here's a workflow that changes everything: fine-tune LLMs directly from Visual Studio Code, running on Google Colab's free GPUs. No expensive hardware. No cloud bills. Just your familiar IDE connected to free compute.

**Unsloth** makes this possible—and makes it 2x faster with 70% less VRAM than standard approaches.

## Why Fine-Tune at All?

Before diving into the how, let's address the why. Base models like Llama, Qwen, or Gemma are trained on internet-scale data to be generalists. They're impressive, but they're not *yours*.

**Fine-tuning transforms a general model into a specialist:**

### 1. Domain Expertise
A base model knows a little about everything. Fine-tuning on your data—medical records, legal documents, codebase, internal wikis—creates a model that deeply understands your domain. A fine-tuned model for radiology will outperform GPT-4 on radiology tasks, despite being 100x smaller.

### 2. Style and Voice
Want outputs that match your brand voice? Formal legal language? Casual customer support? Fine-tuning on examples teaches the model *how* to communicate, not just what to say.

### 3. Task-Specific Performance
Base models are optimized for general chat. Fine-tuning on structured outputs (JSON, SQL, specific formats) dramatically improves reliability for production use cases. No more fighting with prompts to get consistent formatting.

### 4. Smaller, Faster, Cheaper
A fine-tuned 3B model often beats a general 70B model on narrow tasks. That's 20x fewer parameters, meaning faster inference, lower costs, and the ability to run locally.

### 5. Data Privacy
Fine-tuning means your sensitive data trains a model you control—not one that lives on someone else's servers. For healthcare, legal, and enterprise applications, this is often a requirement, not a preference.

### 6. Reasoning and Chain-of-Thought
With reinforcement learning (GRPO/DPO), you can train models to reason through problems step-by-step. This is how labs create "reasoning models"—and now you can do it too.

The barrier has always been hardware. Fine-tuning typically requires 40-80GB of VRAM. That's an A100 or H100—thousands of dollars in cloud compute or tens of thousands in hardware.

Unsloth removes that barrier.

## The VS Code + Colab Workflow

This is the key insight: Google Colab gives you free GPU access (T4s, sometimes better). Unsloth's VS Code extension lets you use those GPUs directly from your local IDE.

**What this means:**
- Write and edit code in your familiar VS Code environment
- Execute on Colab's free GPUs
- No context switching between browser tabs
- Full IDE features: debugging, extensions, git integration

### Setup in 5 Minutes

**1. Install the Colab Extension**

Open VS Code extensions (Ctrl+Shift+X) and search for "Google Colab". Install it.

**2. Clone Unsloth's Notebooks**

```bash
git clone https://github.com/unslothai/notebooks
cd notebooks
```

**3. Open a Notebook and Connect**

Open any notebook (e.g., `nb/Qwen3_(4B)-GRPO.ipynb`). In the kernel selector, choose "Colab", then "+ Add New Colab Server". Authenticate with Google, select GPU as hardware accelerator, and you're connected.

**4. Run Your Fine-Tuning**

Hit "Run All". Unsloth handles the rest—installing dependencies, loading models, running training. Watch your model improve in real-time.

That's it. You're fine-tuning LLMs from VS Code on free hardware.

## Why Unsloth is Fast

The efficiency gains aren't magic—they're engineering. Instead of building on existing frameworks, Unsloth's team:

- **Manually derived gradients** for all compute-heavy operations
- **Wrote custom Triton kernels** for attention, MLP, and RoPE
- **Built a manual backpropagation engine** that avoids framework overhead
- **Implemented padding-free packing** to eliminate wasted compute

The result: 2x faster training, 70% less VRAM, zero accuracy loss. No approximations—just better implementation.

## What You Can Train

Unsloth supports the full spectrum:

| Category | Models |
|----------|--------|
| **Text LLMs** | Llama 3.x, Qwen 3, Gemma 3, DeepSeek, Mistral, gpt-oss |
| **Vision LLMs** | Qwen3-VL, Gemma 3 Vision, Ministral 3 VL |
| **Text-to-Speech** | Orpheus-TTS, sesame/csm-1b |
| **Embeddings** | EmbeddingGemma, BERT-style models |
| **MoE** | DeepSeek, GLM, Qwen MoE (12x faster) |

### Real VRAM Numbers

These are achievable on Colab's free tier (T4 with 15GB):

- **Llama 3.2 1B/3B**: Fits easily, fast iteration
- **Qwen3 4B with GRPO**: Full reinforcement learning workflow
- **Gemma 3 4B Vision**: Multimodal fine-tuning

With Colab Pro (A100):
- **gpt-oss 20B**: 14GB VRAM
- **Llama 3.1 8B**: Full fine-tuning with room to spare
- **500K context training**: Possible on 80GB for 20B models

## A Minimal Fine-Tuning Example

```python
from unsloth import FastLanguageModel

# Load model in 4-bit (fits in less VRAM)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Llama-3.2-1B",
    max_seq_length=2048,
    load_in_4bit=True,
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_alpha=16,
    lora_dropout=0,
)

# Your training loop here—Unsloth handles the optimization
```

The notebooks handle all the boilerplate. Just swap in your dataset.

## When to Fine-Tune vs. Prompt Engineer

Fine-tuning isn't always the answer:

**Use prompting when:**
- You need quick iteration
- The task is straightforward
- You don't have training data
- The base model already performs well

**Use fine-tuning when:**
- Prompting hits a ceiling
- You need consistent structured outputs
- Domain expertise matters
- You want smaller, faster models
- Data privacy is a requirement
- You're building reasoning capabilities

## Getting Started Today

1. **Install VS Code Colab extension**
2. **Clone the notebooks**: `git clone https://github.com/unslothai/notebooks`
3. **Pick a model** that fits your task
4. **Prepare your data** in the expected format (usually prompt/completion pairs)
5. **Run the notebook** and iterate

The [Unsloth documentation](https://unsloth.ai/docs) covers dataset formatting, hyperparameter tuning, and deployment. Their [fine-tuning guide](https://unsloth.ai/docs/get-started/fine-tuning-llms-guide) walks through the full workflow.

## The Bottom Line

Fine-tuning used to require serious hardware investment. Now you can do it from VS Code using free Colab GPUs, with training that's 2x faster than standard approaches.

The combination of accessible compute (Colab) and efficient training (Unsloth) means anyone can create specialized models. The next production-ready fine-tune might come from someone working on a laptop at a coffee shop.

That's a meaningful shift in who gets to build AI.

---

*The Menon Lab explores tools that democratize AI development. Follow along for more on making advanced ML accessible.*
