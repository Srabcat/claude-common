# Claude-common: Shared AI Development Patterns

This repository contains reusable templates and patterns for AI-first development across all 10x10 projects.

## Purpose
- **Templates**: Reusable command templates for new projects
- **Patterns**: Proven AI collaboration workflows  
- **Documentation**: Shared development guidelines
- **Standards**: Cross-project consistency

## Directory Structure

### `/templates/`
Reusable templates that can be copied to new projects:
- `sync-commands/` - Session continuity templates
- `issue-templates/` - GitHub issue templates  
- `workflows/` - Development workflow templates

### `/patterns/`
Documented AI collaboration patterns:
- `ai-collaboration/` - AI workflow best practices
- `context-management/` - Session continuity strategies
- `testing-strategies/` - AI + TDD patterns

### `/docs/`
Shared documentation and guidelines:
- Architecture decision records
- Cross-project standards
- AI productivity guidelines

## Usage

### For New Projects
1. Copy relevant templates from `/templates/`
2. Adapt to project-specific needs
3. Reference patterns from `/patterns/`

### For Existing Projects
1. Reference patterns for consistency
2. Update templates with improvements
3. Share learnings back to common repo

## Integration with Project-Specific .claude/

**Claude-common** provides the templates and patterns.
**Project .claude/** implements project-specific adaptations.
**Global .claude/** handles universal hooks and workflows.

This creates a three-tier system: universal → shared → project-specific.

<!-- IGNORE_AI_START -->
This section is for human reference only. Tell AI to ignore below:

## MCP:
1. Serena MCP server: https://github.com/oraios/serena

## Claude Code Best Practices
1. Anthropic's Claude Code best practices:
https://www.anthropic.com/engineering.
2. Claude Code set up: https://www.youtube.com/watch?v=amEUIuBKwvg  https://github.com/coleam00/context-engineering-intro/blob/main/claude-code-full-guide/.claude/commands/primer.md


## Dev Ops:
Anthropic's guide to devcontainers:
https://docs.anthropic.com/en/docs/cl...

<!-- IGNORE_AI_END -->