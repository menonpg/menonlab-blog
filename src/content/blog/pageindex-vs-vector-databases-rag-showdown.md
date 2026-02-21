---
title: "PageIndex vs. Vector Databases: The RAG Showdown Nobody Expected"
description: "Did hierarchical tree indexing just kill vector databases? A deep dive into PageIndex's 98.7% accuracy claim and when to use reasoning-based vs. embedding-based retrieval."
date: "2026-02-20"
tags: ["rag", "vector-database", "pageindex", "retrieval", "llm", "ai-agents"]
---

Yesterday we wrote about [Zvec](/blog/zvec-sqlite-of-vector-databases), Alibaba's embedded vector database hitting 8,000+ QPS. Today, a new contender enters the arena with a provocative claim: **vector databases are the wrong approach entirely**.

Meet PageIndex — a "vectorless, reasoning-based RAG" system that just hit 98.7% accuracy on FinanceBench. Traditional vector RAG? Usually 50-65% on the same benchmark.

Let's break down what's actually happening here.

## The Core Problem with Vector RAG

Vector-based retrieval has a fundamental assumption baked in: **semantic similarity equals relevance**. You embed your documents, embed your query, and fetch the chunks with the closest vectors.

This works surprisingly well for many use cases. But it fails spectacularly for others:

**Query-Knowledge Mismatch**  
When you ask "What was the company's debt trend?", the *answer* lives in a financial summary table. But the query's embedding doesn't match a table of numbers — it matches text *about* debt. The actual answer gets missed.

**Buried Context**  
The answer to your question is in Appendix G, referenced on page 77 with the phrase "see Appendix G for details." Vector search doesn't follow references. It just retrieves whatever chunks have similar vibes.

**Chunking Destroys Meaning**  
Hard-chunking a 200-page SEC filing into 512-token blocks breaks tables, splits paragraphs mid-sentence, and loses the hierarchical structure that makes the document navigable.

## How PageIndex Works Differently

PageIndex doesn't embed anything. Instead, it:

1. **Builds a hierarchical tree index** — essentially a semantic table of contents
2. **Uses LLM reasoning to navigate** — the model decides where to look based on understanding, not similarity
3. **Follows references** — when it sees "see Appendix G", it actually goes to Appendix G
4. **Retrieves coherent sections** — full pages or logical units, not arbitrary chunks

Think of it like the difference between a keyword search and having a human expert navigate the document for you.

```
Vector RAG: "Find chunks that look like this query"
PageIndex:  "Think about where this answer would be, go there, read it"
```

## The FinanceBench Results

On the FinanceBench benchmark (financial QA over SEC filings):

| System | Accuracy | Coverage |
|--------|----------|----------|
| Mafin 2.5 (PageIndex) | 98.7% | 100% |
| Fintool | 98% | 66.7% |
| Quantly | 94% | 100% |
| Perplexity | 45% | 66.7% |
| ChatGPT 4o + Search | 31% | 66.7% |

That 98.7% is striking. And unlike some competitors, it covers the full benchmark — no cherry-picking.

## So Are Vector Databases Dead?

No. Here's the nuanced take.

### Where PageIndex Wins

- **Structured, hierarchical documents**: SEC filings, legal contracts, technical manuals, academic papers
- **Questions requiring multi-step reasoning**: "Compare Q3 revenue to the same quarter last year"
- **Documents with internal references**: "As shown in Table 5.3..."
- **Domain expertise matters**: Financial analysis, legal research, medical records

### Where Vector Databases Win

- **Massive scale**: Billions of documents where building tree indexes is impractical
- **Unstructured content**: Chat logs, social media, fragmented notes
- **Speed-critical applications**: Real-time search at <10ms latency
- **Simple semantic search**: "Find similar products" or "Show related articles"
- **Hybrid search needs**: Combining vectors with keyword filters

## The Vector Database Landscape (2025)

If you *do* need vector search, here's how the major players stack up:

### Embedded/Local (Zero Infrastructure)

**Zvec** — The new king of embedded. 8,000+ QPS, in-process, `pip install zvec`. [We covered it yesterday](/blog/zvec-sqlite-of-vector-databases).

**ChromaDB** — Developer favorite for prototyping. Simple API, good LangChain integration. Not built for production scale.

**LanceDB** — Embedded, columnar storage, good for multimodal. Serverless-friendly.

### Managed Cloud

**Pinecone** — The "just works" option. Excellent performance, but 3-5x more expensive than alternatives. Best for teams who value ops simplicity over cost.

**Weaviate** — Best balance of features and flexibility. Hybrid search (vectors + BM25), GraphQL API, good for complex applications.

**Qdrant** — Rust-based, excellent performance, growing ecosystem. Strong choice for self-hosted or cloud.

### Enterprise/Azure Ecosystem

**Azure AI Search** — If you're already in Azure, this is the path of least resistance. Hybrid search, built-in chunking, integrates with Azure OpenAI. Not the fastest, but enterprise-ready.

### Self-Hosted Scale

**Milvus** — Built for billions of vectors. Kubernetes-native. Complex to operate but handles massive scale.

**Zilliz Cloud** — Managed Milvus. Was the VectorDBBench leader until Zvec showed up.

## When to Use What: A Decision Framework

**Use PageIndex when:**
- Documents have clear structure (chapters, sections, appendices)
- Accuracy matters more than speed
- Questions require reasoning, not just retrieval
- You're working with professional/domain-specific docs
- You need traceable, explainable results

**Use Vector Databases when:**
- Scale exceeds what tree indexes can handle
- Documents are unstructured or fragmented
- Sub-10ms latency is required
- Hybrid search (vectors + filters) is needed
- You're doing similarity search, not QA

**Use Both when:**
- Initial vector retrieval to narrow candidates
- PageIndex reasoning for final answer extraction
- Different document types in the same system

## The Bigger Picture

PageIndex isn't killing vector databases. It's revealing that **different retrieval problems need different solutions**.

Vector search is pattern matching at scale. Reasoning-based retrieval is navigation with understanding. Both have their place.

The real winner here is the recognition that "chunk everything, embed everything, nearest-neighbor everything" isn't the end state of RAG. For documents that were designed to be *read* — with tables of contents, cross-references, and logical structure — treating them like bags of chunks was always a hack.

PageIndex is what happens when you respect the document's native structure.

## Try It Yourself

**PageIndex:**
- [GitHub](https://github.com/VectifyAI/PageIndex) (open source)
- [Chat Platform](https://chat.pageindex.ai)
- [Documentation](https://docs.pageindex.ai)

**Zvec (for when you do need vectors):**
- [GitHub](https://github.com/alibaba/zvec)
- `pip install zvec`

The future of RAG isn't one tool. It's knowing which tool fits which problem.
