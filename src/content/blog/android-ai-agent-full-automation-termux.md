---
title: "How I Turned an Android Phone into a Fully Autonomous AI Agent"
description: "The missing piece: self-ADB for full screen and app control. Once you have OpenClaw running in Termux, here's how to give your AI agent hands."
date: "2026-02-27"
tags: ["ai-agents", "android", "openclaw", "termux", "automation", "self-hosted", "adb"]
---

This guide assumes you've already set up OpenClaw on your Android phone using Termux. If you haven't, start with my comparison guide: [AI Agents on Android: DroidClaw vs OpenClaw vs Termux Options Compared](/blog/ai-agents-android-droidclaw-openclaw-termux).

**Where this guide picks up:** You have OpenClaw running in Termux, you can chat with your AI via Telegram, and basic Termux:API commands work (camera, location, battery status). But you've hit a wall — how do you get the AI to actually *control* apps? Tap buttons? Navigate Chrome? Take screenshots of what's on screen?

That's what this guide solves.

## The Problem

Out of the box, OpenClaw in Termux can:
- ✅ Chat via Telegram/WhatsApp/Signal
- ✅ Search the web
- ✅ Access phone hardware via Termux:API (camera, GPS, SMS, sensors)
- ✅ Run shell commands and scripts

But it **cannot**:
- ❌ Tap or swipe on the screen
- ❌ Control apps like Chrome, YouTube, or WhatsApp
- ❌ Take screenshots of what's currently displayed
- ❌ Type into arbitrary apps

These require ADB access — and most guides assume you're connecting from a PC. But what if the phone needs to control *itself*?

## The Breakthrough: Self-ADB

Here's what most people don't realize: **Android 11+ supports wireless ADB debugging, and you can connect to it from Termux running on the same device.**

No PC. No second phone. The phone connects to itself.

This unlocks full UI automation: tapping, swiping, typing, screenshots, launching apps — everything ADB can do, available to your AI agent.

---

## Prerequisites

Before continuing, make sure you have:

1. **Termux** installed from F-Droid (not Play Store)
2. **OpenClaw** installed and running (`npm install -g openclaw && openclaw setup`)
3. **Termux:API** app installed from F-Droid
4. **Termux:API package** installed (`pkg install termux-api`)
5. **OpenClaw connected to Telegram** (or your preferred chat platform)

If any of these aren't set up, see the [setup comparison guide](/blog/ai-agents-android-droidclaw-openclaw-termux) first.

---

## Step 1: Install ADB in Termux

Open Termux and run:

```bash
pkg install android-tools
```

This gives you the `adb` command inside Termux.

## Step 2: Enable Wireless Debugging

On your phone:

1. Go to **Settings → About Phone**
2. Tap **"Build Number"** 7 times to enable Developer Options
3. Go to **Settings → Developer Options**
4. Scroll down and enable **Wireless debugging**

## Step 3: Pair Termux to Your Own Phone

This is the magic step.

1. In **Wireless debugging** settings, tap **"Pair device with pairing code"**
2. You'll see an IP:port (like `192.168.1.42:37123`) and a 6-digit code
3. In Termux, run:

```bash
adb pair 192.168.1.42:37123
```

4. Enter the 6-digit code when prompted

You should see: `Successfully paired`

## Step 4: Connect

1. Go back to the main **Wireless debugging** screen
2. Note the IP:port shown under your device name (this is different from the pairing port)
3. In Termux, run:

```bash
adb connect 192.168.1.42:41234
adb devices
```

You should see your device listed as `device` (not `offline` or `unauthorized`).

**That's it.** Termux now has full ADB control over your phone.

---

## What This Unlocks (Behind the Scenes)

Now your AI agent can execute these commands automatically when you chat with it. **You don't type these** — the AI runs them behind the scenes when you make requests via Telegram.

### Screen Control

When you say **"Tap the center of the screen"**, the AI runs:
```bash
adb shell input tap 540 960
```

When you say **"Scroll up"**, it runs:
```bash
adb shell input swipe 540 1500 540 500
```

When you say **"Press the back button"**, it runs:
```bash
adb shell input keyevent 4
```

When you say **"Type 'hello world'"**, it runs:
```bash
adb shell input text "hello%sworld"
```
(Spaces become `%s` in ADB input)

### Browser Control

When you say **"Open themenonlab.com in Chrome"**, the AI runs:
```bash
adb shell am start -a android.intent.action.VIEW \
    -d "https://www.themenonlab.com" \
    -n com.android.chrome/com.google.android.apps.chrome.Main
```

When you say **"Open YouTube and search for lofi beats"**, it runs:
```bash
adb shell am start -a android.intent.action.VIEW \
    -d "https://www.youtube.com/results?search_query=lofi+beats"
```

### Screenshots

When you say **"Take a screenshot and send it to me"**, the AI runs:
```bash
adb shell screencap -p /data/local/tmp/screen.png
adb pull /data/local/tmp/screen.png ~/screen.png
```

Then it sends `screen.png` to you via Telegram.

### App Launching

When you say **"Open Settings"**, it runs:
```bash
adb shell am start -a android.settings.SETTINGS
```

When you say **"Open the camera app"**, it runs:
```bash
adb shell am start -a android.media.action.IMAGE_CAPTURE
```

---

## Keeping It Working

### Reconnect After Reboot

Wireless debugging disconnects when the phone restarts. Add a reconnect script:

```bash
cat > ~/reconnect-adb.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
# Update the IP:port to match your Wireless Debugging screen
adb connect 192.168.1.42:41234
EOF
chmod +x ~/reconnect-adb.sh
```

After a reboot, run `~/reconnect-adb.sh` (you may need to re-pair if the pairing expired).

### Auto-Start OpenClaw

If you haven't already, install **Termux:Boot** from F-Droid:

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/start-openclaw.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
sleep 15
openclaw gateway start
EOF
chmod +x ~/.termux/boot/start-openclaw.sh
```

### Battery Optimization

Prevent Android from killing Termux:

- **Settings → Apps → Termux → Battery** → Unrestricted
- **Settings → Apps → Termux:API → Battery** → Unrestricted
- **Settings → Battery → Battery Saver** → OFF (when plugged in 24/7)
- **Developer Options → Stay awake while charging** → ON

---

## The Full Picture

With self-ADB working, your AI agent now has:

| Capability | How |
|-----------|-----|
| Chat anywhere | Telegram/WhatsApp via OpenClaw |
| Web search | Brave Search API |
| Take photos | `termux-camera-photo` |
| Get location | `termux-location` |
| Send SMS | `termux-sms-send` |
| **Tap/swipe/type** | `adb shell input` ← NEW |
| **Screenshots** | `adb shell screencap` ← NEW |
| **Control any app** | `adb shell am start` ← NEW |
| **Browser automation** | Chrome via intents ← NEW |

The Termux:API gives you hardware access. Self-ADB gives you UI control. Together, your AI can do almost anything a human can do with the phone.

---

## What Didn't Work (And Why)

**Chrome Extension Relay** — Requires desktop Chrome with the extension. Android Chrome doesn't support extensions.

**Playwright/Puppeteer** — Need a full browser binary. Running Chromium in proot-distro is slow and fragile. Self-ADB with Chrome intents is simpler and more reliable.

**Accessibility Services** — Require a proper Android app, not Termux. More setup complexity than self-ADB.

---

## Alternative: mobile-use (If You Want a Ready-Made Solution)

*Updated March 2026*

If setting up self-ADB feels like too much work, there's now a polished open-source alternative: **[mobile-use](https://github.com/minitap-ai/mobile-use)** from Minitap AI.

mobile-use is an AI agent that controls Android and iOS devices using natural language. It understands your commands and interacts with the UI to perform tasks — from sending messages to navigating complex apps.

**Key differences from the DIY approach:**

| | Self-ADB (this guide) | mobile-use |
|--|----------------------|------------|
| Setup | Manual pairing, scripts | Docker one-liner or Python install |
| iOS support | ❌ No | ✅ Yes (simulators) |
| AI integration | You build it | Built-in multi-LLM support |
| Data extraction | Manual screencap + vision | Native structured output (JSON) |
| Benchmark | DIY | #1 on AndroidWorld (100% completion) |

**Quick start with Docker:**

```bash
# Linux/macOS (device connected via USB or emulator running)
bash ./mobile-use.sh \
  "Open Gmail, find first 3 unread emails, and list their sender and subject line" \
  --output-description "A JSON list of objects, each with 'sender' and 'subject' keys"
```

The agent will navigate Gmail, extract the data, and return structured JSON — no screenshots, no parsing, no manual automation.

**When to use mobile-use vs. self-ADB:**

- **mobile-use**: You want a ready-to-go agent, structured data extraction, or iOS support
- **Self-ADB**: You want full control, integration with your own agent (OpenClaw/Clawdbot), or to run entirely on-device

Both approaches have merit. Self-ADB is more flexible and runs locally on the phone itself. mobile-use is more powerful out of the box but requires a host machine running the agent.

[mobile-use on GitHub](https://github.com/minitap-ai/mobile-use) | [Benchmark results](https://minitap.ai/benchmark) | [Research paper](https://arxiv.org/abs/2602.07787)

---

## Why This Matters

Most guides stop at "chat with your AI from Telegram." That's useful, but limited.

Self-ADB turns your phone into a fully autonomous agent. Need to check a website that requires JavaScript? Open it in Chrome, wait, screenshot. Need to send a WhatsApp message to someone not in your API contacts? Open the app, navigate, type, send.

The AI now has hands.

That old phone in your drawer? It just became a 24/7 autonomous agent that can control itself.

---

**My setup:** Google Pixel 7 Pro (128GB, 12GB RAM) — purchased used for $275

**Previous guide:** [AI Agents on Android: Comparing Your Options](/blog/ai-agents-android-droidclaw-openclaw-termux)

**Questions?** Find me on X [@themedcave](https://twitter.com/themedcave)
