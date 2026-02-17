---
title: "Paper-QA: Superhuman RAG for Scientific Literature"
date: "2024-12-03"
tags: ["rag", "ai-agents", "tools", "open-source"]
---

If you work with scientific papers, you know the pain: dozens of PDFs, each 20+ pages, scattered across your filesystem. Finding that one result you vaguely remember reading somewhere becomes an archaeology expedition.

**Paper-QA2** is a RAG system specifically designed for scientific literature—and according to their benchmarks, it achieves "superhuman" accuracy on scientific question answering.

## What Makes It Different

Most RAG systems treat documents as generic text. Paper-QA2 understands that scientific papers have structure: abstracts, methods, results, citations. It leverages this structure for better retrieval.

Key capabilities:
- **High-accuracy citations** — Every answer includes exact references
- **Multi-document reasoning** — Synthesizes across your entire paper collection
- **Contradiction detection** — Identifies conflicting claims across papers
- **Summarization** — Generates literature reviews from multiple sources

## Getting Started

```bash
pip install paper-qa
```

Basic usage:
```python
from paperqa import Settings, ask

answer = ask(
    "What are the main approaches to protein folding prediction?",
    settings=Settings(paper_directory="./papers/")
)
print(answer.formatted_answer)
```

Or via CLI:
```bash
pqa ask "What methods improve transformer efficiency?"
```

## The Algorithm

Paper-QA2 uses an agentic approach:
1. **Index papers** — Parse PDFs, chunk intelligently respecting section boundaries
2. **Search** — Retrieve relevant chunks across your collection
3. **Gather** — Pull additional context from promising sources
4. **Generate** — Synthesize an answer with proper citations
5. **Verify** — Check that citations actually support the claims

The agent can also decide when it needs more information and search for additional sources.

## Supported Formats

- PDFs (obviously)
- Text files
- Microsoft Office documents
- Source code files

## My Take

I've tried many RAG solutions for papers, and most fail at the basics: they hallucinate citations, miss relevant sections, or can't handle technical notation. Paper-QA2 is the first I've used that feels genuinely reliable.

The "superhuman" claim comes from their [2024 benchmark paper](https://paper.wikicrow.ai) where it outperformed human experts on scientific QA tasks. That matches my experience—it often finds connections I would have missed.

For anyone doing literature reviews, research, or just trying to stay on top of their reading list, this is worth setting up.

**Links:**
- [GitHub](https://github.com/Future-House/paper-qa)
- [Benchmark Paper](https://paper.wikicrow.ai)
- [PyPI](https://pypi.org/project/paper-qa/)
