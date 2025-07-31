# Claude Common - Universal Instructions

This file contains universal Claude Code instructions and configurations used across all repositories and products.

## Overview

The `claude-common` repository provides:
- **Universal Commands**: Git, deployment, and development commands that work across all products
- **Universal Instructions**: Common development guidelines and conventions  
- **Post-Task Hooks**: Shared functionality like completion sounds
- **Shared Documentation**: Reference docs available to all projects
- **Cross-Repository Integration**: Easy linking mechanism via `/init-common`

## Usage

### Initial Setup
From any repository that should use the shared commands, run:
```bash
/init-common
```

This command adds the claude-common directory to Claude's context, making all universal commands and instructions available.

### Shared Commands
All commands in `.claude/commands/` are universal utilities that work across all repositories and technology stacks.

### Shared Instructions
These instructions are automatically honored by Claude when working in any linked repository, in addition to product-specific and repository-specific CLAUDE.md files.

### Shared Documentation
Reference documentation is available in the `docs/` directory:
- `docs/CopyWriter.md` - Recruiter-UX copy guidelines
- Additional shared docs can be added here

## Universal Development Guidelines

### Code Style
- Follow existing patterns and conventions in each repository
- Use consistent naming and formatting
- Always test changes before committing
- Write clear, self-documenting code

### Security Best Practices
- **NEVER** commit secrets, API keys, or credentials to any repository
- Use environment variables for all sensitive configuration
- Follow security best practices for the specific technology stack
- Implement proper input validation and sanitization

### Git Workflow
- Use descriptive commit messages
- Create feature branches for new work
- Test thoroughly before merging
- Keep commits focused and atomic

### Testing Standards
- Run all tests before committing changes
- Ensure linting and type checking passes
- Write tests for new functionality
- Test integrations thoroughly

### Documentation
- Update documentation when changing functionality
- Keep README files current
- Document breaking changes and migration steps
- Use clear, concise language

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