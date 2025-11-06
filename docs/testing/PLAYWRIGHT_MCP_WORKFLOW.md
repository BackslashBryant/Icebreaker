# Playwright MCP Workflow for Testing

## Overview

Per `.cursor/rules/04-integrations.mdc` and `.cursor/rules/02-quality.mdc`, Playwright MCP should be used for:
- **UI screenshots** for artifacts
- **Accessibility checks** (axe/Lighthouse)
- **Performance checks** (Lighthouse)

## Playwright MCP Tools

Playwright MCP provides the following tools (from `@microsoft/playwright-mcp`):

### Core Tools
- `browser_navigate` - Navigate to a URL
- `browser_snapshot` - Capture accessibility snapshot (better than screenshots for a11y)
- `browser_take_screenshot` - Take screenshots for artifacts
- `browser_click` - Click elements
- `browser_type` - Type text into fields
- `browser_wait_for` - Wait for text/elements

### Verification Workflow

1. **Start servers** (if not using Playwright test webServer):
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend  
   cd frontend && npm run dev
   ```

2. **Navigate to app**:
   - Use `browser_navigate` with URL: `http://localhost:3000/welcome`

3. **Take accessibility snapshot**:
   - Use `browser_snapshot` to get structured accessibility tree
   - This provides role, accessibleName, and text information
   - Better than screenshots for accessibility verification

4. **Take screenshots for artifacts**:
   - Use `browser_take_screenshot` with filename: `artifacts/welcome-screen.png`
   - Save screenshots at each step of onboarding flow

5. **Navigate through onboarding**:
   - Use `browser_click` to click "PRESS START"
   - Use `browser_wait_for` to wait for next step
   - Use `browser_snapshot` to verify accessibility at each step
   - Use `browser_take_screenshot` to capture UI state

6. **Verify WCAG AA compliance**:
   - Use `browser_snapshot` to check for:
     - Proper roles (button, link, heading, etc.)
     - Accessible names for interactive elements
     - Text content visible in snapshot
   - Check for missing labels, improper ARIA usage

## Integration with E2E Tests

The full E2E test suite (`npx playwright test`) should still run for:
- Complete flow validation
- Automated assertions
- CI/CD pipelines

Playwright MCP should be used for:
- **Interactive verification** during development
- **Screenshot capture** for PR artifacts
- **Accessibility spot checks** during implementation
- **Manual testing workflows**

## When Playwright MCP Tools Are Not Available

If Playwright MCP tools are not loaded in the session:
1. Document the fallback in `.notes/features/<slug>/progress.md`
2. Use `npx playwright test` for full test execution
3. Use `@axe-core/playwright` in test files for accessibility checks
4. Screenshots will be captured automatically in `artifacts/test-results/`

## Configuration

Playwright MCP is configured in `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "playwright-mcp": {
      "command": "cmd",
      "args": [
        "/c",
        "npx",
        "-y",
        "@smithery/cli@latest",
        "run",
        "@microsoft/playwright-mcp",
        "--key",
        "0faa80d7-4649-4752-aa02-89680cfadf07"
      ]
    }
  }
}
```

**Note**: Cursor may need to be restarted for MCP servers to load.

## Artifacts Location

All screenshots and snapshots should be saved to:
- `artifacts/playwright-mcp/` - Screenshots from MCP tools
- `artifacts/test-results/` - Test artifacts from CLI runs
- `artifacts/playwright-report/` - HTML reports (never auto-open)

## References

- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp)
- `.cursor/rules/04-integrations.mdc` - MCP integration rules
- `.cursor/rules/02-quality.mdc` - Quality gates and testing rules


