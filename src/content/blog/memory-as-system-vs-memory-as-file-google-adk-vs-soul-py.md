---
title: "Memory as a System vs Memory as a File: Google ADK vs soul.py"
description: "Two fundamentally different approaches to AI agent memory — Google's always-on consolidation daemon vs soul.py's file-based retrieval primitive. A deep technical comparison with code examples."
date: "2026-03-06"
tags: ["AI agents", "memory", "Google ADK", "soul.py", "LLM"]
---

Google just open-sourced an [always-on memory agent](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents/always-on-memory-agent) built on their Agent Development Kit (ADK). It's designed to run 24/7 on Gemini 3.1 Flash-Lite, continuously ingesting, consolidating, and serving memory.

This is a fundamentally different approach than what we built with [soul.py](https://github.com/menonpg/soul.py). Same problem — AI agents have amnesia — but two very different solutions.

**Google ADK**: Memory as a system process  
**soul.py**: Memory as a file primitive

Let's break down what that means.

---

## The Core Philosophy

### Google ADK: Active Consolidation

Google's agent runs as a daemon. It watches a folder for incoming files, processes them into structured memories, and periodically consolidates — finding connections between memories like the human brain does during sleep.

```
        Incoming Files
              │
              ▼
    ┌─────────────────┐
    │  IngestAgent    │───▶ SQLite
    └─────────────────┘
              │
              │ (every 30 min)
              ▼
    ┌─────────────────┐
    │ConsolidateAgent │───▶ Cross-references
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │  QueryAgent     │◀─── User questions
    └─────────────────┘
```

The key insight: **memory is processed proactively**, not just when you query. The system is always working in the background, building connections you haven't asked for yet.

### soul.py: Smart Retrieval

soul.py takes the opposite approach. Memory is just a markdown file (`MEMORY.md`). Nothing runs in the background. When you ask a question, the system retrieves what it needs using either:

- **RAG** (vector search) for focused lookups
- **RLM** (recursive synthesis) for exhaustive queries

```
        User Query
             │
             ▼
    ┌─────────────────┐
    │     Router      │ (FOCUSED or EXHAUSTIVE?)
    └─────────────────┘
             │
     ┌───────┴───────┐
     ▼               ▼
┌─────────┐    ┌─────────┐
│   RAG   │    │   RLM   │
│(vector) │    │(chunks) │
└─────────┘    └─────────┘
     │               │
     └───────┬───────┘
             ▼
    ┌─────────────────┐
    │    MEMORY.md    │ (plain text)
    └─────────────────┘
```

The key insight: **retrieval is intelligent**, not storage. The file is dumb. The query path is smart.

---

## Architecture Comparison

| Aspect | Google ADK | soul.py |
|--------|-----------|---------|
| **Runtime model** | Always-on daemon | Stateless per-call |
| **Storage** | SQLite (structured) | Markdown (human-readable) |
| **Processing** | Proactive (background) | Reactive (on-demand) |
| **Consolidation** | Automatic (timed) | Manual or none |
| **Identity** | None | SOUL.md defines persona |
| **Multimodal** | ✅ Images, audio, video, PDF | ❌ Text only |
| **LLM Provider** | Gemini only | Any (Anthropic, OpenAI, Gemini, local) |
| **Cost model** | 24/7 inference | Pay per query |
| **Git-friendly** | ❌ Binary DB | ✅ Diffable text |

---

## Code Walkthrough

### Google ADK: The Consolidation Loop

This is the heart of Google's approach — a timer that runs every 30 minutes:

```python
async def consolidation_loop(agent: MemoryAgent, interval_minutes: int = 30):
    """Run consolidation periodically, like sleep cycles."""
    while True:
        await asyncio.sleep(interval_minutes * 60)
        
        # Check if there's enough to consolidate
        db = get_db()
        count = db.execute(
            "SELECT COUNT(*) FROM memories WHERE consolidated = 0"
        ).fetchone()["c"]
        
        if count >= 2:
            # Find connections between memories
            result = await agent.consolidate()
```

The `ConsolidateAgent` then does the real work:

```python
consolidate_agent = Agent(
    name="consolidate_agent",
    model="gemini-3.1-flash-lite-preview",
    instruction="""
    You are a Memory Consolidation Agent. You:
    1. Call read_unconsolidated_memories to see what needs processing
    2. Find connections and patterns across the memories
    3. Create a synthesized summary and one key insight
    4. Call store_consolidation with source_ids, summary, insight, and connections
    
    Think deeply about cross-cutting patterns.
    """,
    tools=[read_unconsolidated_memories, store_consolidation],
)
```

Example output from consolidation:

```
Memory #1: "AI agents are growing fast but reliability is a challenge"
Memory #2: "Q1 priority: reduce inference costs by 40%"
Memory #3: "Current LLM memory approaches all have gaps"
                    │
                    ▼ ConsolidateAgent
    ┌─────────────────────────────────────────────┐
    │ Connections:                                │
    │   #1 ↔ #3: Agent reliability needs better   │
    │            memory architectures             │
    │   #2 ↔ #1: Cost reduction enables scaling   │
    │            agent deployment                 │
    │                                             │
    │ Insight: "The bottleneck for next-gen AI    │
    │  tools is the transition from static RAG    │
    │  to dynamic memory systems"                 │
    └─────────────────────────────────────────────┘
```

### soul.py: The Query Router

soul.py's intelligence is in the router — a fast LLM call that decides which retrieval strategy to use:

```python
ROUTER_PROMPT = """Classify this query for a memory retrieval system:
"{query}"

FOCUSED: Specific lookup (name, fact, date, single topic)
EXHAUSTIVE: Needs synthesis across many memories (patterns, summaries, all, every, compare)

Reply with exactly one word: FOCUSED or EXHAUSTIVE"""

def classify(query: str, client, model: str = "claude-haiku-4-5") -> dict:
    result = client.messages_create(
        model=model, 
        max_tokens=5,
        messages=[{"role":"user","content":ROUTER_PROMPT.format(query=query)}],
    )
    route = "EXHAUSTIVE" if "EXHAUSTIVE" in result.upper() else "FOCUSED"
    return {"route": route}
```

Then the `HybridAgent` dispatches to the right retrieval:

```python
class HybridAgent:
    def ask(self, query: str) -> dict:
        # Route the query
        routing = classify(query, self.client, self.router_model)
        
        if routing["route"] == "FOCUSED":
            # RAG: vector search, return top-k chunks
            context = self.rag.retrieve(query, k=5)
        else:
            # RLM: recursive chunking and synthesis
            context = self.rlm.retrieve(query)
        
        # Generate answer with retrieved context
        answer = self._generate(query, context)
        return {"answer": answer, "route": routing["route"]}
```

---

## Real Usage Examples

### Google ADK: Drop files, query later

```bash
# Start the agent
python agent.py --watch ./inbox --port 8888

# Drop any file — text, image, audio, video, PDF
echo "Anthropic reports 62% of Claude usage is code-related" > inbox/note.txt
cp meeting_recording.mp3 inbox/
cp product_spec.pdf inbox/

# Agent processes automatically, consolidates every 30 min

# Query anytime
curl "http://localhost:8888/query?q=what+are+my+priorities"
```

Response:
```json
{
  "question": "what are my priorities",
  "answer": "Based on your memories, prioritize:
    1. Ship the API by March 15 [Memory 2]
    2. The agent reliability gap [Memory 1] could be addressed 
       by the reconstructive memory approach [Memory 3]"
}
```

### soul.py: Code first, files persist

```python
from hybrid_agent import HybridAgent

# Initialize (uses SOUL.md and MEMORY.md in current directory)
agent = HybridAgent(provider="anthropic")

# Ask questions — memory persists automatically
agent.ask("My name is Prahlad and I'm building an AI research lab")

# Later (even in a new process)
agent = HybridAgent()
result = agent.ask("What do you know about me?")
print(result["answer"])  # → "You're Prahlad, building an AI research lab"
print(result["route"])   # → "FOCUSED" (used RAG)

# Exhaustive query
result = agent.ask("Summarize everything I've told you about my work")
print(result["route"])   # → "EXHAUSTIVE" (used RLM)
```

Your MEMORY.md after the conversation:

```markdown
# Memory Log

## 2026-03-06 08:30:15 UTC
**User**: My name is Prahlad and I'm building an AI research lab
**Assistant**: Nice to meet you, Prahlad! That's exciting work...

## 2026-03-06 08:31:02 UTC  
**User**: What do you know about me?
**Assistant**: You're Prahlad, and you're building an AI research lab.
```

Human-readable. Git-diffable. Yours forever.

---

## When to Use Which

### Choose Google ADK when:

- **Multimodal is essential** — you're ingesting images, audio, video, PDFs, not just text
- **Background processing is valuable** — you want connections discovered proactively, not just when asked
- **You're building a daemon** — the agent is a service, not a library
- **Gemini-native is fine** — you're already on Google Cloud, cost is negligible with Flash-Lite
- **24/7 operation matters** — the agent needs to stay warm and ready

### Choose soul.py when:

- **Provider flexibility** — you need Anthropic, OpenAI, local models, not just Gemini
- **Human-readable memory** — you want to read, edit, and git-version your agent's memories
- **Identity matters** — you need SOUL.md to define who the agent *is*, not just what it knows
- **Stateless deployment** — you want a library, not a background service
- **Cloud option** — SoulMate API if you want managed memory without self-hosting

---

## The Hybrid Approach

Here's the thing: these aren't mutually exclusive.

You could run Google's consolidation daemon **on top of** soul.py's MEMORY.md:

1. soul.py handles identity (`SOUL.md`) and memory logging (`MEMORY.md`)
2. A background job (Google ADK-style) reads `MEMORY.md` periodically
3. The consolidation agent finds patterns and appends **insights** to a new section
4. soul.py's RAG retrieves these consolidated insights during queries

```markdown
# Memory Log
(timestamped exchanges)

# Consolidated Insights
(patterns discovered by background agent)
```

Best of both worlds:
- ✅ Human-readable markdown
- ✅ Provider-agnostic queries  
- ✅ Git-versioned history
- ✅ Proactive consolidation
- ✅ Identity persistence

---

## Conclusion

Google's ADK memory agent is **memory as a system** — always running, actively processing, finding connections you didn't ask for. It's brilliant for multimodal pipelines and continuous ingestion.

soul.py is **memory as a file** — dormant until queried, intelligently retrieved, human-readable. It's perfect for agents that need identity, provider flexibility, and version control.

The gap they both fill: **AI agents shouldn't have amnesia**. 

The difference is whether you want your memory layer to think while you sleep (Google), or to wake up smart when you ask (soul.py).

Both are valid. Both are open-source. Try them both.

---

**Links:**
- [Google ADK Always-On Memory Agent](https://github.com/GoogleCloudPlatform/generative-ai/tree/main/gemini/agents/always-on-memory-agent)
- [soul.py on GitHub](https://github.com/menonpg/soul.py)
- [SoulMate API (managed cloud)](https://soulmate-api.themenonlab.com/docs)
- [RAG + RLM architecture deep dive](/blog/rag-plus-rlm-complete-knowledge-base-architecture)
