# Claude Common - Universal Instructions

AI Workflow:
	1.	Confirm desired output + success criteria before starting.
	2.	Ask if unsure — no guessing. If sure, summarize your understanding.
	3.	On completion: document progress as “Implementation complete — pending your approval.”
	4.	Track all pending-approval tasks until I sign off.
    5.  If in prototype mode, document hardening todo (performance, security...) but skip them until I approve the features for hardening and code review. 

Cross-repository coordination and universal development guidelines for 10x10 recruitment platform. For setup instructions, see README.md.

## Current Project Status (2025-08-08)
**Active Project**: ATS Marketplace Platform - UI Prototype Implementation  
**Phase**: Navigation & UX Validation (Phase 3)  
**Location**: `/ats-candidate-ui/` - Next.js 14 prototype with shadcn/ui  
**Status**: Functional prototype complete, navigation structure validation needed  
**Next**: Navigation approval → feature development prioritization

## ATS Prototype Lessons (CRITICAL)
**Key Insight**: Focus on FUNCTIONALITY first, optimization later
- **Problem**: Used React.memo/useMemo/useCallback without approval (overkill for prototyping)
- **Problem**: Created 50 mock candidates (too many for feature testing)
- **Problem**: Built complex pages before getting basic features approved
- **Rule**: Get approval for ANY library usage or optimization beyond basic functionality
- **Rule**: Use MINIMAL test data during feature development (3-5 records max)
- **Pattern**: Simple Implementation → Feature Approval → Add Data → Performance Optimization

## Lessons Learned - Mock Data Strategy:
- **Feature Development**: 3-5 records max - just enough to test functionality
- **Performance Testing**: Add larger datasets ONLY after features are approved
- **Don't**: Create 50 records when testing basic table sorting/filtering

## Library/Functionality Approval Process
**MUST ASK APPROVAL FOR:**
- React performance hooks (memo, useMemo, useCallback, etc.)
- Any external libraries beyond basic shadcn/ui components  
- Complex built-in functions or patterns
- New component patterns or architectures

**APPROVAL FORMAT:**
- What: Specific function/library name
- Why: Clear business reason for using it
- Alternative: What simpler approach exists
- Impact: Performance/complexity trade-offs

## Documentation Philosophy

**CLAUDE.md Purpose**: Development guidance, architecture, conventions - NOT operational commands
**README.md Purpose**: Setup instructions, command reference, project overview
**Key Principle**: Eliminate duplication across files and repositories
**Add / Remove / Archive Files**: Always ask my approval of new file location directory folder. Always ask my approval for deleting vs archiving files. 

### Lessons Learned
- Commands belong in README.md files, not CLAUDE.md
- File naming conventions should live in one authoritative location
- Platform-wide architecture goes in shared locations, not duplicated per repo
- Technology-specific guidance stays in relevant repositories
- Cross-references prevent duplication while maintaining context
- Always start with what you think the desired output is, and verify the output before you go down to the weeds. 

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
- **Templates**: Use/add appropriate template from `templates/` directory
- **Lifecycle**: `active/` → `archive/` when complete
- **Guidelines**: Follow `guidelines/prd-writing-guidelines.md`
- **Naming**: `YYYY-MM-DD-project-name.md` format

## Research and Troubleshooting Guidelines

### For Research: Primary Source Priority
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

### SW Troubleshooting Methodology
- **Systematic approach** - test one variable at a time
- **Document failed attempts** to avoid circular troubleshooting
- **Use official diagnostic tools** when available
- **When error codes present**: research official definitions, avoid guessing and chasing unrelated causes.Focus exclusively on that error code until all possible causes are exhausted
- **Error code exhaustion principle**: Don't widen scope until the specific error code is fully investigated

### SW Integration Troubleshooting Methodology
- **Isolate network vs authentication vs configuration issues**
- **Network tests first** (telnet, curl) before complex configuration changes
- **SSL/TLS enforcement varies** by service and configuration
- **Connection issues require systematic isolation** of network, auth, and config layers
- **Never state product behavior as fact** without consulting official documentation first
- **Research COMMON integration issues first** - Major service combinations have documented problems
- **IPv4/IPv6 compatibility** - 2024 transition caused widespread connection issues (Supabase→IPv6, many services IPv4-only)
- **Check service-specific forums** - GitHub discussions, Stack Overflow for known integration issues
- **Cloud service transitions** - Research recent major changes that affect connectivity (AWS IPv4 fees, provider migrations)

### Critical Lessons Learned - RESEARCH 
- **Product defaults change** - verify current behavior, don't assume
- **Cloud services have different defaults** than self-hosted versions




