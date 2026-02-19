---
title: "Code vs JSON: The Evolution of LLM Tool Calling"
description: "From academic research to production systems, why the AI industry is converging on code-based tool calling over JSON schemas"
pubDate: 2026-02-19
tags: ["ai-agents", "llm", "anthropic", "huggingface", "tool-calling"]
---

There's a quiet revolution happening in how we build AI agents, and it's elegantly simple: let LLMs write code instead of JSON.

## The Problem with JSON Tool Calling

Traditional tool calling works like this: you define tools as JSON schemas, the model outputs a JSON blob specifying which tool to call with what arguments, you parse it, execute it, and return the result. Repeat for every action.

This approach has fundamental limitations:

- **Round-trip latency**: Every tool call requires a full inference pass
- **Context pollution**: All intermediate results pile into the context window, whether useful or not
- **Limited composability**: You can't nest actions, define reusable functions, or handle complex control flow
- **Brittle parsing**: JSON schemas can't express usage patterns—when to use optional parameters, which combinations make sense

## CodeAct: The Academic Foundation

The research community spotted this problem early. In February 2024, researchers at the University of Illinois published **"Executable Code Actions Elicit Better LLM Agents"** (CodeAct), demonstrating up to 20% higher success rates when LLMs express actions as Python code rather than JSON.

The insight was almost obvious in retrospect: we designed programming languages specifically to express computer actions precisely. If JSON were better, we'd all be programming in JSON. The paper showed that code-based actions provide:

- **Natural composability**: Functions call functions, loops iterate, conditionals branch
- **Object management**: Store and manipulate outputs as variables
- **Training data advantage**: LLMs have seen vastly more quality code than JSON tool schemas

## HuggingFace's smolagents: Productionizing the Research

In December 2024, HuggingFace released **smolagents**, explicitly building on the CodeAct research. Their `CodeAgent` class writes actions as executable Python, running in sandboxed environments for security.

```python
from smolagents import CodeAgent, DuckDuckGoSearchTool, HfApiModel

agent = CodeAgent(tools=[DuckDuckGoSearchTool()], model=HfApiModel())
agent.run("How many seconds would it take for a leopard at full speed to run through Pont des Arts?")
```

The agent doesn't output JSON like `{"tool": "search", "query": "leopard speed"}`. It writes actual Python that calls tools, processes results, and computes the answer—all in one coherent script.

HuggingFace was clear about the lineage: their documentation directly cites the CodeAct paper and explains why code is the superior action representation.

## Anthropic's Programmatic Tool Calling

Earlier this week, Anthropic released advanced tool use features for Claude, including **Programmatic Tool Calling**. The approach is remarkably similar to what smolagents has been doing:

1. Claude writes Python code that invokes tools as functions
2. Code runs in a sandboxed container via code execution
3. When a tool function is called, execution pauses and returns a `tool_use` block
4. You provide the result, execution continues
5. Only final outputs enter Claude's context window

The benefits Anthropic highlights match the CodeAct findings almost exactly:

- **37% reduction in token consumption** by keeping intermediate results out of context
- **Eliminated inference round-trips** for multi-tool workflows
- **More reliable orchestration** through explicit code rather than implicit reasoning

Consider their example: checking which team members exceeded Q3 travel budgets. Traditional tool calling means 20+ separate inference passes (fetch each person's expenses, look up budgets, compare). With programmatic tool calling, Claude writes one Python script that does everything—parallel fetches, loops, conditionals—and only the final list of budget violators enters context.

## Gemini's Agentic Vision: Code for Multimodal

Google is applying the same principle to vision tasks. **Agentic Vision** in Gemini 3 Flash combines visual reasoning with code execution:

- **Think**: Model analyzes the image and formulates a plan
- **Act**: Generates Python to crop, rotate, annotate, or analyze images
- **Observe**: Transformed images append to context for inspection

Instead of asking an LLM to count fingers and hoping it doesn't hallucinate, Gemini writes code to draw bounding boxes on each finger—visual scratchpad meets programmatic verification. They're seeing consistent 5-10% quality improvements across vision benchmarks.

## Who Gets Credit?

There's been some discussion about attribution. Some pointed out that smolagents predated Anthropic's feature announcement. Others noted that CodeAct from University of Illinois predated both by nearly a year. Anthropic's engineering blog had discussed these patterns earlier in 2025.

The honest answer: this is convergent evolution driven by obvious benefits. The academic research established the theory, HuggingFace built the open-source tooling, Anthropic productionized it into their API, and Google extended it to vision. Each built on prior work—that's how technology progresses.

## What This Means for Agent Builders

If you're building AI agents today, the implications are clear:

1. **Prefer code-based tool orchestration** where possible—fewer round-trips, smaller context, more reliable execution
2. **Consider smolagents** for open-source implementations with multiple model support
3. **Use Anthropic's programmatic tool calling** when building with Claude for production workloads
4. **Think in scripts, not steps**—design workflows where the model writes coherent programs rather than making isolated tool decisions

The JSON-schema era of tool calling isn't dead—it's still simpler for basic use cases—but for complex, multi-step agentic workflows, the industry is converging on a better answer: just let the model write code.

---

*The Menon Lab explores emerging AI tools and techniques. Follow along as we dive into what's actually working in the agent ecosystem.*
