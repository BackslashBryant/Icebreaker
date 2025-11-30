# Testing Documentation

This directory contains testing procedures, data, and results for the project.

## Testing Strategy
- Unit tests for individual components
- Integration tests for component interactions
- End-to-end tests for complete workflows
- Performance tests for scalability

## Test Types
- [Unit Tests](procedures.md#unit-tests)
- [Integration Tests](procedures.md#integration-tests)
- [E2E Tests](procedures.md#e2e-tests)
- [Visual Regression Tests](visual-regression.md) - Theme/viewport/accessibility matrix testing
- [Performance Tests](procedures.md#performance-tests)

## Test Data
- [Test Data Sets](test-data.md)
- [Mock Data](test-data.md#mock-data)
- [Test Fixtures](test-data.md#test-fixtures)

## Test Personas
- **User Personas**: See `docs/personas/` for detailed user personas with social media profiles
- **Usage**: Reference personas during manual testing, user research, and feature development
- **IceBreaker Profiles**: Each persona includes expected IceBreaker profile configuration (vibe, tags, visibility) for testing
- **Core Personas**: Maya Patel (19, anxious student), Ethan Chen (20, socially anxious), Zoe Kim (21, overthinker), Marcus Thompson (29, remote worker), Casey Rivera (34, creative professional)
- **Market Research Personas**: River Martinez (26, urban resident), Alex Kim (27, tech conference), Jordan Park (38, privacy-focused), Sam Taylor (24, outgoing introvert), Morgan Davis (28, grad student)

## Results
- [Test Results](results.md)
- [Coverage Reports](results.md#coverage)
- [Performance Benchmarks](results.md#performance)

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific test suite
pnpm test:unit
pnpm test:integration
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

## Test Configuration
- **Unit Tests**: Vitest
- **Integration Tests**: Vitest + Test Database
- **E2E Tests**: Playwright
- **Performance Tests**: Lighthouse + Custom Metrics

## Best Practices
- Write tests before implementing features
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies
- Test edge cases and error conditions
- Maintain high test coverage
- Keep tests fast and reliable

## Troubleshooting
- **Test Failures**: Check test environment setup
- **Coverage Issues**: Ensure all code paths are tested
- **E2E Failures**: Verify browser setup and test data
- **Performance Issues**: Check system resources and configuration
