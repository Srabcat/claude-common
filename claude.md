# Claude Common - Shared Instructions

This file contains shared Claude Code instructions and configurations that are used across multiple repositories.

## Overview

The `claude-common` repository provides:
- **Shared Commands**: Common Claude commands available to all linked repositories
- **Shared Instructions**: Common development guidelines and conventions  
- **Post-Task Hooks**: Shared functionality like completion sounds
- **Cross-Repository Integration**: Easy linking mechanism via `/init-common`

## Usage

### Initial Setup
From any repository that should use the shared commands, run:
```bash
/init-common
```

This command adds the claude-common directory to Claude's context, making all shared commands and instructions available.

### Shared Commands
All commands in `.claude/commands/` are available to any repository that has run `/init-common`.

### Shared Instructions
These instructions are automatically honored by Claude when working in any linked repository, in addition to repository-specific CLAUDE.md files.

## Development Guidelines

### Code Style
- Follow existing patterns and conventions in each repository
- Use consistent naming and formatting
- Always test changes before committing

### Security
- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Follow security best practices

### Testing
- Run tests before committing changes
- Ensure all linting and type checking passes
- Test integrations thoroughly

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