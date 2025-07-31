# Claude Common

Shared Claude Code configurations, commands, and instructions for multiple repositories.

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

## Structure

```
claude-common/
├── .claude/
│   ├── commands/          # Shared Claude commands
│   └── hooks/
│       └── post-task      # Plays completion sound
├── assets/
│   └── done.mp3          # Task completion sound
├── claude.md             # Shared Claude instructions
└── README.md             # This file
```

## Integration

This repository uses Claude Code's `--add-dir` functionality to share commands and instructions across multiple repositories. Each repository needs a one-time setup via the `/init-common` command.

### Benefits

- **DRY Principle**: Write commands once, use everywhere
- **Consistency**: Same instructions and helpers across all projects  
- **Centralized Updates**: Update commands in one place
- **Enhanced UX**: Completion sounds and shared workflows

### Repository Requirements

Each repository that wants to use claude-common should:
1. Have a `.claude/commands/` directory
2. Create an `/init-common` command that runs:
   ```bash
   claude --add-dir "$(git rev-parse --show-toplevel)/../claude-common"
   ```

## Contributing

1. Add or modify commands in `.claude/commands/`
2. Update `claude.md` for new shared instructions
3. Test across multiple repositories
4. Commit and push changes

All linked repositories will automatically have access to updates.