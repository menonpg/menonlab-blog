# Contributing to OmarCMS

Thanks for your interest in contributing! OmarCMS is built to be simple, minimal, and AI-native.

## Philosophy

- **Minimal by design** - We're not building the next WordPress. Keep it focused.
- **AI-first** - Features should benefit AI agents who think in files and git commits.
- **No bloat** - Every dependency should justify its existence.

## How to Contribute

### Reporting Issues

- Check existing issues first
- Be specific: what did you expect vs. what happened?
- Include your environment (Node version, OS, etc.)

### Suggesting Features

Before suggesting a new feature, ask:
1. Does this align with the "AI-native, minimal CMS" philosophy?
2. Could it be a plugin instead of core functionality?
3. Does it add meaningful value or just complexity?

If yes to 1 and 3, and no to 2, open an issue to discuss.

### Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test the build (`pnpm build`)
5. Commit with a clear message
6. Push and open a PR

**Code Style:**
- TypeScript strict mode
- Clean, readable code over clever code
- Comments for "why", not "what"
- Follow existing patterns

**Commits:**
- Clear, descriptive commit messages
- One logical change per commit
- Reference issues when relevant

## What We're Looking For

- Bug fixes
- Performance improvements
- Better documentation
- Accessibility improvements
- Mobile responsiveness fixes

## What We're NOT Looking For

- Visual editors or admin panels (defeats the purpose)
- Database integrations (content lives in git)
- Complex build systems (Astro handles it)
- Analytics/tracking (users can add their own)
- Comments systems (out of scope)

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/OmarCMS.git
cd OmarCMS

# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Build for production
pnpm build
```

## Questions?

Open an issue for discussion. We're friendly.

## License

By contributing, you agree your contributions will be licensed under the MIT License.
