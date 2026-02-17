---
title: "Medical SAM 2: 3D Medical Image Segmentation with Meta's Foundation Model"
date: "2024-11-12"
tags: ["healthcare-ai", "computer-vision", "open-source"]
---

Meta's Segment Anything Model 2 (SAM2) made waves for its ability to segment objects in images and videos with minimal prompting. But medical imaging has unique challenges—3D volumes, subtle tissue boundaries, and the need for clinical-grade accuracy.

**Medical SAM 2 (MedSAM-2)** adapts SAM2 specifically for medical imaging, treating 3D scans as videos to leverage SAM2's temporal understanding.

## The Clever Insight

Medical CT and MRI scans are 3D volumes—stacks of 2D slices. SAM2 was designed for video, which is also sequential 2D frames. MedSAM-2 exploits this similarity: feed a 3D scan as a "video" and let SAM2's architecture handle slice-to-slice consistency automatically.

This means you can:
- Segment a structure in one slice
- Have it automatically propagate through the entire volume
- Get consistent 3D segmentations without slice-by-slice annotation

## Getting Started

```bash
conda env create -f environment.yml
conda activate medsam2
bash download_ckpts.sh  # Get SAM2 checkpoints
```

For 3D abdomen segmentation:
```bash
python train_3d.py -net sam2 -exp_name BTCV_MedSAM2
```

For 2D cases (like fundus images):
```bash
python train_2d.py -net sam2 -exp_name REFUGE_MedSAM2
```

## Pre-trained Weights

They've released pre-trained weights on [HuggingFace](https://huggingface.co/jiayuanz3/MedSAM2_pretrain/tree/main), so you can fine-tune on your specific imaging modality without starting from scratch.

## Applications

- **Organ segmentation** in CT/MRI
- **Tumor delineation** for treatment planning
- **Vessel segmentation** for surgical planning
- **Ophthalmic imaging** (fundus, OCT)
- **Any 3D medical imaging task** that benefits from SAM2's foundation

## Why This Matters

Medical image segmentation has traditionally required:
1. Expensive manual annotation by radiologists
2. Modality-specific models that don't generalize
3. Extensive training data for each new task

Foundation models like SAM2 promise to change this—pre-train once on massive data, then adapt quickly to new tasks with minimal examples.

MedSAM-2 is early evidence that this transfer works for medical imaging. The "video as 3D volume" insight is elegant and the results are promising.

## My Take

I've followed medical imaging AI for years, and the field has been waiting for a true foundation model. MedSAM-2 isn't quite there yet—it still needs domain-specific training—but it demonstrates that adapting general vision models to medicine is viable.

For researchers and clinicians building segmentation tools, this is worth evaluating against your current pipeline. The few-shot capabilities could dramatically reduce annotation burden.

**Links:**
- [GitHub](https://github.com/ImprintLab/Medical-SAM2)
- [Paper](https://arxiv.org/abs/2408.00874)
- [Pre-trained Weights](https://huggingface.co/jiayuanz3/MedSAM2_pretrain/tree/main)
