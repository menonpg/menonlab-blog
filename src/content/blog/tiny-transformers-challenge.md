---
title: "The 1,000-Parameter Challenge: Minimal Transformers That Actually Work"
description: "Can a transformer with fewer parameters than a simple neural network learn meaningful tasks? We explore the lower limits of transformer capabilities with hands-on experiments."
pubDate: "2026-02-23"
tags: ["transformers", "deep-learning", "mnist", "grokking", "research"]
draft: false
---

What's the smallest transformer that can do something useful?

This isn't just an academic question. Tiny models mean edge deployment, interpretability, and a window into what transformers actually learn versus what they memorize.

## The 777-Parameter Wake-Up Call

A [recent experiment](https://github.com/yhavinga/gpt-acc-jax) trained a transformer with just **777 parameters** to perform 10-digit addition. Not 777 million. Not 777 thousand. Just 777.

The model achieved 99%+ accuracy on held-out test cases — numbers it had never seen during training.

Here's why that's remarkable: a lookup table for 10-digit addition would need to store ~10²⁰ possible input pairs. Even with 32-bit floats, the model has capacity for only ~25,000 bits of information. That's **10¹⁷ times too small** to memorize the answers.

The only explanation: **the model learned the algorithm**. Carry propagation. The actual rules of addition. Encoded in 777 weights.

## Grokking: The Sudden Jump

The training dynamics are fascinating. The model first *memorizes* the training examples — high training accuracy, random test performance. Then, after continued training with weight decay, something snaps. Test accuracy suddenly jumps from ~0% to 99%.

```
Accuracy
   │
99%│                          ┌────────
   │                         /
   │                        /  ← "grokking"
   │_______________________/
   │ memorization phase
   └─────────────────────────────── Steps
```

This is **grokking** — the phase transition from memorization to generalization. The theory: weight decay gradually penalizes the complex "lookup table" circuits until the simpler "algorithm" circuit becomes more efficient.

## Our Experiment: Micro-ViT for MNIST

Inspired by this, we asked: **can a ~4,000-parameter Vision Transformer classify handwritten digits?**

For context:
- LeNet-5 (1998): ~60,000 parameters
- Our Micro-ViT: ~4,000 parameters
- The addition transformer: 777 parameters

### Architecture

We stripped a Vision Transformer down to essentials:

| Component | Size | Parameters |
|-----------|------|------------|
| Patch embedding | 49 → 32 | ~1,600 |
| Position embeddings | 17 × 32 | 544 |
| CLS token | 1 × 32 | 32 |
| Single attention layer | 2 heads | ~2,000 |
| Classification head | 32 → 10 | 330 |
| **Total** | | **~4,500** |

Key simplifications:
- **7×7 patches** (only 16 patches from 28×28 image)
- **Single attention layer** (no stacking)
- **No MLP block** (saves ~2K params)
- **Tiny embedding dimension** (32 vs typical 768)

### The Code

The full experiment is available as a Colab notebook:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/menonpg/tiny-transformers/blob/main/notebooks/micro_vit_mnist.ipynb)

Core model (~50 lines of PyTorch):

```python
class MicroViT(nn.Module):
    def __init__(self, embed_dim=32, num_heads=2):
        super().__init__()
        
        # 7×7 patches → 16 patches from 28×28
        self.patch_embed = nn.Linear(49, embed_dim)
        self.cls_token = nn.Parameter(torch.zeros(1, 1, embed_dim))
        self.pos_embed = nn.Parameter(torch.zeros(1, 17, embed_dim))
        
        # Single attention layer
        self.attention = nn.MultiheadAttention(
            embed_dim, num_heads, batch_first=True
        )
        self.norm = nn.LayerNorm(embed_dim)
        
        # Classification head
        self.head = nn.Linear(embed_dim, 10)
    
    def forward(self, x):
        # Patchify: (B, 1, 28, 28) → (B, 16, 49)
        x = self.patchify(x)
        x = self.patch_embed(x)
        
        # Add CLS token and positions
        x = torch.cat([self.cls_token.expand(x.size(0), -1, -1), x], dim=1)
        x = x + self.pos_embed
        
        # Attention
        x = x + self.attention(self.norm(x), self.norm(x), self.norm(x))[0]
        
        # Classify from CLS token
        return self.head(x[:, 0])
```

## Results

*[This section will be updated after running the experiments]*

**Target:** >95% accuracy with <5,000 parameters

**Baseline comparisons:**
- Random guessing: 10%
- LeNet-5 (60K params): ~99%
- Simple MLP (100K params): ~98%

## What the Attention Sees

*[Attention visualizations will be added here]*

One of the benefits of tiny transformers: we can actually inspect what they learn. With only 2 attention heads and 16 patches, we can visualize exactly which parts of the digit each head focuses on.

## Failure Analysis

*[Analysis of misclassified digits will be added here]*

Where does a 4K-parameter model struggle? Likely candidates:
- Ambiguous digits (4 vs 9, 3 vs 8)
- Unusual handwriting styles
- Digits touching the image border

## Why This Matters

### 1. Edge Deployment

A 4K-parameter model fits in the L1 cache of most CPUs. No GPU needed. Real-time inference on microcontrollers becomes feasible.

### 2. Interpretability

When a model has 175 billion parameters, understanding what it learned is nearly impossible. With 4K parameters, we can inspect every weight, visualize every attention pattern, and potentially reverse-engineer the algorithm it discovered.

### 3. Curriculum Design

The grokking phenomenon suggests training dynamics matter as much as architecture. Weight decay, learning rate schedules, and data ordering can determine whether a model memorizes or generalizes.

### 4. The Limits of Scale

If 777 parameters can learn addition and 4K can classify digits, what does that say about massive models? Are they learning algorithms, or just really good lookup tables? The tiny transformer experiments suggest there's something fundamentally different about *learned algorithms* versus *memorized patterns*.

## Try It Yourself

1. **Run the Colab notebook** — free GPU, ~10 minutes to train
2. **Modify the architecture** — can you hit 95% with even fewer parameters?
3. **Try other tasks** — Fashion-MNIST? CIFAR-10 subsets?

## Next Steps

We're exploring:
- **Generative tiny transformers** — can a small autoregressive model generate digits?
- **Other minimal tasks** — what's the smallest transformer for sentiment analysis?
- **Grokking dynamics** — can we predict when the phase transition will happen?

---

*Code and notebooks: [github.com/menonpg/tiny-transformers](https://github.com/menonpg/tiny-transformers)*

*Have ideas for tiny transformer experiments? [Reach out on X](https://x.com/themedcave).*
