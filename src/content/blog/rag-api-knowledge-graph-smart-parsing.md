---
title: "RAG API: Smart Parser Selection Meets Knowledge Graph Retrieval"
description: "Enterprise RAG that auto-selects the best document parser (DeepSeek-OCR, MinerU, Docling) via complexity scoring, then builds knowledge graphs for hybrid retrieval. Here's how it works."
date: "2026-02-22"
tags: ["rag", "knowledge-graph", "document-parsing", "ocr", "llm", "enterprise"]
---

# RAG API: Smart Parser Selection Meets Knowledge Graph Retrieval

Most RAG systems treat document parsing as a solved problem. Throw your PDFs at a parser, chunk the text, embed it, done. But anyone who's built production RAG knows the pain: that parser that works great on clean reports fails miserably on scanned invoices. The one that handles tables well chokes on mathematical formulas. You end up with a patchwork of parsers and manual routing logic.

**RAG API** tackles this differently. It combines **automatic parser selection** based on document complexity with **knowledge graph retrieval** that goes beyond simple vector similarity. The result is an enterprise-grade system that handles diverse documents intelligently and retrieves information with contextual understanding.

**Repository:** [github.com/BukeLy/rag-api](https://github.com/BukeLy/rag-api)

## The Document Parsing Problem

Not all documents are created equal. Consider what a RAG system might encounter:

- **Simple text PDFs** — Clean layout, no images, standard fonts
- **Scanned documents** — Need OCR, possibly poor quality
- **Technical papers** — Mathematical formulas, complex tables, figures
- **Financial reports** — Dense tables, charts, multi-column layouts
- **Mixed content** — Some pages simple, others complex

A single parser can't excel at all of these. DeepSeek-OCR is incredibly efficient for standard documents but might miss nuances in complex charts. MinerU handles multimodal content beautifully but is slower and more resource-intensive. Docling is fast and lightweight but less capable on edge cases.

The traditional approach: pick one parser and accept its limitations. Or build custom routing logic that you'll maintain forever.

RAG API's approach: **complexity scoring**.

## Smart Parser Selection

When a document arrives, RAG API doesn't immediately parse it. First, it analyzes the document to estimate complexity:

### The Complexity Scoring System

The system evaluates several factors:

**Visual Complexity**
- Does the document contain images?
- Are there charts or diagrams?
- How many pages have non-text elements?

**Structural Complexity**
- Are there tables? How complex?
- Multi-column layouts?
- Headers, footers, footnotes?

**Content Signals**
- Mathematical notation present?
- Code blocks or technical content?
- Mixed languages or special characters?

Based on this analysis, documents get routed to the appropriate parser:

| Complexity | Parser | Why |
|------------|--------|-----|
| **Low** | Docling | Fast, lightweight, handles simple docs efficiently |
| **Medium** | DeepSeek-OCR | Best balance of speed and capability, handles 80% of cases |
| **High** | MinerU | Full multimodal parsing for complex documents |

### The Parser Arsenal

**DeepSeek-OCR** is the workhorse. Recent benchmarks show it outperforming GOT-OCR2.0 while using only 100 vision tokens per page (compared to GOT's 256). It handles standard business documents, reports, and text-heavy PDFs with excellent accuracy and speed. For most enterprise document collections, DeepSeek-OCR handles the majority of files.

**MinerU** is the heavy artillery. When documents contain complex charts, mathematical formulas, or dense visual information, MinerU's transformer-based approach captures nuances that lighter parsers miss. It uses significantly more tokens (~7000 per page) but achieves higher accuracy on challenging content. The tradeoff is speed—MinerU is slower, so you only invoke it when necessary.

**Docling** is the speed demon. For plain text files, simple markdown, or documents that are clearly straightforward, Docling processes in roughly one second. No need to spin up heavy OCR machinery for a text file.

### Plain Text Fast Path

RAG API includes an optimization that many systems miss: plain text files (.txt, .md) skip the parser entirely. They're inserted directly into the system in approximately one second. This sounds obvious, but many RAG pipelines process everything through the same parsing pipeline regardless of content type.

### VLM Enhancement Modes

For documents where visual understanding matters (charts, diagrams, infographics), RAG API offers three modes via RAG-Anything's VLM integration:

- **Off** — Markdown only, fastest processing
- **Selective** — Intelligently processes important charts (large images, first-page content, images with titles)
- **Full** — Complete context enhancement for all visual elements

The selective mode is particularly clever. It uses heuristics to identify which images actually contain information versus decorative elements, processing only what matters.

## Beyond Vector Search: Knowledge Graph Retrieval

Smart parsing gets you clean, structured text. But how you retrieve from that text matters just as much. RAG API builds on **LightRAG**, a system from HKU's Data Science Lab that combines knowledge graphs with vector retrieval.

### The Limitation of Pure Vector Search

Traditional RAG works like this:
1. Chunk your documents
2. Embed each chunk into vectors
3. When a query arrives, embed it and find similar vectors
4. Return the top-k most similar chunks

This works well for direct factual questions. "What is the capital of France?" The chunk containing "Paris is the capital of France" will have high similarity.

But it struggles with questions requiring reasoning across information:
- "How do the Q3 results compare to our strategic goals from the annual plan?"
- "What are the implications of the new regulation given our current compliance status?"
- "Which projects mentioned in these reports are connected to the budget concerns raised by the CFO?"

These questions require understanding relationships between entities, not just finding similar text passages.

### How LightRAG Builds Knowledge

When documents are ingested, LightRAG doesn't just chunk and embed. It:

1. **Extracts entities** — People, organizations, concepts, dates, locations
2. **Identifies relationships** — Who works with whom, what depends on what, cause and effect
3. **Builds a knowledge graph** — Nodes (entities) connected by edges (relationships)
4. **Creates embeddings** — Both for text chunks AND for graph elements

The result is a dual representation: your documents exist both as embedded text chunks and as a structured graph of entities and relationships.

### Five Retrieval Modes

LightRAG provides five ways to query this dual structure:

**Naive Mode**
Pure vector retrieval. Fast, simple, good for direct factual queries. "What is X?" questions.

**Local Mode**
Graph-based retrieval focusing on the immediate neighborhood of relevant entities. Good for questions about specific things and their direct relationships. "What projects is John working on?"

**Global Mode**
Graph-based retrieval that traverses broader relationship paths. Good for questions requiring context from across the document corpus. "How does the marketing strategy connect to the engineering roadmap?"

**Hybrid Mode**
Combines local and global graph retrieval. Balances specific facts with broader context.

**Mix Mode**
The full combination: knowledge graph traversal plus vector retrieval. Most comprehensive but slowest. Use when accuracy matters more than speed.

### Why This Matters

Consider a query: "What risks should we consider for the Alpha project given recent supply chain issues?"

**Pure vector search** would find chunks mentioning "Alpha project" and chunks mentioning "supply chain issues"—but might miss that the Alpha project depends on Vendor X, and Vendor X is mentioned in supply chain risk documents without ever appearing in the same chunk as "Alpha project."

**Knowledge graph retrieval** traces the relationship: Alpha project → depends on → Vendor X → mentioned in → supply chain risk analysis. It surfaces relevant context that vector similarity alone would miss.

## Enterprise Architecture

RAG API isn't just a proof-of-concept. It's designed for production deployment with enterprise requirements.

### Multi-Tenant Isolation

Each tenant gets:
- **Isolated data storage** — No cross-tenant data leakage
- **Independent API keys** — Can use different LLM providers per tenant
- **Dedicated LightRAG instances** — Configurable per-tenant settings
- **Separate vector namespaces** — Complete retrieval isolation

Tenant A's financial documents never appear in Tenant B's search results, even if they share the same infrastructure.

### The Storage Stack

RAG API uses purpose-built storage for each need:

| Component | Purpose |
|-----------|---------|
| **DragonflyDB** | KV storage and task queue persistence |
| **Qdrant** | Vector database for embeddings |
| **Memgraph** | Graph database for knowledge graph |

This separation allows each component to scale independently. Vector search load doesn't impact graph queries.

### Task Persistence

Long-running document processing jobs are persisted to Redis. If a container restarts mid-processing, tasks resume rather than restart. This is critical for processing large document batches where a single job might take hours.

### Performance

The system achieves 6-15 second query response times. The knowledge graph makes this possible—graph traversal with indexed relationships is faster than brute-force retrieval over massive embedding collections.

## Practical Use Cases

### Use Case 1: Legal Document Analysis

A law firm needs to search across thousands of contracts, case files, and regulatory documents.

**The challenge:** Contracts reference other contracts. Cases cite precedents. Regulations affect multiple practice areas. Pure vector search finds documents mentioning keywords but misses the web of references.

**With RAG API:** The knowledge graph captures entity relationships—which contracts reference which clauses, which cases cite which precedents. Queries like "What contracts would be affected if Regulation 47B changes?" traverse the graph to find connections that vector search would miss.

**Parser selection:** Most contracts are clean PDFs (DeepSeek-OCR). Some scanned legacy documents require OCR. Court filings with complex exhibits go to MinerU.

### Use Case 2: Technical Documentation

An engineering organization maintains thousands of pages of technical specs, architecture documents, and design reviews.

**The challenge:** Technical documents are full of cross-references. System A depends on System B which integrates with System C. Finding "what depends on this component" requires understanding these relationships.

**With RAG API:** Entities like system names, APIs, and dependencies form a graph. Queries can traverse dependencies: "What systems would be affected if we deprecate this API?"

**Parser selection:** Most docs are markdown or clean PDFs (Docling/DeepSeek-OCR). Architecture diagrams and technical schematics with complex visuals go to MinerU with VLM enhancement.

### Use Case 3: Financial Research

An investment firm analyzes company filings, earnings reports, and market research.

**The challenge:** Financial documents are dense with numbers, tables, and charts. Information about a company appears across multiple documents—annual reports, quarterly filings, analyst coverage.

**With RAG API:** The knowledge graph connects entities across documents—Company X appears in its own filings, in competitor analysis, in market reports. Graph retrieval surfaces comprehensive views.

**Parser selection:** Earnings reports with complex tables need MinerU. Press releases are simple text (Docling). 10-K filings with mixed content get routed based on page-level complexity.

## Getting Started

### Docker Deployment

RAG API ships with Docker Compose for production-ready deployment:

```bash
git clone https://github.com/BukeLy/rag-api.git
cd rag-api
docker-compose up -d
```

The system starts in approximately 3 minutes with all dependencies (DragonflyDB, Qdrant, Memgraph) configured.

### Configuration

Key environment variables:

```bash
# LLM Configuration
OPENAI_API_KEY=your-key
LLM_MODEL=gpt-4o-mini

# Parser Selection
DEFAULT_PARSER=deepseek-ocr
MINERU_API_URL=http://mineru:8000
DOCLING_ENABLED=true

# VLM Enhancement
VLM_MODE=selective  # off, selective, full

# Storage
QDRANT_URL=http://qdrant:6333
MEMGRAPH_URL=bolt://memgraph:7687
```

### API Usage

**Upload documents:**
```bash
curl -X POST http://localhost:8000/api/v1/documents \
  -H "X-Tenant-ID: tenant-123" \
  -F "files=@report.pdf" \
  -F "files=@analysis.docx"
```

**Query with different modes:**
```bash
# Hybrid retrieval (recommended default)
curl -X POST http://localhost:8000/api/v1/query \
  -H "X-Tenant-ID: tenant-123" \
  -d '{"query": "What are the key risks?", "mode": "hybrid"}'

# Full mix mode for complex queries
curl -X POST http://localhost:8000/api/v1/query \
  -d '{"query": "How do Q3 results relate to strategic goals?", "mode": "mix"}'
```

## When to Use RAG API

RAG API shines when:

- **Document diversity is high** — You're processing many document types and don't want to manually route to different parsers
- **Relationship queries matter** — Your users ask questions that require connecting information across documents
- **Enterprise requirements exist** — You need multi-tenancy, persistence, and production-grade infrastructure
- **Accuracy trumps simplicity** — You're willing to invest in infrastructure for better retrieval quality

For simpler use cases (single document type, direct factual queries, prototype phase), lighter solutions like basic LangChain RAG might suffice.

## The Stack at a Glance

| Layer | Component | Purpose |
|-------|-----------|---------|
| **Parsing** | DeepSeek-OCR / MinerU / Docling | Intelligent document processing |
| **Routing** | Complexity Scorer | Auto-select best parser |
| **RAG Engine** | LightRAG | Knowledge graph + vector retrieval |
| **Vector Store** | Qdrant | Embedding storage and similarity search |
| **Graph Store** | Memgraph | Knowledge graph persistence |
| **KV Store** | DragonflyDB | Task queues and caching |
| **API** | FastAPI | REST endpoints with tenant isolation |

## Conclusion

RAG systems have evolved beyond "chunk, embed, retrieve." RAG API represents the next generation: intelligent parsing that adapts to document complexity, and retrieval that understands relationships, not just similarity.

The automatic parser selection alone solves a real production pain point. Combined with knowledge graph retrieval, you get a system that handles enterprise document collections with both efficiency and intelligence.

For teams building serious document intelligence applications, RAG API offers a production-ready foundation that's worth evaluating.

---

*The Menon Lab covers RAG systems, document AI, and enterprise ML infrastructure. For more on retrieval systems, [follow on X](https://x.com/themedcave) or [get in touch](mailto:prahlad.menon@quant.md).*
