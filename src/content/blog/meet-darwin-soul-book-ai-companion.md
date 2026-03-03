---
title: "Meet Darwin: Your AI Guide to the Soul Book"
description: "We built an AI companion to help readers explore 'Soul: Building AI Agents That Remember Who They Are.' The twist? Darwin is built with the same technology the book teaches — we're eating what we cook."
date: "2026-03-03"
tags: ["soul-py", "ai-agents", "book", "demo", "memory", "rag", "rlm"]
---

There's something delightfully recursive about building an AI companion for a book about AI memory.

The book is called *Soul: Building AI Agents That Remember Who They Are*. It teaches you how to give AI agents persistent identity and memory. And the companion we built to help readers explore the book? It's built using exactly those techniques.

We're eating what we cook.

Meet **Darwin**.

## The Backstory: Why We Built soul.py

Every developer building with Large Language Models hits the same wall. You spend an hour configuring your AI assistant — explaining your preferences, your project context, your working style. The AI becomes genuinely helpful. It understands you.

Then the conversation ends. Or the context window fills up. Or the app restarts.

And everything is gone.

This is the problem [soul.py](https://github.com/menonpg/soul.py) solves. It's a Python library that gives any LLM persistent identity and memory using two simple markdown files:

- **SOUL.md** — who the agent is (personality, values, constraints)
- **MEMORY.md** — what the agent knows (experiences, facts, conversation history)

When we [first released soul.py](/blog/soul-py-persistent-memory-llm-agents), the response was overwhelming. The post hit **#1 on r/ollama** with over 50,000 views in 48 hours. Developers were hungry for a simple solution to AI memory that didn't require setting up databases or complex infrastructure.

The library evolved through three versions:

| Version | Architecture | What It Does |
|---------|--------------|--------------|
| v0.1 | Simple injection | Injects entire SOUL.md + MEMORY.md into context |
| v1.0 | RAG retrieval | Uses semantic search to find relevant memories |
| v2.0 | [Hybrid RAG + RLM](/blog/soul-py-v2-rag-rlm-hybrid) | Automatically routes queries to the right retrieval method |

The v2.0 architecture deserves explanation because it's what Darwin uses.

## RAG vs RLM: Why Darwin Uses Both

**RAG** (Retrieval-Augmented Generation) is how most AI systems handle large knowledge bases. You embed your documents into vectors, store them in a database, and retrieve the most relevant chunks when a user asks a question. It's fast and efficient for focused queries.

But RAG has blind spots. Ask "What's the book's return policy?" and RAG excels — it finds the relevant section and answers quickly. Ask "What are all the themes that connect the chapters?" and RAG struggles — that answer isn't in any single chunk, it requires reasoning across the entire book.

**RLM** (Reasoning over the Language Model's full context) takes a different approach. Instead of retrieving chunks, it processes larger sections of the knowledge base and reasons across them. It's slower and more expensive, but it handles synthesis questions that RAG can't.

The insight behind [our hybrid architecture](/blog/rag-plus-rlm-complete-knowledge-base-architecture) is that most queries (~90%) are focused and work great with RAG. But some queries (~10%) genuinely need exhaustive reasoning. A smart router can detect which type of query you're asking and route it accordingly.

Darwin uses this hybrid approach. Ask "What goes in SOUL.md?" and it retrieves the relevant section instantly (RAG). Ask "How does the book's philosophy compare to other approaches to AI memory?" and it reasons across multiple chapters (RLM).

## Giving a Book a Soul

Here's where it gets meta.

We wrote a book teaching people how to give AI agents persistent identity. Then we thought: what if we gave the book itself a soul?

Darwin isn't just a chatbot with the book pasted into its prompt. It's a genuine soul.py agent:

**Darwin has a SOUL.md** that defines its identity:
- A knowledgeable guide to the Soul book
- Patient with beginners, precise with technical details
- Genuinely enthusiastic about persistent AI memory
- Named after Charles Darwin, whose ideas about evolution through accumulated adaptation inspired Chapter 12

**Darwin has a MEMORY.md** that grows over time. Ask it a question, and it remembers the conversation. Come back later, and it recalls what you were exploring. The memory persists across sessions — exactly as the book describes.

**Darwin uses the v2.0 hybrid retrieval** to answer questions. The entire book is its knowledge base, indexed and searchable. When you ask something, Darwin's router decides whether to retrieve specific sections (RAG) or reason across chapters (RLM).

You're not just reading about persistent AI memory. You're experiencing it.

This is what "eating what you cook" means. We didn't build a demo with different technology than what we teach. Darwin is proof that the architecture works — a living demonstration of every concept in the book.

## What You Can Ask Darwin

Darwin knows the book deeply. Some things to try:

**Conceptual questions:**
- "Why does soul.py separate identity from memory?"
- "What's the difference between RAG and RLM?"
- "What does the Oliver Sacks case study teach us about AI identity?"

**Technical questions:**
- "Show me how to initialize a soul.py agent"
- "What goes in SOUL.md versus MEMORY.md?"
- "How does the hybrid query router decide which retrieval method to use?"

**Philosophical questions:**
- "What does the book say about the Ship of Theseus?"
- "Can AI agents have genuine identity, or is it just simulation?"
- "What are the ethical implications of persistent AI memory?"

**Meta questions:**
- "How are you built, Darwin?"
- "What's in your SOUL.md?"
- "Do you remember our last conversation?"

Darwin answers based on the book's content, but it also demonstrates the concepts through its own behavior. Ask it about memory persistence, then close your browser, come back tomorrow, and ask "What were we discussing?" It'll remember.

## Try It Yourself

**[→ Talk to Darwin at soul-book.themenonlab.com](https://soul-book.themenonlab.com)**

The demo is free and requires no signup. Darwin runs on the [RAG + RLM hybrid architecture](/blog/soul-py-v2-rag-rlm-hybrid) described in the book, using the book itself as its knowledge base.

If you find the conversation valuable, the full book goes much deeper:

**[→ Get "Soul: Building AI Agents That Remember Who They Are" on Amazon](#)** *(link coming soon)*

The book includes complete code examples, architectural diagrams, the philosophy behind persistent AI identity, and advanced topics like multi-agent memory sharing and Darwinian evolution of agent identity that Darwin can only summarize.

## Build Your Own Darwin

Darwin is built with [soul.py](https://github.com/menonpg/soul.py), the same open-source library the book teaches. If you want to build your own AI companion — for your documentation, your product, your knowledge base — everything you need is available:

- **Library:** `pip install soul-agent` ([PyPI](https://pypi.org/project/soul-agent/))
- **Source:** [github.com/menonpg/soul.py](https://github.com/menonpg/soul.py)
- **Docker:** [soul-stack](https://hub.docker.com/r/pgmenon/soul-stack) for n8n + soul.py in one container
- **Patterns:** [7 RAG Patterns You Need to Know](/blog/7-rag-patterns-2026)

Two files. Any LLM. Your AI finally remembers.

---

*Darwin is waiting at [soul-book.themenonlab.com](https://soul-book.themenonlab.com). Ask it anything about the book — or about itself. And if you want to understand how it works at a deeper level, the book explains everything.*

---

## Related Posts

- [soul.py: Persistent Memory for LLM Agents](/blog/soul-py-persistent-memory-llm-agents) — The original v0.1 announcement
- [soul.py v2.0: RAG + RLM Hybrid Architecture](/blog/soul-py-v2-rag-rlm-hybrid) — How the query router works
- [RAG + RLM: The Complete Knowledge Base Architecture](/blog/rag-plus-rlm-complete-knowledge-base-architecture) — Deep dive on when to use each approach
- [The Darwinian Agent: What Evolution Teaches Us About AI Memory](/blog/soul-py-darwin-evolution-agent-identity) — Why we named the companion Darwin
