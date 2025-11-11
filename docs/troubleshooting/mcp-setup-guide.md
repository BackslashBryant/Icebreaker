_Template placeholder. Replace or remove once your project defines this content._

# MCP Setup Guide

## Overview
MCP (Model Context Protocol) tools enhance Cursor IDE capabilities for development.

## Required Tools
- **GitHub MCP** (`@modelcontextprotocol/server-github`) - Issue management, branch/PR operations
- **Supabase MCP** (Hosted server) - Database operations, schema queries, project management
- **Playwright MCP** (`@playwright/mcp`) - UI testing, screenshots, accessibility checks
- **Desktop Commander MCP** (`@wonderwhy-er/desktop-commander`) - Local shell/file automation
- **Ref Tools MCP** (`ref-tools-mcp`) - Documentation search (no configuration needed)

## Configuration
1. Install MCP tools via npm
2. Configure environment variables
3. Set up tool permissions and scopes
4. Test tool integration

## Environment Variables
- `GITHUB_TOKEN`: GitHub personal access token (required for GitHub, Desktop Commander, Playwright MCPs)
- **Supabase MCP**: No environment variables needed - uses browser-based authentication

## GitHub Token Setup
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with required permissions:
   - `repo` - Full control of private repositories
   - `repo:status` - Access commit status
   - `public_repo` - Access public repositories
   - `workflow` - Update GitHub Action workflows
3. Store token in environment variable `GITHUB_TOKEN`

## Supabase Setup

**Using Official Hosted Supabase MCP Server** (Recommended):

1. **No environment variables needed** - The hosted server uses browser-based authentication
2. **Get your project reference**:
   - Go to Supabase Dashboard → Your Project
   - Copy the project reference from the URL (e.g., `awqcctsqyrlgaygpmgrq`)
3. **Configure in `.cursor/mcp.json`**:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
       }
     }
   }
   ```
4. **First-time authentication**:
   - Restart Cursor completely
   - Cursor will prompt you to authenticate via browser
   - Log in to your Supabase account and grant organization access

**Benefits of Hosted Server**:
- No manual token management
- Automatic authentication via browser
- Project-scoped access
- Feature groups (docs, account, database, debugging, development, functions, branching, storage)
- Official Supabase support

**Note**: If you need Supabase keys for other purposes (client libraries, direct API access), see `docs/troubleshooting/supabase-key-setup.md` for optional setup.

## MCP Configuration
The MCP configuration is located in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching%2Cstorage"
    },
    "playwright-mcp": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@wonderwhy-er/desktop-commander"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    },
    "ref-tools-mcp": {
      "command": "npx",
      "args": ["-y", "ref-tools-mcp"]
    }
  }
}
```

## Automation Helpers
- `npm run preflight` &mdash; validates that baseline MCPs (GitHub, Ref Tools, Desktop Commander, Playwright) remain configured before agents run.
- `npm run mcp:heal` &mdash; detects and fixes common MCP configuration issues (missing env fields, deprecated Smithery CLI usage).
- `npm run mcp:suggest` &mdash; analyses dependencies/config files and prints recommended MCPs alongside Cursor Directory links. Add `--json` or `--summary` for CI or scripted usage, and `--install <id>` (or `--install all`) to append the generated config to `.cursor/mcp.json`.
- `npm run verify` &mdash; automatically invokes the suggestion helper so verification logs capture any new MCP recommendations.

Record the output of `npm run mcp:suggest` in `.notes/` or the active plan so future sessions know whether to add or retire integrations.

## Troubleshooting

### Tool Installation Issues
- Ensure Node.js 18+ is installed
- Check npm/npx availability
- Verify network connectivity

### Permission and Authentication Problems
- Verify GitHub token permissions
- Check Supabase credentials
- Ensure environment variables are set

### Integration Failures
- Test individual MCP tools
- Check Cursor IDE MCP support
- Verify tool compatibility

### Performance Optimization
- Monitor MCP tool performance
- Optimize tool usage patterns
- Check system resources

## Best Practices
- Regular tool updates
- Security considerations
- Performance monitoring
- Backup and recovery

## Usage Examples

### GitHub MCP
```bash
# Create issue
cursor --github create-issue --title "New feature" --body "Description"

# List issues
cursor --github list-issues

# Create PR
cursor --github create-pr --title "Feature PR" --body "Description"
```

### Supabase MCP
The hosted Supabase MCP server provides database operations, schema management, and project tools. Ask the AI assistant to:
- Query your database tables
- List tables and schemas
- Execute SQL queries
- View project logs
- Manage database branches
- Access Supabase documentation

### Playwright MCP
```bash
# Take screenshot
cursor --playwright screenshot --url "https://example.com"

# Run accessibility test
cursor --playwright axe --url "https://example.com"

# Run Lighthouse
cursor --playwright lighthouse --url "https://example.com"
```

## Security Considerations
- Never commit tokens or secrets
- Use environment variables for sensitive data
- Regularly rotate access tokens
- Monitor tool usage and permissions

## Support
- Check MCP tool documentation
- Review Cursor IDE MCP support
- Consult troubleshooting guides
- Ask questions in team channels
