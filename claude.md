# Claude Common - Universal Instructions

Cross-repository coordination and universal development guidelines for 10x10 recruitment platform. For setup instructions, see README.md.

## Current Project Status (2025-08-07)
**Active Project**: ATS Marketplace Platform (AI-Powered Recruiting)  
**Phase**: Strategic Planning & Architecture (Phase 2)  
**Location**: `/prd/` directory - all files prefixed with `ATS-`  
**Research Complete**: Competitive analysis (Claude) + UI/Navigation design (Manus) consolidated  
**Next**: Technical complexity assessment and system architecture planning

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

## Product Requirements Documents (PRDs)
- **Location**: `cloud/common/prd/` - centralized PRD repository
- **Templates**: Use appropriate template from `templates/` directory
- **Lifecycle**: `active/` → `archive/` when complete
- **Guidelines**: Follow `guidelines/prd-writing-guidelines.md`
- **Naming**: `YYYY-MM-DD-project-name.md` format

## Research and Troubleshooting Guidelines

### Primary Source Priority
- **ALWAYS prioritize official documentation** from the product vendor/maintainer
- **Official docs are authoritative** - other sources may be outdated or incorrect
- **Verify configuration claims** with official documentation before stating as fact
- **Link to official sources** when making configuration recommendations

### Information Verification Hierarchy
1. **Official product documentation** (highest priority)
2. **Official GitHub repositories** and issue trackers
3. **Vendor support forums** and knowledge bases
4. **Stack Overflow** and community forums (verify with official docs)
5. **Blog posts and tutorials** (lowest priority - often outdated)

### Research Best Practices
- **Always cite sources** when making configuration claims
- **Test assumptions** against official documentation
- **Document what you've tried** to avoid repetitive troubleshooting
- **Distinguish between facts and assumptions** in recommendations
- **Admit uncertainty** rather than stating unverified information as fact

### Troubleshooting Methodology
- **Systematic approach** - test one variable at a time
- **Document failed attempts** to avoid circular troubleshooting
- **Use official diagnostic tools** when available
- **Isolate network vs authentication vs configuration issues**
- **Network tests first** (telnet, curl) before complex configuration changes
- **When error codes present**: Focus exclusively on that error code until all possible causes are exhausted
- **Error code exhaustion principle**: Don't expand troubleshooting scope until current error is fully investigated

### Critical Lessons Learned
- **Product defaults change** - verify current behavior, don't assume
- **Cloud services have different defaults** than self-hosted versions
- **Error codes have precise meanings** - research official definitions
- **SSL/TLS enforcement varies** by service and configuration
- **Connection issues require systematic isolation** of network, auth, and config layers
- **Never state product behavior as fact** without consulting official documentation first
- **Research COMMON integration issues first** - Major service combinations have documented problems
- **IPv4/IPv6 compatibility** - 2024 transition caused widespread connection issues (Supabase→IPv6, many services IPv4-only)
- **Check service-specific forums** - GitHub discussions, Stack Overflow for known integration issues
- **Cloud service transitions** - Research recent major changes that affect connectivity (AWS IPv4 fees, provider migrations)

