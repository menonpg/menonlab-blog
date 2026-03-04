---
title: "Open-Source Tools for Training Vision Language Models for Document Recognition"
description: "A practical guide to the best open-source VLM training tools for document OCR, including Qwen2.5-VL, PaddleOCR, GOT-OCR 2.0, and more—with architecture details, training requirements, and getting-started code."
date: "2026-03-04"
tags: ["machine-learning", "vlm", "ocr", "document-ai", "deep-learning"]
---

The document AI landscape has shifted dramatically. Traditional OCR pipelines—text detection, character recognition, post-processing—are giving way to end-to-end vision language models (VLMs) that treat document understanding as a unified vision-language task. For ML engineers building custom document recognition systems, several open-source tools now offer production-ready training pipelines.

This guide covers the most capable open-source VLMs for document recognition, with a focus on *trainability*—what it actually takes to fine-tune these models on your data.

## The New Architecture Paradigm

Modern document VLMs share a common structure: a vision encoder (typically ViT-based) paired with a language model decoder. The vision encoder processes document images at various resolutions, while the decoder generates structured text outputs (Markdown, HTML, JSON, or DocTags). This end-to-end approach eliminates the brittle handoffs between detection, recognition, and layout analysis that plagued traditional pipelines.

The key advantage for training: you can fine-tune on document-output pairs without separately annotating bounding boxes, reading order, or character-level labels.

## Top Training-Ready VLM Tools

### 1. Qwen2.5-VL (and the Fine-Tuning Ecosystem)

Alibaba's [Qwen2.5-VL](https://github.com/QwenLM/Qwen3-VL) has become the foundation model of choice for document OCR. It achieves top-tier scores on OCRBench and DocVQA while supporting grounding (bounding boxes) and multi-resolution inputs.

**Training Resource:** The [Qwen-VL-Series-Finetune](https://github.com/2U1/Qwen-VL-Series-Finetune) repository provides a complete training pipeline using HuggingFace and Liger-Kernel. It supports:

- Full fine-tuning and LoRA/QLoRA
- DeepSpeed ZeRO-2/3 for multi-GPU training
- DPO and GRPO training
- Mixed image/video datasets

**Getting Started:**

```bash
git clone https://github.com/2U1/Qwen-VL-Series-Finetune
cd Qwen-VL-Series-Finetune
pip install -r requirements.txt
pip install flash-attn --no-build-isolation
```

Dataset format follows LLaVA convention—JSON with conversations and image paths:

```json
[{
  "id": "doc_001",
  "image": "invoice_001.png",
  "conversations": [
    {"from": "human", "value": "<image>\nExtract all text from this invoice."},
    {"from": "gpt", "value": "Invoice #12345\nDate: 2024-01-15\nTotal: $1,250.00..."}
  ]
}]
```

**Hardware:** Fine-tuning the 7B model with LoRA requires ~24GB VRAM. Full fine-tuning needs 4×A100 80GB with DeepSpeed.

### 2. PaddleOCR-VL

[PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) has evolved from a traditional OCR toolkit into a full VLM solution. The new PaddleOCR-VL-0.9B achieves state-of-the-art document parsing while supporting 109 languages—all in a model small enough to train on consumer hardware.

**Key Features:**
- PP-StructureV3 for complex document layout analysis
- Built-in table, formula, and chart recognition
- Comprehensive training documentation with dataset preparation guides

**Training Data Requirements:** PaddleOCR's documentation recommends at least 500 annotated samples for detection fine-tuning and 5,000+ for recognition. The [training guide](https://github.com/PaddlePaddle/PaddleOCR/blob/release/2.7/doc/doc_en/training_en.md) covers dataset formatting, config modification, and multi-GPU training.

**Fine-Tuning Command:**

```bash
python tools/train.py -c configs/rec/PP-OCRv5/PP-OCRv5_rec.yaml \
  -o Global.pretrained_model=./pretrain_models/PP-OCRv5_rec \
  Train.dataset.data_dir=./your_data
```

### 3. GOT-OCR 2.0

The [General OCR Theory (GOT-OCR 2.0)](https://github.com/Ucas-HaoranWei/GOT-OCR2.0) model takes a unified approach: one architecture handles text, tables, formulas, charts, and scene text. It's OCR-free in the sense that there's no separate text detector—the model directly generates structured output from image pixels.

**Training Pipeline:** GOT provides DeepSpeed-based training scripts. The model supports post-training (stages 2-3) on the released weights:

```bash
deepspeed GOT/train/train_GOT.py \
  --deepspeed zero_config/zero2.json \
  --model_name_or_path ./GOT_weights/ \
  --bf16 True \
  --gradient_accumulation_steps 2 \
  --learning_rate 2e-5 \
  --num_train_epochs 1
```

**Alternative:** For easier fine-tuning, GOT is also supported in [ms-swift](https://github.com/modelscope/ms-swift), which provides LoRA training with minimal setup:

```bash
swift sft --model_type got-ocr2 \
  --model_id_or_path stepfun-ai/GOT-OCR2_0 \
  --sft_type lora \
  --dataset your_dataset
```

### 4. RolmOCR

[RolmOCR](https://huggingface.co/reducto/RolmOCR) by Reducto is a Qwen2.5-VL 7B fine-tune optimized specifically for OCR throughput. It strips away general VLM capabilities to focus purely on document transcription, achieving strong accuracy at lower computational cost.

**Best For:** Production deployments where you need VLM-quality OCR without the 30B+ parameter overhead. It's compatible with vLLM for fast inference. Training follows the same Qwen fine-tuning approach described above.

### 5. InternVL 2.5

[InternVL 2.5](https://github.com/OpenGVLab/InternVL) offers the widest range of model sizes (1B to 78B parameters), making it uniquely flexible. The smaller variants are trainable on single GPUs while the larger models compete with GPT-4V on document understanding benchmarks.

**Training:** InternVL provides fine-tuning scripts with support for LoRA, full fine-tuning, and various DeepSpeed configurations. The 1B-8B models are practical for most teams to train.

### 6. Granite-Docling

IBM's [Granite-Docling-258M](https://huggingface.co/ibm-granite/granite-docling-258M) is the smallest capable document VLM, outputting in DocTags format (an XML-like structure preserving layout semantics). At 258M parameters, it's trainable on a single GPU and supports prompt-based task switching—parse a full page or extract just formulas.

## Choosing the Right Tool

| Model | Size | Training Complexity | Best For |
|-------|------|---------------------|----------|
| Qwen2.5-VL + 2U1 repo | 2B-72B | Medium | Custom document types, production OCR |
| PaddleOCR-VL | 0.9B | Low | Multilingual, structured documents |
| GOT-OCR 2.0 | ~1B | Medium | Mixed content (formulas, charts, tables) |
| RolmOCR | 7B | Low (use as-is) | High-throughput transcription |
| Granite-Docling | 258M | Low | Edge deployment, limited compute |

## Training Data: The Real Challenge

The models are open. The weights are available. But training data remains the bottleneck. For document-specific fine-tuning, consider:

- **Synthetic generation:** [SynthDoG](https://github.com/clovaai/synthtiger) (NAVER, MIT License) generates diverse document images with annotations
- **Public datasets:** OmniDocBench, DocVQA, SROIE for receipts, PubMed-OCR for scientific documents
- **Semi-supervised:** Use a strong model (Qwen3-VL or Claude) to generate initial annotations, then human-correct

For specialized domains (medical records, legal contracts, historical documents), expect to annotate 1,000-5,000 samples for meaningful fine-tuning results.

## Conclusion

The open-source document VLM ecosystem has matured rapidly. Qwen2.5-VL with the 2U1 fine-tuning repo offers the most complete training pipeline. PaddleOCR-VL provides the best documentation and multilingual support. GOT-OCR 2.0 handles the widest range of document elements.

For most teams, the recommended path: start with RolmOCR or Qwen2.5-VL inference, identify failure cases, then fine-tune on domain-specific data using LoRA. The tooling is finally good enough that custom document AI is accessible to any team with annotated data and a few GPUs.

## References

- [Qwen-VL-Series-Finetune](https://github.com/2U1/Qwen-VL-Series-Finetune) - Training scripts for Qwen VL models
- [PaddleOCR](https://github.com/PaddlePaddle/PaddleOCR) - Comprehensive OCR toolkit with VLM support
- [GOT-OCR 2.0](https://github.com/Ucas-HaoranWei/GOT-OCR2.0) - Unified end-to-end OCR model
- [RolmOCR](https://huggingface.co/reducto/RolmOCR) - Optimized OCR fine-tune of Qwen2.5-VL
- [InternVL 2.5](https://github.com/OpenGVLab/InternVL) - Scalable vision-language model family
- [Granite-Docling](https://huggingface.co/ibm-granite/granite-docling-258M) - Compact document parsing model
- [HuggingFace OCR Guide](https://huggingface.co/blog/ocr-open-models) - Comprehensive model comparison
- [Modal OCR Comparison](https://modal.com/blog/8-top-open-source-ocr-models-compared) - Benchmark analysis
