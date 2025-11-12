# E2E Testing with Playwright

## Primary Testing Tool: Playwright MCP

**Use Playwright MCP for all testing operations** - it provides clean output, proper encoding, and better integration with Cursor.

### Running Tests

**Preferred Method**: Use Playwright MCP tools via Cursor chat
- Screenshots, accessibility checks, and test execution through MCP
- Clean output without encoding issues
- Better integration with Cursor's context

**Fallback Method**: Command line (for CI or when MCP unavailable)
```bash
cd tests
npm test                    # Run all tests
npm test -- <file>.spec.ts  # Run specific test file
npm run test:smoke          # Run smoke tests only
```

## Test Output

- **Reporter**: `list` - Clean ASCII output, no Unicode artifacts
- **Encoding**: UTF-8 (handled automatically by Playwright)
- **Colors**: Disabled in CI, enabled locally for better readability

## Test Structure

- `e2e/personas/` - Persona-based E2E tests
- `e2e/visual/` - Visual regression tests
- `e2e/` - Core functionality tests
- `utils/` - Test helpers and utilities
- `fixtures/` - Test data and mocks

## Configuration

- `playwright.config.ts` - Main test configuration
- `playwright.config.smoke.ts` - Smoke test configuration (faster subset)

## Notes

- **Dynamic Workers**: Tests use 50% of CPU cores automatically (2 workers in CI)
  - Override with `PLAYWRIGHT_WORKERS` env var (e.g., `PLAYWRIGHT_WORKERS=4` or `PLAYWRIGHT_WORKERS=25%`)
- **Parallel Execution**: Enabled by default - servers are reused, no port conflicts
- Servers start automatically via `webServer` config
- Set `SKIP_WEB_SERVER=1` to use manually started servers
- Set `DEBUG=1` to see server output during tests
- Set `CI=1` for CI environment (uses conservative worker count)

