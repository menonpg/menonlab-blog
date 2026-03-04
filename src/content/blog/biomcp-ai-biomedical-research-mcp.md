---
title: "BioMCP: Connecting AI to 15+ Biomedical Databases"
description: "A deep dive into BioMCP, an open-source MCP server that gives AI assistants direct access to PubMed, ClinicalTrials.gov, ClinVar, and more for biomedical research."
date: "2026-03-04"
tags: ["mcp", "biomedical", "ai-tools", "research", "open-source"]
---

If you've ever wished you could ask Claude or another AI assistant to look up a gene variant in ClinVar, find recruiting clinical trials, or search PubMed—all within a single conversation—BioMCP makes that possible. It's an open-source [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that connects AI assistants directly to over 15 biomedical databases through a unified command grammar.

## What Is BioMCP?

[BioMCP](https://biomcp.org/) is a single-binary CLI and MCP server developed by [GenomOncology](https://github.com/genomoncology/biomcp). It provides a consistent interface for querying diverse biomedical data sources—from gene databases to clinical trial registries to drug safety reports. The project is MIT-licensed, written in Rust, and works with Claude Desktop, Cursor, and any MCP-compatible client.

The key insight behind BioMCP is that biomedical research requires consulting multiple databases that each have their own APIs, authentication schemes, and query languages. BioMCP normalizes all of this into a simple grammar:

```bash
search <entity> [filters]    # Discovery
get <entity> <id> [sections] # Focused detail
<entity> <helper> <id>       # Cross-entity pivots
```

## Supported Databases and Entities

BioMCP connects to an impressive array of authoritative sources across 12 entity types:

| Entity | Data Sources |
|--------|-------------|
| **Gene** | MyGene.info, UniProt, Reactome, QuickGO, STRING, CIViC |
| **Variant** | MyVariant.info, ClinVar, gnomAD, CIViC, OncoKB, cBioPortal, GWAS Catalog, AlphaGenome |
| **Article** | PubMed, PubTator3, Europe PMC |
| **Trial** | ClinicalTrials.gov, NCI CTS API |
| **Drug** | MyChem.info, ChEMBL, OpenTargets, Drugs@FDA, CIViC |
| **Disease** | Monarch Initiative, MONDO, CIViC, OpenTargets |
| **Pathway** | Reactome, g:Profiler |
| **Protein** | UniProt, InterPro, STRING, PDB/AlphaFold |
| **Adverse Event** | OpenFDA (FAERS, MAUDE, Recalls) |
| **PGx** | CPIC, PharmGKB |
| **GWAS** | GWAS Catalog |
| **Phenotype** | Monarch Initiative (HPO) |

Most queries work without any API keys. Optional keys for NCBI, OpenFDA, OncoKB, and AlphaGenome improve rate limits or enable additional features.

## Installation and Setup

Getting started takes about 30 seconds:

```bash
# Install the binary
curl -fsSL https://raw.githubusercontent.com/genomoncology/biomcp/main/install.sh | bash

# Verify it works
biomcp health --apis-only
```

To use BioMCP with Claude Desktop or Cursor, add this to your MCP configuration:

```json
{
  "mcpServers": {
    "biomcp": {
      "command": "biomcp",
      "args": ["serve"]
    }
  }
}
```

BioMCP also includes 14 "skills"—guided investigation workflows—that you can install into your agent directory:

```bash
biomcp skill install ~/.claude --force
```

These skills provide structured prompts for common research tasks like variant-to-treatment workflows, rare disease investigation, and pharmacogenomics analysis.

## Practical Examples

Here's what makes BioMCP genuinely useful. Instead of manually navigating multiple websites, you can query directly:

**Find clinical trials for a specific mutation:**
```bash
biomcp variant trials "BRAF V600E" --limit 5
```

**Get drug safety data:**
```bash
biomcp drug adverse-events pembrolizumab
biomcp search adverse-event -d pembrolizumab
```

**Research a gene with pathway context:**
```bash
biomcp get gene BRAF pathways interactions
biomcp gene articles BRCA1
```

**Search for recruiting trials by condition:**
```bash
biomcp search trial -c melanoma -s recruiting
```

**Gene set enrichment analysis:**
```bash
biomcp enrich BRAF,KRAS,NRAS --limit 10
```

**Pharmacogenomics recommendations:**
```bash
biomcp get pgx CYP2D6 recommendations
```

The cross-entity helpers are particularly powerful—they let you pivot between related data without rebuilding queries. Start with a disease, find associated genes, then pivot to clinical trials.

## Built-in Skills for Complex Workflows

BioMCP bundles 14 guided investigation workflows that demonstrate best practices for common research scenarios:

- **Variant to Treatment** — Map variants to evidence-based treatment options
- **Trial Searching** — Patient matching against recruiting trials
- **Rare Disease** — Evidence gathering and trial strategy for rare conditions
- **Hereditary Cancer** — Comprehensive syndrome workup
- **Pharmacogenomics** — Gene-drug interactions and dosing guidance
- **Literature Synthesis** — Evidence synthesis with automatic cross-entity verification

View available skills with `biomcp skill list` and read any skill with `biomcp skill show 03`.

## Why This Matters

For researchers, BioMCP transforms the AI assistant from a general-purpose chatbot into a biomedical research partner with direct database access. Instead of relying on the AI's training data (which may be outdated), you get live queries against authoritative sources.

For developers building biomedical AI applications, BioMCP provides a well-designed foundation. The unified grammar, caching layer (at `~/.cache/biomcp`), and built-in rate limiting mean you don't need to implement the plumbing for each data source yourself.

The progressive disclosure model is also worth noting—`get` commands support selectable sections, so you can request just what you need (summary, pathways, interactions) rather than pulling everything.

## Getting Started

1. Install BioMCP: `curl -fsSL https://raw.githubusercontent.com/genomoncology/biomcp/main/install.sh | bash`
2. Run `biomcp list` to see all available entities and commands
3. Try `biomcp get gene BRAF` for a quick test
4. Configure your MCP client to use `biomcp serve`

The [full documentation](https://biomcp.org/) includes detailed guides for each entity type, troubleshooting help, and API reference material.

---

**References:**
- [BioMCP Official Site](https://biomcp.org/)
- [GitHub Repository](https://github.com/genomoncology/biomcp)
- [Data Sources Reference](https://biomcp.org/reference/data-sources/)
- [Skills Documentation](https://biomcp.org/getting-started/skills/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
