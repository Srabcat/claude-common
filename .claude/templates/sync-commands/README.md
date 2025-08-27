# Sync Commands Templates

These templates provide session continuity patterns for AI-first development across projects.

## Files

### `sync-start`
**Purpose**: Load project context at new AI session start  
**Adaptation needed**:
- Replace `[YOUR_PROJECT_NAME]` with actual project name
- Update `TODO_FILE` to match your project's todo file name
- Modify framework section grep patterns if needed

### `sync-end`  
**Purpose**: Save progress before ending AI session
**Adaptation needed**:
- Replace `[YOUR_PROJECT_NAME]` with actual project name  
- Update `TODO_FILE` to match your project's todo file name
- Modify framework section patterns for your project structure

### `project-status` (template)
**Purpose**: Quick overview of project progress
**Adaptation needed**:
- Customize for your project's milestone structure
- Update progress calculation logic
- Add project-specific status checks

## Usage Pattern

1. **Copy templates** to your project's `.claude/commands/` directory
2. **Customize** project-specific variables and paths
3. **Make executable**: `chmod +x .claude/commands/sync-*`
4. **Test** commands work with your project structure
5. **Update** commands as project evolves

## Integration with Hooks

These commands work with the global `post-task` hook that shows sync reminders after every AI task completion.

**Hook location**: `/Users/april/10x10-Repos/.claude/hooks/post-task`
**Commands location**: `[PROJECT]/.claude/commands/sync-*`

This creates automatic reminders to maintain session continuity across AI interactions.

## Best Practices

- **Consistent naming**: Use same command names across projects
- **Clear prompts**: Commands should show exact phrases to say to AI
- **Project adaptation**: Customize for each project's todo/tracking system
- **Regular updates**: Keep templates current as patterns evolve