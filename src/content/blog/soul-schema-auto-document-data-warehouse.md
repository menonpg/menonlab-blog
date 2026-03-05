---
title: "soul-schema: Auto-Document Your Data Warehouse in 3 Minutes"
description: "An open-source tool that uses LLMs to auto-generate semantic layers from any database. Turns cryptic column names into human-readable descriptions, exports to dbt YAML and Vanna training data. Works air-gapped with Ollama."
date: "2026-03-04"
tags: ["data-engineering", "dbt", "llm", "open-source", "semantic-layer"]
---

You inherit a data warehouse. 100 tables. Zero documentation. Column names like `cust_ltv`, `flg_b2b`, `reg_cd`. The person who knew what they meant left in 2019.

Sound familiar?

**soul-schema** connects to your database, reads the schema, and uses an LLM to generate human-readable descriptions for every table and column — in about 3 minutes.

```bash
pip install soul-schema

soul-schema connect \
  --db "postgresql://user:pass@localhost/warehouse" \
  --llm anthropic \
  --key sk-ant-...
```

That's it. You now have documentation.

## The Before/After

Here's what a typical undocumented `customers` table looks like:

```sql
CREATE TABLE customers (
    cust_id     INTEGER PRIMARY KEY,
    cust_nm     VARCHAR(100),
    cust_email  VARCHAR(255),
    cust_ltv    DECIMAL(10,2),
    reg_cd      VARCHAR(10),
    flg_b2b     INTEGER,
    acq_dt      DATE,
    tier_cd     VARCHAR(20)
);
```

Quick — what's `flg_b2b`? What are the valid values for `reg_cd`? What does `tier_cd` represent?

After running soul-schema:

| Column | Description |
|--------|-------------|
| `cust_ltv` | Customer lifetime value in USD — total revenue attributed to this customer |
| `flg_b2b` | Boolean flag where 1 = B2B (business) customer and 0 = B2C (consumer) customer; determines pricing model and contract type |
| `reg_cd` | Registration region code indicating primary business region (NA = North America, EU = Europe); used for regional analytics and compliance |
| `tier_cd` | Customer tier classification (bronze, silver, gold, platinum) based on LTV or engagement level; drives support prioritization and benefits |

The LLM infers meaning from column names, data types, and a small sample of values. It's not magic — it's pattern recognition at scale.

## Export to dbt YAML

The real payoff: soul-schema exports directly to dbt's `schema.yml` format.

```bash
soul-schema export --format dbt
```

Output:

```yaml
version: 2

models:
  - name: customers
    description: "Core customer master table storing account information, 
                  acquisition details, and engagement metrics for both 
                  B2B and B2C customers."
    columns:
      - name: cust_id
        description: "Unique primary key identifier for each customer account."
      - name: cust_ltv
        description: "Customer lifetime value in USD — total revenue 
                      attributed to this customer"
      - name: flg_b2b
        description: "Boolean flag where 1 = B2B (business) customer 
                      and 0 = B2C (consumer) customer."
      - name: reg_cd
        description: "Registration region code (NA = North America, 
                      EU = Europe); used for regional analytics."
```

Drop that into your dbt project and you've got documentation that actually shows up in dbt docs.

## Export to Vanna Training Data

Building a Text-to-SQL solution? soul-schema exports to Vanna's training format:

```bash
soul-schema export --format vanna
```

```json
[
  {
    "question": "What is customers.cust_ltv?",
    "answer": "Customer lifetime value in USD — total revenue attributed to this customer"
  },
  {
    "question": "What is customers.flg_b2b?",
    "answer": "Boolean flag where 1 = B2B (business) customer and 0 = B2C (consumer)"
  }
]
```

This is the training data that tools like Vanna AI need to understand your schema. Without it, Text-to-SQL accuracy suffers. With it, the LLM knows that `flg_b2b = 1` means "business customer."

## Corrections That Stick

Here's where soul-schema differs from one-shot documentation generators: **corrections are permanent**.

```bash
soul-schema review
```

This opens an interactive terminal UI where you can edit any description. When you save a correction, it's marked as "locked" — future runs won't overwrite it.

```markdown
### cust_ltv
- **Desc:** Customer lifetime value in USD — total revenue attributed to this customer
- **Locked:** true
```

The semantic layer learns from your corrections. Over time, the human-curated parts stay stable while auto-generated parts improve.

## Air-Gapped with Ollama

Sensitive data? Can't send metadata to external APIs? Run fully local:

```bash
# Start Ollama with llama3.2
ollama serve
ollama pull llama3.2

# Connect with local LLM
soul-schema connect \
  --db "postgresql://..." \
  --llm openai-compatible \
  --base-url http://localhost:11434/v1 \
  --model llama3.2
```

No data leaves your network. The schema stays local, the LLM runs local, the output stays local.

## How It Works

1. **Connect** — SQLAlchemy connects to your database
2. **Extract** — Reads INFORMATION_SCHEMA + samples 10 rows per table (for type inference)
3. **Generate** — Sends table/column names + samples to your chosen LLM
4. **Store** — Saves descriptions to a markdown file (`schema_memory.md`)
5. **Export** — Converts to dbt YAML, Vanna JSON, or portable JSON

**Important:** Only metadata is processed. Column names, data types, and a small sample. No bulk data extraction. No row-level data leaves your infrastructure.

## The Positioning

| | Alation / Collibra | Unity Catalog | soul-schema |
|---|---|---|---|
| **Cost** | $100K+/yr | Databricks only | Free / OSS |
| **Setup** | Weeks | Days | Minutes |
| **Metadata generation** | Manual | Semi-auto | Automatic |
| **Learns from corrections** | ❌ | ❌ | ✅ |
| **Works with any database** | ✅ | ❌ | ✅ |
| **Air-gapped (local LLM)** | ❌ | ❌ | ✅ |

soul-schema isn't trying to replace enterprise data catalogs. It's for teams that need documentation *now*, can't spend $100K, and don't want to manually write descriptions for 500 columns.

## Get Started

```bash
pip install soul-schema

# Anthropic
soul-schema connect --db "postgresql://..." --llm anthropic --key sk-ant-...

# OpenAI
soul-schema connect --db "postgresql://..." --llm openai --key sk-...

# Ollama (air-gapped)
soul-schema connect --db "postgresql://..." --llm openai-compatible \
  --base-url http://localhost:11434/v1 --model llama3.2

# Review and correct
soul-schema review

# Export
soul-schema export --format dbt
soul-schema export --format vanna
soul-schema export --format json
```

The code is MIT licensed: [github.com/menonpg/soul-schema](https://github.com/menonpg/soul-schema)

Real examples with actual output: [github.com/menonpg/soul-schema/tree/main/examples](https://github.com/menonpg/soul-schema/tree/main/examples)

## What's Next

Based on community feedback, here's what's coming:

**Schema Diffing** — Compare baseline snapshots against current database. Detect drift: new tables, removed columns, type changes. Run `soul-schema diff --baseline v1.json --current jdbc:...` to see what changed.

**PII Detection** — Automatically flag columns that look like personally identifiable information (`*_ssn`, `*_email`, phone patterns). Security teams get notified about potentially sensitive columns during documentation.

**CI Integration** — GitHub Action that runs schema checks in PRs. Flag suspicious columns before merge. Pair this with schema diffing to catch "we added a column that looks like a user identifier" automatically.

Full roadmap: [ROADMAP.md](https://github.com/menonpg/soul-schema/blob/main/ROADMAP.md)

---

*Updated: March 2026 — Added roadmap section*

---

**References:**
- [soul-schema on GitHub](https://github.com/menonpg/soul-schema)
- [soul-schema on PyPI](https://pypi.org/project/soul-schema/)
- [dbt schema.yml documentation](https://docs.getdbt.com/reference/configs-and-properties)
- [Vanna AI](https://github.com/vanna-ai/vanna)
- [Ollama](https://ollama.ai/)
