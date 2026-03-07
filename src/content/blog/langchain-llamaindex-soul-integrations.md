---
title: "langchain-soul & llamaindex-soul: Full Soul Ecosystem for Your Framework"
description: "Drop-in persistent memory for LangChain and LlamaIndex. Same soul-agent RAG+RLM, same SoulMate cloud option, same SchemaMemory for database intelligence."
date: "2026-03-06"
tags: ["langchain", "llamaindex", "soul", "memory", "ai-agents", "rag", "open-source"]
---

Today we're releasing **langchain-soul** and **llamaindex-soul** — bringing the full Soul ecosystem to LangChain and LlamaIndex users.

One `pip install`. Full stack: persistent memory, hybrid RAG+RLM retrieval, database schema intelligence, and managed cloud option.

## The Problem

You're building with LangChain or LlamaIndex. Your agent works great... until the conversation ends. Then it forgets everything.

Built-in memory solutions are either:
- **Too simple** — just stores recent messages, no semantic search
- **Too complex** — requires spinning up vector databases, managing embeddings
- **Not human-readable** — can't inspect or edit what your agent "knows"

And if your agent needs to query a database? Good luck explaining what `cust_ltv`, `flg_b2b`, and `reg_cd` mean.

## The Solution

```bash
pip install langchain-soul   # or llamaindex-soul
```

That's it. You get the **entire Soul ecosystem**:

| Component | What It Does |
|-----------|--------------|
| **soul-agent** | RAG + RLM hybrid retrieval — auto-routes queries to semantic search or exhaustive reasoning |
| **soul-schema** | Database semantic layer — auto-documents tables/columns, gives agents database understanding |
| **SoulMate API** | Managed cloud option — zero infrastructure, same interface |
| **Markdown storage** | Human-readable, git-versionable, editable memory files |

---

## 1. Persistent Memory (soul-agent)

### LangChain

```python
from langchain_soul import SoulMemory
from langchain.chains import ConversationChain
from langchain_openai import ChatOpenAI

# Markdown-based memory with full RAG+RLM
memory = SoulMemory()
chain = ConversationChain(llm=ChatOpenAI(), memory=memory)

response = chain.predict(input="Hello!")
# Conversation saved to MEMORY.md — human-readable!
```

### LlamaIndex

```python
from llamaindex_soul import SoulChatStore
from llama_index.core.memory import ChatMemoryBuffer

chat_store = SoulChatStore()
memory = ChatMemoryBuffer.from_defaults(
    token_limit=3000,
    chat_store=chat_store,
    chat_store_key="user1",
)

# Use with any LlamaIndex agent
from llama_index.core.agent import FunctionAgent
agent = FunctionAgent(tools=tools, llm=llm)
await agent.run("Hello!", memory=memory)
```

### What Makes It Different

**RAG + RLM Hybrid Retrieval**: Queries get automatically routed to the right strategy:
- **Factual lookups** ("What's the user's email?") → RAG (fast semantic search)
- **Reasoning questions** ("Why did we decide X?") → RLM (exhaustive context scan)

**Human-readable storage**: Your agent's memories live in `MEMORY.md`:

```markdown
## 2026-03-06 14:30:00 UTC
**Human:** We decided to use PostgreSQL for the project.
**AI:** Got it — PostgreSQL it is. I'll remember that for future discussions.
```

You can `cat`, `grep`, edit, and git-version these files.

### Semantic Search

```python
# LangChain
results = memory.recall("What database did we choose?")

# LlamaIndex  
results = chat_store.recall("user1", "What database did we choose?")

for result in results:
    print(f"[{result['score']:.2f}] {result['content']}")
```

---

## 2. Database Schema Intelligence (soul-schema)

Your agent needs to write SQL. But your database has 100 tables with columns named `cust_ltv`, `flg_b2b`, `reg_cd`. The person who knew what they meant left in 2019.

**SchemaMemory** fixes this:

```python
from langchain_soul import SchemaMemory  # or llamaindex_soul

# Connect to any SQLAlchemy-compatible database
schema = SchemaMemory(
    database_url="postgresql://user:pass@host/db",
    llm_provider="anthropic",  # or "openai", "gemini", "ollama"
)

# Auto-generate semantic descriptions using LLM
schema.generate(sample_rows=5)  # Samples data to understand context
```

### What It Does

1. **Connects** to your database (PostgreSQL, MySQL, SQLite, Snowflake, etc.)
2. **Reads** table structures and samples data
3. **Generates** human-readable descriptions using an LLM
4. **Caches** results so you don't regenerate every time

### Query Context

```python
# Get relevant schema for a natural language query
context = schema.context_for("Show me revenue by region")
```

Returns formatted markdown:

```markdown
## Relevant Database Schema

### sales_transactions
Revenue and order data by transaction

| Column | Type | Description |
|--------|------|-------------|
| revenue | DECIMAL | Transaction revenue in USD |
| region_code | VARCHAR | Geographic region identifier |
| transaction_date | DATE | Date of transaction |

### regions
Geographic region lookup table

| Column | Type | Description |
|--------|------|-------------|
| region_code | VARCHAR | Region identifier (e.g., 'NA', 'EU') |
| region_name | VARCHAR | Full region name |
```

### Use in Agent Prompts

```python
from langchain.agents import create_sql_agent

# Get full schema as markdown
schema_docs = schema.to_markdown()

agent = create_sql_agent(
    llm=llm,
    db=db,
    prefix=f"You have access to this database:\n\n{schema_docs}\n\n"
)
```

### Export Formats

```python
# Save as JSON for caching
schema.save("schema_cache.json", format="json")

# Export for dbt (schema.yml)
schema.save("models/schema.yml", format="dbt")

# Export for Vanna.AI training
schema.save("vanna_training.json", format="vanna")
```

### Describe Individual Tables

```python
# Get details for a specific table
table_info = schema.describe("customers")
print(table_info)
# {
#   "name": "customers",
#   "description": "Customer master data including contact and segmentation info",
#   "columns": [
#     {"name": "customer_id", "type": "INTEGER", "description": "Unique customer identifier"},
#     {"name": "cust_ltv", "type": "DECIMAL", "description": "Customer lifetime value in USD"},
#     {"name": "flg_b2b", "type": "BOOLEAN", "description": "True if B2B customer, False if B2C"},
#     ...
#   ]
# }
```

---

## 3. Managed Cloud (SoulMate API)

Don't want to manage files? **SoulMate** is the managed version — same interface, zero infrastructure:

### LangChain

```python
from langchain_soul import SoulMateMemory

memory = SoulMateMemory(api_key="your-key")  # We handle storage
chain = ConversationChain(llm=llm, memory=memory)
```

### LlamaIndex

```python
from llamaindex_soul import SoulMateChatStore

chat_store = SoulMateChatStore(api_key="your-key")
memory = ChatMemoryBuffer.from_defaults(chat_store=chat_store)
```

### Factory Functions

Switch backends with one line:

```python
from langchain_soul import create_memory

# Development: local files
memory = create_memory("local")

# Production: managed cloud
memory = create_memory("soulmate", api_key="...")
```

```python
from llamaindex_soul import create_chat_store

store = create_chat_store("local")      # File-based
store = create_chat_store("soulmate")   # Managed cloud
```

---

## 4. Full Configuration Options

### Memory Configuration

```python
from langchain_soul import SoulMemory

memory = SoulMemory(
    soul_path="agents/assistant/SOUL.md",      # Agent identity
    memory_path="agents/assistant/MEMORY.md",  # Memory storage
    provider="anthropic",                       # LLM provider
    use_hybrid=True,                           # Enable RAG+RLM
)
```

### Schema Configuration

```python
from langchain_soul import SchemaMemory

schema = SchemaMemory(
    database_url="postgresql://...",
    llm_provider="anthropic",    # or "openai", "gemini", "ollama"
    api_key=None,                # Uses env var if not provided
    cache_path="schema.json",    # Cache generated descriptions
)
```

### SoulMate Configuration

```python
from langchain_soul import SoulMateMemory

memory = SoulMateMemory(
    api_key="...",
    base_url="https://your-instance.com",  # Self-hosted option
    tenant_id="team-alpha",                 # Multi-tenant isolation
    scope="/project/alpha",                 # Scope memories
)
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│              langchain-soul / llamaindex-soul                │
│                                                              │
│  ┌────────────────┐    ┌────────────────┐                   │
│  │  SoulMemory    │    │ SoulMateMemory │                   │
│  │  (local files) │    │ (managed cloud)│                   │
│  └───────┬────────┘    └───────┬────────┘                   │
│          │                     │                             │
│          ▼                     ▼                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            soul-agent (RAG + RLM hybrid)            │    │
│  │  • Semantic search (RAG) for factual lookups        │    │
│  │  • Exhaustive scan (RLM) for reasoning queries      │    │
│  │  • Auto-routes based on query type                  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            soul-schema (database intelligence)       │    │
│  │  • Auto-generates table/column descriptions         │    │
│  │  • Exports to dbt, Vanna, JSON                      │    │
│  │  • Query-aware context injection                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            SoulMate API (optional managed)           │    │
│  │  • Zero infrastructure                              │    │
│  │  • Multi-tenant isolation                           │    │
│  │  • Same interface as local                          │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## The Full Soul Ecosystem

| Package | Purpose | Install |
|---------|---------|---------|
| **[soul-agent](https://github.com/menonpg/soul.py)** | Core RAG+RLM library | `pip install soul-agent` |
| **[soul-schema](https://github.com/menonpg/soul-schema)** | Database semantic layer | `pip install soul-schema` |
| **[crewai-soul](https://github.com/menonpg/crewai-soul)** | CrewAI integration | `pip install crewai-soul` |
| **[langchain-soul](https://github.com/menonpg/langchain-soul)** | LangChain integration | `pip install langchain-soul` |
| **[llamaindex-soul](https://github.com/menonpg/llamaindex-soul)** | LlamaIndex integration | `pip install llamaindex-soul` |
| **[SoulMate](https://menonpg.github.io/soulmate)** | Managed cloud service | API key |

When you install `langchain-soul` or `llamaindex-soul`, you get `soul-agent` and `soul-schema` automatically.

---

## Get Started

```bash
# LangChain users
pip install langchain-soul

# LlamaIndex users  
pip install llamaindex-soul
```

**PyPI:**
- [langchain-soul](https://pypi.org/project/langchain-soul/)
- [llamaindex-soul](https://pypi.org/project/llamaindex-soul/)

**GitHub:**
- [langchain-soul](https://github.com/menonpg/langchain-soul)
- [llamaindex-soul](https://github.com/menonpg/llamaindex-soul)

Both MIT licensed. Both tested. Both ready for production.

Your agents finally remember — and understand your data — in whatever framework you prefer.
