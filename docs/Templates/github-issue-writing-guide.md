# GitHub Issue Writing Guide for AI Projects

## Overview
This guide provides best practices for writing effective GitHub issues, particularly for AI and open-source projects. Well-written issues save time for maintainers and contributors, leading to faster resolution and better collaboration.

## Core Principles

### 1. Be Specific and Actionable
- **Good**: "Model crashes with CUDA out of memory error on GPUs with <8GB VRAM"
- **Bad**: "Model doesn't work"

### 2. Provide Context
- Include environment details (OS, Python version, library versions)
- Describe expected vs actual behavior
- Add relevant logs or error messages

### 3. Make It Reproducible
- Provide minimal code examples
- Include step-by-step reproduction instructions
- Specify exact versions and configurations

## Issue Types and Structure

### Bug Reports
**Essential Components:**
- **Clear title**: Include component and brief description
- **Environment**: OS, software versions, hardware specs (especially for AI)
- **Reproduction steps**: Minimal, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Additional context**: Logs, screenshots, workarounds

### Feature Requests
**Essential Components:**
- **Problem statement**: What problem does this solve?
- **Proposed solution**: Specific implementation suggestion
- **Alternatives considered**: Other approaches you've thought of
- **Use cases**: How would this be used?
- **Priority/impact**: Why is this important?

### Performance Issues (AI-Specific)
**Additional Components:**
- **Performance metrics**: Memory usage, training time, inference speed
- **Hardware specifications**: GPU model, memory, CPU cores
- **Dataset characteristics**: Size, type, complexity
- **Benchmarking data**: Before/after comparisons

## Research Before Writing

### 1. Repository Investigation
- Read `CONTRIBUTING.md` and issue templates
- Search existing issues for duplicates
- Review project documentation
- Understand the project's coding conventions

### 2. Issue Template Usage
- Use provided templates when available
- Follow the project's labeling conventions
- Include all required fields
- Add relevant optional information

## Communication Best Practices

### 1. Title Writing
- Start with component/area: `[Training] Memory leak in gradient accumulation`
- Be specific about the problem
- Include error type when applicable
- Keep under 80 characters when possible

### 2. Description Structure
- **Summary**: One-paragraph problem overview
- **Details**: Technical specifics and context
- **Impact**: Who/what is affected
- **Next steps**: What you've tried or suggest

### 3. Code Examples
- Use code blocks with syntax highlighting
- Provide minimal reproducible examples
- Include relevant configuration files
- Show both problematic and expected code

### 4. Follow-up Communication
- Respond promptly to clarification requests
- Update the issue if you find workarounds
- Close with summary when resolved
- Thank contributors and maintainers

## Common Mistakes to Avoid

1. **Vague titles**: "Something is broken"
2. **Missing environment info**: Especially critical for AI projects
3. **No reproduction steps**: Makes debugging nearly impossible
4. **Duplicate issues**: Always search first
5. **Multiple unrelated problems**: Create separate issues
6. **Insufficient context**: Provide enough detail for others to understand

## Quality Checklist

Before submitting, ensure your issue has:
- [ ] Clear, specific title
- [ ] Complete environment information
- [ ] Reproduction steps (for bugs)
- [ ] Expected vs actual behavior
- [ ] Relevant code examples
- [ ] Logs or error messages
- [ ] Search performed for duplicates
- [ ] Appropriate labels applied
- [ ] Proper formatting and grammar

## GitHub 2025 Features

### Sub-Issues
Break large issues into smaller, manageable sub-issues:
- Makes work more manageable
- Enables parallel development
- Creates smaller, easier-to-review PRs

### Issue Types
Use GitHub's new issue classification system:
- Helps organize bug backlogs
- Provides consistent language across repositories
- Enables better progress tracking

### Advanced Search
Leverage improved search capabilities:
- Find related issues more effectively
- Better duplicate detection
- Enhanced filtering options

## Using the Templates

**For New Repositories:**
1. Copy the entire `.github/ISSUE_TEMPLATE/` folder from claude-common
2. Customize labels, assignees, and contact links for your project
3. Adjust fields based on your project's specific needs

**Template Structure:**
- YAML format for structured forms with validation
- Numbered prefixes for proper ordering (01-bug-report.yml)
- Configuration file (config.yml) to customize template chooser

Remember: Good issues save everyone time and lead to better software. Invest in clarity upfront for faster resolution later.