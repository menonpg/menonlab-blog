---
title: "VoxTell: How Text-Guided Segmentation Just Leapfrogged the SAM Family"
description: "A deep technical analysis of VoxTell's CVPR 2026 paper—comparing it to SAM, MedSAM, SAM-Med3D, and TotalSegmentator, with practical guidance on when and how to use it."
date: "2026-02-24"
tags: ["medical-imaging", "computer-vision", "deep-learning", "CVPR", "segmentation", "vision-language"]
---

The DKFZ team just dropped something significant: **VoxTell has been accepted to CVPR 2026**, and it represents a genuine paradigm shift in how we approach 3D medical image segmentation.

I've spent the past few days digging through the paper, the code, and running comparisons. Here's my analysis of what VoxTell actually achieves, how it stacks up against existing approaches, and whether it belongs in your clinical or research pipeline.

## The Core Innovation: From Prompts to Prose

Let me be direct about what makes VoxTell different from everything else in the medical segmentation landscape.

**SAM and its descendants** (MedSAM, SAM2, MedSAM2, SAM-Med3D) are *spatially prompted*. You click a point, draw a box, or scribble on the image. The model segments what you pointed at. This works, but it requires someone to interact with every case.

**TotalSegmentator and nnU-Net** are *fixed-vocabulary*. They segment predefined anatomical structures—104 classes for TotalSegmentator, whatever you trained nnU-Net on for your task. Powerful, but rigid.

**VoxTell is *linguistically prompted***. Type "liver" and it segments the liver. Type "2.3 cm ground-glass opacity in the right lower lobe" and it attempts to segment exactly that finding. Type a sentence from a radiology report—actual clinical prose—and it tries to parse and localize.

This isn't just a different interface. It's a fundamentally different capability.

## How VoxTell Works: Multi-Stage Vision-Language Fusion

The architecture is where VoxTell earns its CVPR acceptance. Previous text-guided segmentation models (BioMedParse, SAT) perform what I'd call "late fusion"—text embeddings meet image features only at the final decoding stage. This limits the model's ability to handle spatially grounded queries.

VoxTell takes a different approach:

### The Encoder Stack
- **Image Encoder:** A UNet-style 3D encoder—not a transformer. The DKFZ team (including Fabian Isensee, the nnU-Net author) knows that UNets still dominate volumetric medical imaging benchmarks. They didn't fight that reality.
- **Text Encoder:** Qwen3-Embedding-4B, frozen. A 4-billion parameter embedding model that captures semantic relationships between anatomical concepts.

### The Fusion Strategy
Here's the key innovation: at *every resolution scale* of the decoder, text embeddings modulate volumetric features through channel-wise dot products. This happens at the coarsest features (where the model reasons about "which lung?") all the way to the finest features (where it delineates precise boundaries).

They also apply deep supervision at every decoder stage—forcing the model to produce prompt-conditioned predictions at multiple resolutions. This isn't just regularization; it compels the model to align text and image features throughout the hierarchy.

### Why This Matters
Consider the query "lesion in the right lung" vs. "lesion in the left lung." In a late-fusion model, both queries would produce similar intermediate features until the very end. In VoxTell, the text embedding influences the *entire* feature pyramid, allowing spatial reasoning to happen at multiple scales.

## The Training Data: Scale Matters

VoxTell was trained on:
- **62,000+ volumetric scans** from 158 public datasets
- **1,087 anatomical and pathological concepts**
- **9,682 rewritten labels** (synonyms, clinical variations, hierarchical aggregates)
- **CT, MRI, and PET modalities**

For context:
- SAM-Med3D: 22K images, 143K masks, 245 categories
- TotalSegmentator: 1,204 images, 104 structures
- MedSAM2: 455K 3D image-mask pairs (impressive, but point/box prompted)

The vocabulary expansion is particularly clever. They used an LLM to generate anatomically precise variants ("right kidney" → "right renal organ", "dexter kidney") and hierarchical aggregates (combining "left rib 1" through "left rib 12" into "left rib cage"). During training, they sample from this expanded vocabulary with emphasis on canonical terms.

## Head-to-Head: VoxTell vs. The Field

### vs. SAM / MedSAM / SAM2 / MedSAM2

| Aspect | SAM Family | VoxTell |
|--------|-----------|---------|
| **Prompt Type** | Points, boxes, scribbles | Free-form text |
| **Interaction** | Per-case (or per-slice) | Zero-shot from description |
| **Batch Processing** | Requires automation layer | Native—just provide text |
| **Clinical Language** | N/A | Handles report prose |
| **Unseen Concepts** | Limited | Semantic generalization |

The SAM family excels when you have a human in the loop or when you're building interactive annotation tools. VoxTell excels when you want to automate segmentation based on textual descriptions—whether from structured ontologies or free-form reports.

### vs. SAM-Med3D

SAM-Med3D is the closest architectural cousin—both are fully 3D, both trained on large-scale data. But SAM-Med3D still requires spatial prompts (3D points). VoxTell's text interface enables use cases that point-prompting can't address:

- Segmenting structures described in radiology reports without manual localization
- Batch processing with varying target structures per case
- Handling synonyms and linguistic variation without retraining

### vs. TotalSegmentator / nnU-Net

TotalSegmentator remains the production workhorse for anatomical segmentation. It's fast, reliable, and covers 104 structures with high accuracy. But it's *closed-vocabulary*—if your target isn't in the 104 classes, you're out of luck.

VoxTell trades some reliability for flexibility. Early benchmarks show it matching or exceeding TotalSegmentator on common anatomies, while also handling:
- Rare pathologies not in any fixed label set
- Fine-grained substructures ("segment VII of the liver")
- Instance-specific descriptions ("the larger of the two nodules")

### vs. SAT (Segment Anything with Text)

SAT was the previous SOTA for text-prompted medical segmentation. Both use MaskFormer-style architectures. The key differences:

- **Fusion depth:** SAT performs single late-stage fusion; VoxTell fuses at every decoder stage
- **Training scale:** VoxTell roughly doubles the dataset and triples the vocabulary
- **Clinical language:** VoxTell explicitly benchmarks on radiotherapy report text; SAT doesn't

## Practical Use Cases

### 1. Report-Driven Automation
The killer app. Radiology reports already contain natural language descriptions of findings. If VoxTell can parse "1.8 cm spiculated mass in the posterior segment of the right upper lobe" and produce an accurate segmentation, you've eliminated the manual localization step in many workflows.

The DKFZ team tested this on a held-out radiotherapy cohort using report-derived prompts. VoxTell outperformed all prior text-promptable methods.

### 2. Flexible Batch Processing
Different clinical protocols require different structures. Instead of maintaining separate models or complex label mappings, you provide a list of text prompts:

```bash
voxtell-predict -i scan.nii.gz -o output/ -m /path/to/model \
  -p "liver" "spleen" "portal vein" "hepatic lesions"
```

### 3. Research on Rare Structures
Training a dedicated model for a rare anatomical variant or unusual pathology requires expensive annotation. VoxTell's semantic generalization may let you segment related concepts zero-shot—or at least provide a starting point for refinement.

### 4. Interactive Refinement
Combine with spatial prompts for a hybrid workflow: use text to get an initial segmentation, then refine with point corrections. The napari plugin makes this practical.

## Limitations and Caveats

Let me be honest about where VoxTell falls short:

**1. Ambiguous Prompts**
"Segment the tumor" works when there's one tumor. When there are multiple, VoxTell may segment all, one, or none unpredictably. Instance disambiguation from text alone is unsolved.

**2. Orientation Sensitivity**
The paper notes that images must be in RAS orientation for correct laterality. "Left kidney" will segment the right kidney if your DICOM metadata is wrong. This is a foot-gun waiting to happen in production.

**3. Extreme Spacing**
Performance degrades on images with unusual voxel spacing. High-resolution brain MRI may need resampling before inference.

**4. Inference Speed**
The 4B-parameter text encoder adds latency. For high-throughput pipelines, this may matter. TotalSegmentator remains faster for fixed anatomies.

**5. Not Yet Battle-Tested**
TotalSegmentator has thousands of production deployments. VoxTell is brand new. Expect edge cases.

## Getting Started

Installation is straightforward:

```bash
pip install voxtell
```

Download the model checkpoint:

```python
from huggingface_hub import snapshot_download

model_path = snapshot_download(
    repo_id="mrokuss/VoxTell",
    allow_patterns=["voxtell_v1.1/*", "*.json"]
)
```

Run inference:

```python
from voxtell.inference.predictor import VoxTellPredictor
import torch

predictor = VoxTellPredictor(
    model_dir=f"{model_path}/voxtell_v1.1",
    device=torch.device("cuda")
)

# From your NIfTI loader
masks = predictor.predict_single_image(image_array, [
    "liver",
    "right kidney", 
    "left kidney",
    "hepatocellular carcinoma"
])
```

For interactive exploration, the [napari plugin](https://github.com/MIC-DKFZ/napari-voxtell) is excellent.

## The Bottom Line

VoxTell is a genuine advance. It's not replacing TotalSegmentator for your production anatomy pipeline tomorrow—but it opens doors that spatial prompting cannot.

If you work with radiology reports, rare pathologies, or variable target structures, VoxTell deserves serious evaluation. If you're building annotation tools, the combination of text + spatial prompting could be powerful.

The CVPR acceptance is well-deserved. The DKFZ team—particularly Maximilian Rokuss, Moritz Langenberg, and the nnU-Net veterans—have produced something that will influence the field.

## Resources

- 📄 **Paper:** [arXiv:2511.11450](https://arxiv.org/abs/2511.11450)
- 💻 **Code:** [github.com/MIC-DKFZ/VoxTell](https://github.com/MIC-DKFZ/VoxTell)
- 🧩 **Napari Plugin:** [github.com/MIC-DKFZ/napari-voxtell](https://github.com/MIC-DKFZ/napari-voxtell)
- 🌐 **Web Interface:** [github.com/gomesgustavoo/voxtell-web-plugin](https://github.com/gomesgustavoo/voxtell-web-plugin)
- 🤗 **Model Weights:** [huggingface.co/mrokuss/VoxTell](https://huggingface.co/mrokuss/VoxTell)

---

*Congratulations to the entire DKFZ team on this acceptance. Looking forward to seeing where the community takes this.*
