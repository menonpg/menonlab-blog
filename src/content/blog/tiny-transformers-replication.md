---
title: "Replicating the 777-Parameter Transformer: Our Tiny Transformers Project"
description: "We're building the smallest transformers that actually work — starting with a replication of the famous 777-parameter addition model. Here's our repo, experiments, and what we've learned."
date: "2026-02-24"
tags: ["transformers", "grokking", "deep-learning", "replication", "open-source"]
---

How small can a transformer be and still do something useful?

That question led us to start [tiny-transformers](https://github.com/menonpg/tiny-transformers) — a project to explore the minimum viable transformer for various tasks.

Our first target: replicate the famous **777-parameter transformer** that learned 10-digit addition with 99.69% accuracy.

## The Reference: yhavinga/gpt-acc-jax

The benchmark we're chasing comes from [yhavinga/gpt-acc-jax](https://github.com/yhavinga/gpt-acc-jax), which documented an autonomous AI experiment to find the smallest possible addition transformer.

Their winning architecture:

| Parameter | Value |
|-----------|-------|
| Layers | 1 |
| Hidden dim | 7 |
| Attention heads | 1 |
| FFN dim | 14 (2× expansion) |
| Vocab size | 14 |
| Learning rate | 0.02 |
| Total params | **777** |

Key findings from their 47 experiments:
- **One layer beats two** at the same parameter count
- **Higher learning rate (0.02)** is essential for tiny models
- **Tied embeddings + no FFN bias** enables sub-1K params
- There's a sharp **parameter cliff** at ~800 params — below it, nothing works

## Our Approach: Modular Arithmetic First

Instead of jumping straight to 10-digit decimal addition, we're starting with **modular arithmetic** — the same domain used in the original grokking papers.

Why? Modular arithmetic (like `a + b mod 97`) is:
- Bounded (all answers are 0-96)
- Well-studied for grokking
- Easier to visualize and debug
- A stepping stone to decimal arithmetic

Our dataset:
```python
# All pairs (a, b) where a, b ∈ {0, 1, ..., 96}
# Task: predict (a + b) mod 97
# Total possible examples: 97 × 97 = 9,409
# Train/test split: 50/50
```

## Current Experiment Setup

We matched the 777-param paper's hyperparameters:

```python
# Training configuration (from grokking_arithmetic.ipynb)
OPERATION = 'add'
P = 97  # Prime modulus
EMBED_DIM = 7  # Match 777-param model
NUM_HEADS = 1
BATCH_SIZE = 512
NUM_EPOCHS = 100000  # 100k epochs for grokking!
LEARNING_RATE = 0.02  # Higher LR for tiny models
WEIGHT_DECAY = 1.0  # Crucial for grokking
```

The 100k epoch count isn't arbitrary — the original grokking papers trained for 100,000 steps, and grokking often happens late (10k-50k epochs in).

## Our Model Architecture

```python
class TinyArithmeticTransformer(nn.Module):
    def __init__(self, vocab_size=104, embed_dim=7, num_heads=1, max_len=5):
        # Token embeddings
        self.token_embed = nn.Embedding(vocab_size, embed_dim)
        
        # Learned position embeddings (essential!)
        self.pos_embed = nn.Parameter(torch.zeros(1, max_len, embed_dim))
        
        # Single attention layer
        self.attention = nn.MultiheadAttention(embed_dim, num_heads)
        self.norm = nn.LayerNorm(embed_dim)
        
        # Output head (tied with input embeddings)
        self.head = nn.Linear(embed_dim, vocab_size, bias=False)
        self.head.weight = self.token_embed.weight  # Weight tying
```

Current parameter count: **~800-1000** depending on vocab size. We're iterating to get it under 777.

## What We're Tracking

Each training run logs:
- Train/test loss curves
- Train/test accuracy curves
- **Grokking detection**: automatic alert when test acc jumps from <50% to >99%
- Checkpoints every 10k epochs

The classic grokking signature we're looking for:

```
Epoch 5000:  Train 100%, Test 12%   ← Memorized
Epoch 10000: Train 100%, Test 15%   ← Still memorized
Epoch 15000: Train 100%, Test 18%   ← Plateau...
Epoch 20000: Train 100%, Test 97%   ← GROKKING! 🎯
```

## Experiments in Progress

**Notebook 1: `grokking_arithmetic.ipynb`**
- Modular addition (mod 97)
- Target: <1000 params, >99% test accuracy
- Status: Running 100k epoch experiments

**Notebook 2: `grokking_diffusion_mnist.ipynb`**
- Tiny diffusion model for MNIST generation
- Target: <10,000 params, recognizable digits
- Status: Architecture design phase

**Notebook 3: `micro_vit_mnist.ipynb`** (completed)
- Micro Vision Transformer for MNIST classification
- Result: 6,794 params, 93.22% accuracy
- Missed targets but proved tiny ViTs can learn

## Run It Yourself

Everything's on GitHub with Colab links:

```bash
git clone https://github.com/menonpg/tiny-transformers
cd tiny-transformers/notebooks
```

Or click the Colab badge in the README to run in-browser with free GPU.

## What's Next

1. **Hit 99% on modular addition** with <1000 params
2. **Extend to subtraction, multiplication, division** (mod 97)
3. **Scale to decimal arithmetic** (10-digit addition like the 777-param paper)
4. **Visualize the grokking transition** — what do the weights look like mid-grok?
5. **Mechanistic interpretability** — can we reverse-engineer what the model learned?

## Why This Matters

Tiny transformers aren't just an academic curiosity. They tell us:

- **What's the minimum compute needed for a task?** Useful for edge deployment.
- **Do neural networks learn algorithms or memorize?** Grokking proves they can learn.
- **What architectural choices actually matter?** At 777 params, every decision counts.

We're documenting everything as we go. Follow along at [menonpg/tiny-transformers](https://github.com/menonpg/tiny-transformers).

---

**Links:**
- Our repo: [github.com/menonpg/tiny-transformers](https://github.com/menonpg/tiny-transformers)
- Reference (777-param): [github.com/yhavinga/gpt-acc-jax](https://github.com/yhavinga/gpt-acc-jax)
- Original grokking paper: [arxiv.org/abs/2201.02177](https://arxiv.org/abs/2201.02177)
