---
title: "6 Ways to Build a Chatbot in 2026: From Vanilla JS to Multi-Platform SDKs"
description: "A practical comparison of chatbot implementation approaches — vanilla JavaScript, Vercel AI SDK, Vercel Chat SDK, Dify, Clawdbot, and traditional platforms. Where's the LLM? Is it agentic? What does it take to add tools?"
date: "2026-02-25"
tags: ["chatbots", "ai-engineering", "typescript", "vercel", "developer-tools"]
---

You need to add a chatbot to your app. Simple, right?

Except now you're drowning in options. Vanilla JavaScript? Vercel's new Chat SDK? A no-code platform? That open-source framework with 50k GitHub stars?

I recently built a chat interface for an analytics dashboard and went down this rabbit hole. Here's what I learned — a practical comparison of six approaches, with explicit focus on **where the LLM lives**, **whether it's agentic**, and **what it takes to add tool use**.

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
  
  // 👇 THIS IS WHERE THE LLM GETS CALLED
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  appendMessage('assistant', data.reply);
}
```

**You still need a backend.** The `/api/chat` endpoint calls the LLM:

```javascript
// api/chat.js — YOUR backend, YOUR LLM call
import OpenAI from 'openai';

const openai = new OpenAI();

export async function POST(req) {
  const { message } = await req.json();
  
  // 👇 THE ACTUAL LLM CALL
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: message }
    ]
  });
  
  return Response.json({ 
    reply: completion.choices[0].message.content 
  });
}
```

> **🧠 LLM Call Location:** Your backend API route — you write it, you own it
> 
> **🤖 Agentic?** No. Single request → single response. No tool use.
> 
> **🔧 To Make It Agentic:** You'd need to implement a tool-calling loop yourself:
> 1. Parse `tool_calls` from the LLM response
> 2. Execute each tool
> 3. Send results back to the LLM
> 4. Repeat until no more tool calls
> 
> **Complexity to add tools:** 🔴 High — ~200 lines of loop/retry/error handling code

### When It Works

- **Simple widgets** — A feedback bot, FAQ assistant, or support chat
- **Learning** — Understanding the fundamentals before adding abstractions
- **Full control** — Custom animations, unique UI patterns, specific accessibility needs

### Verdict

Perfect for learning and simple Q&A. Don't use this if you need streaming or agentic behavior — you'll end up rebuilding what the SDKs already provide.

---

## 2. Vercel AI SDK: Streaming AI for React

If you're building with React or Next.js and need streaming responses, this is the current gold standard.

```typescript
// Frontend — React component
import { useChat } from 'ai/react';

export default function Chat() {
  // 👇 useChat handles the fetch to /api/chat automatically
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

```typescript
// Backend — app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  // 👇 THE LLM CALL — streaming response
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: 'You are a helpful assistant.',
  });
  
  return result.toDataStreamResponse();
}
```

> **🧠 LLM Call Location:** Backend API route (`/api/chat`), using `streamText()` from the AI SDK
> 
> **🤖 Agentic?** Not by default, but **built-in support** for tools!
> 
> **🔧 To Make It Agentic:** Add a `tools` parameter — the SDK handles the loop:

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();
  
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    // 👇 ADD TOOLS — SDK handles calling them automatically
    tools: {
      getWeather: tool({
        description: 'Get current weather for a location',
        parameters: z.object({
          city: z.string().describe('City name'),
        }),
        execute: async ({ city }) => {
          const weather = await fetchWeather(city);
          return weather;
        },
      }),
      queryDatabase: tool({
        description: 'Query the analytics database',
        parameters: z.object({
          query: z.string().describe('SQL query'),
        }),
        execute: async ({ query }) => {
          return await db.query(query);
        },
      }),
    },
    maxSteps: 5, // Allow up to 5 tool-calling rounds
  });
  
  return result.toDataStreamResponse();
}
```

> **Complexity to add tools:** 🟢 Low — just add `tools` object and `maxSteps`. SDK handles the agentic loop, retries, and streaming.

### What Makes It Great

- **Native streaming** — Tokens appear as they're generated
- **Provider agnostic** — Swap OpenAI for Anthropic with one line
- **Tool calling built-in** — No manual loop implementation
- **`maxSteps`** — Controls how many tool-call rounds before stopping

### Verdict

Best choice for web apps. The tool support makes it easy to go from simple chatbot to agentic without changing architecture.

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
  await thread.post("👋 I'm your analytics assistant!");
});

bot.onSubscribedMessage(async (thread, message) => {
  // 👇 YOU CALL THE LLM HERE — inside your handler
  const response = await generateResponse(message.text);
  await thread.post(response);
});

// Your LLM function — you bring your own
async function generateResponse(userMessage: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an analytics assistant.' },
      { role: 'user', content: userMessage }
    ]
  });
  return completion.choices[0].message.content;
}
```

> **🧠 LLM Call Location:** Inside your event handlers — **you bring your own LLM client**. The Chat SDK handles platforms, not AI.
> 
> **🤖 Agentic?** No built-in support. The SDK is platform-agnostic about AI.
> 
> **🔧 To Make It Agentic:** Combine with Vercel AI SDK or implement your own tool loop:

```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';

bot.onSubscribedMessage(async (thread, message) => {
  // 👇 USE AI SDK FOR AGENTIC RESPONSES
  const result = await generateText({
    model: openai('gpt-4o'),
    messages: [{ role: 'user', content: message.text }],
    tools: {
      queryAnalytics: tool({
        description: 'Query Cloudflare analytics',
        parameters: z.object({ metric: z.string() }),
        execute: async ({ metric }) => fetchCloudflareData(metric),
      }),
    },
    maxSteps: 3,
  });
  
  await thread.post(result.text);
});
```

> **Complexity to add tools:** 🟡 Medium — Chat SDK doesn't provide tools, but pairs well with AI SDK. Two libraries working together.

### The Killer Feature: Platform-Native UI

JSX components that render correctly on each platform:

```tsx
import { Card, Section, Button } from 'chat/jsx';

const AnalyticsCard = ({ data }) => (
  <Card>
    <Section>
      <h3>📊 Weekly Traffic</h3>
      <p>Total visits: {data.visits.toLocaleString()}</p>
    </Section>
    <Button action="refresh">Refresh Data</Button>
  </Card>
);
```

### Verdict

Perfect for multi-platform internal bots. Combine with Vercel AI SDK for agentic capabilities.

---

## 4. Dify: No-Code AI Apps

Sometimes you don't want to write code at all.

```html
<!-- Frontend embed — that's literally it -->
<script>
  window.difyChatbotConfig = { 
    token: 'app-xxxxxxxxxxxxx',
    baseUrl: 'https://api.dify.ai'
  };
</script>
<script src="https://udify.app/embed.min.js" defer></script>
```

> **🧠 LLM Call Location:** Dify's servers. You configure the model in their dashboard, they handle the API calls.
> 
> **🤖 Agentic?** Yes! Dify has a visual "Agent" mode with tool support.
> 
> **🔧 To Make It Agentic:** Toggle "Agent" mode in the Dify dashboard and add tools:

**In Dify's visual builder:**
1. Switch app type from "Chatbot" to "Agent"
2. Add built-in tools (web search, calculator, code interpreter)
3. Or create custom tools via HTTP endpoints
4. Configure tool selection strategy (auto/manual)

> **Complexity to add tools:** 🟢 Very Low — click buttons in a GUI. No code required.

### What You Get

- **Visual workflow builder** — Drag-and-drop conversation flows
- **Built-in RAG** — Upload documents, Dify handles chunking and retrieval
- **Pre-built tools** — Web search, Wikipedia, Wolfram Alpha, code execution
- **Custom API tools** — Point to any HTTP endpoint

### The Tradeoffs

- **Vendor dependency** — Your workflows live on their platform
- **Cost at scale** — Token costs + platform fees
- **Black box** — Harder to debug than code you wrote

### Verdict

Fastest path to an agentic chatbot. Ideal for prototypes and non-technical teams. Not for production systems where you need full control.

---

## 5. Agent Frameworks: When You Need Real AI

Sometimes a chatbot isn't enough. You need an agent that can browse the web, execute code, access databases, and remember context across sessions.

```typescript
// Example: LangGraph agent
import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { Calculator } from 'langchain/tools/calculator';

// 👇 THE LLM — passed to the agent
const llm = new ChatOpenAI({ model: 'gpt-4o' });

// 👇 TOOLS — the agent decides when to use them
const tools = [
  new TavilySearchResults({ maxResults: 3 }),
  new Calculator(),
  new SqlQueryTool({ connection: db }),
];

// 👇 CREATE THE AGENT — it's agentic by design
const agent = createReactAgent({
  llm,
  tools,
});

// Run it
const result = await agent.invoke({
  messages: [{ 
    role: 'user', 
    content: 'What was our revenue last quarter and how does it compare to industry averages?' 
  }]
});
// Agent: queries DB → searches web → calculates comparison → responds
```

> **🧠 LLM Call Location:** Inside the agent's reasoning loop. The agent calls the LLM multiple times — once per "thought" step.
> 
> **🤖 Agentic?** Yes, by definition. This IS the agentic approach.
> 
> **🔧 Built-in capabilities:**
> - Multi-step reasoning (ReAct pattern)
> - Automatic tool selection
> - Memory/state persistence
> - Human-in-the-loop checkpoints
> - Parallel tool execution

```typescript
// The agent's internal loop (simplified):
while (true) {
  // 1. LLM decides what to do
  const thought = await llm.invoke(messages);
  
  // 2. If tool call requested, execute it
  if (thought.tool_calls) {
    for (const call of thought.tool_calls) {
      const result = await tools[call.name].execute(call.args);
      messages.push({ role: 'tool', content: result });
    }
  }
  
  // 3. If no tool calls, we're done
  else {
    return thought.content;
  }
}
```

> **Complexity to add tools:** 🟢 Native — tools are the whole point. Just add them to the array.

### Framework Comparison

| Framework | Language | Strength |
|-----------|----------|----------|
| **LangGraph** | Python/JS | Stateful graphs, human-in-loop |
| **CrewAI** | Python | Multi-agent collaboration |
| **AutoGen** | Python | Conversational agents |
| **Clawdbot** | Node.js | Full assistant (browser, files, APIs) |

### Verdict

When you need autonomous task completion, not just Q&A. Expect higher token costs and more complex debugging.

---

## 6. Traditional Platforms: Botpress, Rasa, Dialogflow

The incumbents have added LLM support, but their DNA is intent-based.

```yaml
# Rasa example — intent + LLM hybrid
intents:
  - greet
  - ask_weather
  - fallback_to_llm  # New: catch-all for LLM

rules:
  - rule: Greet user
    steps:
      - intent: greet
      - action: utter_greet
      
  - rule: LLM fallback
    steps:
      - intent: fallback_to_llm
      - action: action_llm_response  # Custom action that calls GPT
```

```python
# Custom action calling LLM
class ActionLLMResponse(Action):
    def run(self, dispatcher, tracker, domain):
        user_message = tracker.latest_message.get('text')
        
        # 👇 LLM CALL — inside a Rasa custom action
        response = openai.chat.completions.create(
            model='gpt-4o',
            messages=[{'role': 'user', 'content': user_message}]
        )
        
        dispatcher.utter_message(response.choices[0].message.content)
        return []
```

> **🧠 LLM Call Location:** Inside custom actions. The LLM is bolted on, not native.
> 
> **🤖 Agentic?** Limited. These platforms use deterministic flows with LLM as fallback.
> 
> **🔧 To Make It Agentic:** Fight the framework. These were designed for intent matching, not autonomous reasoning.

> **Complexity to add tools:** 🔴 High — requires custom actions, webhook integrations, and fighting the intent-based paradigm.

### When They Make Sense

- Strict compliance requirements (audit trails, deterministic paths)
- Existing investment in the ecosystem
- Voice/telephony integration (Dialogflow's strength)

### Verdict

Use if you're already locked in or have regulatory requirements. For new projects, modern alternatives are simpler.

---

## Summary: The Complete Picture

| Approach | LLM Call Location | Agentic? | Tool Complexity | Best For |
|----------|-------------------|----------|-----------------|----------|
| **Vanilla JS** | Your backend API | ❌ No | 🔴 High (DIY loop) | Learning, simple Q&A |
| **Vercel AI SDK** | Backend w/ `streamText` | ✅ Yes (built-in) | 🟢 Low | Web apps, streaming |
| **Vercel Chat SDK** | Your handlers (BYO) | ➕ Via AI SDK | 🟡 Medium | Multi-platform bots |
| **Dify** | Dify's servers | ✅ Yes (visual) | 🟢 Very Low | No-code, prototypes |
| **Agent Frameworks** | Agent's reasoning loop | ✅ Native | 🟢 Native | Autonomous tasks |
| **Traditional** | Custom actions | ⚠️ Bolted-on | 🔴 High | Compliance, voice |

## Decision Flowchart

```
Need a chatbot?
│
├─ Do you need it on Slack/Teams/Discord?
│   └─ Yes → Vercel Chat SDK + AI SDK
│
├─ Is it web-only?
│   ├─ Need streaming? → Vercel AI SDK
│   └─ Simple Q&A? → Vanilla JS or Dify
│
├─ Does it need to take actions (query DBs, browse web)?
│   ├─ No code? → Dify Agent mode
│   └─ Full control? → LangGraph / Agent framework
│
└─ Compliance/regulatory requirements?
    └─ Yes → Botpress / Rasa / Dialogflow
```

## The Bottom Line

**For most web apps:** Start with Vercel AI SDK. Add tools when you need them.

**For Slack/Teams bots:** Vercel Chat SDK + AI SDK combo.

**For quick prototypes:** Dify — you'll be done before you finish reading the AI SDK docs.

**For autonomous agents:** LangGraph or similar. Accept the complexity.

And sometimes? A hundred lines of vanilla JavaScript is all you need — just know what you're signing up for when requirements grow.

---

*Building something interesting with these tools? I'd love to hear about it — reach out on [X @themedcave](https://x.com/themedcave).*
