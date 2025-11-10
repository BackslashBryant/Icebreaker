import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000, // 10s per test - prevents hangs
    hookTimeout: 10000, // 10s per hook - prevents setup/teardown hangs
    teardownTimeout: 5000, // 5s teardown - ensures cleanup completes
    pool: 'forks', // Isolate tests in separate processes to prevent port conflicts
    poolOptions: {
      forks: {
        singleFork: false, // Allow parallel execution (dynamic ports prevent conflicts)
      },
    },
  },
});
