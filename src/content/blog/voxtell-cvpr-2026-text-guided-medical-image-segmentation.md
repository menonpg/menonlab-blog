---
title: "VoxTell at CVPR 2026: A Paradigm Shift in Text-Guided 3D Medical Image Segmentation"
description: "How our collaborative work on VoxTell is reshaping the way clinicians interact with volumetric medical images—from single words to full radiology reports."
pubDate: 2026-02-24
heroImage: "/blog-images/voxtell-hero.png"
tags: ["medical imaging", "computer vision", "deep learning", "CVPR", "segmentation", "NLP"]
---

I'm thrilled to share that **VoxTell has been accepted to CVPR 2026**—one of the premier venues in computer vision research. This work represents a significant step forward in how we think about medical image segmentation, and I'm honored to have contributed alongside an exceptional team at the German Cancer Research Center (DKFZ).

Special thanks to Maximilian Rokuss and Moritz Langenberg for bringing me aboard this journey. Their vision for what medical image segmentation could become—truly language-driven, truly universal—is now a reality.

## The Problem We Set Out to Solve

Anyone who has worked in clinical radiology or radiation oncology knows the pain: medical image segmentation remains fragmented. We have models for liver segmentation, separate models for lung nodules, different architectures for brain MRI versus abdominal CT. Even the impressive "universal" segmentation models that have emerged in recent years are constrained to predefined label sets. They can segment a liver, but only because "liver" is in their training vocabulary.

But that's not how clinicians think. When a radiologist reads a scan, they don't think in terms of fixed class indices. They think in natural language: *"There's a 2.3 cm ground-glass opacity in the right lower lobe."* Or simply: *"segment the spleen."*

The question we asked: **Can a segmentation model understand arbitrary text—from single anatomical terms to full clinical sentences—and produce accurate 3D volumetric masks?**

## What Makes VoxTell Different

The name says it all: **Vox** (voxel) + **Tell** (language). VoxTell is a vision-language model that directly maps free-form text prompts to 3D segmentation masks.

### Scale and Diversity

VoxTell was trained on what is, to our knowledge, the largest and most diverse 3D medical imaging corpus assembled for text-guided segmentation:

- **62,000+ volumetric scans** from 158 public datasets
- **1,087 anatomical and pathological concepts**
- **CT, MRI, and PET modalities**
- Coverage spanning brain, thorax, abdomen, pelvis, musculoskeletal system, and vascular structures

This isn't just a large dataset—it's a comprehensive atlas of human anatomy and pathology, annotated and harmonized for language-conditioned learning.

### Multi-Stage Vision-Language Fusion

Here's where the technical innovation lies. Prior text-guided segmentation models (including the excellent SAT and BioMedParse) perform what I'd call "late fusion"—text embeddings are combined with image features only at the final decoding stage. This works, but it limits the model's ability to respond to spatially grounded queries like *"lesion in the right lung"* versus *"lesion in the left lung."*

VoxTell takes a different approach: **repeated cross-modal interaction throughout the entire decoder hierarchy**. At every resolution scale, textual embeddings modulate volumetric features. This means the model learns prompt-conditioned representations from the coarsest feature maps all the way to the finest.

The architecture extends the MaskFormer paradigm with:
- A UNet-style 3D encoder (still state-of-the-art for volumetric medical imaging)
- A transformer-based prompt decoder using Qwen3-Embedding-4B for text encoding
- Scale-specific adapter MLPs that project text embeddings to match each decoder stage
- Deep supervision across all decoder stages, enforcing prompt-conditioned predictions at multiple resolutions

### Real Clinical Language Understanding

Perhaps most impressive: VoxTell can segment structures from actual radiology report text. Not cleaned-up labels, not structured ontology terms—real clinical prose.

In our experiments on a held-out radiotherapy cohort, we extracted tumor descriptions directly from radiology reports (e.g., *"2.8 cm spiculated mass in the posterior segment of the right upper lobe"*) and asked VoxTell to segment them. It outperformed all prior text-promptable methods on this task.

This is the promise of language-driven segmentation realized: a radiologist's dictated findings become direct input to the segmentation model.

## Key Results

### State-of-the-Art Zero-Shot Performance

On unseen datasets (not just held-out test splits, but entirely new data sources), VoxTell achieves state-of-the-art zero-shot segmentation performance across:
- Familiar anatomical structures
- Cross-modality scenarios (e.g., training on CT, testing on MRI)
- Related but unseen concepts

### Robustness to Linguistic Variation

Prior models are notoriously brittle to synonyms, spelling variations, and phrasing differences. VoxTell maintains robust performance across:
- Single words (*"liver"*)
- Anatomical synonyms (*"hepatic organ"*, *"hepar"*)
- Clinical descriptions (*"heterogeneous mass in segment VII of the liver"*)
- Minor spelling errors (a practical reality in clinical workflows)

### Generalization to Unseen Concepts

This is where things get exciting from a research perspective. VoxTell shows promising generalization to semantically related structures it never saw during training. The rich embeddings from the Qwen3 text encoder appear to encode anatomical knowledge that transfers to novel concepts.

## Why This Matters for Clinical Practice

The implications for clinical workflows are significant:

**1. Reduced annotation burden.** Instead of training separate models for each anatomical structure, a single VoxTell model can segment anything describable in text.

**2. Report-driven automation.** Radiology reports already exist. If segmentation models can parse them directly, we unlock automation opportunities that don't require additional annotation.

**3. Democratized access.** Rare pathologies and unusual anatomical variants are poorly served by fixed-label models. Text-prompted segmentation could enable on-demand delineation of structures that would never make it into a standard training set.

**4. Interactive refinement.** Clinicians can iteratively refine segmentations using natural language: *"just the left kidney"*, *"exclude the cyst"*, *"include the adrenal gland."*

## Getting Started with VoxTell

The team has made VoxTell fully open-source and easy to use:

```bash
pip install voxtell
```

**Command-line inference:**
```bash
voxtell-predict -i scan.nii.gz -o output/ -m /path/to/model -p "liver" "spleen" "pancreas"
```

**Python API:**
```python
from voxtell.inference.predictor import VoxTellPredictor

predictor = VoxTellPredictor(model_dir="/path/to/model", device="cuda")
masks = predictor.predict_single_image(image, ["right kidney", "left kidney"])
```

There's also a [napari plugin](https://github.com/MIC-DKFZ/napari-voxtell) for interactive exploration and a community-built [web interface](https://github.com/gomesgustavoo/voxtell-web-plugin).

Model weights are available on [Hugging Face](https://huggingface.co/mrokuss/VoxTell).

## The Road Ahead

VoxTell represents progress, not perfection. Open questions remain:

- How do we handle ambiguous prompts where multiple interpretations are valid?
- Can we extend this framework to incorporate spatial prompts (points, boxes) alongside text?
- What's the ceiling for cross-modality generalization, and how do we push it further?

The CVPR acceptance is a milestone, but the work continues. The goal remains a truly universal medical image understanding system—one that reasons about anatomy and pathology the way clinicians do, in the rich and flexible language of medicine.

## Resources

- 📄 **Paper:** [arXiv:2511.11450](https://arxiv.org/abs/2511.11450)
- 💻 **Code:** [github.com/MIC-DKFZ/VoxTell](https://github.com/MIC-DKFZ/VoxTell)
- 🧩 **Napari Plugin:** [github.com/MIC-DKFZ/napari-voxtell](https://github.com/MIC-DKFZ/napari-voxtell)
- 🌐 **Web Interface:** [github.com/gomesgustavoo/voxtell-web-plugin](https://github.com/gomesgustavoo/voxtell-web-plugin)
- 🤗 **Model Weights:** [huggingface.co/mrokuss/VoxTell](https://huggingface.co/mrokuss/VoxTell)

---

*Congratulations to all co-authors: Maximilian Rokuss, Moritz Langenberg, Yannick Kirchhoff, Fabian Isensee, Benjamin Hamm, Constantin Ulrich, Sebastian Regnery, Lukas Bauer, Efthimios Katsigiannopulos, Tobias Norajitra, and Klaus Maier-Hein. It's been an honor to be part of this work.*
