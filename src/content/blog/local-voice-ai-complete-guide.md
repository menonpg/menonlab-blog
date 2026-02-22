---
title: "Building a Completely Local Voice AI Agent: LiveKit, VAPI, and the Voice-Native Revolution"
description: "A complete guide to self-hosted voice AI: from LiveKit-based local setups to voice-native models like PersonaPlex and Moshi that eliminate STT/TTS latency entirely."
date: "2026-02-22"
tags: ["voice-ai", "livekit", "self-hosted", "ai-agents", "telephony", "open-source"]
---

# Building a Completely Local Voice AI Agent

Voice AI is having a moment. VAPI raised $20M to build voice agents as a service. LiveKit open-sourced their entire agent framework. And NVIDIA just dropped PersonaPlex, a model that makes traditional STT→LLM→TTS pipelines look like antiques.

If you want to build voice AI that runs entirely on your hardware—no cloud API calls, full privacy, telephony-capable—this guide covers everything from turn-key Docker setups to the cutting edge of voice-native models.

## The Local Voice AI Stack

[local-voice-ai](https://github.com/ShayneP/local-voice-ai) is the fastest way to get a fully local voice assistant running. It's a Docker Compose setup that wires together:

- **LiveKit** for WebRTC real-time audio and rooms
- **LiveKit Agents** (Python) to orchestrate the STT→LLM→TTS pipeline
- **Nemotron Speech** (default) or **Whisper** for speech-to-text
- **llama.cpp** running Qwen3-4B for the LLM
- **Kokoro** for text-to-speech synthesis
- **Next.js** frontend UI

### Getting Started

```bash
# Clone the repo
git clone https://github.com/ShayneP/local-voice-ai.git
cd local-voice-ai

# Start everything (will prompt for CPU or GPU)
./compose-up.sh  # Mac/Linux
./compose-up.ps1  # Windows
```

Visit `http://localhost:3000` and start talking. First run downloads several GB of models—expect 10+ minutes on decent hardware.

**Requirements:**
- Docker + Docker Compose
- No GPU required (CPU works, but slower)
- 12GB+ RAM recommended

The architecture is modular. Each component runs in its own container and communicates over OpenAI-compatible APIs, so you can swap out any piece:

| Component | Default | Alternatives |
|-----------|---------|--------------|
| STT | Nemotron Speech | Whisper, Deepgram |
| LLM | Qwen3-4B via llama.cpp | Any GGUF model |
| TTS | Kokoro | Cartesia, ElevenLabs |
| Transport | LiveKit | — |

## LiveKit vs VAPI: The Core Trade-off

Both platforms build voice AI agents. The difference is philosophy.

**LiveKit** is open-source LEGOs. You get primitives—rooms, participants, tracks—and build whatever you want. Full customization, self-hostable, but requires more engineering.

**VAPI** is turnkey Playmobil. Opinionated, closed-source, faster to deploy common patterns (appointment booking, customer service), but less flexible for edge cases.

### Feature Comparison

| Feature | LiveKit | VAPI |
|---------|---------|------|
| Open Source | ✅ Fully OSS | ❌ Closed source |
| Self-hosting | ✅ Run your own servers | ❌ Cloud only |
| Video support | ✅ Full WebRTC video | ❌ Audio only |
| Telephony | ✅ SIP/PSTN integration | ✅ Strong focus |
| Turn detection | ✅ Semantic transformer model | ✅ "Smart endpointing" |
| Multi-participant | ✅ Full room support | ❌ 1:1 focused |
| Pricing | Free tier + usage | $0.05/min + providers |

### Pricing Reality Check

VAPI's $0.05/min base fee sounds cheap until you add provider costs. [Real-world estimates](https://blog.dograh.com/self-hosted-voice-agents-vs-vapi-real-cost-analysis-tco-break-even/) put total VAPI costs at **$0.13–0.33/min** once you include LLM, STT, and TTS.

LiveKit Cloud's free tier includes 1,000 minutes. Beyond that, you're paying for compute—but you can self-host entirely if you want to own the infrastructure.

For ~3,000 min/month, [community estimates](https://www.reddit.com/r/AI_Agents/comments/1pjuevf/lost_between_livekit_cloud_vs_vapi_vs_retell_for/) put:
- **Retell AI**: ~$275–320/mo (transparent pricing)
- **VAPI**: ~$370–500+/mo (add-ons unpredictable)
- **LiveKit Cloud**: Varies by usage pattern
- **Self-hosted**: Just your infrastructure costs

## LiveKit Telephony: The Local VAPI

LiveKit isn't just WebRTC—it's a full telephony stack. You can:

- **Receive inbound calls** via SIP trunks
- **Make outbound calls** programmatically
- **Route calls to AI agents** automatically
- **Transfer calls** to humans when needed

### How It Works

1. **Get a phone number** from LiveKit Phone Numbers or a SIP provider (Twilio, Telnyx, Plivo)
2. **Create an inbound trunk** to receive calls
3. **Define dispatch rules** that route callers to LiveKit rooms
4. **Run your agent** that joins the room and handles the conversation

```python
from livekit.agents import Agent, AgentSession, JobContext

@server.rtc_session()
async def entrypoint(ctx: JobContext):
    session = AgentSession(
        stt=inference.STT("deepgram/nova-3"),
        llm=inference.LLM("openai/gpt-4.1-mini"),
        tts=inference.TTS("cartesia/sonic-3"),
    )
    
    agent = Agent(
        instructions="You are a helpful phone assistant.",
        tools=[transfer_to_human, lookup_account],
    )
    
    await session.start(agent=agent, room=ctx.room)
```

LiveKit handles DTMF tones, call transfers (cold and warm), SIP REFER, and integrates Krisp noise cancellation for noisy environments.

**Supported SIP providers:** Twilio, Telnyx, Exotel, Plivo, Wavix

This is genuinely "local VAPI"—the same capabilities, but you control the infrastructure.

## The Latency Problem (And How Voice-Native Models Solve It)

Traditional voice AI has a fundamental latency problem:

```
User speaks → STT (200-400ms) → LLM (500-2000ms) → TTS (200-400ms) → User hears
                                Total: 900-2800ms
```

That's noticeable. It's why conversations with voice assistants feel robotic—awkward pauses, no natural interruptions, weird turn-taking.

The solution? **Skip the cascade entirely.**

### PersonaPlex: NVIDIA's Audio-Native Model

[PersonaPlex](https://research.nvidia.com/labs/adlr/personaplex/) works directly with audio tokens. No ASR→LLM→TTS pipeline. The model listens and speaks simultaneously in a dual-stream configuration.

**Results:**
- **Turn-taking latency: 170ms** 
- **Interruption latency: 240ms**
- Full-duplex (listens while speaking)
- Natural backchanneling ("uh-huh", "okay")

Built on the [Moshi architecture](https://github.com/kyutai-labs/moshi) with 7B parameters, PersonaPlex can:
- **Voice prompt**: Clone any voice from a sample
- **Text prompt**: Define any persona or role
- **Handle interruptions**: Like a human conversation

The [API](https://www.personaplex.io/) is available now. Think of it as "conversation as a service" rather than "voice pipeline as a service."

### Moshi: Open-Source Full-Duplex

[Moshi](https://github.com/kyutai-labs/moshi) from Kyutai Labs is the open-source predecessor to PersonaPlex:

- **7.6B parameters**, runs on-device
- **160ms theoretical latency**, 200ms practical
- **Full-duplex**: listens and speaks simultaneously
- Uses **Mimi**, a neural audio codec for streaming
- **Fully open-source** (Apache 2.0)

```bash
# Run Moshi locally
pip install moshi
python -m moshi.server
```

This is the foundation both PersonaPlex and [Helium](https://kyutai.org/blog/2025-04-30-helium) (Kyutai's newer model) are built on.

### Ultravox: Audio-Native LLM

[Ultravox](https://github.com/fixie-ai/ultravox) from Fixie takes a different approach: extend any open-weight LLM with a multimodal projector that converts audio directly into the LLM's embedding space.

- Built on Llama 3, Mistral, or Gemma
- **Audio goes directly to the LLM**—no separate ASR
- Can understand paralinguistic cues (timing, emotion)
- Available on HuggingFace in multiple sizes (8B, 70B)

Think of it as "an LLM that can hear." It processes speech natively rather than converting to text first.

## Architecture Comparison

| Approach | Latency | Customization | Self-hostable | Open Source |
|----------|---------|---------------|---------------|-------------|
| **Traditional (STT→LLM→TTS)** | 900-2800ms | Full control over each component | ✅ Yes | ✅ Yes |
| **LiveKit local-voice-ai** | 500-1500ms | Swap any component | ✅ Yes | ✅ Yes |
| **VAPI** | 400-1000ms | Limited | ❌ No | ❌ No |
| **PersonaPlex** | ~170ms | Voice + persona prompting | ❌ API only | ❌ No |
| **Moshi** | ~200ms | Full model access | ✅ Yes | ✅ Yes |
| **Ultravox** | ~300ms | Fine-tune the model | ✅ Yes | ✅ Yes |

## Which Should You Use?

**Use local-voice-ai / LiveKit if:**
- You need full control and self-hosting
- Privacy is critical (healthcare, finance)
- You want telephony integration
- You're building something custom

**Use VAPI if:**
- You want fast deployment for common patterns
- You don't have engineering resources for infrastructure
- Telephony is your primary use case

**Use PersonaPlex/Moshi if:**
- Sub-200ms latency is critical
- Natural conversation dynamics matter
- You want full-duplex (no turn-taking artifacts)

**Use Ultravox if:**
- You want an audio-native open model
- You need to fine-tune on your domain
- You want to understand speech paralinguistics

## The Future: Voice-Native Is Inevitable

The STT→LLM→TTS cascade is a historical artifact. We built it because we had good ASR, good LLMs, and good TTS—but not good speech-to-speech models.

That's changing fast. PersonaPlex, Moshi, and Ultravox prove that models can work directly with audio, eliminating the latency and unnaturalness of cascaded systems.

In 2-3 years, the cascade approach will feel as outdated as rule-based chatbots feel today. The voice-native models will just be better.

But for now, if you need production voice AI that runs on your hardware, supports telephony, and gives you full control—LiveKit's stack is the way to go. And local-voice-ai gets you there in a single `docker compose up`.

**Links:**
- [local-voice-ai](https://github.com/ShayneP/local-voice-ai) — Docker-based local voice assistant
- [LiveKit Agents](https://github.com/livekit/agents) — Open-source voice AI framework
- [LiveKit Telephony](https://docs.livekit.io/telephony/) — SIP/PSTN integration
- [PersonaPlex](https://research.nvidia.com/labs/adlr/personaplex/) — NVIDIA's 170ms latency voice model
- [Moshi](https://github.com/kyutai-labs/moshi) — Open-source full-duplex model
- [Ultravox](https://github.com/fixie-ai/ultravox) — Audio-native LLM from Fixie
