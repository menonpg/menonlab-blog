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

## Step 1: Install Termux and OpenClaw

Install Termux from **F-Droid** (not the Play Store — that version is outdated and unmaintained).

```bash
pkg update && pkg upgrade
pkg install nodejs
npm install -g openclaw
openclaw setup
```

OpenClaw runs a local gateway on `localhost:18789`. Configure your Telegram bot token during setup, and you'll be able to chat with your agent via Telegram.

## Step 2: Install Termux:API for Hardware Control

Install the **Termux:API** companion app from F-Droid, then install the CLI tools:

```bash
pkg install termux-api
```

Test it immediately:

```bash
termux-battery-status   # Battery level, health, charge cycles
termux-torch on         # Flashlight on
termux-torch off        # Flashlight off
termux-vibrate -d 500   # Vibrate for 500ms
termux-toast "Hello!"   # On-screen popup
termux-location         # GPS coordinates
```

This gives you control over: torch, vibration, toast notifications, volume, brightness, camera, microphone, sensors, location, SMS, contacts, clipboard, and more.

## Step 3: Configure Web Search

Get a [Brave Search API key](https://brave.com/search/api/) and add it to OpenClaw's config:

```json
// ~/.openclaw/openclaw.json
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

Restart the gateway:

```bash
openclaw gateway restart
```

## Step 4: Install GitHub CLI

```bash
pkg install gh
gh auth login
```

Follow the OAuth flow — it opens a browser tab via Android's intent system. Now your agent can list repos, clone code, open PRs, check issues, and more.

## Step 5: The Breakthrough — ADB Over WiFi, Phone to Itself

**This is the key insight most people miss.**

Android 11+ supports wireless ADB debugging, and you can connect to it *from Termux on the same device* — no PC needed. This unlocks full UI automation.

### 5a. Install ADB in Termux

```bash
pkg install android-tools
```

### 5b. Enable Wireless Debugging

Go to **Settings → Developer Options** (enable Developer Options first by tapping "Build Number" 7 times in About Phone).

Enable **Wireless debugging**.

### 5c. Pair the Device

Tap **"Pair device with pairing code"**. You'll see an IP:port and a 6-digit code.

In Termux:

```bash
adb pair 192.168.x.x:XXXXX 123456
```

### 5d. Connect

Back on the main Wireless Debugging screen, note the IP:port under "Device name" and run:

```bash
adb connect 192.168.x.x:XXXXX
adb devices  # Should show your device as "device"
```

That's it. You now have ADB control of your own phone from within Termux.

## Step 6: Browser Automation via ADB

With ADB connected, you can open any URL in Chrome:

```bash
adb shell am start -a android.intent.action.VIEW \
    -d "https://www.themenonlab.com" \
    -n com.android.chrome/com.google.android.apps.chrome.Main
```

### Screenshot and Send via Telegram

Capture the screen and send it to yourself:

```bash
# Capture screen
adb shell screencap -p /data/local/tmp/screen.png
adb pull /data/local/tmp/screen.png ~/screen.png

# Resize with ImageMagick (optional, reduces upload size)
pkg install imagemagick
magick ~/screen.png -resize 400x800 -strip ~/screen_small.png

# Send via Telegram Bot API
curl -F chat_id=YOUR_CHAT_ID \
     -F photo=@$HOME/screen_small.png \
     "https://api.telegram.org/botYOUR_BOT_TOKEN/sendPhoto"
```

### Touch, Type, and Swipe

```bash
adb shell input tap 540 960          # Tap center of screen
adb shell input text "hello"         # Type text
adb shell input swipe 540 1500 540 500   # Scroll up
adb shell input keyevent 4           # Press back button
adb shell input keyevent 3           # Press home button
```

## Step 7: Persist Across Reboots

Install **Termux:Boot** from F-Droid to auto-start your agent:

```bash
mkdir -p ~/.termux/boot
cat > ~/.termux/boot/start-openclaw.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
sleep 10  # Wait for network
openclaw gateway start
EOF
chmod +x ~/.termux/boot/start-openclaw.sh
```

## Step 8: Optimize for Always-On Operation

In Android Settings:

- **Battery → Battery Saver** → OFF
- **Apps → Termux → Battery** → Unrestricted
- **Apps → Termux:API → Battery** → Unrestricted
- **Display → Screen timeout** → 30 minutes (or use Always-On Display)
- **Developer Options → Stay awake while charging** → ON

## What This Unlocks

You now have an AI agent that can:

- ✅ Chat with you via Telegram from anywhere
- ✅ Browse the web and search for information
- ✅ Take photos using the phone's camera
- ✅ Get GPS location
- ✅ Send SMS messages
- ✅ Control any app via screen taps and swipes
- ✅ Take screenshots and send them to you
- ✅ Clone repos and run code
- ✅ Run 24/7 on a $275 used phone

All without root. All without a PC. The phone is completely self-contained.

## What Didn't Work (and Why)

**Chrome Extension Relay** — Dead end on mobile. The relay requires a desktop Chrome instance with the extension installed. Android Chrome doesn't support extensions.

**Playwright/Puppeteer in Termux** — These need a full browser binary. You can technically run Chromium in proot-distro, but it's slow and fragile. Self-ADB with Chrome intents is more reliable.

**andClaw app** — Packages everything nicely, but I wanted more control over the setup. If you want a simpler path, it's a valid option.

## The Bigger Picture

Most "AI on Android" guides stop at chat. They don't show you how to give the AI *hands* — the ability to actually control the phone.

The self-ADB trick is the unlock. Once you can tap, swipe, type, and screenshot from Termux, you can automate anything. The AI can navigate apps, fill forms, check prices, send messages — whatever a human could do by touching the screen.

That old phone in your drawer? It just became a 24/7 autonomous agent.

---

**Hardware used:** Google Pixel 7 Pro (128GB, 12GB RAM) — purchased used for $275

**Questions?** Find me on X [@themedcave](https://twitter.com/themedcave)
