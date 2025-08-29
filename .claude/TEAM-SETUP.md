# Claude Code Team Setup Guide

## Quick Setup for New Projects

### 1. Link Shared Configurations
```bash
cd /path/to/your/new/repo
ln -sf ../claude-common/.mcp.json .mcp.json
ln -sf ../claude-common/.claude ./claude-shared
```

### 2. Create Project-Specific .claude/
```bash
mkdir -p .claude/commands .claude/hooks
echo '{"extends": "./claude-shared/settings.json"}' > .claude/settings.json
```

### 3. Copy Essential Commands
```bash
cp ../claude-common/.claude/commands/primer.md .claude/commands/
cp ../claude-common/.claude/commands/git-checkpoint.md .claude/commands/
cp ../claude-common/.claude/commands/code-workflow.md .claude/commands/
```

## Available Shared Resources

### MCP Servers (via .mcp.json)
- **Serena**: Semantic coding assistant
- **Playwright**: Browser automation  
- **shadcn**: UI component templates

### Command Templates (.claude/commands/)
- `primer.md` - Project context loading
- `git-checkpoint.md` - Quick save commits
- `code-workflow.md` - Full development workflow
- `prototype.md` - Prototyping guidelines
- `adr-generate.md` - Architecture decision records
- `db-design-*.md` - Database design workflows

### Hooks (.claude/hooks/)
- `post-task` - Completion sounds & session tracking

### Agents (.claude/agents/)
- `ui-review-agent.md` - Design review specialist

## Team Usage Patterns

### Project Initialization
1. Run `/primer` to understand project context
2. Use `/git-checkpoint` for frequent progress saves
3. Follow `/code-workflow` for feature development

### Development Workflow
1. **Plan**: Use architecture commands for complex features
2. **Implement**: Follow code-workflow patterns
3. **Review**: Use specialized agents for quality assurance

### Session Management
- Hook provides automatic progress tracking
- Use relative paths for all configurations
- Share command patterns across team members