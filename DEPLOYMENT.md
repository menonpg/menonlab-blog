# Deployment Strategy

## Rule: Midnight Pushes Only

**Only push code batches to GitHub at midnight** to avoid overwhelming Vercel with deployments.

## Workflow

1. **Work locally throughout the day**
   - Make changes, improvements, fixes
   - Test via local dev server: `pnpm dev --host 0.0.0.0`
   - Server accessible at: http://192.168.12.217:4321

2. **Commit locally as you go**
   - Commit frequently with clear messages
   - Keep changes atomic and well-documented
   - Commits stay local until push time

3. **Push once at midnight (00:00 CST)**
   - Batches all the day's commits into a single deployment
   - Reduces Vercel deployment spam
   - Cleaner deployment history

4. **Exceptions**
   - Critical bug fixes can be pushed immediately
   - When Eric explicitly requests a push
   - Production issues that need immediate resolution

## Why?

Each push to `main` triggers a Vercel deployment. During active development, this can mean 10-20 deployments per day. By batching commits locally and pushing once at midnight, we:

- Reduce deployment noise
- Make deployment history cleaner
- Avoid Vercel rate limits or quotas
- Keep the deployment log meaningful (one deploy = one day's work)

## Local Testing

Always test changes locally before committing:

```bash
cd /Users/ewimsatt/.openclaw/workspace/OmarCMS
export PATH="/usr/local/Cellar/node@22/22.22.0/bin:$PATH"
pnpm dev --host 0.0.0.0
```

Access from any device on the network at `http://192.168.12.217:4321`

---

**Created:** 2026-02-14  
**Last Updated:** 2026-02-14
