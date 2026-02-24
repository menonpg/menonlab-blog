---
title: "Replicating the 777-Parameter Transformer: Our Tiny Transformers Project"
description: "We're building the smallest transformers that actually work — starting with a replication of the famous 777-parameter addition model. Here's our repo, experiments, what failed, and what we learned."
date: "2026-02-24"
tags: ["transformers", "grokking", "deep-learning", "replication", "open-source"]
---

How small can a transformer be and still do something useful?

That question led us to start [tiny-transformers](https://github.com/menonpg/tiny-transformers) — a project to explore the minimum viable transformer for various tasks.

Our first target: replicate the famous **777-parameter transformer** that learned 10-digit addition with 99.69% accuracy.

This post documents everything — including the mistakes. If you're trying to replicate grokking yourself, hopefully our failures save you some time.

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

## What We Tried (and What Failed)

Replication is harder than it looks. Here's our iteration log:

### Attempt 1: Copy the Config, Ignore the Architecture

Our first notebook had `EMBED_DIM = 7` and `LEARNING_RATE = 0.02` — matching the paper. We thought that was enough.

**What we missed:** The model had no feedforward layer. We used `nn.MultiheadAttention` directly and went straight to the output head. The 777-param model has a proper FFN with `d_ff = 14` (2× expansion).

**Result:** The model could memorize (~100% train accuracy) but never generalized. Test accuracy stuck around 10-15%.

**Lesson:** The FFN layer isn't optional. Attention alone can memorize, but the FFN seems critical for the compression that leads to generalization.

### Attempt 2: Wrong Weight Decay

We initially used `WEIGHT_DECAY = 0.01` (matching the 777 paper exactly), but the original grokking papers on modular arithmetic used much higher values — around 1.0.

**What happened:** With low weight decay, the model memorized and stayed memorized. No grokking even after 20k epochs.

**The fix:** Cranked weight decay to 1.0. This is counterintuitive — aggressive regularization on a tiny model — but it's what forces the model to find a compact, generalizing solution instead of a sprawling memorization table.

**Lesson:** Weight decay is the secret ingredient. It's not just regularization — it's what creates the pressure to generalize.

### Attempt 3: Using nn.MultiheadAttention

PyTorch's `nn.MultiheadAttention` is convenient, but it has internal Q, K, V projections with their own parameters. For a 7-dimensional model, this bloats the parameter count unpredictably.

**What happened:** Our "minimal" model had way more parameters than expected. Hard to match the 777 target.

**The fix:** Wrote a custom `CausalSelfAttention` class with explicit QKV projection:

```python
class CausalSelfAttention(nn.Module):
    def __init__(self, d_model):
        super().__init__()
        self.qkv = nn.Linear(d_model, 3 * d_model, bias=False)
        self.proj = nn.Linear(d_model, d_model, bias=False)
```

**Lesson:** At this scale, every parameter matters. Use explicit layers so you know exactly what you're paying for.

### Attempt 4: Constant Learning Rate

We started with a constant learning rate of 0.02. The 777 paper uses cosine decay with warmup.

**What happened:** Training was unstable early on. Loss would spike, then recover, then spike again.

**The fix:** Added warmup (50 epochs) + cosine decay:

```python
def get_lr(step, warmup_steps, total_steps, max_lr):
    if step < warmup_steps:
        return max_lr * step / warmup_steps
    progress = (step - warmup_steps) / (total_steps - warmup_steps)
    return min_lr + 0.5 * (max_lr - min_lr) * (1 + math.cos(math.pi * progress))
```

**Lesson:** LR scheduling matters even for tiny models. Warmup prevents early instability; decay helps fine-tune at the end.

### Attempt 5: Not Training Long Enough

Our first runs used 10,000 epochs. Seemed like a lot.

**What happened:** Train accuracy hit 100% around epoch 500. Test accuracy hovered at 15%. We thought the model was broken.

**The reality:** Grokking can take 20k-50k epochs. The model needs to memorize first (fast), then the weight decay pressure slowly forces it to find a generalizing solution (slow).

**The fix:** Extended to 100,000 epochs with checkpoints every 10k.

**Lesson:** Patience. Grokking is called "delayed generalization" for a reason. If your train accuracy is 100% and test is bad, you might just need to wait.

## Our Current Architecture

After all the iterations, here's what we're running:

```python
class TinyGrokTransformer(nn.Module):
    def __init__(self, vocab_size, d_model=7, d_ff=14, n_layers=1):
        # Token embeddings
        self.token_embed = nn.Embedding(vocab_size, d_model)
        
        # Learned position embeddings (NOT sinusoidal!)
        self.pos_embed = nn.Embedding(max_len, d_model)
        
        # Transformer block: attention + FFN
        self.blocks = nn.ModuleList([
            TransformerBlock(d_model, d_ff) for _ in range(n_layers)
        ])
        
        # Output head TIED with input embeddings
        self.head = nn.Linear(d_model, vocab_size, bias=False)
        self.head.weight = self.token_embed.weight
```

Key details:
- **d_model = 7, d_ff = 14** — Matches 777 paper
- **Learned positions** — Sinusoidal failed in their experiments
- **No bias in FFN** — Saves parameters
- **Tied embeddings** — Input and output share weights

## The Training Config

```python
D_MODEL = 7
D_FF = 14           # 2× expansion
N_LAYERS = 1
BATCH_SIZE = 512    # Full batch works best
NUM_EPOCHS = 100000 # Grokking needs patience
MAX_LR = 0.02       # High for tiny models
WEIGHT_DECAY = 1.0  # Critical for grokking
WARMUP_EPOCHS = 50
```

## What We're Looking For

The classic grokking signature:

```
Epoch 5000:  Train 100%, Test 12%   ← Memorized
Epoch 10000: Train 100%, Test 15%   ← Still memorized
Epoch 15000: Train 100%, Test 18%   ← Plateau...
Epoch 20000: Train 100%, Test 97%   ← GROKKING! 🎯
```

The notebook has automatic detection that alerts when test accuracy jumps from <50% to >99%.

## Run It Yourself

The notebook is on GitHub with a Colab badge:

```bash
git clone https://github.com/menonpg/tiny-transformers
cd tiny-transformers/notebooks
# Open grokking_arithmetic.ipynb
```

Or run directly in Colab (free GPU): [Open in Colab](https://colab.research.google.com/github/menonpg/tiny-transformers/blob/main/notebooks/grokking_arithmetic.ipynb)

## What's Next

We're still iterating:

1. **Verify grokking occurs** on our current architecture (running now)
2. **Extend to other operations** — subtraction, multiplication, division (mod 97)
3. **Scale to decimal arithmetic** — 10-digit addition like the original 777 paper
4. **Visualize weight evolution** — what do the embeddings look like before/during/after grokking?
5. **Mechanistic interpretability** — can we reverse-engineer the algorithm the model learned?

## Why Document Failures?

Because replication papers rarely show the dead ends. The 777 paper ran 47 experiments — they had plenty of failures too. Knowing what *doesn't* work is often more useful than knowing what does.

If you're trying to replicate grokking:
- **Do** use an FFN layer (attention alone won't generalize)
- **Do** use high weight decay (1.0 for modular arithmetic)
- **Do** train for 50k-100k epochs (grokking is slow)
- **Do** use a high learning rate (0.02) for tiny models
- **Don't** use sinusoidal positions (learned works better)
- **Don't** expect results in 10k epochs (that's just memorization)

We'll update this post as we learn more.

---

**Links:**
- Our repo: [github.com/menonpg/tiny-transformers](https://github.com/menonpg/tiny-transformers)
- Reference (777-param): [github.com/yhavinga/gpt-acc-jax](https://github.com/yhavinga/gpt-acc-jax)
- Original grokking paper: [arxiv.org/abs/2201.02177](https://arxiv.org/abs/2201.02177)
