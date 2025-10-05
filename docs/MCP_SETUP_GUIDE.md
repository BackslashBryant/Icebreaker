_Template placeholder. Replace or remove once your project defines this content._

# MCP Setup Guide

## Overview
MCP (Model Context Protocol) tools enhance Cursor IDE capabilities for development.

## Required Tools
- GitHub MCP for issue management
- Supabase MCP for database operations
- Playwright MCP for UI testing
- Desktop Commander for local operations
- DocFork MCP for documentation

## Configuration
1. Install MCP tools via npm
2. Configure environment variables
3. Set up tool permissions and scopes
4. Test tool integration

## Environment Variables
- `GITHUB_TOKEN`: GitHub personal access token
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key

## GitHub Token Setup
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with required permissions:
   - `repo` - Full control of private repositories
   - `repo:status` - Access commit status
   - `public_repo` - Access public repositories
   - `workflow` - Update GitHub Action workflows
3. Store token in environment variable `GITHUB_TOKEN`

## Supabase Setup
1. Create Supabase project
2. Get project URL and anonymous key
3. Store in environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## MCP Configuration
The MCP configuration is located in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "github"],
      "env": ["GITHUB_TOKEN"],
      "config": {
        "owner": "your-username",
        "repo": "your-repo"
      }
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "supabase"],
      "env": ["SUPABASE_URL", "SUPABASE_ANON_KEY"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "playwright"],
      "env": ["GITHUB_TOKEN"]
    },
    "desktop-commander": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "desktop-commander"],
      "env": ["GITHUB_TOKEN"]
    },
    "docfork": {
      "command": "npx",
      "args": ["-y", "@smithery/cli@latest", "run", "docfork"],
      "env": ["GITHUB_TOKEN"]
    }
  }
}
```

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
```bash
# List tables
cursor --supabase list-tables

# Execute SQL
cursor --supabase execute-sql --query "SELECT * FROM users"

# Get logs
cursor --supabase get-logs --service api
```

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
