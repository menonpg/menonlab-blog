---
title: "WebMCP: Chrome's New Standard for Agent-Ready Websites"
description: "Google and Microsoft propose a web standard that lets sites expose structured tools to AI agents — no more DOM scraping and button-guessing."
date: "2026-02-18"
tags: ["ai-agents", "web-standards", "browser", "mcp", "chrome"]
---

# WebMCP: Chrome's New Standard for Agent-Ready Websites

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

## Try It Now

1. Download [Chrome Canary](https://www.google.com/chrome/canary/)
2. Go to `chrome://flags`, enable "WebMCP for testing"
3. Install the [Model Context Tool Inspector Extension](https://chromewebstore.google.com/detail/model-context-tool-inspec/gbpdfapgefenggkahomfgkhfehlcenpd)
4. Try the [live travel demo](https://travel-demo.bandarra.me/)

---

**Links:**
- Chrome blog: [WebMCP Early Preview](https://developer.chrome.com/blog/webmcp-epp)
- Spec: [github.com/webmachinelearning/webmcp](https://github.com/webmachinelearning/webmcp)
- Early Preview Program: [Join here](https://developer.chrome.com/docs/ai/join-epp)
