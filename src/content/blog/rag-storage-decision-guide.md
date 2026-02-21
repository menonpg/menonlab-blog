---
title: "The RAG Storage Decision Guide: From Local Files to Serverless Vectors"
description: "When to use Upstash, local file caching, embedded databases, managed vector services, or skip vectors entirely. A practical framework for choosing your RAG infrastructure."
date: "2026-02-20"
tags: ["rag", "vector-database", "upstash", "architecture", "infrastructure"]
---

Building a RAG application means making storage decisions. Should you use a vector database? Which one? Do you even need vectors? What about caching?

After covering [Zvec](/blog/zvec-sqlite-of-vector-databases) (embedded vectors) and [PageIndex](/blog/pageindex-vs-vector-databases-rag-showdown) (vectorless RAG), let's zoom out and map the entire landscape of storage options for RAG applications.

## The Storage Layers

Most RAG systems need multiple storage layers:

| Layer | Purpose | Examples |
|-------|---------|----------|
| **Cache** | Fast repeated access, rate limiting | Redis, file cache |
| **Vector Store** | Semantic similarity search | Pinecone, Zvec, Weaviate |
| **Document Store** | Raw content, metadata | Postgres, S3, filesystem |
| **Index** | Structure-based navigation | PageIndex trees, BM25 |

Not every app needs all layers. Let's break down when to use what.

---

## Local File Caching

**What it is:** Simple file-based storage on disk. JSON files, SQLite, or just a `cache/` directory.

**When to use it:**
- Prototyping and local development
- Single-machine deployments
- Caching expensive API responses (embeddings, LLM calls)
- Storing processed documents between runs
- Budget is zero

**Example from VirtualCFI:**
```python
CACHE_DIR = Path(__file__).parent / "cache"
CACHE_DIR.mkdir(exist_ok=True)

# Cache weather API responses
def get_cached_weather(airport_code):
    cache_file = CACHE_DIR / f"{airport_code}.json"
    if cache_file.exists():
        data = json.loads(cache_file.read_text())
        if time.time() - data['timestamp'] < 300:  # 5 min TTL
            return data['weather']
    return None
```

**Limitations:**
- No distribution (single machine only)
- No built-in expiration
- No concurrent access guarantees
- You manage everything

**Best for:** Solo projects, local tools, scripts, anywhere infrastructure cost matters more than scale.

---

## Upstash Redis

**What it is:** Serverless Redis with per-request pricing. Pay for what you use, scales to zero.

**When to use it:**
- Rate limiting API endpoints
- Session storage
- Caching with TTL (auto-expiration)
- Pub/sub for real-time features
- Distributed locking
- Anywhere you'd use Redis but don't want to manage it

**Example use case (Supavec uses this):**
```typescript
// Rate limiting with sliding window
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
});

const { success } = await ratelimit.limit(userId);
```

**Pricing model:** ~$0.20 per 100K commands. Free tier: 10K commands/day.

**What it's NOT for:**
- Vector similarity search (use Upstash Vector for that)
- Primary document storage
- Complex queries

**Best for:** Production apps that need caching/rate-limiting without managing Redis infrastructure.

---

## Upstash Vector

**What it is:** Serverless vector database from the same folks. DiskANN-powered, REST API, pay-per-query.

**When to use it:**
- Cloud-native RAG applications
- Serverless/edge deployments (Vercel, Cloudflare Workers)
- Variable traffic (scales to zero)
- You want managed infrastructure with usage-based pricing

**Key features:**
- DiskANN algorithm (high recall, low latency)
- Metadata filtering
- REST API + TypeScript/Python SDKs
- Multiple similarity functions (cosine, euclidean, dot product)

**Example:**
```typescript
import { Index } from "@upstash/vector";

const index = new Index();

// Upsert vectors
await index.upsert([
  { id: "doc-1", vector: embedding, metadata: { source: "report.pdf" } }
]);

// Query
const results = await index.query({
  vector: queryEmbedding,
  topK: 5,
  filter: "source = 'report.pdf'"
});
```

**Pricing:** Starts free (10K queries/month), then ~$0.40 per 100K queries.

**Trade-offs:**
- Network latency on every query (not embedded)
- Less control than self-hosted
- Vendor lock-in (though data is exportable)

**Best for:** Serverless apps, teams who want zero ops, variable/unpredictable traffic.

---

## Embedded Vector Databases

**What they are:** Vector search that runs in your process. No network calls, no servers.

### Zvec
- **Speed:** 8,000+ QPS, fastest embedded option
- **Built on:** Alibaba's Proxima engine
- **Best for:** Production-grade local RAG, edge devices
- **Install:** `pip install zvec`

### ChromaDB
- **Speed:** Good for prototyping, not production scale
- **Built on:** SQLite + HNSW
- **Best for:** Development, small datasets, LangChain integration
- **Install:** `pip install chromadb`

### LanceDB
- **Speed:** Columnar storage, good for multimodal
- **Built on:** Lance format (Arrow-based)
- **Best for:** Multimodal RAG, versioned datasets
- **Install:** `pip install lancedb`

**When to use embedded:**
- Desktop/CLI applications
- Edge deployments
- Privacy-sensitive (data never leaves the machine)
- Cost-sensitive (no per-query fees)
- Low-latency requirements (<1ms)

**When NOT to use embedded:**
- Multi-machine deployments
- Serverless functions (cold starts hurt)
- Data needs to be shared across services

---

## Managed Vector Services

**What they are:** Hosted vector databases you connect to over the network.

### Pinecone
- **Positioning:** "Just works" premium option
- **Pricing:** $70/month minimum for production
- **Best for:** Teams who value ops simplicity over cost
- **Trade-off:** 3-5x more expensive than alternatives

### Weaviate
- **Positioning:** Feature-rich, hybrid search
- **Pricing:** Free self-hosted, managed starts ~$25/month
- **Best for:** Complex RAG with BM25 + vectors, GraphQL fans
- **Trade-off:** More complexity to configure

### Qdrant
- **Positioning:** Performance-focused, Rust-based
- **Pricing:** Free self-hosted, cloud is competitive
- **Best for:** Teams comfortable with self-hosting, need filtering
- **Trade-off:** Smaller ecosystem than Pinecone

### Azure AI Search
- **Positioning:** Enterprise, Azure ecosystem
- **Pricing:** ~$75/month for basic tier
- **Best for:** Azure shops, enterprise compliance requirements
- **Trade-off:** Not the fastest, more expensive

**When to use managed:**
- Production at scale (millions of vectors)
- Multi-region requirements
- Team doesn't want to manage infrastructure
- Need SLAs and support

---

## RAG-as-a-Service: Supavec

**What it is:** Open-source Carbon.ai alternative. Full RAG pipeline as an API — upload docs, get chat.

**Built on:**
- Supabase (Postgres + pgvector for storage)
- Upstash Redis (rate limiting)
- OpenAI (embeddings + chat)

**When to use it:**
- You want RAG without building the pipeline
- Document ingestion is your main challenge
- Multi-tenant SaaS (built-in team isolation)
- Open-source matters (Carbon.ai shut down, this won't)

**Example workflow:**
```bash
# Upload a document
curl -X POST https://api.supavec.com/upload \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@report.pdf"

# Chat with it
curl -X POST https://api.supavec.com/chat \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"query": "Summarize the key findings", "file_ids": ["..."]}'
```

**Trade-offs:**
- Less control than building your own
- Depends on OpenAI for embeddings
- Another service to depend on

**Best for:** Rapid prototyping, startups, teams who want to focus on product not infrastructure.

---

## Vectorless: PageIndex

**What it is:** Skip vectors entirely. Build hierarchical tree indexes, use LLM reasoning for retrieval.

**When to use it:**
- Structured documents (SEC filings, legal contracts, manuals)
- Accuracy matters more than speed
- Questions require multi-step reasoning
- You need traceable, explainable retrieval

**When NOT to use it:**
- Massive unstructured corpus
- Sub-second latency requirements
- Simple similarity search ("find similar products")

**The result:** 98.7% accuracy on FinanceBench vs 50-65% for vector RAG.

**Best for:** Professional document analysis where getting it right matters more than getting it fast.

---

## Decision Framework

### Start here:

**Do you need semantic search?**
- No → Use local files or Redis for caching, skip vectors
- Yes → Continue below

**Is your data structured with clear hierarchy?**
- Yes → Consider PageIndex (vectorless)
- No → Continue to vectors

**Where does your app run?**
- Single machine/edge → Zvec or LanceDB (embedded)
- Serverless (Vercel, Cloudflare) → Upstash Vector
- Kubernetes/VMs → Self-host Qdrant or Weaviate
- "Just make it work" → Pinecone

**What's your budget?**
- $0 → ChromaDB (dev), Zvec (prod), self-hosted Qdrant
- Per-request OK → Upstash Vector
- Fixed monthly → Pinecone, Weaviate Cloud, Azure AI Search

**Do you want to build the pipeline or use one?**
- Build it → Pick vector DB + roll your own ingestion
- Use one → Supavec or similar RAG-as-a-Service

---

## The Stack I'd Use Today

For a **production RAG application** starting fresh:

| Layer | Choice | Why |
|-------|--------|-----|
| Cache/Rate Limit | Upstash Redis | Serverless, per-request pricing |
| Vector Search | Zvec (local) or Upstash Vector (cloud) | Performance + simplicity |
| Document Store | Supabase/Postgres | Flexible, SQL when needed |
| Structured Docs | PageIndex | For contracts, filings, manuals |

For a **prototype or small project:**

| Layer | Choice | Why |
|-------|--------|-----|
| Everything | Supavec | Full stack, open source, fast to start |

For a **local-first desktop app:**

| Layer | Choice | Why |
|-------|--------|-----|
| Vectors | Zvec | Fast, embedded, no network |
| Cache | File system | Simple, no dependencies |
| Docs | SQLite | Single file, portable |

---

## Links

- **Upstash Redis/Vector:** [upstash.com](https://upstash.com)
- **Zvec:** [github.com/alibaba/zvec](https://github.com/alibaba/zvec)
- **Supavec:** [github.com/supavec/supavec](https://github.com/supavec/supavec)
- **PageIndex:** [github.com/VectifyAI/PageIndex](https://github.com/VectifyAI/PageIndex)
- **ChromaDB:** [trychroma.com](https://www.trychroma.com)
- **LanceDB:** [lancedb.com](https://lancedb.com)
- **Qdrant:** [qdrant.tech](https://qdrant.tech)
- **Weaviate:** [weaviate.io](https://weaviate.io)
- **Pinecone:** [pinecone.io](https://www.pinecone.io)

The right choice depends on your constraints. There's no universal answer — but now you have a map.
