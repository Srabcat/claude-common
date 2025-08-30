#!/bin/bash

# AI Session Handoff - Prepare context for new AI session
# Usage: /ai-reset

echo "🤖 AI SESSION HANDOFF PREPARATION"
echo "================================="
echo ""

# Save current session context
echo "📝 Saving current session context..."

# Get current mode
CURRENT_MODE="unknown"
if [ -f ".current-mode" ]; then
    CURRENT_MODE=$(cat .current-mode)
fi

# Get current branch and recent changes
BRANCH=$(git branch --show-current 2>/dev/null || echo 'unknown')
RECENT_COMMITS=$(git log --oneline -3 2>/dev/null || echo 'No recent commits')

# Create handoff context file
cat > .ai-session-context << EOF
# AI Session Handoff Context
Generated: $(date)

## Current State
- **Mode**: $CURRENT_MODE
- **Branch**: $BRANCH  
- **Last Updated**: $(date)

## Recent Work (last 3 commits)
$RECENT_COMMITS

## Key Context Files for New AI Session
- docs/PROJECT-STATUS.md - Overall project status
- docs/CHANGELOG.md - Recent changes and decisions
- docs/coding.md - Development guidelines and architecture
- .current-mode - Current development mode
- PROJECT-TODO.md - Current tasks and progress

## Last Session Summary
- Working on: [ADD CURRENT TASK HERE]
- Completed: [ADD WHAT WAS FINISHED]
- Next steps: [ADD IMMEDIATE NEXT ACTIONS]
- Blocked on: [ADD ANY BLOCKERS]

## Files Modified This Session
$(git diff --name-only HEAD~3..HEAD 2>/dev/null || echo 'No recent changes detected')

## New AI Session Starter Prompt
Copy and paste this for the new AI:
---
**Mode**: $CURRENT_MODE
**Task**: [DESCRIBE SPECIFIC TASK]
**Context**: Load from docs/PROJECT-STATUS.md, docs/CHANGELOG.md, and .ai-session-context
**Branch**: $BRANCH
**Last Session**: See .ai-session-context file for recent work and next steps
EOF

echo "✅ Session context saved to .ai-session-context"
echo ""

echo "📋 NEXT STEPS FOR NEW AI SESSION:"
echo ""
echo "1. 📤 **Copy this prompt for new AI**:"
echo "   Mode: $CURRENT_MODE"
echo "   Task: [DESCRIBE WHAT YOU WANT TO WORK ON]"
echo "   Context: Load from docs/PROJECT-STATUS.md, docs/CHANGELOG.md, and .ai-session-context"
echo "   Branch: $BRANCH"
echo ""

echo "2. 📁 **Key files for new AI to read**:"
echo "   - .ai-session-context (this session summary)"
echo "   - docs/PROJECT-STATUS.md (overall status)"
echo "   - docs/CHANGELOG.md (recent changes)"
echo "   - docs/coding.md (development guidelines)"
echo ""

echo "3. 🔄 **What new AI should do first**:"
echo "   - Read the context files above"
echo "   - Run /mode-check to understand current state"
echo "   - Confirm understanding of current task"
echo ""

echo "4. ⚠️  **Manual updates needed before new session**:"
echo "   - Edit .ai-session-context with current task details"
echo "   - Update docs/PROJECT-STATUS.md if needed"
echo "   - Add entry to docs/CHANGELOG.md for this session"
echo ""

echo "🎯 **Ready for clean AI handoff!**"