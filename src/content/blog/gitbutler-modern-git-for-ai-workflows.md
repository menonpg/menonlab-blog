---
title: "GitButler: Modern Git for AI-Powered Workflows"
description: "Virtual branches, stacked branches, and unlimited undo — Git reimagined for how we actually work"
date: "2026-02-24"
tags: ["git", "developer-tools", "ai", "productivity"]
---

Git is powerful. It's also... not exactly user-friendly. **GitButler** is a ground-up reimagining of the Git interface — both GUI and CLI — designed for modern, AI-assisted development.

## The Problem with Git

We all know the pain points:
- Context switching between branches breaks flow
- Interactive rebase is powerful but cryptic
- One wrong command and you're Googling "how to undo git"
- Managing multiple parallel changes is awkward

GitButler fixes these without abandoning Git itself. It's still Git under the hood — your repo stays compatible with everything.

## Virtual (Parallel) Branches

Here's the killer feature: **work on multiple branches simultaneously**.

Instead of constantly switching branches, GitButler lets you have multiple "virtual branches" active at once. Your changes are automatically organized into the right branch based on which files you're editing.

Think of it like having multiple workspaces open in the same codebase.

## Stacked Branches

Building feature A that depends on feature B? Stack them:

```bash
but branch stack create feature-b
but branch stack create feature-a --on feature-b
```

When you amend commits in the base branch, GitButler automatically restacks everything on top. No more rebase conflicts cascading through your PR chain.

## Commit Management Without the Pain

Forget `git rebase -i`. GitButler makes commit manipulation visual and intuitive:

- **Drag and drop** to reorder commits
- **Amend** any commit, not just the latest
- **Split** a commit into multiple smaller ones
- **Squash** commits together
- **Move** commits between branches

In the CLI:

```bash
but rub     # Interactive commit editing
but uncommit # Undo the last commit
```

## Unlimited Undo

GitButler logs every operation. Made a mistake? Just undo it:

```bash
but ops log    # See operation history
but ops undo   # Undo the last operation
```

This works for any operation — rebases, merges, commits, everything. It's like Time Machine for your repo.

## First-Class Conflict Handling

Here's a novel approach: **rebases always succeed** in GitButler.

Instead of stopping mid-rebase when conflicts occur, GitButler marks conflicting commits and lets you resolve them at any time, in any order. You're never stuck in a half-rebased state.

## Forge Integration

Push PRs without leaving the tool:

```bash
but pr create      # Open a PR
but pr update      # Update existing PR
but pr status      # Check CI status
```

Works with GitHub and GitLab. No need to switch to the browser for basic PR operations.

## AI-Assisted Everything

GitButler has built-in AI for:
- Generating commit messages from diffs
- Creating branch names
- Writing PR descriptions

Perfect for AI-assisted coding sessions where you're moving fast.

## The CLI: `but`

The CLI is called `but` (as in "Git, but better"). It's the same Rust backend as the GUI, so you get identical functionality:

```bash
but status         # Like git status, but cleaner
but branch list    # List branches
but commit         # Create a commit
but push           # Push changes
```

## When to Use GitButler

**GitButler shines when:**
- You work on multiple features simultaneously
- You frequently need to edit commits
- You're doing AI-assisted development
- You want better PR workflows
- You're tired of Git's footguns

**Stick with vanilla Git when:**
- You need minimal dependencies
- You're on a server without GUI access
- Your team requires specific Git workflows
- You're comfortable with Git's UX

## Technical Details

- Built with **Tauri** (Rust backend, Svelte frontend)
- Cross-platform: macOS, Windows, Linux
- Works with existing Git repos — no migration needed
- Fair Source license (becomes MIT after 2 years)

## The Bottom Line

GitButler doesn't replace Git — it wraps it in a modern interface that matches how developers actually work in 2026. The virtual branches and undo timeline alone are worth trying it.

**GitHub:** [gitbutlerapp/gitbutler](https://github.com/gitbutlerapp/gitbutler)  
**Website:** [gitbutler.com](https://gitbutler.com)

---

*Have you tried GitButler? What's your favorite feature? Let me know!*
