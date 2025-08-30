# Claude Common

Universal Claude Code configurations and shared instructions for the 10x10 recruitment platform repositories.

*Test change for GitHub authentication verification.*

## 10x10 Platform Overview

Multi-component recruitment platform with legacy LoopBack 3 system and new Next.js SaaS application.

**Legacy System** (Production)
- React frontend + LoopBack 3 API
- MongoDB database with ML matching service
- LinkedIn Chrome extension integration

**New SaaS Platform** (Development)
- Next.js full-stack application
- PostgreSQL with Drizzle ORM

### Quick Start Platform

```bash
# Legacy Backend API
cd 10by10-web-app && npm run start:local

# Legacy Frontend
cd 10by10-web-app-client && npm run start:local

# New SaaS Platform
cd NextSaaS && npm run dev
```

## Development Tools

### Serena MCP Server
For enhanced Claude Code integration with semantic code editing tools:

```bash
# Start Serena MCP server
uvx --from git+https://github.com/oraios/serena serena start-mcp-server --log-level DEBUG
```

**Note**: The server may exit after initialization - this is normal behavior. Claude Code will restart it automatically when needed.

## Structure

```
claude-common/
├── .claude/
│   ├── commands/          # Shared Claude commands
│   └── hooks/
│       └── post-task      # Plays completion sound
├── assets/
│   └── done.mp3          # Task completion sound
├── docs/
│   └── Architecture/      # Technical architecture documentation
│       └── research-cache/ # Cached research results with verified URLs
├── claude.md             # Shared Claude instructions
└── README.md             # This file
```

### Benefits

- **DRY Principle**: Write commands once, use everywhere
- **Consistency**: Same instructions and helpers across all projects

## Research Cache

To reduce token usage and avoid re-researching the same topics, research results are cached in `docs/Architecture/research-cache/` with verified URLs:

### Finding Research:
- **ATS Standards**: `research-cache/ats-*-research.md`
- **API Documentation**: `research-cache/*-api-*.md` 
- **Industry Patterns**: `research-cache/industry-*-patterns.md`

### Research Format:
Each research file includes:
- **Date**: When research was conducted
- **Source**: Primary source (official docs, API specs, etc.)
- **Verified URLs**: Direct links for verification
- **Key Findings**: Extracted insights and patterns
- **Implementation Notes**: Technical considerations


Power Keywords: Claude responds to certain keywords with enhanced behavior (information dense keywords):

IMPORTANT: Emphasizes critical instructions that should not be overlooked
Proactively: Encourages Claude to take initiative and suggest improvements
Ultra-think: Can trigger more thorough analysis (use sparingly)
Essential Prompt Engineering Tips:

Avoid prompting for "production-ready" code - this often leads to over-engineering
Prompt Claude to write scripts to check its work: "After implementing, create a validation script"
Avoid backward compatibility unless specifically needed - Claude tends to preserve old code unnecessarily
Focus on clarity and specific requirements rather than vague quality descriptors

<!-- IGNORE_AI_START -->
This section is for human reference only. Tell AI to ignore below:

## Advanced Prompting Techniques
Power Keywords: Claude responds to certain keywords with enhanced behavior (information dense keywords):

IMPORTANT: Emphasizes critical instructions that should not be overlooked
Proactively: Encourages Claude to take initiative and suggest improvements
Ultra-think: Can trigger more thorough analysis (use sparingly)
Essential Prompt Engineering Tips:

Avoid prompting for "production-ready" code - this often leads to over-engineering
Prompt Claude to write scripts to check its work: "After implementing, create a validation script"
Avoid backward compatibility unless specifically needed - Claude tends to preserve old code unnecessarily
Focus on clarity and specific requirements rather than vague quality descriptors

## MCP:
- Serena MCP server: https://github.com/oraios/serena
- Playwright: https://www.youtube.com/watch?v=NjOqPbUecC4


## Claude Code Best Practices
1. Anthropic's Claude Code best practices:
https://www.anthropic.com/engineering.
https://www.anthropic.com/engineering/claude-code-best-practices
2. Context Engineering: https://www.youtube.com/watch?v=amEUIuBKwvg  https://github.com/coleam00/context-engineering-intro/blob/main/claude-code-full-guide/.claude/commands/primer.md
3. Dont break production code with ADR - https://www.youtube.com/watch?v=CMYhZMtPI_E https://github.com/AI-Engineer-Skool/prompt-vault/tree/main/self-documenting-ai-agent


## Dev Ops:
Anthropic's guide to devcontainers:
https://docs.anthropic.com/en/docs/cl...

## Tools
- https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor?tab=readme-ov-file#runtime-issues
- claude --dangerously-skip-permissions

## TODO
- avoid stale file references: https://www.youtube.com/watch?v=ohjMGnEaBxk https://github.com/AI-Engineer-Skool/prompt-vault/blob/main/claude-md-memory-workflow/update-claude-md.yml
- Subagents - https://github.com/coleam00/context-engineering-intro/tree/main/claude-code-full-guide
- Ref, Security, memory, Exa, playwright - https://www.youtube.com/watch?v=sF799nFJONk
- Claude class: https://anthropic.skilljar.com/

