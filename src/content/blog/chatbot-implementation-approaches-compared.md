---
title: "6 Ways to Build a Chatbot in 2026: From Vanilla JS to Multi-Platform SDKs"
description: "A practical comparison of chatbot implementation approaches — vanilla JavaScript, Vercel AI SDK, Vercel Chat SDK, Dify, Clawdbot, and traditional platforms. Which one fits your project?"
date: "2026-02-25"
tags: ["chatbots", "ai-engineering", "typescript", "vercel", "developer-tools"]
---

You need to add a chatbot to your app. Simple, right?

Except now you're drowning in options. Vanilla JavaScript? Vercel's new Chat SDK? A no-code platform? That open-source framework with 50k GitHub stars?

I recently built a chat interface for an analytics dashboard and went down this rabbit hole. Here's what I learned — a practical comparison of six approaches, when to use each, and the tradeoffs nobody tells you about.

## The Landscape in 2026

The chatbot ecosystem has evolved significantly. We've moved from intent-based dialog flows (remember training "utterances"?) to LLM-powered conversations. But the implementation choices have multiplied:

1. **Vanilla JS** — Build it yourself
2. **Vercel AI SDK** — Streaming AI for web apps
3. **Vercel Chat SDK** — Multi-platform bots (just open-sourced)
4. **Dify** — No-code AI app builder
5. **Clawdbot/Agent Frameworks** — Full AI assistants
6. **Traditional Platforms** — Botpress, Rasa, Dialogflow

Let's break each one down.

---

## 1. Vanilla JavaScript: The DIY Approach

Sometimes the best dependency is no dependency.

```javascript
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');

async function sendChat() {
  const message = chatInput.value;
  appendMessage('user', message);
  chatInput.value = '';
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  appendMessage('assistant', data.reply);
}

function appendMessage(role, content) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  div.innerHTML = `<div class="message-content">${content}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
```

### When It Works

- **Simple widgets** — A feedback bot, FAQ assistant, or support chat
- **Learning** — Understanding the fundamentals before adding abstractions
- **Full control** — Custom animations, unique UI patterns, specific accessibility needs
- **Minimal footprint** — The entire chat UI can be under 2KB

### The Tradeoffs

- **No streaming** — Users stare at a loading spinner while the LLM thinks. You can add streaming, but now you're implementing SSE or WebSocket handling yourself.
- **State management** — Conversation history, typing indicators, retry logic — all manual.
- **Single platform** — This code only works on web. Need Slack too? Start over.

### Verdict

Perfect for simple, single-platform chat widgets where you want zero dependencies. Not ideal when you need streaming responses or multi-platform deployment.

---

## 2. Vercel AI SDK: Streaming AI for React

If you're building with React or Next.js and need streaming responses, this is the current gold standard.

```typescript
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={`message ${m.role}`}>
            {m.content}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

The API route:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: 'You are a helpful assistant.',
  });
  
  return result.toDataStreamResponse();
}
```

### What Makes It Great

- **Native streaming** — Tokens appear as they're generated. No loading spinners.
- **Provider agnostic** — Swap OpenAI for Anthropic or Google with one line.
- **Tool calling** — Built-in support for function calling and structured outputs.
- **Edge-ready** — Runs on Vercel Edge, Cloudflare Workers, or any Node environment.

### The Tradeoffs

- **React-centric** — The hooks are React-specific. Vue and Svelte adapters exist but are less mature.
- **Web only** — No Slack adapter, no Discord integration. It's for web apps.
- **You build the UI** — The SDK handles AI communication, not the chat interface.

### Verdict

The best choice for web applications that need streaming AI responses. Especially powerful in Next.js projects.

---

## 3. Vercel Chat SDK: One Bot, Every Platform

Just open-sourced in February 2026, this is Vercel's answer to "I need this bot on Slack AND Teams AND Discord."

```typescript
import { Chat } from 'chat';
import { createSlackAdapter } from '@chat-adapter/slack';
import { createTeamsAdapter } from '@chat-adapter/teams';
import { createRedisState } from '@chat-adapter/state-redis';

const bot = new Chat({
  userName: 'analytics-bot',
  adapters: {
    slack: createSlackAdapter(),
    teams: createTeamsAdapter(),
  },
  state: createRedisState(),
});

bot.onNewMention(async (thread) => {
  await thread.subscribe();
  await thread.post("👋 I'm your analytics assistant. Ask me about traffic trends!");
});

bot.onSubscribedMessage(async (thread, message) => {
  const insight = await analyzeQuery(message.text);
  await thread.post(insight);
});
```

### The Killer Feature: Platform-Native UI

JSX components that render correctly on each platform:

```tsx
import { Card, Section, Button } from 'chat/jsx';

const AnalyticsCard = ({ data }) => (
  <Card>
    <Section>
      <h3>📊 Weekly Traffic</h3>
      <p>Total visits: {data.visits.toLocaleString()}</p>
      <p>Unique visitors: {data.uniques.toLocaleString()}</p>
    </Section>
    <Button action="refresh">Refresh Data</Button>
  </Card>
);
```

This renders as Block Kit on Slack, Adaptive Cards on Teams, and native cards on Google Chat.

### Supported Platforms

| Platform | Mentions | Reactions | Cards | Modals | Streaming |
|----------|----------|-----------|-------|--------|-----------|
| Slack | ✅ | ✅ | ✅ | ✅ | Native |
| Teams | ✅ | Read-only | ✅ | ❌ | Post+Edit |
| Discord | ✅ | ✅ | ✅ | ❌ | Post+Edit |
| Google Chat | ✅ | ✅ | ✅ | ❌ | Post+Edit |
| GitHub | ✅ | ✅ | ❌ | ❌ | ❌ |
| Linear | ✅ | ✅ | ❌ | ❌ | ❌ |

### The Tradeoffs

- **Enterprise focus** — Slack, Teams, Discord. No web widget adapter (yet).
- **Requires Redis** — State management needs a Redis instance for production.
- **New and beta** — Documentation is good but ecosystem is young.

### Verdict

If you're building internal tools, DevOps bots, or anything that needs to live in Slack/Teams/Discord — this is now the obvious choice. Write once, deploy everywhere.

---

## 4. Dify: No-Code AI Apps

Sometimes you don't want to write code at all.

```html
<!-- That's it. That's the implementation. -->
<script>
  window.difyChatbotConfig = { 
    token: 'app-xxxxxxxxxxxxx',
    baseUrl: 'https://api.dify.ai'
  };
</script>
<script src="https://udify.app/embed.min.js" defer></script>
```

### What You Get

- **Visual workflow builder** — Drag-and-drop conversation flows
- **Built-in RAG** — Upload documents, Dify handles chunking and retrieval
- **Multiple AI providers** — OpenAI, Anthropic, local models via Ollama
- **Analytics dashboard** — Conversation logs, user feedback, token usage

### When It Shines

I used Dify for an SEC filing analyzer. Upload 10-K documents, configure the retrieval, embed the chatbot — done in an afternoon. No backend code.

### The Tradeoffs

- **Vendor dependency** — Your workflows live on their platform
- **Cost at scale** — Free tier is generous, but enterprise pricing adds up
- **Limited customization** — The widget looks like the widget

### Verdict

Best for rapid prototyping, non-technical teams, or when RAG is the primary use case. Not ideal when you need deep customization or want to own your infrastructure.

---

## 5. Agent Frameworks: When You Need Real AI

Sometimes a chatbot isn't enough. You need an agent that can:

- Browse the web
- Execute code
- Access databases
- Remember context across sessions
- Use tools dynamically

Frameworks like Clawdbot, LangGraph, or CrewAI handle this:

```javascript
// Simplified example — actual implementation varies by framework
const agent = new Agent({
  tools: [webBrowser, sqlQuery, codeExecution],
  memory: persistentMemory,
  systemPrompt: `You're an analytics assistant with access to 
    the Cloudflare API. You can query real traffic data.`
});

const response = await agent.chat(
  "What was our best performing blog post last week?"
);
// Agent queries Cloudflare, analyzes data, returns insights
```

### When You Need This

- The chatbot needs to **do things**, not just answer questions
- Multi-step reasoning with tool use
- Long-running tasks with human oversight
- Integration with multiple data sources

### The Tradeoffs

- **Complexity** — Significantly more setup than a simple chatbot
- **Cost** — Agents use more tokens (tool calls, reasoning steps)
- **Debugging** — When an agent fails, the failure modes are complex

### Verdict

Overkill for FAQ bots. Essential when you're building something that needs to act autonomously.

---

## 6. Traditional Platforms: Botpress, Rasa, Dialogflow

The incumbents haven't disappeared. They've adapted.

### Botpress

Open-source, visual builder, now with LLM integration. Good for teams that want a GUI but need self-hosting options.

### Rasa

Python-based, fully open-source. Strong in regulated industries where you can't send data to external APIs.

### Dialogflow (Google)

Deep integration with Google Cloud, good for voice assistants and telephony.

### When They Make Sense

- **Compliance requirements** — Healthcare, finance, government
- **Existing infrastructure** — Already invested in the ecosystem
- **Complex dialog flows** — Multi-turn conversations with strict business logic

### The Tradeoffs

- **Intent-based legacy** — Designed for "utterance → intent → response" before LLMs
- **Steep learning curve** — Enterprise features mean enterprise complexity
- **Vendor lock-in** — Migrations are painful

---

## Decision Matrix: Which Should You Choose?

| Your Situation | Best Choice |
|----------------|-------------|
| Quick web widget, minimal code | **Dify embed** |
| React/Next.js app with streaming | **Vercel AI SDK** |
| Internal bot for Slack/Teams/Discord | **Vercel Chat SDK** |
| Learning, full control, simple needs | **Vanilla JS** |
| Agent that takes actions, uses tools | **Agent framework** |
| Enterprise, compliance, complex flows | **Botpress/Rasa/Dialogflow** |

## The Bottom Line

There's no universal "best" approach. The right choice depends on:

1. **Where does the bot live?** — Web only? Slack? Multiple platforms?
2. **What does it need to do?** — Answer questions? Take actions? Both?
3. **Who's building it?** — Developers? Non-technical team?
4. **What's your timeline?** — Afternoon prototype? Production system?

For most web apps in 2026, I'd start with **Vercel AI SDK** for streaming chat. For multi-platform internal tools, **Vercel Chat SDK** is the new obvious choice. For quick wins without code, **Dify**.

And sometimes? A hundred lines of vanilla JavaScript is all you need.

---

*Building something interesting with these tools? I'd love to hear about it — reach out on [X @themedcave](https://x.com/themedcave).*
