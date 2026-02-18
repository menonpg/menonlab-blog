---
title: "DeepDoc: Deep Research on Your Local Documents Instead of the Internet"
description: "An open-source tool that applies deep research workflows to your own files—PDFs, Word docs, images—generating structured markdown reports without manual digging."
date: "2026-02-18"
tags: ["rag", "tools", "open-source", "research", "local-first"]
---

Most "deep research" tools are designed to crawl the web. But what if the answers you need are already sitting in your local files—scattered across PDFs, Word documents, and notes you've accumulated over months or years?

**DeepDoc** flips the script: it applies the same multi-agent research workflow to your *local* knowledge base instead of the internet.

## The Problem It Solves

You have hundreds of documents. Meeting notes, research papers, contracts, technical specs. The information is there, but finding and synthesizing it means manually opening files, searching, copying, and piecing things together.

DeepDoc automates this entire process. Give it a research question, point it at your files, and it generates a structured markdown report with citations back to your source documents.

## How It Works

The workflow mirrors what you'd do manually, but orchestrated by AI agents:

1. **Upload documents** — PDFs, DOCX, TXT, even images (JPG)
2. **Chunking** — Text is extracted and split into page-wise chunks
3. **Vector indexing** — Chunks go into Qdrant for semantic search
4. **Structure generation** — Based on your query, it proposes a report outline
5. **Human feedback loop** — You can refine the structure before research begins
6. **Multi-agent research** — For each section:
   - Knowledge generation agent creates context
   - Query generation agent formulates search queries
   - Search agents retrieve relevant chunks from your docs
   - Reflection agents refine and validate results
   - Section writer produces the final content
7. **Report compilation** — All sections are assembled into a clean markdown report

This isn't simple RAG. It's agentic research with iterative refinement—the kind of workflow that would take hours to do manually.

## Architecture Highlights

DeepDoc uses a sensible stack for local-first research:

| Component | Choice |
|-----------|--------|
| **Vector DB** | Qdrant (runs locally via Docker) |
| **Embeddings** | BAAI/bge-small-en-v1.5 (lightweight, effective) |
| **LLM** | OpenAI gpt-4o-mini by default (configurable) |
| **Orchestration** | Multi-agent workflow with reflection loops |

The configuration is straightforward—you can adjust search depth, number of reflections, and max queries per section.

## When Would You Use This?

**Research synthesis**: You've collected 50 papers on a topic. Ask DeepDoc to summarize the key findings with citations.

**Due diligence**: Point it at a folder of contracts or financial documents. Ask specific questions about terms, obligations, or risks.

**Knowledge management**: Consolidate insights from months of meeting notes into a structured brief.

**Competitive analysis**: Feed it your collection of competitor documents and get a comparative report.

The key differentiator is *local-first*. Your documents never leave your machine. For sensitive corporate or personal data, this matters.

## Getting Started

DeepDoc requires Python 3.9+, Docker (for Qdrant), and API keys for your LLM provider.

```bash
git clone https://github.com/Oqura-ai/deepdoc.git
cd deepdoc
uv venv && source .venv/bin/activate
cp .env.example .env  # Add your API keys
uv pip install -r requirements.txt
docker-compose up --build  # Start Qdrant
python main.py
```

The CLI walks you through uploading documents, defining your research question, and iterating on the report structure.

## Limitations

- **LLM dependency**: Still requires API calls to OpenAI/Mistral for the reasoning steps
- **Document parsing**: Complex layouts (tables, multi-column PDFs) may not extract perfectly
- **No GUI yet**: It's a CLI/script-based workflow

But for a focused tool that does one thing well—deep research on local docs—it's a solid starting point.

## Links

- **GitHub**: [github.com/Oqura-ai/deepdoc](https://github.com/Oqura-ai/deepdoc)
- **License**: MIT

---

*If you're building RAG applications, check out our breakdown of [7 RAG Patterns Ranked by Production Maturity](/blog/7-rag-patterns-2026/)—DeepDoc sits somewhere between Agentic RAG and full multi-agent orchestration.*
