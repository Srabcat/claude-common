# Claude Common - Universal Instructions

Cross-repository coordination and universal development guidelines for 10x10 recruitment platform. For setup instructions, see README.md.

## Documentation Philosophy

**CLAUDE.md Purpose**: Development guidance, architecture, conventions - NOT operational commands
**README.md Purpose**: Setup instructions, command reference, project overview
**Key Principle**: Eliminate duplication across files and repositories

### Lessons Learned
- Commands belong in README.md files, not CLAUDE.md
- File naming conventions should live in one authoritative location
- Platform-wide architecture goes in shared locations, not duplicated per repo
- Technology-specific guidance stays in relevant repositories
- Cross-references prevent duplication while maintaining context

## Repository Structure

- **Legacy Platform**: `10by10-web-app/`, `10by10-web-app-client/` → See `loopback-legacy/claude.md`
- **New SaaS Platform**: `NextSaaS/` → See `NextSaaS/CLAUDE.md`
- **ML Service**: `MatchingML/` → Python Flask service
- **Browser Extension**: `10x10-chrome-extension/` → LinkedIn integration
- **Utilities**: `MongoUtils/` → Database maintenance

## Technology-Specific Instructions

For detailed development guidance:
- **LoopBack 3 Legacy**: See `loopback-legacy/claude.md`
- **Next.js SaaS**: See `NextSaaS/CLAUDE.md`
- **This File**: Universal guidelines and cross-repo coordination

## Integration

Repository-specific CLAUDE.md files supplement (don't override) these universal rules.

## Universal Development Guidelines

### Code Style
- Follow existing patterns and conventions in each repository
- Use consistent naming and formatting
- Always test changes before committing
- Write clear, self-documenting code

### Security Best Practices
- **NEVER** commit secrets, API keys, or credentials to any repository.
- New call DB directly from Front End
- Use environment variables for all sensitive configuration
- Follow security best practices for the specific technology stack
- Implement proper input validation and sanitization

### Git Workflow
- Use descriptive commit messages
- Create feature branches for new work
- Test thoroughly before merging
- Keep commits and PR focused and atomic

### Testing Standards before merge to dev or production repo
- Run all tests before committing changes
- Ensure linting and type checking passes
- Write tests for new functionality
- Test integrations thoroughly

### Documentation
- Update documentation when changing functionality
- Keep README files current
- Document breaking changes, migration steps, todo later
- Clear, concise - telegram style

