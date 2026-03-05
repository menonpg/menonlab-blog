---
title: "WebMCP: Chrome's New Standard for Agent-Ready Websites"
description: "Google and Microsoft propose a web standard that lets sites expose structured tools to AI agents — no more DOM scraping and button-guessing."
date: "2026-02-18"
tags: ["ai-agents", "web-standards", "browser", "mcp", "chrome"]
---


If you've ever watched an AI agent "use" a website by guessing which button is "Checkout" and fumbling through form fields, you already know the core problem: **web UIs are built for humans, but agents need structure.**

That's exactly what WebMCP is trying to fix.

[WebMCP](https://developer.chrome.com/blog/webmcp-epp) is a new web standard (currently in early preview in Chrome 146 Canary) that lets websites expose structured tools directly to in-browser AI agents. Instead of screen-scraping and hoping the DOM didn't change, agents can call real functions with proper schemas.

Think of it as **MCP, but built into the browser tab.**

## The Problem with Current Agent-Web Interaction

Today's AI browser agents work through:

- **Brittle UI automation** — clicking coordinates that break when layouts change
- **DOM scraping** — parsing HTML that wasn't meant to be parsed
- **Accessibility hacks** — abusing aria labels for navigation
- **Constant breakage** — every site update potentially breaks the flow

This is why tools like Browser-Use and Playwright-based agents feel fragile. They're reverse-engineering interfaces designed for human eyes.

## The WebMCP Solution: Publish Tools, Not Pixels

WebMCP flips the model. Instead of agents guessing what buttons do, your site explicitly publishes a contract:

- **Discovery** — What tools exist on this page (`checkout`, `filter_results`, `book_flight`)
- **Schemas** — Exactly what inputs/outputs look like (JSON Schema format)
- **State** — What's available right now given the current page context

The difference:

```
❌ "Click around until something works"
✅ "Call book_flight({ origin: 'JFK', destination: 'LAX', date: '2026-03-15' })"
```

## Two APIs: Imperative and Declarative

WebMCP provides two ways to expose tools:

### 1. Imperative API (JavaScript)

Register tools programmatically with `navigator.modelContext`:

```javascript
navigator.modelContext.registerTool({
  name: "searchFlights",
  description: "Search for available flights",
  inputSchema: {
    type: "object",
    properties: {
      origin: { type: "string", description: "Departure airport code" },
      destination: { type: "string", description: "Arrival airport code" },
      date: { type: "string", format: "date" }
    },
    required: ["origin", "destination", "date"]
  },
  execute: async (params) => {
    // Your implementation
    return await flightAPI.search(params);
  }
});
```

### 2. Declarative API (HTML Forms)

The spicy part: you can annotate ordinary HTML forms to become agent-callable tools:

```html
<form toolname="book_flight" 
      tooldescription="Book a flight reservation"
      toolautosubmit="false">
  <input name="origin" placeholder="From" />
  <input name="destination" placeholder="To" />
  <input name="date" type="date" />
  <button type="submit">Search</button>
</form>
```

The browser automatically translates form fields into a structured tool schema. When an agent invokes it, the browser focuses the form and pre-fills the fields. By default, the user still clicks submit — unless you enable `toolautosubmit`.

## How Tool Discovery Works

This is the key part that makes WebMCP tick: **both sides need to participate.**

### Website Side: Publishing Tools

A website becomes WebMCP-compatible by adding specific code:

- **Imperative:** Call `navigator.modelContext.registerTool()` in JavaScript
- **Declarative:** Add `toolname` and `tooldescription` attributes to HTML forms

Without this code, a page has no tools. The page looks normal to humans, but there's nothing for an agent to discover.

### Client Side: Discovering Tools

On the other side, you need a **WebMCP-aware client** — like the Chrome extension. Here's what it does:

1. **Scans the page** — When you navigate to a site, the client checks for registered tools via `navigator.modelContext`
2. **Reads the registry** — It pulls the list of available tools, their names, descriptions, and input schemas
3. **Builds tool definitions** — These get formatted into the structure LLMs expect (similar to OpenAI's function calling format)
4. **Injects into LLM context** — When you chat with the agent, it knows exactly what tools exist and how to call them

```
┌─────────────────────────────────────────────────────────────┐
│                        WEBSITE                              │
│                                                             │
│  navigator.modelContext.registerTool({                      │
│    name: "book_flight",                                     │
│    inputSchema: { ... },                                    │
│    execute: async (params) => { ... }                       │
│  })                                                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Tools registered in browser API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    WEBMCP CLIENT                            │
│                  (Chrome Extension)                         │
│                                                             │
│  1. Query navigator.modelContext for tools                  │
│  2. Extract schemas and descriptions                        │
│  3. Format as LLM-compatible tool definitions               │
│  4. Include in system prompt / function calls               │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Tool definitions sent to LLM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         LLM                                 │
│                    (Gemini API)                             │
│                                                             │
│  "I see you have a book_flight tool. I'll call it with:"    │
│  { origin: "JFK", destination: "LAX", date: "2026-03-15" }  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Tool call routed back
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        WEBSITE                              │
│                                                             │
│  execute() function runs, returns result to LLM             │
└─────────────────────────────────────────────────────────────┘
```

### Why Both Sides Matter

This is fundamentally different from screen scraping:

| Approach | Website Needs To... | Agent Needs To... |
|----------|---------------------|-------------------|
| **Screen Scraping** | Nothing (just exist) | Guess everything |
| **WebMCP** | Publish tools explicitly | Discover and invoke properly |

The tradeoff: WebMCP requires website adoption. But when sites do adopt it, agents get **reliable, versioned, schema-validated** interactions instead of fragile DOM guessing.

**Current reality:** Very few sites have WebMCP tools yet. That's why Google published demo sites — so you can test the flow end-to-end while waiting for broader adoption.

## Agent-Aware Form Handling

WebMCP adds agent-awareness to form submission:

- `SubmitEvent.agentInvoked` — tells you the submit came from an AI agent
- `SubmitEvent.respondWith(Promise)` — return structured results back to the model

This means your web app can validate normally for humans but return structured errors for agents so they can self-correct:

```javascript
form.addEventListener('submit', (e) => {
  if (e.agentInvoked) {
    e.preventDefault();
    e.respondWith(processBooking(e.formData).then(result => ({
      success: true,
      confirmationNumber: result.id
    })));
  }
});
```

## Visual Feedback

When a tool is invoked via the declarative path:

- `toolactivated` event fires when fields are pre-filled
- `toolcancel` fires if the user cancels
- CSS pseudo-classes (`:tool-form-active`, `:tool-submit-active`) let you style the agent interaction differently

## Best Practices from the Spec

The documentation includes design rules that are essentially a cheat code for agent-friendly tools:

1. **Name tools precisely** — Use verbs that describe the action. Distinguish `create-event` from `start-event-creation-flow`.

2. **Design schemas that reduce model math** — If the user says "11:00 to 15:00", accept strings. Don't force the model to compute minutes-from-midnight.

3. **Validate strictly in code, loosely in schema** — Assume the schema won't fully protect you. Return descriptive errors so the model can retry.

4. **Make tools atomic and composable** — Prefer one tool with parameters over ten near-duplicates.

## Current Limitations

This is still early preview:

- **No headless mode** — Tool calls require a visible browser tab
- **UI must stay in sync** — State changes from agents need to reflect in the UI
- **No discoverability** — No built-in way for agents to know which sites support tools without visiting
- **Complex apps may need refactors** — Tool-driven UI updates need clean implementation

## WebMCP vs MCP

Quick distinction:

- **MCP (Model Context Protocol)** — Server-side protocol; you deploy tools on your own server
- **WebMCP** — Inspired by MCP, but provides tools to in-browser agents using client-side functions or annotated forms

WebMCP is about making the *browser itself* the bridge between agents and web applications.

## Why This Matters

If WebMCP lands as a real standard, it changes the baseline expectation: **every serious web app becomes both a UI for humans AND a tool surface for agents.**

The apps that win won't be the ones with the prettiest interface — they'll be the ones with the clearest tool contracts.

## How to Try It

Here's a walkthrough of getting WebMCP running with Google Chrome Canary:

<iframe src="https://drive.google.com/file/d/1NGFAffTEoOis72mWbvpvUl0mMtUGJJvQ/preview" width="100%" height="480" allow="autoplay" style="border-radius: 8px; margin: 1.5rem 0;"></iframe>

### Step 1: Download Chrome Canary

First, you need [Chrome Canary](https://www.google.com/chrome/canary/) — the bleeding-edge version of Chrome. This is currently the only browser where WebMCP is available.

### Step 2: Enable the WebMCP Flag

Once installed, you need to enable WebMCP through a feature flag:

1. Open Chrome Canary
2. Navigate to `chrome://flags`
3. Search for **"WebMCP for testing"**
4. Enable it and restart the browser

The explicit "for testing" name signals this is an early API that may change as it matures.

### Step 3: Install the Agent Extension

For now, the only way to interact with WebMCP tools is through Google's official Chrome extension:

**[Model Context Tool Inspector](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd)**

This extension provides an agent that can discover and invoke WebMCP tools on any compatible page.

### Step 4: Get a Gemini API Key

The extension agent needs a Gemini API key to work. You can get one for free:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project (or use an existing one)
3. Click **"Create API key"**
4. Copy the key and paste it into the extension settings

### Step 5: Test the Demos

Google has published several demo pages to try:

**[WebMCP Tools Demos](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/)**

These include travel booking, form filling, and other examples showing how WebMCP tools work in practice. Open any demo page, click the extension, and ask the agent to perform tasks using the exposed tools.

---

**Links:**
- Chrome blog: [WebMCP Early Preview](https://developer.chrome.com/blog/webmcp-epp)
- Spec: [github.com/webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp)
- Demo tools: [github.com/GoogleChromeLabs/webmcp-tools](https://github.com/GoogleChromeLabs/webmcp-tools/tree/main/demos/)
- Early Preview Program: [Join here](https://developer.chrome.com/docs/ai/join-epp)
