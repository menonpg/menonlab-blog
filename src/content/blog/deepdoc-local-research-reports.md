---
title: "DeepDoc: Turn Your Local Files Into Research Reports With AI Agents"
description: "An open-source tool that performs deep research on your documents, not the internet — using a multi-agent workflow to generate structured markdown reports."
date: "2026-02-26"
tags: ["ai-agents", "rag", "research", "open-source", "local-first"]
---


What if you could point an AI at a folder of documents and say "write me a research report on this"?

Not a summary. Not a Q&A chatbot. An actual structured research report with sections, citations, and synthesized insights.

That's exactly what [DeepDoc](https://github.com/Oqura-ai/deepdoc) does.

## The Problem With Document RAG

Most RAG systems work like this: chunk your documents, embed them, retrieve relevant chunks, and stuff them into a prompt. You ask a question, you get an answer.

But what if you don't have a specific question? What if you want to *understand* a collection of documents — extract themes, identify patterns, and synthesize findings?

That's a research workflow, not a Q&A workflow. And it requires a fundamentally different approach.

## How DeepDoc Works

DeepDoc uses a multi-agent research pipeline that mimics how a human researcher would approach a document collection:

1. **Upload your files** — PDFs, DOCX, images, text files. The system extracts and chunks the content.

2. **Semantic indexing** — Chunks go into a Qdrant vector database for similarity search.

3. **Structure generation** — Based on your research query, the system proposes a report outline with sections and topics.

4. **Human-in-the-loop** — You can refine the structure before research begins.

5. **Multi-agent research** — For each section, specialized agents:
   - Generate domain knowledge
   - Create targeted search queries
   - Run retrieval over your chunked data
   - Use reflection agents to refine results
   - Write the section content

6. **Report compilation** — Section content flows to a final report writer that produces a cohesive markdown document.

This isn't RAG. It's agentic document research.

## The Architecture That Makes It Work

The key insight is separating *retrieval* from *research*. Traditional RAG conflates these — you retrieve to answer. DeepDoc retrieves to understand.

The reflection loop is particularly clever. After initial retrieval, agents evaluate whether they have enough information to write a section. If not, they generate new queries and search again. This iterative refinement mimics how researchers actually work: you don't stop at the first source you find.

The configuration exposes useful knobs:

```python
THREAD_CONFIG = {
    "configurable": {
        "max_queries": 3,      # Queries per section
        "search_depth": 2,     # Retrieval iterations
        "num_reflections": 2,  # Refinement passes
    }
}
```

More depth means better synthesis but slower generation. For a quick overview, keep it shallow. For serious research, crank it up.

## Running It Locally

The setup is straightforward if you're comfortable with Python:

```bash
git clone https://github.com/Oqura-ai/deepdoc.git
cd deepdoc
uv venv && source .venv/bin/activate
cp .env.example .env  # Add your API keys
uv pip install -r requirements.txt
docker-compose up --build  # Starts Qdrant
python main.py
```

You'll need API keys for OpenAI (or configure another provider in `configuration.py`) and optionally Mistral. The embedding model (BGE-small) runs locally.

## When To Use This

DeepDoc shines when you have:

- **A document collection** you need to understand holistically
- **A research question** that spans multiple sources
- **Time constraints** that make manual review impractical

Think: legal discovery, literature reviews, competitive analysis, due diligence research. Anywhere you'd normally spend hours reading and synthesizing.

It's less useful for simple Q&A (just use regular RAG) or real-time queries (the multi-agent pipeline has latency).

## The Bigger Picture

We're seeing a shift from "RAG as a feature" to "RAG as infrastructure." Tools like DeepDoc don't just retrieve — they reason, reflect, and synthesize. The vector database becomes one component in a larger agentic workflow.

This is where local-first AI gets interesting. Your documents stay on your machine. The research happens in your environment. You get structured output you can actually use.

If you're sitting on a pile of documents and wondering what's in them, give DeepDoc a try. The [GitHub repo](https://github.com/Oqura-ai/deepdoc) has everything you need to get started.

---

*DeepDoc is MIT licensed and actively maintained by Oqura AI.*
