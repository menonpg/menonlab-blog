---
title: "The Embeddings Backlash: When Simpler Retrieval Works Better"
description: "Vector databases aren't always the answer. A look at tag-based retrieval, BM25, and LLM reranking as alternatives to embedding-heavy RAG systems."
date: "2026-03-04"
tags: ["RAG", "embeddings", "retrieval", "LLM", "architecture"]
---

# The Embeddings Backlash: When Simpler Retrieval Works Better

There's a quiet rebellion happening in the RAG community.

After two years of "just embed everything and throw it in a vector database," developers are discovering that simpler approaches often work better—especially for smaller document collections.

## The Embedding Orthodoxy

The standard RAG playbook looks like this:

1. Chunk your documents
2. Embed each chunk with OpenAI/Cohere/etc.
3. Store embeddings in Pinecone/Weaviate/Qdrant
4. At query time, embed the question
5. Find similar chunks via cosine similarity
6. Pass chunks to LLM for answer

This works. But it comes with baggage:

- **Cost**: Embedding APIs aren't free, especially at scale
- **Latency**: Multiple round-trips (embed query → vector search → LLM)
- **Infrastructure**: Yet another database to manage
- **Semantic blurring**: Similar ≠ relevant (cosine similarity can miss context)

## The Rebels

A PHP developer recently shared a [RAG system](https://github.com/ddmmbb-2/Pure-PHP-RAG-Engine) that skips embeddings entirely:

> "I've been experimenting with building a RAG system that completely skips embeddings and vector databases."

Their approach:
1. **Tag-based SQL retrieval** — LLM generates searchable tags for each document
2. **Multi-tag aggregation scoring** — SQL query ranks by tag overlap
3. **LLM reranking** — Before generating, the LLM scores and filters results
4. **Dynamic snippet extraction** — Pull context windows around keyword matches

No embeddings. No vector database. Just SQLite, PHP, and clever use of the LLM.

## When Simpler Wins

This isn't a contrarian take for its own sake. There are real scenarios where embeddings add complexity without value:

### 1. Small to Medium Collections

If you have 1,000 documents instead of 1 million, the precision gains from semantic search often don't justify the infrastructure. BM25 (keyword matching) with good preprocessing can be surprisingly effective.

### 2. Structured Data

For database schema discovery (like [soul-schema](https://github.com/menonpg/soul-schema)), embeddings don't help. You need the LLM to *understand* column names like `cust_ltv` and *generate* descriptions. The "retrieval" is just querying metadata—SQL does that fine.

### 3. When You Control the Query

If users are searching your docs through an LLM interface, you can:
- Have the LLM expand/reformulate the query
- Use the LLM to rerank results
- Let the LLM request more context if needed

The LLM becomes part of the retrieval loop, not just the generation step.

## The Reranking Pattern

The most interesting technique from the PHP project is **LLM reranking**:

```
Query → Keyword Search → Top 20 results → LLM Reranks → Top 5 → Generate Answer
```

Instead of trusting vector similarity to find the best matches, you retrieve more candidates than you need, then ask the LLM: "Which of these are actually relevant to the question?"

This catches cases where:
- Keywords match but context doesn't
- Semantic similarity is high but the chunk doesn't answer the question
- The best answer is in a document that scores medium on both keyword and semantic

We're adding this to [soul.py](https://github.com/menonpg/soul.py)'s roadmap. The hybrid RAG+RLM routing already helps, but explicit reranking could improve precision further.

## The Hybrid Future

I don't think embeddings are going away. For large-scale semantic search, they're still the best tool. But the "embed everything" default is being questioned.

The emerging pattern is **hybrid retrieval**:

| Stage | Method | Purpose |
|-------|--------|---------|
| 1. Recall | BM25 + Embeddings | Cast a wide net |
| 2. Rerank | LLM scoring | Filter for relevance |
| 3. Extract | Dynamic snippets | Optimize context window |
| 4. Generate | LLM | Final answer |

Each stage uses the right tool for the job. Keywords for recall, semantics for similarity, LLM for judgment.

## Practical Takeaways

1. **Start simple**: Try BM25 before reaching for embeddings. You might be surprised.

2. **Consider your scale**: Under 10K documents? Embeddings might be overkill.

3. **Add reranking**: Even with embeddings, an LLM reranking step can significantly improve precision.

4. **Measure what matters**: Track answer quality, not just retrieval recall. Sometimes fewer, better results beat more, fuzzier ones.

5. **Use the LLM in the loop**: Query expansion, reranking, and snippet extraction are all places where an LLM can help—not just the final generation.

The embedding orthodoxy served us well for bootstrapping the RAG ecosystem. But like any orthodoxy, it's worth questioning. Sometimes the simple thing just works.

---

*Building RAG systems? Check out [soul.py](https://github.com/menonpg/soul.py) for persistent agent memory with hybrid RAG+RLM routing.*
