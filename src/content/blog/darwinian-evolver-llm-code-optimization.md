---
title: "Imbue's Darwinian Evolver: When LLMs Learn to Evolve Code"
description: "Imbue just open-sourced a framework that treats code and prompts like organisms — mutating, scoring, and evolving them toward better solutions. They used it to more than double reasoning performance on ARC-AGI."
date: "2026-02-28"
tags: ["llm", "code-optimization", "evolutionary-algorithms", "imbue", "arc-agi", "open-source"]
---

What if instead of manually tweaking prompts and debugging code, you could just let them evolve?

Imbue (formerly Generally Intelligent) just open-sourced a framework that does exactly that. The Darwinian Evolver treats code and prompts like organisms in a population — mutating them, scoring their fitness, and letting the best solutions survive to reproduce.

The results speak for themselves: they used it to more than double a model's reasoning performance on ARC-AGI tasks.

## The Problem It Solves

Anyone who's built LLM-based applications knows the pain. You tweak a prompt to fix one issue, and it breaks something else. You adjust the tool calling logic, and now your carefully tuned prompt doesn't work anymore. Optimization becomes a game of whack-a-mole.

Traditional prompt optimization frameworks like DSPy's MIPRO help, but they're limited. They typically optimize a single prompt in isolation, without considering the surrounding harnesses and decision logic. And they often rely on few-shot prompting, which hits context length limits quickly.

Imbue's insight: treat the entire system as an evolvable organism.

## How It Works

The framework maintains a population of solutions. In each iteration:

1. **Select** promising parents from the population
2. **Mutate** them using an LLM to generate variations
3. **Evaluate** the new organisms against your test cases
4. **Survive** — the best solutions stay and reproduce

```
┌─────────────────────────────────────────────────────┐
│                    Population                        │
│  [Organism 1] [Organism 2] [Organism 3] ...         │
└─────────────────────┬───────────────────────────────┘
                      │ Select parents
                      ▼
┌─────────────────────────────────────────────────────┐
│                    Mutator (LLM)                     │
│  "Here's the code and where it failed.              │
│   Generate an improved version."                     │
└─────────────────────┬───────────────────────────────┘
                      │ Generate children
                      ▼
┌─────────────────────────────────────────────────────┐
│                    Evaluator                         │
│  Score each organism against test cases             │
└─────────────────────┬───────────────────────────────┘
                      │ Add best to population
                      ▼
                   [Repeat]
```

The key insight: **evolution is resilient**. Even if your mutator only produces a better solution 20% of the time, the framework can still leverage those successes. Bad mutations die off. Good ones propagate.

## What You Need to Define

To use the evolver on your own problem, you provide three things:

**1. Initial Organism**
The starting solution — a Python function, a prompt template, whatever you're optimizing.

```python
class MyPromptOrganism(Organism):
    prompt_template: str
```

**2. Evaluator**
A function that scores how well an organism performs and identifies where it fails.

```python
class MyEvaluator(Evaluator):
    def evaluate(self, organism) -> EvaluationResult:
        # Run tests, calculate score
        score = run_tests(organism)
        failures = find_failure_cases(organism)
        return EvaluationResult(score=score, trainable_failure_cases=failures)
```

**3. Mutator**
An LLM-powered function that takes an organism and its failure cases, then generates improved versions.

```python
class MyMutator(Mutator):
    def mutate(self, organism, failure_cases) -> list[Organism]:
        diagnosis = llm.diagnose_failure(organism, failure_cases[0])
        new_code = llm.generate_fix(organism, diagnosis)
        return [MyOrganism(code=new_code)]
```

That's it. The framework handles selection, population management, and the evolutionary loop.

## Why This Is Different

**It's end-to-end.** Unlike single-prompt optimizers, you can evolve entire agent systems — prompts, tool definitions, and orchestration logic together.

**It's gradient-free.** Code isn't differentiable. Prompts aren't differentiable. Evolution doesn't care. If you can score it, you can evolve it.

**It's open-ended.** There's no inherent ceiling. Given enough time and good evaluation data, evolution can keep improving indefinitely.

**It handles non-determinism.** LLM outputs are stochastic. Evaluations can be noisy. Evolution is robust to both — it just needs signal, not perfection.

## Real-World Results

Imbue used the Darwinian Evolver for two major applications:

**1. Building Vet (their coding agent verifier)**
They evolved the entire verification system end-to-end, optimizing prompts and logic together rather than tweaking components in isolation.

**2. ARC-AGI reasoning tasks**
The headline result: more than doubling a model's reasoning performance on ARC-AGI. The evolver far exceeded the capabilities of the underlying base model by iteratively improving solution strategies.

They've published a [separate deep-dive on the ARC-AGI results](https://imbue.com/research/2026-02-27-arc-agi-2-evolution/) if you want the details.

## Getting Started

The framework is lightweight and well-documented:

```bash
# Clone and install
git clone https://github.com/imbue-ai/darwinian_evolver
cd darwinian_evolver
uv sync

# Run the example problem
uv run darwinian_evolver parrot --num_iterations 3 --output_dir /tmp/output
```

The repo includes a lineage visualizer — open `lineage_visualizer.html` in your browser to see how your population evolved, which mutations succeeded, and how fitness improved over generations.

## When to Use This

The Darwinian Evolver is a good fit when:

- **Manual optimization is tedious** — you're stuck in prompt-tweak-test loops
- **The search space is large** — too many possible variations to explore manually
- **You have evaluation data** — some way to score solutions, even approximately
- **Components interact** — you need to optimize a system, not just a prompt

It's probably overkill for:

- Simple, one-shot prompts that work well enough
- Cases where you don't have evaluation data
- Latency-critical applications (evolution takes time)

## The Bigger Picture

This sits at the intersection of two trends: **LLMs as code generators** and **evolutionary computation**.

We've known for decades that evolution finds solutions humans wouldn't design. Now we have LLMs that can generate meaningful mutations — not random bit flips, but semantically coherent variations that an intelligent observer might try.

Combine them, and you get optimization that's both creative (LLM-driven mutations) and systematic (evolutionary selection pressure).

Imbue's contribution is making this practical and accessible. The framework is simple enough to adapt to your own problems, and the results on ARC-AGI demonstrate it's not just a toy.

For anyone building LLM-based systems and tired of manual optimization loops, this is worth exploring.

---

*The Darwinian Evolver is open-source at [github.com/imbue-ai/darwinian_evolver](https://github.com/imbue-ai/darwinian_evolver). Imbue's research post with full details: [LLM-based Evolution as a Universal Optimizer](https://imbue.com/research/2026-02-27-darwinian-evolver/).*
