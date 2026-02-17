---
title: "AutoFigure: Generate Publication-Ready Scientific Diagrams from Text"
date: "2026-02-16"
tags: ["ai-agents", "tools", "open-source"]
---

Creating figures for research papers is tedious. You know what you want to show, but translating that into a polished diagram means hours in draw.io, PowerPoint, or—if you're ambitious—TikZ.

**AutoFigure** generates publication-ready scientific illustrations from text descriptions or directly from research papers.

## How It Works

AutoFigure uses a dual-agent system with iterative refinement:

1. **Generate** — An LLM creates initial SVG/XML from your description
2. **Evaluate** — A critic agent scores quality (0-10) and provides feedback
3. **Refine** — Loop continues until the figure meets publication standards

This Review-Refine loop is key. First drafts are rarely perfect, but AutoFigure keeps improving until the diagram is actually usable.

## Two Modes

**Text-to-Figure** — Describe what you want:
```
"A flowchart showing the transformer architecture with 
attention mechanism, feed-forward layers, and residual connections"
```

**Paper-to-Figure** — Upload a PDF, and AutoFigure extracts the methodology and creates visual diagrams automatically. No manual description needed.

## Output Formats

- **SVG** — Vector graphics, scales perfectly
- **mxGraph XML** — Fully compatible with draw.io for manual editing

The draw.io compatibility is clever—you get AI-generated starting points that you can refine manually if needed.

## Getting Started

```bash
git clone https://github.com/ResearAI/AutoFigure.git
cd AutoFigure
pip install -e .
playwright install chromium
```

Basic usage:
```python
from autofigure import generate_figure

figure = generate_figure(
    description="Neural network architecture with encoder-decoder structure",
    output_format="svg"
)
```

There's also a web interface for interactive generation and editing.

## Why This Matters

Scientific communication relies heavily on figures. A good diagram can explain in seconds what takes paragraphs of text. But figure creation is a bottleneck:

- Researchers spend hours on diagrams instead of research
- Quality varies wildly based on design skills
- Iteration is slow when changes require manual redrawing

AutoFigure treats figure generation as a first-class AI task, not an afterthought.

## My Take

I've seen many "AI diagram generators" that produce unusable output. AutoFigure's iterative refinement approach is what makes it different—it actually critiques and improves its own work.

The paper-to-figure mode is particularly interesting for literature reviews. Feed it papers and get visual summaries without manually reading methodology sections.

**Links:**
- [GitHub](https://github.com/ResearAI/AutoFigure)
- [Paper (ICLR 2026)](https://openreview.net/forum?id=5N3z9JQJKq)
- [FigureBench Dataset](https://huggingface.co/datasets/WestlakeNLP/FigureBench)
