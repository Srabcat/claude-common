# /debug - Systematic AI Troubleshooting

**DEBUG MODE** - When AI struggles with a problem, follow systematic approach.

## Step 1: Context Gathering
```bash
# Show current state
git status
git log --oneline -5

# Show relevant files (ask user which to check)
ls -la [problem-area]/
```

## Step 2: Problem Isolation
Ask user to specify:
- [ ] What was expected to happen?
- [ ] What actually happened?
- [ ] Error messages (exact text)
- [ ] Steps to reproduce
- [ ] Recent changes made

## Step 3: Systematic Investigation
1. **Read error logs completely** - Don't skim
2. **Check file imports/exports** - Common source of issues
3. **Verify environment** - .env, package.json, dependencies
4. **Test smaller pieces** - Isolate the failing component
5. **Check git history** - What worked before?

## Step 4: Knowledge Check
Before fixing, ask yourself:
- [ ] Do I understand the tech stack being used?
- [ ] Have I seen this error pattern before?
- [ ] Am I making assumptions about the code?
- [ ] Should I read documentation first?

## Step 5: Methodical Fix Attempt
1. **Single change at a time** - Don't fix multiple things
2. **Test after each change** - Verify progress
3. **Document what didn't work** - For lessons learned
4. **Ask for user confirmation** - Before major changes

## When Still Stuck
- Ask user to paste full error output
- Request specific file contents that might be relevant
- Suggest pair debugging approach
- Consider if this is a knowledge gap vs logic error

## After Resolution
Use `/lessons-add [category] [lesson]` to capture why the issue was hard to debug.

**Debug systematically. Document lessons.**