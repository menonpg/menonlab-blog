---
title: "Vanna AI: The Open-Source Text-to-SQL That Actually Works (Locally)"
description: "A deep dive into Vanna AI 2.0 — the MIT-licensed framework that turns natural language into SQL queries. Works with any LLM (including local Ollama models), any database, and ships with a production-ready UI."
date: "2026-03-04"
tags: ["ai", "sql", "open-source", "llm", "data-analysis"]
---

After years of half-baked demos and cloud-only solutions, we finally have a Text-to-SQL framework that delivers on all fronts: **Vanna AI 2.0**. It's open-source (MIT license), works with local LLMs via Ollama, connects to virtually any database, and includes a production-ready web interface out of the box.

## Why This Matters

Every data team has the same bottleneck: business stakeholders need answers, but they can't write SQL. They file tickets. Analysts queue requests. Reports take days. Text-to-SQL promises to change this — ask a question in plain English, get SQL that runs against your database.

The problem? Most solutions either require sending your data to cloud APIs (privacy nightmare) or have such poor accuracy they're useless in production. Vanna 2.0 solves both.

## What Makes Vanna Different

### 1. True Local LLM Support

Vanna works with **any LLM** — including local models via Ollama. This means your data never leaves your infrastructure:

```python
from vanna.integrations.ollama import OllamaLlmService

llm = OllamaLlmService(model="llama3.2")  # or codellama, mistral, etc.
```

Want better SQL-specific performance? Pair it with **SQLCoder**, Defog's open-source model that [outperforms GPT-4 on text-to-SQL benchmarks](https://github.com/defog-ai/sqlcoder). SQLCoder-7b-2 achieves 91.4% accuracy on complex ratio queries where GPT-4 scores 80%.

### 2. Works With Any Database

Postgres, MySQL, SQLite, Snowflake, BigQuery, Oracle, DuckDB, ClickHouse — Vanna connects to them all. The framework abstracts database connections so you can swap backends without changing your application code:

```python
from vanna.integrations.postgres import PostgresRunner
from vanna.integrations.sqlite import SqliteRunner

# Switch between databases with one line
sql_runner = PostgresRunner(connection_string="postgresql://...")
# or
sql_runner = SqliteRunner("./local.db")
```

### 3. Production-Ready Web UI

Unlike research projects that dump you into notebooks, Vanna 2.0 ships with a pre-built `<vanna-chat>` web component. Drop it into any page:

```html
<script src="https://img.vanna.ai/vanna-components.js"></script>
<vanna-chat 
  sse-endpoint="https://your-api.com/chat"
  theme="dark">
</vanna-chat>
```

The UI streams responses in real-time — not just text, but interactive data tables and Plotly charts. It works on mobile, supports dark/light themes, and integrates with React, Vue, or plain HTML.

### 4. Enterprise Security Built-In

This is where Vanna 2.0 really shines. User identity flows through the entire system:

- **Row-level security**: Queries automatically filtered by user permissions
- **Audit logs**: Every query tracked per user for compliance
- **Rate limiting**: Per-user quotas via lifecycle hooks
- **Your auth system**: Bring your own cookies, JWTs, or OAuth tokens

```python
class MyUserResolver(UserResolver):
    async def resolve_user(self, request_context: RequestContext) -> User:
        token = request_context.get_header('Authorization')
        user_data = self.decode_jwt(token)
        return User(
            id=user_data['id'],
            group_memberships=user_data['groups']  # Controls permissions
        )
```

## Getting Started in 5 Minutes

Here's a complete local setup with Ollama and SQLite:

```bash
# Install Vanna
pip install vanna

# Install Ollama (if not already)
brew install ollama
ollama pull llama3.2
```

```python
from fastapi import FastAPI
from vanna import Agent
from vanna.servers.fastapi.routes import register_chat_routes
from vanna.servers.base import ChatHandler
from vanna.integrations.ollama import OllamaLlmService
from vanna.tools import RunSqlTool
from vanna.integrations.sqlite import SqliteRunner
from vanna.core.registry import ToolRegistry

app = FastAPI()

# Configure local LLM
llm = OllamaLlmService(model="llama3.2")

# Set up database connection
tools = ToolRegistry()
tools.register(RunSqlTool(sql_runner=SqliteRunner("./chinook.db")))

# Create agent
agent = Agent(llm_service=llm, tool_registry=tools)

# Add routes
chat_handler = ChatHandler(agent)
register_chat_routes(app, chat_handler)
```

Run with `uvicorn main:app --reload`, open `localhost:8000`, and start asking questions.

## Improving Accuracy with Training Data

Vanna uses RAG (Retrieval-Augmented Generation) to improve SQL accuracy. You can train it on your schema and example queries:

```python
# Train on your schema (DDL)
vn.train(ddl="CREATE TABLE customers (id INT, name VARCHAR, region VARCHAR)")

# Train on example question-SQL pairs
vn.train(
    question="How many customers do we have in Europe?",
    sql="SELECT COUNT(*) FROM customers WHERE region = 'Europe'"
)

# Train on documentation
vn.train(documentation="Region codes: NA=North America, EU=Europe, APAC=Asia Pacific")
```

The more context you provide, the better Vanna understands your specific database schema and business terminology.

## Benchmarks: How Does It Compare?

On the [BIRD benchmark](https://bird-bench.github.io/), which tests real-world SQL generation:

| System | Execution Accuracy |
|--------|-------------------|
| GPT-4o (API) | ~72% |
| Contextual-SQL (local, Qwen-32B) | ~73% |
| Vanna + SQLCoder-7b (local) | ~65-70%* |
| Vanna + GPT-4 (API) | ~70-75%* |

*Varies by training data and schema complexity

The key insight: local models with good context (RAG training) approach cloud API performance. [Contextual AI's research](https://contextual.ai/blog/open-sourcing-the-best-local-text-to-sql-system) shows that inference-time scaling — generating multiple candidate queries and selecting the best one — helps local models compete with larger API models.

## Alternative: DataLine for Quick Analysis

If you want a simpler, GUI-first approach, check out [DataLine](https://github.com/RamiAwar/dataline). It's a standalone app (Docker or binary) that provides chat-based data analysis with automatic chart generation. Privacy-focused by default — it can hide your actual data from LLMs while still generating accurate SQL.

```bash
docker run -p 7377:7377 -v dataline:/home/.dataline ramiawar/dataline:latest
```

DataLine is better for ad-hoc exploration; Vanna is better for building production applications.

## The Bottom Line

Text-to-SQL has crossed the threshold from "interesting demo" to "actually useful." Vanna 2.0 gives you:

- **Privacy**: Run everything locally with Ollama
- **Flexibility**: Any LLM, any database
- **Production-ready**: Real UI, real security, real scalability
- **MIT license**: Use it however you want

For teams drowning in SQL tickets, this is the escape hatch. Your analysts become force multipliers instead of query machines, and business users get self-service access to data insights.

The code is on GitHub: [github.com/vanna-ai/vanna](https://github.com/vanna-ai/vanna)

---

**References:**
- [Vanna AI GitHub](https://github.com/vanna-ai/vanna)
- [Vanna 2.0 Documentation](https://vanna.ai/docs)
- [SQLCoder by Defog](https://github.com/defog-ai/sqlcoder)
- [DataLine](https://github.com/RamiAwar/dataline)
- [Contextual AI: Open-Sourcing the Best Local Text-to-SQL System](https://contextual.ai/blog/open-sourcing-the-best-local-text-to-sql-system)
- [BIRD Benchmark](https://bird-bench.github.io/)
