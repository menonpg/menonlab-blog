---
title: "AlphaRustyRAG: Sub-Second RAG in Rust — What's Actually Making It Fast"
description: "A new open-source RAG API answers questions across 1,000 PDFs in 160ms. But is it Rust, or something else? Breaking down where the speed actually comes from."
date: "2026-02-27"
tags: ["rag", "rust", "llm", "performance", "groq", "vector-search"]
---

A project called [AlphaRustyRAG](https://github.com/AlphaCorp-AI/AlphaRustyRAG) just dropped, claiming sub-second RAG responses across 1,000 PDFs. The headline numbers:

- **160ms** time-to-first-token (server-side)
- **< 700ms** total completion with 3 cited sources
- **< 1 second** end-to-end from Brazil to a US server

For context, most production RAG systems I've seen take 2-5 seconds before the user sees a single token. So 160ms is genuinely impressive.

But here's the question worth asking: **Is Rust the reason it's fast?**

## The Architecture

AlphaRustyRAG collapses the entire RAG pipeline into a single async Rust binary:

```
Document Upload → Chunking → Cohere Embeddings → Milvus Storage
                                    ↓
User Query → Embed Query → Milvus HNSW Search → Groq LLM → SSE Stream
```

Everything runs in one process: Actix-web for the API, Cohere for embeddings, Milvus for vector search, Groq for LLM streaming. No microservice hops.

## Where the Speed Actually Comes From

Let's break down the 160ms TTFT:

### 1. Groq's LPU (Biggest Factor)

The project uses [Groq](https://groq.com) for LLM inference. Groq's Language Processing Unit delivers tokens 10-20x faster than GPU-based providers. A Python app using Groq would also be fast.

This isn't a knock — choosing Groq is smart. But it's not a Rust advantage.

### 2. Single-Process Architecture (Real Contribution)

Most RAG stacks look like this:

```
API Gateway → Embedding Service → Vector DB Wrapper → LLM Orchestrator → Response
     ↓              ↓                    ↓                  ↓
   20ms           50ms                 30ms               50ms         = 150ms overhead
```

Each hop adds latency: network round-trips, serialization, connection pooling. Even on localhost, you're burning 10-30ms per service boundary.

AlphaRustyRAG eliminates this by keeping everything in one process. The embedding call goes directly to Cohere's API. The vector search hits Milvus directly. No internal network hops.

**This is a legitimate architectural win**, and Rust makes it easier to build high-performance single-binary applications. But you could achieve similar results with Go, or even well-optimized Node.js.

### 3. Milvus HNSW (Industry Standard)

The vector search uses Milvus with HNSW indexing — the same setup everyone uses. HNSW is fast regardless of what language calls it. Sub-10ms searches on 27K chunks are expected, not exceptional.

### 4. Cohere's Light Embeddings (Tradeoff)

They're using `embed-english-light-v3.0` at 384 dimensions. This is:
- **Fast**: Smaller vectors = faster similarity computation
- **Lower quality**: Full embeddings (1024+ dims) capture more semantic nuance

For many use cases, the light model is fine. But if you need high retrieval accuracy on complex queries, you might sacrifice some speed for better embeddings.

## What's Missing: Accuracy

The benchmarks show latency. They don't show accuracy.

Fast but wrong isn't useful. I'd want to see:
- Retrieval precision/recall on the Open RAG Bench queries
- Answer correctness compared to ground truth
- How often the cited sources are actually relevant

This isn't a criticism unique to AlphaRustyRAG — most RAG projects lead with speed metrics. But in production, I've seen 200ms systems that return garbage and 3-second systems that nail every answer.

## What's Genuinely Good

Despite my caveats, this project does several things right:

**Production-ready features:**
- JWT authentication with Argon2id password hashing
- OpenAPI 3.0 docs with Swagger UI
- SSE streaming with sources delivered as a leading event
- Concurrent document ingestion (8 workers, batched embeddings)
- ZIP upload support for bulk ingestion

**Clean code:**
- Single binary deployment
- Docker Compose for infrastructure (Postgres + Milvus)
- Environment-based configuration
- Actual error handling (not just `.unwrap()` everywhere)

**Sensible defaults:**
- 500-word chunks with 50-word overlap
- Top-K retrieval with 3 sources
- Cosine similarity (the right choice for normalized embeddings)

## When Would You Use This?

**Good fit:**
- You need fast RAG and can accept Groq/Cohere vendor lock-in
- You want a single deployable binary (easier ops than microservices)
- Your accuracy requirements are "good enough" (internal tools, prototypes)
- You're already in the Rust ecosystem

**Not ideal:**
- You need to run fully on-prem (Groq and Cohere are cloud APIs)
- You need maximum retrieval accuracy (might want better embeddings + reranking)
- Your team doesn't know Rust (maintenance burden)

## The Bigger Lesson

The real insight isn't "use Rust for RAG." It's:

**Collapse your pipeline.**

Every service boundary costs 10-50ms. If your RAG stack has:
- Separate embedding service
- Vector DB with a REST wrapper
- LLM gateway/orchestrator
- Multiple API gateways

...you're paying 100-200ms in overhead before any real work happens.

AlphaRustyRAG proves that a well-optimized monolith can beat a microservice architecture on latency. That lesson applies regardless of language.

## Try It Yourself

```bash
git clone https://github.com/AlphaCorp-AI/AlphaRustyRAG
cd alpharust
cp .env.example .env
# Add your GROQ_API_KEY and COHERE_API_KEY
docker compose up -d
cargo run --release
```

Upload some documents, hit the `/chat-rag/stream` endpoint, and see sub-second responses.

The code is clean, the benchmarks are real, and if nothing else, it's a great reference for how to structure a high-performance RAG system.

---

**Links:**
- [AlphaRustyRAG on GitHub](https://github.com/AlphaCorp-AI/AlphaRustyRAG)
- [Open RAG Bench Dataset](https://drive.google.com/drive/u/1/folders/18q_zokgsrMsL-Xfx4OcYST1DLb8TNzYY) (1,000 PDFs used for testing)
- [Groq Console](https://console.groq.com/) (LPU-powered inference)
- [Cohere Dashboard](https://dashboard.cohere.com/) (embeddings API)
