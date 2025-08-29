# Claude Code MCP Server Configuration

## Overview
This document describes the centralized MCP (Model Context Protocol) server configuration setup for all 10x10 repositories.

## Configuration Location
- **Master Config**: `/Users/april/10x10-Repos/claude-common/.mcp.json`
- **Linked Repos**: Other repositories use symbolic links to the master config

## Configured MCP Servers

### 1. Serena
- **Purpose**: Semantic coding assistant with repository context
- **Type**: stdio
- **Command**: `uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd)`

### 2. Playwright  
- **Purpose**: Browser automation and testing
- **Type**: stdio
- **Command**: `npx @playwright/mcp@latest`

### 3. shadcn
- **Purpose**: shadcn/ui component information and templates
- **Type**: http
- **URL**: `https://www.shadcn.io/api/mcp`

## Setup Process

### For New Repositories
To add MCP configuration to a new repository:

```bash
cd /path/to/your/new/repo
ln -sf ../claude-common/.mcp.json .mcp.json
```

### Verification
MCP servers should be available when working in any linked repository. Use `/mcp` command in Claude Code to verify server availability.

## Known Issues
- `claude mcp list` may not show project-scoped servers due to known Claude Code CLI issues
- MCP servers are functional even if not visible in CLI listing
- Project-scoped server discovery has known bugs in Claude Code

## Backup Strategy
- Configuration is version controlled in the `claude-common` repository
- All project repositories inherit the configuration via symbolic links
- No configuration stored in home directory to ensure backup coverage

## Maintenance
To modify MCP configuration:
1. Edit `claude-common/.mcp.json`
2. Changes automatically apply to all linked repositories
3. Commit changes to Git for backup

## Recovery
To restore MCP configuration on a new machine:
1. Clone the `claude-common` repository
2. Create symbolic links from other repositories to `.mcp.json`
3. No additional setup required