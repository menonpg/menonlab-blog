---
title: "How I Turned an Android Phone into a Fully Autonomous AI Agent"
description: "No root, no PC required. Full phone control via self-ADB, browser automation, hardware access, and Telegram integration — all running from Termux on the device itself."
date: "2026-02-27"
tags: ["ai-agents", "android", "openclaw", "termux", "automation", "self-hosted"]
---

I wanted to run a persistent AI agent on my Android phone that could autonomously browse the web, control phone hardware, access my GitHub repos, and send me updates via Telegram — all from the phone itself, with no desktop involved.

Here's exactly how I did it.

## The Stack

- **Device:** Google Pixel 7 Pro (Android 14)
- **Agent runtime:** OpenClaw running in Termux
- **Communication:** Telegram bot
- **Phone control:** Termux:API + ADB over WiFi (self-ADB)

## How It Works: Two Layers

Before diving in, understand the two layers:

1. **Setup (you do this once):** Install apps, configure API keys, enable permissions. These are commands *you* type.

2. **Runtime (the AI does this automatically):** Once set up, the AI agent executes commands behind the scenes when you ask it to do things via Telegram. You never type these — they're what powers the magic.

I'll clearly mark which is which throughout this guide.

---

# Part 1: Setup (One-Time Configuration)

These are commands YOU type once to set everything up.

## Step 1: Install Termux and OpenClaw

Install Termux from **F-Droid** (not the Play Store — that version is outdated and unmaintained).

Open Termux and type:

```bash
pkg update && pkg upgrade
pkg install nodejs
npm install -g openclaw
openclaw setup
```

During `openclaw setup`, you'll configure your Telegram bot token. After this, you can chat with your agent via Telegram.

## Step 2: Install Termux:API for Hardware Control

Install the **Termux:API** companion app from F-Droid (it's a separate app, not a Termux package).

Then in Termux, type:

```bash
pkg install termux-api
```

Test that it works:

```bash
termux-battery-status
termux-toast "Hello from Termux!"
```

If you see your battery info and a toast popup, you're good.

## Step 3: Configure Web Search

Get a [Brave Search API key](https://brave.com/search/api/) and add it to OpenClaw's config.

```bash
nano ~/.openclaw/openclaw.json
```

Add your API key:

```json
{
  "tools": {
    "web": {
      "search": {
        "apiKey": "YOUR_BRAVE_API_KEY"
      }
    }
  }
}
```

Save and restart:

```bash
openclaw gateway restart
```

## Step 4: Install GitHub CLI

```bash
pkg install gh
gh auth login
```

Follow the prompts. This lets the AI access your repos.

## Step 5: Enable Self-ADB (The Key Unlock)

This is the breakthrough that enables full UI automation. You're going to connect ADB to your own phone, from Termux running on that same phone.

### 5a. Install ADB

```bash
pkg install android-tools
```

### 5b. Enable Wireless Debugging

1. Go to **Settings → About Phone**
2. Tap **"Build Number"** 7 times to enable Developer Options
3. Go to **Settings → Developer Options**
4. Enable **Wireless debugging**

### 5c. Pair Termux to Your Phone

In Wireless Debugging settings, tap **"Pair device with pairing code"**. You'll see an IP:port and a 6-digit code.

In Termux, type:

```bash
adb pair 192.168.x.x:XXXXX
```

Enter the 6-digit code when prompted.

### 5d. Connect

Go back to the Wireless Debugging screen. Note the IP:port shown under your device name (different from the pairing port).

```bash
adb connect 192.168.x.x:XXXXX
adb devices
```

You should see your device listed as "device". That's it — Termux now has ADB control over your own phone.

## Step 6: Persist Across Reboots

Install **Termux:Boot** from F-Droid so the agent auto-starts when your phone reboots.

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/start-openclaw.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
sleep 10
openclaw gateway start
EOF
chmod +x ~/.termux/boot/start-openclaw.sh
```

## Step 7: Optimize Battery Settings

In Android Settings, configure these so the system doesn't kill Termux:

- **Battery → Battery Saver** → OFF
- **Apps → Termux → Battery** → Unrestricted
- **Apps → Termux:API → Battery** → Unrestricted
- **Developer Options → Stay awake while charging** → ON

---

# Part 2: What the AI Does Behind the Scenes

**You don't type any of this.** These are the commands the AI agent executes automatically when you interact with it via Telegram.

When you message your agent "What's my battery level?", it runs:

```bash
termux-battery-status
```

When you say "Turn on the flashlight", it runs:

```bash
termux-torch on
```

When you ask "Where am I?", it runs:

```bash
termux-location
```

When you say "Take a photo", it runs:

```bash
termux-camera-photo -c 0 ~/photo.jpg
```

When you say "Open themenonlab.com in Chrome", it runs:

```bash
adb shell am start -a android.intent.action.VIEW \
    -d "https://www.themenonlab.com" \
    -n com.android.chrome/com.google.android.apps.chrome.Main
```

When you say "Take a screenshot and send it to me", it runs:

```bash
adb shell screencap -p /data/local/tmp/screen.png
adb pull /data/local/tmp/screen.png ~/screen.png
# Then sends via Telegram Bot API
```

When you say "Tap the center of the screen", it runs:

```bash
adb shell input tap 540 960
```

When you say "Type 'hello' into the current app", it runs:

```bash
adb shell input text "hello"
```

When you say "Scroll up", it runs:

```bash
adb shell input swipe 540 1500 540 500
```

**The point:** You just chat naturally via Telegram. The AI translates your requests into these commands, executes them, and reports back with results or screenshots.

---

# What This Setup Unlocks

Once configured, your AI agent can:

- ✅ Chat with you via Telegram from anywhere in the world
- ✅ Browse the web and search for information
- ✅ Take photos using the phone's cameras
- ✅ Get GPS location
- ✅ Send SMS messages
- ✅ Control *any* app via screen taps, swipes, and typing
- ✅ Take screenshots and send them to you
- ✅ Clone GitHub repos and run code
- ✅ Run 24/7 on a cheap used phone

All without root. All without a PC. The phone is completely self-contained.

---

# What Didn't Work (and Why)

**Chrome Extension Relay** — Dead end on mobile. The relay requires a desktop Chrome instance with the extension installed. Android Chrome doesn't support extensions.

**Playwright/Puppeteer in Termux** — These need a full browser binary. You can technically run Chromium in proot-distro, but it's slow and fragile. Self-ADB with Chrome intents is more reliable.

**andClaw app** — Packages everything nicely, but I wanted more control over the setup. If you want a simpler path, it's a valid option.

---

# The Bigger Picture

Most "AI on Android" guides stop at chat. They show you how to message an AI, but not how to give it *hands* — the ability to actually control the phone.

The self-ADB trick is the unlock. Once the AI can tap, swipe, type, and screenshot, it can automate anything. Navigate apps, fill forms, check prices, send messages — whatever a human could do by touching the screen.

That old phone in your drawer? It just became a 24/7 autonomous agent.

---

**Hardware used:** Google Pixel 7 Pro (128GB, 12GB RAM) — purchased used for $275

**Questions?** Find me on X [@themedcave](https://twitter.com/themedcave)
