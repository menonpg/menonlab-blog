---
title: "Grokking: How a 777-Parameter Transformer Learned Real Math"
description: "A tiny transformer with just 777 parameters learned 10-digit addition with 99.69% accuracy — proving neural networks can discover algorithms, not just memorize patterns."
date: "2026-02-24"
tags: ["grokking", "transformers", "deep-learning", "neural-networks", "mechanistic-interpretability"]
---

In January 2025, something remarkable happened.

A transformer with only **777 parameters** learned to perform 10-digit addition with 99.69% accuracy.

Let that sink in. 

To memorize all possible 10-digit addition problems, you'd need roughly 10^20 parameters. This model had 777. It couldn't possibly memorize. Which means it had to **actually learn the algorithm**.

This is grokking.

## What Is Grokking?

Grokking is a phenomenon where neural networks suddenly generalize long after they've memorized the training data.

Here's what it looks like:

1. **Phase 1 (Memorization):** The model achieves 100% training accuracy by memorizing examples. Test accuracy stays near random (0%).

2. **Phase 2 (Plateau):** Nothing visible happens. Training loss is low. Test accuracy is still garbage. Most people stop training here.

3. **Phase 3 (Grokking):** Suddenly — often thousands of epochs later — test accuracy jumps from ~0% to ~100%. The model has "figured out" the underlying algorithm.

The original 2022 paper by Power et al. at OpenAI demonstrated this on modular arithmetic (like `a + b mod 97`). But the 777-parameter result pushed it further: grokking works on **arbitrary-precision decimal arithmetic** — the kind of math we actually use.

## The 777-Parameter Architecture

The winning model from [yhavinga/gpt-acc-jax](https://github.com/yhavinga/gpt-acc-jax):

```
Layers: 1
Hidden dim: 7
Attention heads: 1
FFN dim: 14 (2× expansion)
Vocab size: 14
Context length: 35
```

Key optimizations that got it this small:
- **Tied embeddings:** Input and output embeddings share weights
- **No FFN bias:** Removes a few dozen parameters
- **Learned positions:** Sinusoidal positions failed; learned ones are essential
- **High learning rate (0.02):** Tiny models need higher LR to grok

What **didn't** work:
- RMSNorm (broke generalization)
- No delimiters (needed +/= tokens)
- RoPE embeddings (crashed)
- Going below d=7 (sharp "parameter cliff")

## The Parameter Cliff

This is fascinating: there's a hard threshold around 800 parameters where models abruptly go from 0% to 100% accuracy.

Below the cliff: no amount of training helps. The model simply lacks capacity.
Above the cliff: grokking happens reliably.

The transition is **sharp** — not gradual. It suggests there's a minimum representational capacity needed to encode the addition algorithm.

## Why Does Grokking Happen?

The leading theory involves **weight decay** and **representation compression**.

1. During memorization, the model learns a "lookup table" with large, unstructured weights
2. Weight decay (L2 regularization) continuously pushes weights toward zero
3. Eventually, the pressure to shrink weights forces the model to find a more compact representation
4. The compact representation turns out to be... the actual algorithm

In Neel Nanda's mechanistic interpretability work, researchers literally reverse-engineered grokked models and found they'd learned **Fourier features** for modular arithmetic — the same mathematical structure humans would use.

The network didn't just learn to generalize. It discovered the correct math.

## What We're Experimenting With

At The Menon Lab, we're running grokking experiments on modular arithmetic:

```python
# Training config (matched to 777-param paper)
OPERATION = 'add'  # Modular addition
P = 97  # Prime modulus
EMBED_DIM = 7  # Match 777-param model
NUM_EPOCHS = 100000  # 100k epochs for grokking!
LEARNING_RATE = 2e-2  # Higher LR for tiny models
WEIGHT_DECAY = 1.0  # Crucial for grokking
```

Our goal: replicate grokking, visualize the weight evolution, and extend it to other arithmetic operations (subtraction, multiplication, division).

The code lives at [menonpg/tiny-transformers](https://github.com/menonpg/tiny-transformers).

## Why This Matters

Grokking has profound implications:

**1. Neural networks can learn algorithms, not just patterns.**
The 777-parameter model didn't memorize. It couldn't. It discovered a general procedure for addition that works on numbers it had never seen.

**2. Overtraining might be underrated.**
We typically stop training when validation loss plateaus. Grokking shows that useful learning can happen long after apparent convergence.

**3. Weight decay isn't just regularization.**
It's a force that pushes networks toward simpler, more general solutions — even when memorization works fine on the training set.

**4. Interpretability gets concrete.**
When a model groks, we can often reverse-engineer what it learned. This opens a path to understanding neural networks mechanistically.

## The Open Questions

- Can we predict *when* grokking will happen?
- Does grokking scale to larger, more complex algorithms?
- Can we induce grokking deliberately (not just wait for it)?
- What does the representation look like mid-grok?

These are active research areas. And with transformers this small, anyone with a laptop can run experiments.

## Try It Yourself

Clone our notebook and run 100k epochs:

```bash
git clone https://github.com/menonpg/tiny-transformers
cd tiny-transformers/notebooks
# Open grokking_arithmetic.ipynb in Colab or Jupyter
```

Watch the training curves. The sudden jump from memorization to generalization is genuinely thrilling to witness.

Grokking reminds us that neural networks are stranger — and more capable — than we give them credit for. A 777-parameter model discovered addition. What else might be waiting to be grokked?

---

**References:**
- [Power et al. (2022) - Grokking: Generalization Beyond Overfitting](https://arxiv.org/abs/2201.02177)
- [yhavinga/gpt-acc-jax](https://github.com/yhavinga/gpt-acc-jax) - 777-parameter transformer
- [Nanda & Lieberum - Progress Measures for Grokking](https://arxiv.org/abs/2301.05217)
- [stockeh/mlx-grokking](https://github.com/stockeh/mlx-grokking) - Grokking in <150 epochs with MLX
