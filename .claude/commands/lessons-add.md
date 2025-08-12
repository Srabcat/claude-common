# /lessons-add [category] [lesson] - Capture AI Learning

**LESSONS LEARNED** - Document why AI struggled and how it was resolved.

## Usage
```bash
/lessons-add typescript "AI missed that NextJS 15 requires explicit 'use client' for useState"
/lessons-add database "AI assumed Drizzle syntax but project uses custom query builder"
/lessons-add auth "AI forgot to check team permissions in middleware"
```

## Categories
- `typescript` - Type errors, compilation issues
- `database` - Query problems, schema mismatches  
- `auth` - Authentication/authorization bugs
- `nextjs` - Framework-specific issues
- `ui` - Component/styling problems
- `api` - Route handlers, server actions
- `deployment` - Build/runtime issues

## Storage Location
Lessons stored in: `docs/ai-lessons.md`

Format:
```markdown
## [Category] - [Date]
**Problem:** [What went wrong]
**Root Cause:** [Why AI struggled] 
**Solution:** [How it was fixed]
**Prevention:** [How to avoid next time]
---
```

## Why This Helps
- **Pattern Recognition** - Avoid repeating same mistakes
- **Context Building** - Understand project-specific quirks  
- **Debugging Speed** - Quick reference for similar issues
- **Knowledge Transfer** - Help other developers/AI sessions

**Learn from struggles. Build better debugging intuition.**