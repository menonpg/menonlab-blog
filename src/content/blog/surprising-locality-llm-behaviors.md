---
title: "The Surprising Locality of LLM Behaviors: Why a Few Weights Control Everything"
description: "From task vectors to abliteration, research shows LLM capabilities are surprisingly modular. What this means for fine-tuning, model editing, and AI safety."
date: "2026-03-04"
tags: ["LLM", "fine-tuning", "mechanistic-interpretability", "AI-safety", "research"]
---

We used to think large language models were inscrutable black boxes—billions of parameters working together in ways we couldn't decompose or understand.

Turns out we were wrong.

A growing body of research shows that LLM behaviors are surprisingly *localized*. Capabilities, styles, and even safety behaviors often live in specific subspaces of the weight matrix. You can add, remove, or modify them with surgical precision.

This has profound implications for fine-tuning, model merging, interpretability—and AI safety.

## Task Vectors: Capabilities as Directions

The foundational insight comes from Ilharco et al.'s 2023 paper "[Editing Models with Task Arithmetic](https://arxiv.org/abs/2212.04089)":

```
task_vector = fine_tuned_weights - pretrained_weights
```

That's it. Subtract the pretrained model from the fine-tuned model, and you get a "task vector"—a direction in parameter space that encodes the capability you trained.

The wild part? These vectors compose:

| Operation | Result |
|-----------|--------|
| `pretrained + task_vector_A` | Model with capability A |
| `pretrained + task_vector_A + task_vector_B` | Model with both capabilities |
| `pretrained - task_vector_A` | Model with capability A *removed* |
| `task_vector_A - task_vector_B` | The "difference" between capabilities |

You can literally do arithmetic on model capabilities. Add French, subtract toxicity, combine coding and math. No retraining required.

## LoRA: Fine-Tuning with 0.1% of Weights

If capabilities are localized, do we really need to update all parameters when fine-tuning?

[LoRA](https://arxiv.org/abs/2106.09685) (Low-Rank Adaptation) answered decisively: no.

By decomposing weight updates into low-rank matrices, LoRA achieves competitive fine-tuning performance while updating less than 1% of parameters. For a 7B model, that's ~70M parameters instead of 7B.

This works because the "direction" that encodes a new capability doesn't require changing every weight—just the ones that define that subspace.

## Abliteration: Refusal is One Direction

Here's where it gets uncomfortable for AI safety.

[Abliteration](https://huggingface.co/blog/mlabonne/abliteration) is a technique that removes refusal behavior from language models. The process:

1. Collect prompts the model refuses ("How do I hack...") and prompts it answers
2. Run both through the model, capture hidden states
3. Find the direction that separates refusal from compliance
4. Remove that direction from the model's weights

The result? A model that answers everything, with its other capabilities intact.

The refusal behavior—all of it—lives in essentially *one direction* in the model's representation space. Tools like [OBLITERATUS](https://huggingface.co/spaces/pliny-the-prompter/obliteratus) now automate this with 13 different methods across 116+ models.

As one researcher put it:

> "If alignment can be trivially removed by anyone with model weights and a GitHub tutorial, then alignment as currently implemented is not a security mechanism but a speed bump."

## The Geometry of Alignment

Recent work has gone further, showing you can *fingerprint* how a model was aligned just from its weight geometry:

- **DPO** (Direct Preference Optimization) creates one kind of subspace
- **RLHF** (Reinforcement Learning from Human Feedback) creates another
- **CAI** (Constitutional AI) creates yet another

Each alignment method leaves a distinct signature. You can detect which was used without knowing anything about the training process—just by analyzing the model's weights.

This means alignment isn't hidden or distributed. It's a specific, detectable, removable structure.

## What This Means

### For Fine-Tuning

Stop thinking about fine-tuning as "retraining the model." Think about it as "adding a direction."

- Use LoRA or similar for efficiency
- Consider task vector arithmetic for combining capabilities
- Understand that you're editing a subspace, not the whole model

### For Model Merging

If capabilities are directions, you can merge models by combining their directions:

```python
merged = base + 0.5 * (model_A - base) + 0.5 * (model_B - base)
```

This is why model merging works at all. Capabilities don't destructively interfere because they often occupy different subspaces.

### For Interpretability

The locality of behaviors is a gift for mechanistic interpretability. Instead of searching billions of parameters for "where does the model know French," you can:

1. Create a task vector for French
2. Identify which layers/dimensions it affects most
3. Study those specific circuits

### For AI Safety

This is the hard one.

If safety behaviors are as localized as other capabilities, they can be removed just as easily. Current alignment techniques create detectable, removable structures.

Some implications:

- **Open weights = removable safety** (for motivated actors)
- **Safety must be distributed**, not localized, to be robust
- **Detection might matter more** than prevention

The "[Embarrassingly Simple Defense](https://arxiv.org/abs/2505.19056)" paper proposes dispersing safety signals across multiple dimensions to make them harder to isolate. But this is an arms race.

## The Bigger Picture

Five years ago, we thought neural networks were mysterious soups of numbers. Now we're finding structure:

| What We Thought | What We Found |
|-----------------|---------------|
| Capabilities are distributed | Many are localized to subspaces |
| Fine-tuning changes everything | Often changes <1% of weights |
| Alignment is deep | Often one direction, removable |
| Models are black boxes | Increasingly decomposable |

This is good news for efficiency (cheaper fine-tuning), interpretability (findable circuits), and capability composition (model merging).

It's more complicated news for safety. The same locality that makes models editable makes them *un-editable* in the safety direction.

But knowing the structure is better than not knowing. You can't defend a system you don't understand.

---

*Building with LLMs? Check out [soul.py](https://github.com/menonpg/soul.py) for persistent agent memory, and [soul-schema](https://github.com/menonpg/soul-schema) for auto-documenting your data warehouse.*
