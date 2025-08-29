# /pr-ready - Complete Prototype & Convert to PR Quality

Your role: an architecture-minded world class fullstack react/Next.js/postgres coder. Expert in code review, refactor with best practices 

- You write clean, maintainable, well designed and documented code
- Before refactoring, write test cases first so you can test and verify refactoring works


**PROTOTYPE TO PR MODE** - Complete prototype, checkpoint, and convert to PR-ready code.

## Step 1: Complete Prototype Phase
```bash
# Save final prototype state
git add . && git commit -m "prototype: [feature-name] complete - ready for cleanup"

# Tag the working prototype
git tag prototype-[feature-name]-complete
```

## Step 2: Review Prototype Work
```bash
# See all prototype commits
git log --oneline main..HEAD

# See all changes from start  
git diff main...HEAD

# See what branch we're cleaning up
cat .prototype-branch 2>/dev/null || echo "Current branch"

# Review all prototype changes
git log --oneline --grep="checkpoint:"
git diff main...HEAD --name-only
```

## Step 3: Choose Cleanup Strategy

### Option A: Clean Up In Place
```bash
# Stay on prototype branch, clean up file by file
# Commit cleanup changes with /checkpoint
```

### Option B: Fresh Branch 
```bash
# Create clean implementation branch
git checkout main
git checkout -b feature/[name]-clean
# Reimplement with strict standards, reference prototype
```

## Step 4: File-by-File Cleanup Process
For each prototype file:

1. **TypeScript** - Remove `any`, add proper types
2. **Error Handling** - Add try/catch, user feedback, loading states
3. **Validation** - Add Zod schemas for user inputs  
4. **Security** - Verify auth/team permission checks
5. **Comments** - Document complex logic and decisions
6. **Testing** - Consider error scenarios and edge cases

## Quality Checklist Per File
- [ ] No TypeScript errors or warnings
- [ ] No `any` types (ask approval if needed)
- [ ] Proper error handling with user feedback
- [ ] Input validation where needed
- [ ] Authentication/authorization verified
- [ ] Complex logic documented
- [ ] Loading states for async operations

## Available Commands During Cleanup
- `/checkpoint [name]` - Save PR-ready checkpoint
- `/debug` - Systematic troubleshooting when stuck

## Commit Pattern During Cleanup
```bash
/checkpoint [filename]-pr-ready   # "checkpoint: UserForm-pr-ready complete"
```

## Final PR Checklist
- [ ] Core feature demonstrates main functionality
- [ ] User can complete primary workflow  
- [ ] All prototype files cleaned up to PR standards
- [ ] No TypeScript errors or warnings
- [ ] No blocking bugs in happy path
- [ ] Code ready for team review

# Code Review / PR Phase


### Code Quality
- [ ] TypeScript types are accurate
- [ ] No console.logs in production code
- [ ] Error handling implemented
- [ ] Loading states for async operations

### Security  
- [ ] User authentication checked
- [ ] Team authorization verified
- [ ] No sensitive data in logs
- [ ] SQL injection prevention (Drizzle handles this)

### Database
- [ ] Migrations tested
- [ ] Indexes added for new queries
- [ ] Foreign key constraints maintained
- [ ] Activity logging added where needed

### Components
- [ ] Proper component separation (ui vs custom)
- [ ] Accessibility considerations
- [ ] Mobile responsive
- [ ] Loading states implemented

### Testing
- [ ] Feature works with test user
- [ ] Edge cases handled
- [ ] Error scenarios tested
- [ ] Database rollback tested

### Performance
- [ ] Server Components used where possible
- [ ] Client Components only when needed
- [ ] Proper caching strategies
- [ ] Database queries optimized

## Review Commands
```bash
# Test the changes
pnpm dev

# Check types
npx tsc --noEmit

# Check database
pnpm db:studio

# Test with fresh data
pnpm db:migrate && pnpm db:seed
```

## Common Issues
- Missing `"use client"` directive
- Server Actions without `"use server"`
- Authentication not checked
- Team membership not verified
- Missing error boundaries
- Poor loading states

**Goal: Maintainable, secure, PR-ready code that preserves working functionality.**