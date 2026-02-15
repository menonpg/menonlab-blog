# Quality Enforcement

OmarCMS enforces quality through automated checks. These tools prevent bloat, ensure accessibility, and maintain code standards.

## Markdown Linting

**When:** Pre-commit hook (automatic)

Checks all markdown files for:

- Consistent formatting
- Proper heading structure
- Valid markdown syntax

**Config:** `.markdownlint.json`

**Manual run:**

```bash
pnpm lint:md
```

**Skip on commit (not recommended):**

```bash
git commit --no-verify
```

## Performance Budgets

**When:** Every build (`pnpm build`)

Enforces size limits:

- Total JavaScript: 250 KB
- Total CSS: 50 KB
- Largest JS file: 100 KB
- Largest CSS file: 30 KB
- Total images: 2000 KB

**Manual run:**

```bash
pnpm check:budgets
```

**Why:** Fast sites are better sites. These budgets prevent bloat.

**What to do if exceeded:**

1. Check what changed (large dependency added?)
2. Optimize images (compress, resize, use WebP)
3. Remove unused code
4. Split large bundles

## Accessibility Checks

**When:** Before deploying (manual)

Tests WCAG 2.1 AA compliance on key pages:

- Homepage
- About
- Blog index
- Docs

**Run:**

```bash
# Start preview server first
pnpm build && pnpm preview

# In another terminal
pnpm check:a11y
```

**Why:** Accessible sites work for everyone.

**What to do if failed:**

1. Fix errors shown in output
2. Check contrast ratios (4.5:1 minimum)
3. Add aria-labels where needed
4. Test with keyboard navigation

## Philosophy

These tools enforce minimalism:

- **Markdown linting** keeps content clean
- **Performance budgets** prevent feature creep (features add weight)
- **Accessibility checks** ensure quality over quantity

If you can't ship within budgets, you're adding too much.

## Updating Budgets

If you have legitimate reasons to adjust limits, edit `scripts/check-bundle-size.js`:

```javascript
const BUDGETS = {
  totalJS: 250,      // Increase only with justification
  totalCSS: 50,      // Should rarely need more
  largestJS: 100,    // Keep individual files small
  largestCSS: 30,    // Inline critical CSS if needed
  images: 2000,      // Compress before increasing
};
```

Document why you changed them in git commit message.

## Disabling Checks

**Don't.** These exist to keep the platform minimal.

If you must:

- Remove `&& node scripts/check-bundle-size.js` from build script
- Delete `.husky/pre-commit` to skip linting
- Skip a11y checks (they're manual anyway)

But if you're disabling quality checks, you're probably building the wrong thing.
