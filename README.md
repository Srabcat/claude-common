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
├── claude.md             # Shared Claude instructions
└── README.md             # This file
```

### Benefits

- **DRY Principle**: Write commands once, use everywhere
- **Consistency**: Same instructions and helpers across all projects

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