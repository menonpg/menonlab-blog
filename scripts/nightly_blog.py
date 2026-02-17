#!/usr/bin/env python3
"""
Nightly Blog Generator for The Menon Lab

Scans Apple Notes for GitHub repos, researches them, and publishes blog posts.
Designed to run as a cron job via Clawdbot.
"""

import subprocess
import json
import re
import os
from datetime import date, datetime
from pathlib import Path

# Paths
REPO_ROOT = Path(__file__).parent.parent
BLOG_DIR = REPO_ROOT / "src" / "content" / "blog"
PROCESSED_FILE = REPO_ROOT / "scripts" / ".processed_notes.json"

def get_apple_notes():
    """Fetch notes from Apple Notes via osascript"""
    script = '''
    tell application "Notes"
        set noteList to {}
        repeat with n in notes
            set noteTitle to name of n
            set noteBody to plaintext of n
            set noteDate to modification date of n
            set end of noteList to {noteTitle, noteBody, noteDate as string}
        end repeat
        return noteList
    end tell
    '''
    try:
        result = subprocess.run(
            ["osascript", "-e", script],
            capture_output=True, text=True, timeout=60
        )
        return result.stdout
    except Exception as e:
        print(f"Error fetching notes: {e}")
        return ""

def extract_github_repos(text):
    """Extract GitHub URLs from text"""
    patterns = [
        r'github\.com/([a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)',
        r'([a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)(?:\s|$)',  # bare repo names
    ]
    repos = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        repos.extend(matches)
    return list(set(repos))

def load_processed():
    """Load list of already-processed repos"""
    if PROCESSED_FILE.exists():
        return json.loads(PROCESSED_FILE.read_text())
    return []

def save_processed(repos):
    """Save processed repos list"""
    PROCESSED_FILE.write_text(json.dumps(repos, indent=2))

def categorize_repo(repo_name, description):
    """Determine appropriate tags based on repo content"""
    text = f"{repo_name} {description}".lower()
    tags = []
    
    if any(w in text for w in ["agent", "autonomous", "agentic", "multi-agent"]):
        tags.append("ai-agents")
    if any(w in text for w in ["llm", "language model", "gpt", "transformer", "chat"]):
        tags.append("llm")
    if any(w in text for w in ["vision", "image", "video", "visual", "detection"]):
        tags.append("computer-vision")
    if any(w in text for w in ["medical", "health", "clinical", "biomedical", "healthcare"]):
        tags.append("healthcare-ai")
    if any(w in text for w in ["rag", "retrieval", "vector", "embedding", "knowledge"]):
        tags.append("rag")
    if any(w in text for w in ["tool", "cli", "utility", "library"]):
        tags.append("tools")
    
    tags.append("open-source")  # Default for all GitHub repos
    
    return list(set(tags))[:4]  # Max 4 tags

def main():
    """Main entry point for nightly blog generation"""
    print(f"=== Nightly Blog Generator ===")
    print(f"Time: {datetime.now()}")
    print()
    
    # This script is meant to be called by Clawdbot with specific instructions
    # The actual AI writing happens in the Clawdbot session
    
    print("To generate blog posts:")
    print("1. Clawdbot scans Apple Notes")
    print("2. Identifies GitHub repos not yet covered")
    print("3. Researches each repo (README, docs, use cases)")
    print("4. Writes 500-800 word blog post")
    print("5. Calls publish_post.py to commit & deploy")
    print()
    print("Run via Clawdbot cron job, not directly.")

if __name__ == "__main__":
    main()
