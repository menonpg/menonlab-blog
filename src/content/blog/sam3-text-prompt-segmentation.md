---
title: "SAM 3: Meta's Segment Anything Now Understands Text"
description: "No more clicking on objects — describe what you want to segment in plain English. Trained on 4 million unique concepts with 50x the vocabulary of existing datasets."
date: "2026-02-17"
tags: ["computer-vision", "ai-agents", "open-source"]
---

Meta's Segment Anything Model changed computer vision when it launched—point at something, get a perfect mask. SAM 2 added video tracking. Now **SAM 3** adds the capability everyone wanted: **text prompts**.

Instead of clicking on objects, you can now describe what you want to segment in plain English.

## What's New

SAM 3 ("Segment Anything with Concepts") introduces:

**Text prompts** — Describe objects with short noun phrases:
- "all the cars"
- "red flowers"
- "people wearing hats"

**Exemplar prompts** — Draw a box around one example, and SAM 3 finds all similar objects across the image or video.

**Massive vocabulary** — Trained on 4 million unique concepts, handling 270K concepts in their benchmark—50x more than existing segmentation datasets.

## The Numbers

SAM 3 achieves 75-80% of human performance on their new SA-CO benchmark for open-vocabulary segmentation. That's remarkable for a task that previously required either:
- Fixed label sets (COCO's 80 classes)
- Manual point/box prompts for each object

## Getting Started

```bash
pip install sam3
```

Basic text-prompted segmentation:
```python
from sam3 import SAM3Predictor

predictor = SAM3Predictor.from_pretrained("sam3-large")

# Load image
image = predictor.load_image("photo.jpg")

# Segment by text
masks = predictor.predict(
    image,
    text_prompt="dogs"
)
```

For video:
```python
# Track all instances of a concept through video
video_masks = predictor.predict_video(
    video_path="clip.mp4",
    text_prompt="bicycles"
)
```

## Architecture

SAM 3 unifies:
- **Image segmentation** (like SAM 1)
- **Video tracking** (like SAM 2)
- **Open-vocabulary detection** (like CLIP-based detectors)

All in one model that handles text, points, boxes, and masks as prompts interchangeably.

## Why This Matters

Before SAM 3, open-vocabulary segmentation required stitching together multiple models—a detector, a segmenter, maybe a tracker. Results were inconsistent and slow.

SAM 3 is end-to-end: describe what you want, get masks. This enables:

- **Zero-shot labeling** — Annotate datasets by describing objects
- **Natural language video editing** — "Remove all the logos"
- **Accessible CV tools** — Non-experts can segment without learning to prompt
- **Agent vision** — AI agents can now "see" any concept they can describe

## My Take

This is the vision model I've been waiting for. SAM 1 was impressive but required knowing *where* objects were. SAM 2 added temporal consistency. SAM 3 finally closes the loop—you can describe *what* you want in natural language.

For anyone building vision applications, this should be your default starting point. The combination of text understanding + video tracking + massive concept vocabulary makes it genuinely general-purpose.

**Links:**
- [GitHub](https://github.com/facebookresearch/sam3)
- [Demo](https://segment-anything.com/)
- [Paper](https://ai.meta.com/research/publications/sam-3-segment-anything-with-concepts/)
