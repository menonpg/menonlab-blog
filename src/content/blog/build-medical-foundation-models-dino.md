---
title: "Build Your Own Medical Foundation Model: A DINO-Based Blueprint"
description: "How researchers are creating domain-specific foundation models from DINOv2. A practical guide using RedDino as a case study, applicable to cardiac imaging, pathology, and beyond."
date: "2026-02-21"
tags: ["foundation-models", "medical-imaging", "self-supervised-learning", "DINOv2", "computer-vision"]
---

# Build Your Own Medical Foundation Model: A DINO-Based Blueprint

A team at University of Cagliari just released [RedDino](https://github.com/Snarci/RedDino)—a foundation model for red blood cell analysis trained on 1.25 million images. It beats DINOv2, ResNet, and every other baseline on RBC classification.

But here's what's actually interesting: **the methodology is completely transferable**. The same approach works for ascending aortic morphology, cardiac MRI analysis, coarctation detection, retinal imaging, histopathology—basically any medical imaging domain where you can collect enough unlabeled data.

This post breaks down exactly how they did it, and how you can apply the same blueprint to your own medical imaging problem.

## The Core Insight: Self-Supervised Learning Changes Everything

Traditional medical AI requires labeled data. Lots of it. Expert annotations. IRB approvals. Years of collection.

Self-supervised learning flips this: **you train on unlabeled images, then adapt to labeled tasks**. The model learns rich representations by solving pretext tasks (like predicting missing patches or matching augmented views of the same image), and those representations transfer beautifully to downstream classification, segmentation, and detection.

DINOv2 from Meta is the current state-of-the-art for this. It was trained on 142 million curated images and produces embeddings that work remarkably well across diverse vision tasks—often matching or beating supervised models with zero fine-tuning.

The RedDino insight: **take DINOv2's training framework, but train it on domain-specific data**. The result is a foundation model that understands your domain deeply.

## The RedDino Methodology (Generalized)

Here's what they actually did, stripped of RBC-specific details:

### Step 1: Collect Massive Unlabeled Data

RedDino aggregated **18 different datasets** totaling 50,000+ original images from 420+ patients. After preprocessing, they extracted 1.25 million training patches.

**Key decisions:**
- **No labels required for pretraining** — this is the power of self-supervised learning
- **Diverse sources** — different imaging equipment, protocols, staining techniques
- **Mixed populations** — healthy and pathological samples together

**For your domain:** You don't need labeled data for the pretraining phase. Gather everything you can—clinical archives, research datasets, multi-center studies. Diversity is more important than labels.

### Step 2: Extract Consistent Training Units

RedDino compared two approaches:
1. **Individual segmented cells** — cropped out each RBC
2. **Fixed-size patches** — non-overlapping 224×224 patches from smear images

**Patches won decisively.** Why? They preserve spatial context, capture relationships between cells, and are simpler to extract at scale.

**For cardiac imaging (e.g., aortic morphology):**
- Extract patches from CT/MRI slices
- Include patches with and without the structure of interest
- Consider multi-scale patches (different zoom levels)

**For histopathology:**
- Patch-based extraction at multiple magnifications
- Standard sizes (224×224 or 256×256) work well
- Don't overthink segmentation—raw patches often work better

### Step 3: Domain-Specific DINOv2 Adaptations

This is where RedDino's technical innovations matter. They modified DINOv2's default training in two critical ways:

#### Modification 1: Remove the Koleo Regularizer

DINOv2 uses a regularization term (Koleo) that enforces uniform feature distribution—preventing feature collapse where everything maps to the same embedding.

**The problem:** In medical imaging, your subjects are *naturally uniform*. Red blood cells mostly look alike. Healthy ascending aortas mostly look alike. The Koleo regularizer was *suppressing* the pathological variations that actually matter.

**The fix:** Remove it. Let abnormal cases (sickle cells, dilated aortas, malaria-infected cells) stand out in the embedding space.

**When to apply this:** If your domain has a "normal" baseline with rare pathological variants, removing Koleo likely helps.

#### Modification 2: Replace Centering Method

They switched from moving average centering to **Sinkhorn-Knopp centering**, which improved representation quality for their domain.

This is more technical, but the principle matters: **DINOv2's defaults are optimized for natural images**. Medical images have different statistics. Experiment with the centering mechanism.

### Step 4: Custom Augmentation Pipeline

Standard DINOv2 augmentations include things like color jittering and random crops. RedDino replaced pixel-level augmentations with **32 domain-appropriate augmentations** from the Albumentations library:

- Brightness/contrast variations (mimicking different microscope settings)
- Blur (mimicking focus variations)
- Noise injection (mimicking sensor noise)
- Geometric transforms appropriate to the domain

**For cardiac imaging:** Consider augmentations that mimic:
- Different scanner manufacturers
- Breathing motion artifacts
- Slice thickness variations
- Contrast timing differences

**The principle:** Your augmentations should reflect real-world variation in your imaging pipeline.

### Step 5: Train at Scale

RedDino trained for 2,000 iterations on their 1.25M patch dataset, producing models from 22M to 304M parameters (small, base, large variants).

**Hardware reality:** They used serious compute. But you can start smaller:
- Fine-tune from DINOv2 pretrained weights (not from scratch)
- Use a smaller model variant (ViT-Small)
- Train on fewer iterations, evaluate, adjust

## Applying This to Cardiac Imaging

Let's make this concrete. Say you want to build a foundation model for **ascending aortic morphology**—detecting dilation, aneurysms, coarctation patterns.

### Data Collection Strategy

**Unlabeled data sources:**
- Clinical CT/MRI archives (no labels needed)
- Research datasets (even if labeled differently)
- Multi-center studies
- Different scanner manufacturers

**Target:** 500K-2M patches minimum for meaningful pretraining.

**Patch extraction:**
- 224×224 patches from axial slices at the aortic level
- Include mediastinal context (don't crop too tight)
- Multiple patients, multiple timepoints if available

### Domain Adaptations

**Remove Koleo?** Probably yes—normal aortas dominate the distribution, and you want pathological dilation to stand out.

**Augmentations to add:**
- Windowing variations (different HU windows)
- Simulated motion blur
- Scanner-specific noise patterns
- Orientation variations (patient positioning)

**Augmentations to avoid:**
- Extreme color jittering (CT is grayscale/windowed)
- Random cropping that loses anatomical context

### Evaluation Strategy

Once pretrained, evaluate your foundation model by:

1. **Linear probing:** Freeze the backbone, train a linear classifier on a small labeled set. High accuracy = good representations.

2. **k-NN classification:** No training at all—classify based on nearest neighbors in embedding space. Tests raw embedding quality.

3. **Few-shot learning:** Can you classify with 10 labeled examples per class? 50? This measures practical utility.

## The Broader Pattern

RedDino follows a pattern emerging across medical imaging:

| Domain | Foundation Model | Training Data | Key Adaptation |
|--------|------------------|---------------|----------------|
| RBC Analysis | RedDino | 1.25M patches | Remove Koleo, custom augmentations |
| White Blood Cells | DinoBloom | Multi-source hematology | Domain-specific pretraining |
| X-Ray Analysis | XRay-DINO | Chest X-ray archives | Holistic SSL approach |
| Surgical Video | Surgical-DINO | Endoscopy footage | Adapter learning for depth |
| Cardiac MRI | (emerging) | Left atrial segmentation | DINOv2 fine-tuning |

The playbook is consistent:
1. Collect large unlabeled domain data
2. Train or fine-tune DINOv2
3. Make domain-specific modifications
4. Release models for the community

## Practical Starting Points

### If you have <100K images:
**Fine-tune DINOv2** rather than training from scratch. Use the pretrained weights and adapt:

```python
import timm
import torch

# Load pretrained DINOv2
model = timm.create_model("vit_small_patch14_dinov2.lvd142m", pretrained=True)

# Replace the head for your task
model.head = torch.nn.Linear(model.head.in_features, num_classes)

# Fine-tune with your data
```

This is often enough for strong results without the compute requirements of full pretraining.

### If you have 100K-1M images:
**Continue pretraining** DINOv2 on your domain data:
- Start from DINOv2 weights
- Run additional self-supervised training
- Then fine-tune for downstream tasks

### If you have >1M images:
**Consider training from scratch** with domain-specific modifications (like RedDino did). This requires significant compute but produces the best domain-specific representations.

## Why This Matters

Foundation models are eating medical imaging. The first movers in each domain (hematology, radiology, pathology, ophthalmology) are establishing benchmarks that become hard to beat.

But the methodology is accessible:
- **DINOv2's code is open source**
- **Self-supervised learning doesn't need labels**
- **Domain expertise matters more than ML expertise**

If you have access to a large medical imaging archive and domain knowledge about what variations matter, you have what you need to build a foundation model.

RedDino proves it works. The question is: what domain will you apply it to?

---

*Interested in building foundation models for medical imaging? The Menon Lab works on applied AI for healthcare. [Reach out](mailto:prahlad.menon@gmail.com).*
