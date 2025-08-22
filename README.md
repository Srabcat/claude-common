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

## Quick Start

1. **Link a repository to claude-common:**
   ```bash
   # From inside your repository
   /init-common
   ```

2. **Use shared commands:**
   All commands in `.claude/commands/` become available in linked repositories.

3. **Enjoy completion sounds:**
   Tasks automatically play a completion sound via the post-task hook.

This repository uses Claude Code's `--add-dir` functionality to share commands and instructions across multiple repositories. 

Each repository needs a one-time setup via the `/init-common` command.

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

## Repository Integration

### Adding New Repositories
1. Ensure the repository has a `.claude/commands/` directory
2. Create an `/init-common` command in the repository
3. Run the `/init-common` command to link to claude-common

### Command Precedence
- Repository-specific commands override shared commands
- Repository-specific CLAUDE.md rules supplement (don't override) shared rules
- Local configuration takes precedence over shared configuration

## Maintenance

### Updating Shared Commands
1. Make changes in `claude-common/.claude/commands/`
2. Test changes across multiple repositories
3. Commit and push changes to claude-common
4. All linked repositories automatically get updates

### Sound Configuration
The post-task hook plays `assets/done.mp3` after Claude completes any task. To customize:
1. Replace `assets/done.mp3` with your preferred sound file
2. The hook automatically detects the appropriate audio player for your system

### Repository Requirements

Each repository that wants to use claude-common should:
1. Have a `.claude/commands/` directory
2. Create an `/init-common` command that runs:
   ```bash
   claude --add-dir "$(git rev-parse --show-toplevel)/../claude-common"
   ```