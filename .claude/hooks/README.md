# Claude Code Hooks

## Sound Notification Options

### Current: `post-task`
- **Sound**: Gentle Ping + Pop sequence
- **Volume**: Noticeable but pleasant
- **Duration**: ~0.5 seconds

### Alternative: `post-task-loud` 
- **Sound**: Triple Glass ding + voice "Claude task completed"
- **Volume**: Loud and obvious
- **Duration**: ~2 seconds

## How to Switch

### For gentler sound (current):
```bash
# Already active - does Ping + Pop
```

### For louder notification:
```bash
cp /Users/april/10x10-Repos/claude-common/.claude/hooks/post-task-loud /Users/april/10x10-Repos/claude-common/.claude/hooks/post-task
```

### To disable sound:
```bash
chmod -x /Users/april/10x10-Repos/claude-common/.claude/hooks/post-task
```

## Available macOS System Sounds

Uncomment in the hook file to try different sounds:
- `Ping.aiff` - Gentle ping (current)
- `Pop.aiff` - Soft pop (current) 
- `Glass.aiff` - Clear ding
- `Purr.aiff` - Gentle purr
- `Tink.aiff` - Soft metallic tink
- `Blow.aiff` - Whoosh sound
- `Bottle.aiff` - Cork pop
- `Frog.aiff` - Ribbit sound
- `Funk.aiff` - Funky beep

## Testing

Run manually to test:
```bash
/Users/april/10x10-Repos/claude-common/.claude/hooks/post-task
```

<!-- IGNORE_AI_START -->
This section is for human reference only. Tell AI to ignore below:

Hooks documentation - https://docs.anthropic.com/en/docs/claude-code/hooks

PreToolUse: Before tool execution (can block operations)
PostToolUse: After successful tool completion
UserPromptSubmit: When user submits a prompt
SubagentStop: When a subagent completes its task
Stop: When the main agent finishes responding
SessionStart: At session initialization
PreCompact: Before context compaction
Notification: During system notifications
Learn more in the Hooks documentation.

<!-- IGNORE_AI_END -->