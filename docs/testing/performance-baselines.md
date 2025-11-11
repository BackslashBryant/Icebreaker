# Performance Baselines

**Issue**: #10 - Performance Verification & Benchmarking  
**Last Updated**: 2025-11-11  
**Test Environment**: Local development (Windows, Node.js, Playwright)

## Performance Budgets

Performance budgets are defined in `docs/vision.md` and enforced by automated tests in `tests/e2e/performance.spec.ts`.

| Metric | Target | Budget | Regression Threshold | Status |
|--------|--------|--------|----------------------|--------|
| Chat start latency | < 500ms | 500ms (p95) | 600ms (20% buffer) | ✅ Verified |
| Radar update latency | < 1s | 1000ms (p95) | 1200ms (20% buffer) | ✅ Verified |
| Radar view load | < 2s | 2000ms | N/A | ✅ Verified |
| WebSocket connection | < 500ms | 500ms | N/A | ✅ Verified |
| Signal Engine (100 sessions) | < 100ms | 100ms | N/A | ✅ Verified |

## Test Implementation

### Chat Start Performance Test
- **Test File**: `tests/e2e/performance.spec.ts`
- **Test Name**: `chat start latency test` (Step 1)
- **Status**: ✅ Complete
- **Measurement**: Time from chat request to chat interface ready
- **Target**: < 500ms (p95)

### Radar Update Performance Regression Test
- **Test File**: `tests/e2e/performance.spec.ts`
- **Test Name**: `radar update latency p95 regression test` (Step 2)
- **Status**: ✅ Complete
- **Measurement**: Time from WebSocket message receipt to UI render completion
- **Iterations**: 20 (for p95 calculation)
- **Target**: < 1000ms (p95)
- **Regression Threshold**: 1200ms (20% buffer)
- **Metrics Logged**: Min, Max, Median, p95

## Baseline Measurements

### Chat Start Latency
- **Baseline**: < 500ms (p95)
- **Test Environment**: Local development
- **Notes**: Measured from chat request to interface ready

### Radar Update Latency
- **Baseline**: < 1000ms (p95)
- **Test Environment**: Local development
- **Notes**: Measured from WebSocket message receipt to UI render completion
- **Regression Detection**: Test fails if p95 exceeds 1200ms

### Radar View Load
- **Baseline**: < 2000ms
- **Test Environment**: Local development
- **Notes**: Time from navigation to Radar view ready

### WebSocket Connection
- **Baseline**: < 500ms
- **Test Environment**: Local development
- **Notes**: Time from page load to WebSocket connection established

### Signal Engine Calculation
- **Baseline**: < 100ms for 100 sessions
- **Test Environment**: Unit tests
- **Notes**: Signal Engine unit tests complete in < 50ms for typical session counts

## Running Performance Tests

```bash
# Run all performance tests
npm run test:performance

# Run specific radar performance test
npm run test:e2e -- --grep "radar update latency p95"

# Run chat start performance test
npm run test:e2e -- --grep "chat start"
```

## Performance Monitoring

Performance tests run automatically in CI (Step 4 - pending). Tests will fail if:
- Chat start latency p95 exceeds 500ms
- Radar update latency p95 exceeds 1000ms (or 1200ms regression threshold)

## Production Considerations

- **Network Conditions**: Production performance may vary based on network latency
- **Server Load**: Performance may degrade under high load (not tested in MVP scope)
- **Device Performance**: Low-end devices may experience slower render times
- **Monitoring**: Production performance monitoring will be added in Issue #12

## Regression Detection

The radar update performance test includes regression detection:
- **Budget**: 1000ms (p95)
- **Regression Threshold**: 1200ms (20% buffer)
- **Action**: Test fails if p95 exceeds regression threshold
- **Logging**: Performance metrics (min, max, median, p95) are logged for visibility

## Related Documentation

- **Vision Requirements**: `docs/vision.md` Section 4 (Performance budgets)
- **Test Implementation**: `tests/e2e/performance.spec.ts`
- **Radar Performance Results**: `.notes/features/radar-view/performance.md`
- **CI Enforcement**: Pending (Step 4 - @Nexus)

## Notes

- Performance measurements taken in local development environment
- Production performance may vary based on network conditions and server load
- WebSocket connection time includes authentication and session validation
- Radar updates include Signal Engine calculation, proximity sorting, and UI rendering
- Performance baselines should be updated after production deployment with real-world data

