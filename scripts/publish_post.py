#!/usr/bin/env python3
"""
OmarCMS AI Publishing Script
Writes posts to src/content/blog/ and commits to git
"""

import subprocess
import json
import re
from datetime import date
from pathlib import Path

BLOG_DIR = Path(__file__).parent.parent / "src" / "content" / "blog"
TAGS_FILE = Path(__file__).parent.parent / "src" / "data" / "tags.json"

def get_valid_tags():
    """Load valid tags from tags.json"""
    with open(TAGS_FILE) as f:
        data = json.load(f)
    return [tag["id"] for tag in data["tags"]]

def slugify(title):
    """Convert title to URL-friendly slug"""
    slug = title.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    return slug.strip('-')

def publish_post(title, content, tags=None, dry_run=False):
    """
    Publish a new post to OmarCMS
    
    Args:
        title: Post title
        content: Markdown content (without frontmatter)
        tags: List of tag IDs (must be in tags.json)
        dry_run: If True, don't commit/push
    
    Returns:
        Path to the created file
    """
    if tags is None:
        tags = []
    
    # Validate tags
    valid_tags = get_valid_tags()
    tags = [t for t in tags if t in valid_tags]
    
    today = date.today().strftime("%Y-%m-%d")
    slug = slugify(title)
    filename = f"{slug}.md"
    filepath = BLOG_DIR / filename
    
    # Build frontmatter
    frontmatter = f'''---
title: "{title}"
date: "{today}"
tags: {json.dumps(tags)}
---

{content}
'''
    
    # Write file
    BLOG_DIR.mkdir(parents=True, exist_ok=True)
    filepath.write_text(frontmatter)
    print(f"✓ Wrote: {filepath}")
    
    if not dry_run:
        # Git operations
        repo_root = Path(__file__).parent.parent
        subprocess.run(["git", "add", str(filepath)], cwd=repo_root)
        subprocess.run(["git", "commit", "-m", f"New post: {title}"], cwd=repo_root)
        subprocess.run(["git", "push"], cwd=repo_root)
        print(f"✓ Published: {title}")
    else:
        print(f"[DRY RUN] Would commit: {title}")
    
    return filepath

if __name__ == "__main__":
    # Example usage
    publish_post(
        title="Test Post",
        content="This is a test post.\n\n## Section\n\nMore content here.",
        tags=["tools", "open-source"],
        dry_run=True
    )
