---
title: "Zvec: The SQLite of Vector Databases Has Arrived"
description: "Alibaba open-sources Zvec, an embedded vector database that runs in-process with zero infrastructure. Over 8,000 QPS, 2x faster than the previous leader."
pubDate: 2026-02-20
tags: ["vector-database", "rag", "embeddings", "alibaba", "open-source"]
---

What if you could add production-grade vector search to your Python app with a single `pip install`? No servers. No Docker containers. No API keys. No infrastructure to manage.

That's exactly what [Zvec](https://github.com/alibaba/zvec) delivers.

## The Problem with Vector Databases

Building RAG applications or semantic search features typically means spinning up infrastructure. Pinecone needs an account and API keys. Milvus wants Docker containers. Qdrant needs a server running somewhere. Even the "lightweight" options add operational complexity.

For many use cases—desktop apps, CLI tools, edge devices, local knowledge bases—this is overkill. You just want vector search that works like SQLite: embedded, in-process, and zero-ops.

## Enter Zvec

Alibaba's Tongyi Lab just open-sourced Zvec, positioning it as "the SQLite of vector databases." It's an embedded library that runs entirely inside your Python process. No daemons. No network calls. No external dependencies.

```bash
pip install zvec
```

That's it. You're ready to search billions of vectors.

## Built on Battle-Tested Infrastructure

Zvec isn't a weekend project. It's built on **Proxima**, Alibaba's production-grade vector search engine that powers search and recommendation systems across their ecosystem. The team wrapped Proxima with a clean Python API and packaged it as an embedded runtime.

The result is a library that delivers cloud-level performance without cloud-level complexity.

## The Numbers Don't Lie

On VectorDBBench with the Cohere 10M dataset (10 million 768-dimensional vectors), Zvec delivers:

- **Over 8,000 queries per second**
- **2x faster than ZillizCloud** (the previous #1)
- Significantly faster index build times

These aren't cherry-picked benchmarks. VectorDBBench is an open-source framework widely used in the vector database community. The methodology and configurations are [fully documented](https://zvec.org/en/docs/benchmarks/) for anyone to reproduce.

## Dead Simple API

Here's a complete working example:

```python
import zvec

# Define schema
schema = zvec.CollectionSchema(
    name="example",
    vectors=zvec.VectorSchema("embedding", zvec.DataType.VECTOR_FP32, 4),
)

# Create collection
collection = zvec.create_and_open(path="./zvec_example", schema=schema)

# Insert documents
collection.insert([
    zvec.Doc(id="doc_1", vectors={"embedding": [0.1, 0.2, 0.3, 0.4]}),
    zvec.Doc(id="doc_2", vectors={"embedding": [0.2, 0.3, 0.4, 0.1]}),
])

# Search
results = collection.query(
    zvec.VectorQuery("embedding", vector=[0.4, 0.3, 0.3, 0.1]),
    topk=10
)
```

If you've used SQLite, this feels familiar. Open a file, insert data, query. The database lives in a directory on your filesystem.

## RAG-Ready Features

Zvec isn't just a bare-bones index. It includes features that RAG pipelines actually need:

- **Full CRUD operations** — your knowledge base changes over time
- **Hybrid search** — combine vector similarity with scalar filters (user, date, type)
- **Multi-vector queries** — combine multiple embedding channels in one call
- **Built-in reranking** — weighted fusion and Reciprocal Rank Fusion (RRF)
- **Schema evolution** — adjust index strategies as requirements change

This is the difference between a library that works for demos and one that works for production.

## Performance Engineering

The speed comes from serious low-level optimization:

- Multi-threaded concurrency
- Cache-friendly memory layouts
- SIMD acceleration
- CPU prefetching

These are the kinds of wins that come from years of running vector search at Alibaba scale, now available in an open-source package.

## Platform Support

Currently supports:
- Python 3.10 - 3.12
- Linux (x86_64, ARM64)
- macOS (ARM64)

The roadmap includes integrations with LangChain, LlamaIndex, DuckDB, and PostgreSQL.

## The Bottom Line

Zvec solves a real problem: getting production-quality vector search without production-quality infrastructure headaches. For local RAG apps, CLI tools, desktop software, or edge deployments, it's exactly what's been missing.

Apache 2.0 licensed. No strings attached.

**Links:**
- [GitHub Repository](https://github.com/alibaba/zvec)
- [Documentation](https://zvec.org/en/docs/)
- [Benchmarks](https://zvec.org/en/docs/benchmarks/)
