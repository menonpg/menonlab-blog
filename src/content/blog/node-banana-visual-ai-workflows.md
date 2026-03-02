---
title: "Node Banana: Visual Node-Based Workflows for AI Image Generation"
description: "An open-source, drag-and-drop workflow builder for AI image generation that connects Gemini, Replicate, and fal.ai in visual pipelines."
date: "2026-03-02"
tags: ["ai-tools", "image-generation", "workflows", "open-source", "node-editor"]
---

If you've used ComfyUI, you know the power of node-based workflows for image generation. But ComfyUI is complex, tightly coupled to Stable Diffusion, and has a learning curve that intimidates newcomers.

[Node Banana](https://github.com/shrimbly/node-banana) takes a different approach: a clean, web-based node editor focused on simplicity and multi-provider support. Built mainly with Claude Opus 4.5 (yes, really), it's designed for anyone who wants to chain AI image operations without writing code.

## What Makes It Different

**Prompt-to-Workflow generation.** Describe what you want in natural language, and Node Banana generates the complete workflow for you. "Create a pipeline that takes a sketch, generates a detailed image, then upscales it" becomes a connected node graph automatically. Currently Gemini-powered, with more providers coming.

**Multi-provider support.** Unlike tools locked to one model ecosystem, Node Banana connects to:
- Google Gemini (text and image generation)
- Replicate (thousands of open-source models)
- fal.ai (fast inference for image/video)
- OpenAI (text generation)

This means you can mix models in a single workflow. Use Gemini for ideation, Replicate for a specific LoRA, and fal.ai for fast upscaling — all connected visually.

**Built-in image annotation.** A full-screen editor with drawing tools (rectangles, circles, arrows, freehand, text) lets you annotate images directly in the workflow. Perfect for inpainting masks or visual feedback loops.

## How It Works

The interface is straightforward:

1. **Add nodes** from the floating action bar — image generators, text processors, annotation tools
2. **Connect outputs to inputs** by dragging between handles (type-matched: image→image, text→text)
3. **Configure each node** — select models, adjust parameters, set prompts
4. **Run the workflow** — execution flows through the graph, each node processing in sequence

Workflows save as JSON files, so you can version control them, share them, or build a library of reusable pipelines.

## The Tech Stack

For developers interested in extending it:
- Next.js 16 with App Router
- React Flow (@xyflow/react) for the node editor
- Konva.js for canvas annotation
- Zustand for state management
- TypeScript throughout

The codebase is clean and well-organized — a testament to AI-assisted development done right.

## Who Should Use This

Node Banana fills a specific gap: you want visual AI workflows without ComfyUI's complexity, and you want to use multiple AI providers without switching tools.

It's particularly useful for:
- **Designers** building repeatable image generation pipelines
- **Developers** prototyping multi-step AI processes
- **Content creators** chaining generation → editing → upscaling workflows
- **Anyone** who thinks better visually than in code

The project is early (the README warns about rough edges), but the foundation is solid. Chrome recommended for now; join their Discord for support.

## Getting Started

```bash
git clone https://github.com/shrimbly/node-banana
cd node-banana
npm install
# Add API keys to .env.local
npm run dev
```

Then open localhost:3000 and start connecting nodes.

What I like most: it doesn't try to do everything. It's a focused tool for visual AI workflows, built by someone who actually uses it for their own projects. That pragmatism shows in the design.

[Explore Node Banana on GitHub](https://github.com/shrimbly/node-banana)
