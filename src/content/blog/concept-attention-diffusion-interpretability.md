---
title: "ConceptAttention: See What Diffusion Models Actually See"
description: "A new interpretability method that extracts per-concept heatmaps from Flux, SD3, and even video models. Finally understand where your prompts land."
date: "2026-02-25"
tags: ["diffusion-models", "interpretability", "flux", "computer-vision"]
---

When you prompt a diffusion model with "a dragon standing on a rock," how do you know it understood "dragon" vs "rock" vs "standing"? You look at the output and hope for the best.

[ConceptAttention](https://github.com/helblazer811/ConceptAttention) changes that. It extracts per-concept heatmaps showing exactly where the model attends for each word in your prompt. Not post-hoc saliency maps — actual attention patterns from inside the transformer.

## The Core Idea

Previous interpretability methods for diffusion models (like DAAM) used cross-attention maps. ConceptAttention does something different: it uses the **output space** of joint attention blocks.

Here's the insight: in DiT architectures like Flux, text and image tokens are processed together through joint attention. After each block, you can extract:
1. Output vectors for image patches
2. Output vectors for concept tokens

Take the dot product, apply softmax, average across layers 15-18 and timesteps, and you get a heatmap showing where each concept is localized.

The paper shows this gives cleaner, more precise localization than cross-attention approaches.

## How to Use It

```python
from concept_attention import ConceptAttentionFluxPipeline

pipeline = ConceptAttentionFluxPipeline(
    model_name="flux-schnell",
    device="cuda:0"
)

output = pipeline.generate_image(
    prompt="A dragon standing on a rock",
    concepts=["dragon", "rock", "sky", "cloud"],
    width=1024,
    height=1024,
)

# output.image = the generated image
# output.concept_heatmaps = list of PIL images, one per concept
```

You can also encode existing images:

```python
output = pipeline.encode_image(
    image=my_image,
    concepts=["dog", "grass", "ball"],
)
```

## Supported Models

- **Flux 1 & 2** (primary target)
- **SD3**
- **CogVideoX** (video generation!)

The video support is particularly interesting — you get concept heatmaps across frames, showing how attention evolves over time.

## Under the Hood

The technical mechanism:

1. Each concept word is embedded separately via T5, taking only the first token
2. During the diffusion process, they hook into layers 15-18 (the later joint attention blocks)
3. Extract output vectors for both image patches (64×64 grid) and concept tokens
4. Compute: `heatmap = softmax(image_vectors @ concept_vectors.T)`
5. Average across selected timesteps and layers

The choice of layers 15-18 isn't arbitrary — these are where semantic concepts tend to be most localized. Earlier layers are noisier; later layers are too committed to pixel details.

## Why This Matters

**Prompt debugging**: When your image doesn't match your prompt, you can see which concepts the model ignored or mislocalized.

**Model comparison**: Compare how Flux vs SD3 vs other DiTs interpret the same prompt.

**Research tool**: Study how diffusion transformers represent concepts internally.

**Safety/auditing**: Verify that sensitive concepts are (or aren't) being attended to.

## Limitations

- Requires GPU (Flux is big)
- Square images only for now
- Heatmaps are 64×64, upscaled to image resolution
- Concept words should be single tokens ideally (multi-token concepts work but are averaged)

## The Interpretability Gap

Diffusion models have been black boxes for too long. We've had attention visualization for language models for years, but image generation was stuck with "look at the output and guess."

ConceptAttention is part of a trend toward actually understanding what these models do internally. Not just "does it work?" but "how does it work, and can we trust it?"

For anyone building products on top of diffusion models, tools like this move us from "prompt engineering by vibes" to "prompt engineering by evidence."

---

**Links:**
- [GitHub](https://github.com/helblazer811/ConceptAttention)
- [Paper (arXiv)](https://arxiv.org/abs/2502.04320)
- [HuggingFace Demo](https://huggingface.co/spaces/helblazer811/ConceptAttention)
