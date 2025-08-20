# Project: Hiring Marketplace Platform


------------------------------------

Let me search for the latest Claude Code documentation to give you current best practices.Let me fetch the official documentation to get the most accurate information:Based on the official documentation and best practices, here's your comprehensive Claude Code guide:

# Claude Code Best Practices - August 2025

## Core Setup (Must Do First)

### 1. Install & Basic Config
```bash
# Install Claude Code extension in VS Code/Cursor
# Install GitHub CLI for enhanced functionality
brew install gh
```

### 2. Create Your CLAUDE.md File (Essential!)

Put this in your project root and **check it into git**:

```markdown
# Project: Hiring Marketplace Platform

## Bash Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run test` - Run test suite
- `npm run typecheck` - TypeScript checking
- `docker-compose up` - Start local database

## Code Style
- Use TypeScript strict mode
- Prefer functional components over class components
- Use Prisma for database queries
- Follow REST API patterns in /api routes
- Use Tailwind for styling

## Database
- Run `npx prisma migrate dev` after schema changes
- Use `npx prisma studio` to view data
- Multi-tenant isolation via tenant_id in all tables

## Testing
- Write tests BEFORE implementing features (TDD)
- Use Jest for unit tests
- Test database operations in isolation
- Mock external APIs in tests

## Workflow
- Create feature branches from main
- Prefer small, focused commits
- Run typecheck before committing
- IMPORTANT: Always include tenant_id in database queries for security
```

## Essential Workflows

### 1. **Explore → Plan → Code → Commit** (Most Important)
```bash
claude
# Then:
"Read the authentication files and understand how login works, but don't write any code yet"

"Think about how to implement multi-tenant job posting. Make a plan"

"Now implement the plan you made"

"Commit the changes and create a PR"
```

**Key phrase**: Use "think" to trigger extended thinking mode - try "think", "think hard", "think harder", or "ultrathink" for more computation time.

### 2. **Test-Driven Development** (Your Best Friend)
```bash
"Write tests for the job posting API endpoint based on these requirements. Don't implement anything yet - just tests that should pass"

"Run the tests and confirm they fail"  

"Commit the tests"

"Now write code to make these tests pass. Keep iterating until all tests pass"

"Commit the implementation"
```

## Productivity Power-Ups

### 1. **Permission Management** (Stop Fighting Prompts!)
```bash
# Allow common tools permanently
claude
/permissions
# Add: Edit, Bash(git commit:*), Bash(npm run:*)
```

### 2. **Custom Slash Commands**
Create `.claude/commands/fix-issue.md`:
```markdown
Please analyze and fix GitHub issue: $ARGUMENTS

Steps:
1. Use `gh issue view` to get details
2. Understand the problem  
3. Search codebase for relevant files
4. Implement the fix
5. Write/run tests
6. Create commit and PR
```

Usage: `/project:fix-issue 123`

### 3. **Use Multiple Claude Sessions** (Game Changer!)
```bash
# Terminal 1: Feature development
cd project && claude

# Terminal 2: Testing/QA  
cd project-testing && claude

# Terminal 3: Database migrations
cd project-db && claude
```

Or use git worktrees:
```bash
git worktree add ../project-feature-auth auth-feature
cd ../project-feature-auth && claude
```

## Database-Specific Best Practices

Add to your CLAUDE.md:
```markdown
## Database Security Rules
- EVERY table MUST have tenant_id for multi-tenant isolation
- NEVER query across tenants without explicit marketplace_visibility table
- Always use parameterized queries to prevent SQL injection
- Test tenant isolation in every database function

## Common Patterns  
- Use UUIDs for all primary keys
- Include created_at, updated_at on all tables
- Soft delete with deleted_at instead of hard delete
- Index foreign keys and frequently queried columns
```

## MCP & Advanced Tools

Add useful MCP servers to `.mcp.json`:
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-puppeteer"]
    },
    "postgres": {
      "command": "mcp-server-postgres",
      "args": ["postgresql://user:pass@localhost:5432/db"]
    }
  }
}
```

## Debugging & Course Correction

- **Escape**: Interrupt Claude anytime to redirect
- **Double Escape**: Go back and edit previous prompts  
- **Use /clear**: Reset context when it gets cluttered
- **Be specific**: "Add pagination to job listings with 20 items per page using offset/limit" vs "add pagination"

## Quick Test Questions

**Q1**: What should you do BEFORE asking Claude to write code for a complex feature?
**A**: Ask it to explore/read relevant files and make a plan first

**Q2**: What's the magic word to get Claude to think more deeply?
**A**: "think" (or "think hard", "think harder", "ultrathink")

**Q3**: How do you run multiple Claude sessions for parallel work?
**A**: Use git worktrees or multiple terminal tabs with separate checkouts

**Q4**: What's the most important file for your project setup?
**A**: CLAUDE.md in your project root (and check it into git!)

Start with the CLAUDE.md file and the "explore → plan → code → commit" workflow - that alone will 10x your productivity. Once you're comfortable, add the parallel sessions and custom slash commands.
