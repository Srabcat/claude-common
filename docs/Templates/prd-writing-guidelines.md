# PRD Writing Guidelines

Best practices for creating effective Product Requirements Documents.

## Core Principles

### 1. Clarity Over Cleverness
- Use simple, direct language
- Avoid jargon and technical terms unless necessary
- Write for your least technical stakeholder

### 2. Specific Over General
- Include concrete examples and use cases
- Define exact acceptance criteria
- Quantify success metrics where possible

### 3. User-Focused
- Start with user problems, not technical solutions
- Include actual user quotes and feedback when available
- Validate assumptions with data

## Writing Best Practices

### Problem Statement
- **Use data**: Include metrics that show the problem's impact
- **Be specific**: "Users abandon checkout" vs "Users are frustrated"
- **Show urgency**: Why solve this now vs later?

### User Stories
- Follow the standard format: "As a [user], I want [goal], so that [benefit]"
- Focus on the "why" - what value does this provide?
- Include edge cases and error scenarios
- Make them testable with clear acceptance criteria

### Success Metrics
- Choose metrics that directly relate to business goals
- Set realistic but ambitious targets
- Include both leading and lagging indicators
- Define how and when metrics will be measured

### Technical Requirements
- Collaborate with engineering early and often
- Include performance requirements (response times, load)
- Consider security and compliance requirements
- Document integration points and dependencies

## Common Mistakes to Avoid

### ❌ Writing Solutions Instead of Problems
**Bad**: "We need a new dashboard with charts"
**Good**: "Sales managers can't quickly identify underperforming territories"

### ❌ Vague Acceptance Criteria
**Bad**: "The page should load quickly"
**Good**: "Page loads in under 2 seconds for 95% of users"

### ❌ Missing Edge Cases
- What happens when there's no data?
- How do errors get handled?
- What about mobile/tablet views?

### ❌ Unrealistic Timelines
- Account for testing, bug fixes, and iteration
- Include buffer time for unexpected complexity
- Consider dependencies and team capacity

## Review Process

### Before Writing
- [ ] Validate the problem with user research
- [ ] Confirm business priority and urgency
- [ ] Check for existing solutions or workarounds

### During Writing
- [ ] Get early feedback from key stakeholders
- [ ] Validate technical feasibility with engineering
- [ ] Review designs and user flows with UX team

### Before Approval
- [ ] Test user stories with actual users if possible
- [ ] Confirm metrics are measurable and meaningful
- [ ] Ensure all stakeholders understand and agree

## PRD Lifecycle Management

### Living Document
- PRDs should evolve as you learn more
- Update based on user feedback and technical discoveries
- Version control major changes

### Post-Launch
- Measure actual results against predicted success metrics
- Document what worked and what didn't
- Use learnings to improve future PRDs

## Templates for Different Project Types

### Feature Enhancement
Use when adding to existing functionality
- Focus on current user pain points
- Include usage data and user feedback
- Consider impact on existing workflows

### New Product/Service
Use when building something entirely new
- Extensive market research section
- Detailed go-to-market strategy
- Higher uncertainty - plan for pivots

### Technical Infrastructure
Use for backend/platform improvements
- Focus on developer experience and system performance
- Include technical debt and maintenance considerations
- Quantify engineering efficiency improvements

### Bug Fix/Maintenance
Use for addressing technical debt or bugs
- Document user impact of current issues
- Include root cause analysis
- Plan for preventing similar issues

## Stakeholder Communication

### For Executives
- Lead with business impact and ROI
- Include competitive analysis
- Focus on strategic alignment

### For Engineering
- Detailed technical requirements
- Performance and scalability considerations
- Integration points and dependencies

### For Design
- User journey and experience requirements
- Accessibility and responsive design needs
- Brand and visual consistency requirements

### For Marketing
- Target audience and positioning
- Key benefits and differentiators
- Launch timeline and rollout plan