---
title: "EdgeQuake: LightRAG in Rust for Multi-Hop Reasoning"
description: "A high-performance Graph-RAG implementation with 6 query modes, PDF vision pipeline, and MCP integration. When vector similarity isn't enough."
date: "2026-02-28"
tags: ["rag", "graph-rag", "rust", "knowledge-graph", "llm", "open-source"]
---

Vector similarity has a ceiling. Ask your RAG system "How does X relate to Y through Z?" and watch it fumble. The embeddings might find documents mentioning X and Z separately, but they can't trace the *path* between concepts. That's not a model problem—it's an architectural one.

[EdgeQuake](https://github.com/raphaelmansuy/edgequake) is a Rust implementation of the [LightRAG algorithm](https://arxiv.org/abs/2410.05779) designed specifically for these multi-hop reasoning queries. Instead of treating documents as bags of embeddings, it decomposes them into knowledge graphs—entities and relationships that can be traversed at query time.

## The Problem with Vector-Only RAG

Traditional RAG works like this: chunk documents, embed them, find the top-k most similar chunks to your query, stuff them into a prompt. This is fast and works well for direct lookups ("What is the capital of France?").

But it fails on:

- **Multi-hop reasoning** — "How does the supply chain disruption affect our Q3 revenue projections?"
- **Thematic questions** — "What are the major themes across these research papers?"
- **Relationship queries** — "Which team members have worked together on multiple projects?"

The core issue: vectors capture semantic similarity but lose structural relationships. Two chunks might both be relevant, but the *connection* between them—the reasoning path—is invisible to embedding search.

## How EdgeQuake Solves This

EdgeQuake builds a knowledge graph alongside your vector index. When you ingest a document:

1. **Entity Extraction** — LLM identifies people, organizations, locations, concepts, events, technologies, products (7 configurable types)
2. **Relationship Mapping** — LLM identifies how entities relate to each other
3. **Gleaning** — Multi-pass extraction catches 15-25% more entities than single-pass
4. **Community Detection** — Louvain clustering groups related entities for thematic queries
5. **Dual Indexing** — Both vector embeddings and graph structure are stored

At query time, the system can traverse *both* the vector space and the graph structure.

## The 6 Query Modes

This is where EdgeQuake gets interesting. Different questions need different retrieval strategies:

| Mode | Best For | Latency | How It Works |
|------|----------|---------|--------------|
| **Naive** | Keyword lookups | ~100-300ms | Pure vector similarity |
| **Local** | Specific relationships | ~200-500ms | Entity-centric + local graph neighborhood |
| **Global** | Thematic questions | ~300-800ms | Community-based semantic search |
| **Hybrid** | General queries (default) | ~400-1000ms | Combines Local + Global |
| **Mix** | Tunable blend | Variable | Weighted naive + graph with configurable ratios |
| **Bypass** | Non-RAG questions | ~50ms | Direct LLM, no retrieval |

**Naive** is your escape hatch when you just need fast similarity search. **Local** excels when you're asking about specific entities and their immediate connections. **Global** shines on big-picture questions that span communities of concepts. **Hybrid** is the safe default that balances both.

The **Mix** mode is particularly useful for tuning: you can dial between "mostly vector" and "mostly graph" based on your domain's characteristics.

## Performance Claims

EdgeQuake is written in Rust with an async-first Tokio architecture. The benchmarks are notable:

| Metric | EdgeQuake | Traditional RAG | Improvement |
|--------|-----------|-----------------|-------------|
| Query Latency (hybrid) | < 200ms | ~1000ms | 5x faster |
| Document Processing | 25s (10k tokens) | ~60s | 2.4x faster |
| Concurrent Users | 1000+ | ~100 | 10x |
| Memory per Document | 2MB | ~8MB | 4x better |
| Entity Extraction | ~2-3x more | Baseline | 3x |

Take benchmarks with appropriate skepticism, but the Rust foundation and async design are real architectural advantages for production workloads.

## PDF Vision Pipeline (v0.4.0)

Most RAG systems choke on scanned documents and complex tables. EdgeQuake's v0.4.0 release includes a vision pipeline that routes PDF pages through multimodal LLMs (GPT-4o, Claude, Gemini) as images.

```bash
# Standard text extraction (default)
curl -X POST http://localhost:8080/api/v1/documents/upload \
  -F "file=@report.pdf"

# Vision mode for scanned/complex PDFs
curl -X POST http://localhost:8080/api/v1/documents/upload \
  -H "X-Use-Vision: true" \
  -F "file=@scanned-invoice.pdf"
```

The system handles:
- **Scanned documents** — OCR via vision model
- **Complex tables** — LLM understands structure, not just text
- **Multi-column layouts** — Correct reading order preserved
- **Automatic fallback** — Vision failures gracefully fall back to text extraction

This is zero-config: pdfium is embedded in the binary.

## MCP Integration

EdgeQuake exposes its capabilities via the [Model Context Protocol](https://modelcontextprotocol.io/), meaning AI agents (Claude, Cursor, etc.) can use it as a tool:

```json
{
  "tool": "edgequake_query",
  "input": {
    "query": "What relationships exist between Project Alpha and the engineering team?",
    "mode": "local"
  }
}
```

Agents can query the knowledge graph, upload documents, and explore entity relationships programmatically. This makes EdgeQuake useful as a persistent memory layer for agentic workflows.

## Quick Start

```bash
# Clone and install
git clone https://github.com/raphaelmansuy/edgequake.git
cd edgequake
make install

# Start full stack (PostgreSQL + Backend + Frontend)
make dev
```

That gives you:
- Backend API at `localhost:8080`
- React frontend at `localhost:3000` with interactive graph visualization
- Swagger docs at `localhost:8080/swagger-ui`
- Default Ollama provider (local, free)

## When to Use Graph-RAG

Not every RAG system needs a knowledge graph. Here's the decision framework:

**Vector-only RAG is fine when:**
- Questions are direct lookups
- Documents are independent (no cross-references)
- Latency is critical and you can't afford graph traversal
- Your corpus is small and simple

**Graph-RAG (EdgeQuake) is better when:**
- Questions require connecting information across documents
- Your domain has rich entity relationships
- Users ask "how" and "why" questions, not just "what"
- You need thematic summaries across large corpora
- Multi-hop reasoning is a core use case

The LightRAG paper showed significant improvements on multi-hop QA benchmarks. If your users are frustrated that the AI "can't connect the dots," that's a signal to explore Graph-RAG.

## Architecture Notes

EdgeQuake uses PostgreSQL with two extensions:
- **AGE** — Apache AGE for graph storage and traversal (Cypher queries)
- **pgvector** — Vector similarity search

This keeps everything in one database rather than requiring separate graph and vector stores. The tradeoff is PostgreSQL operational overhead, but for teams already running Postgres, it's a natural fit.

The React 19 frontend includes Sigma.js graph visualizations—useful for debugging and understanding how your knowledge graph is structured.

## Links

- [GitHub](https://github.com/raphaelmansuy/edgequake)
- [LightRAG Paper](https://arxiv.org/abs/2410.05779)
- [MCP Server Docs](https://github.com/raphaelmansuy/edgequake/tree/edgequake-main/mcp)

---

*For context on where Graph-RAG fits among other patterns, see [7 RAG Patterns You Need to Know in 2026](/blog/7-rag-patterns-2026).*
