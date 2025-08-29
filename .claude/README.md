# Claude-common/.claude: Shared AI Development Patterns

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

This creates a three-tier system: universal → shared → project-specific.

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


<!-- IGNORE_AI_END -->