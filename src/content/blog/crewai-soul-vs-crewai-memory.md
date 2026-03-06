---
title: "crewai-soul vs CrewAI Memory: Which Should You Use?"
description: "A comparison of CrewAI's built-in memory system and crewai-soul's markdown-native approach. When to use each, and why you might want both."
date: "2026-03-06"
tags: ["crewai", "ai-agents", "memory", "soul-py", "rag"]
---

CrewAI ships with a powerful built-in memory system. So why did I build [crewai-soul](https://github.com/menonpg/crewai-soul)?

Different problems need different solutions. Here's when to use each.

## The Quick Answer

| Use Case | Best Choice |
|----------|-------------|
| Production apps, auto-organizing memory | **CrewAI Memory** |
| Git-tracked projects, human-editable memory | **crewai-soul** |
| Teams who need to audit/edit agent memories | **crewai-soul** |
| Zero-config, just works | **CrewAI Memory** |
| Managed cloud deployment | **crewai-soul + SoulMate** |

## CrewAI's Built-in Memory

CrewAI recently shipped a unified `Memory` class that consolidates what used to be four separate systems (short-term, long-term, entity, external) into one intelligent API.

```python
from crewai import Memory

memory = Memory()
memory.remember("We decided to use PostgreSQL.")
matches = memory.recall("database decision")
```

**What it does well:**

- **LLM-powered scope inference** — When you `remember()` something, the LLM analyzes the content and automatically places it in the right scope (`/project/alpha/decisions`, `/engineering/database`, etc.)
- **Composite scoring** — Recall blends semantic similarity, recency, and importance
- **Self-organizing** — The scope tree grows organically from content
- **LanceDB storage** — Fast local vector store, no external DB needed

**The tradeoffs:**

- Memory is stored in `.crewai/memory/` as LanceDB files — not human-readable
- You can't easily edit memories manually
- Can't git-track memory evolution over time
- Requires LLM calls for scope inference (cost + latency)

## crewai-soul: Markdown-Native Memory

crewai-soul takes a different approach: your agent's memory lives in markdown files you can read, edit, and version control.

```python
from crewai_soul import SoulMemory

memory = SoulMemory()
memory.remember("We decided to use PostgreSQL.")
matches = memory.recall("database decision")
```

After running, check `MEMORY.md`:

```markdown
# Memory Log

## 2026-03-06 18:30:15 UTC
**Scope:** `/decisions`

We decided to use PostgreSQL.
```

**What it does well:**

- **Human-readable** — Open `MEMORY.md` and see exactly what your agent remembers
- **Git-versionable** — Track memory evolution with commits
- **Editable** — Fix a wrong memory by editing the file
- **RAG + RLM hybrid** — Uses [soul-agent](https://github.com/menonpg/soul.py) under the hood for smart retrieval
- **No LLM required for storage** — Just appends to markdown
- **Managed option** — SoulMate API for production (we handle infrastructure)

**The tradeoffs:**

- No automatic scope inference (you specify scope or use flat structure)
- Markdown parsing is simpler than vector search for large memory sets
- You manage the files (or use SoulMate)

## Head-to-Head Comparison

| Feature | CrewAI Memory | crewai-soul |
|---------|--------------|-------------|
| **Storage format** | LanceDB (binary) | Markdown files |
| **Human-readable** | ❌ | ✅ |
| **Git-versionable** | ❌ | ✅ |
| **Manual editing** | ❌ | ✅ |
| **Auto scope inference** | ✅ (LLM) | ❌ |
| **Composite scoring** | ✅ | ✅ (via soul-agent) |
| **RAG retrieval** | ✅ | ✅ |
| **RLM (exhaustive)** | ❌ | ✅ |
| **Infrastructure** | Local LanceDB | Files or SoulMate API |
| **LLM cost for storage** | Yes (inference) | No |
| **Database schema context** | ❌ | ✅ (soul-schema) |

## When to Use CrewAI Memory

Choose CrewAI's built-in memory when:

1. **You want zero configuration** — `memory=True` and you're done
2. **Auto-organization matters** — Let the LLM decide where memories belong
3. **You don't need to audit memories** — The black box is fine
4. **You're already using CrewAI's ecosystem** — Flows, agents, tasks all integrate seamlessly

```python
from crewai import Crew

crew = Crew(
    agents=[...],
    tasks=[...],
    memory=True,  # That's it
)
```

## When to Use crewai-soul

Choose crewai-soul when:

1. **You need to see what's in memory** — Debugging, auditing, compliance
2. **Memory should be version-controlled** — Track changes over time with git
3. **Humans need to edit memories** — Fix mistakes, add context manually
4. **You want git-ops for agents** — Memory changes show up in PRs
5. **You need RLM (exhaustive retrieval)** — For queries that need the full picture
6. **Production with managed infrastructure** — Use SoulMate API

```python
from crewai_soul import SoulMemory

# Local (git-tracked)
memory = SoulMemory()

# Or managed (SoulMate API)
from crewai_soul import SoulMateMemory
memory = SoulMateMemory(api_key="...")

crew = Crew(
    agents=[...],
    memory=memory,
)
```

## The Hybrid Approach

Nothing stops you from using both. CrewAI Memory for runtime auto-organization, crewai-soul for audit logs:

```python
from crewai import Crew, Memory
from crewai_soul import SoulMemory

# CrewAI Memory for runtime
crew = Crew(
    agents=[...],
    memory=Memory(),
)

# crewai-soul for audit trail
audit = SoulMemory(memory_path="AUDIT.md")

# After each crew run, log to audit
audit.remember(f"Crew completed task: {result.summary}")
```

## Bonus: Database Schema Intelligence

crewai-soul includes [soul-schema](https://github.com/menonpg/soul-schema) integration for agents that work with databases:

```python
from crewai_soul import SchemaMemory

schema = SchemaMemory("postgresql://...")
schema.generate()  # Auto-generate column/table descriptions

# Get relevant schema for a query
context = schema.context_for("Show me revenue by region")
```

This gives your Text-to-SQL agents the semantic layer they need without manual documentation.

## Installation

```bash
# crewai-soul (includes soul-agent + soul-schema)
pip install crewai-soul

# CrewAI Memory is built-in
pip install crewai
```

## Links

- [crewai-soul on PyPI](https://pypi.org/project/crewai-soul)
- [crewai-soul on GitHub](https://github.com/menonpg/crewai-soul)
- [soul.py (soul-agent)](https://github.com/menonpg/soul.py)
- [CrewAI Memory docs](https://docs.crewai.com/concepts/memory)
- [SoulMate (managed)](https://menonpg.github.io/soulmate)

---

*Different tools for different problems. CrewAI Memory is great for auto-organizing runtime memory. crewai-soul is great when you need transparency, version control, and human oversight. Pick the one that fits your workflow—or use both.*
