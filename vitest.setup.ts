// Vitest setup file
import { vi } from 'vitest';

// Mock console methods in tests to reduce noise
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: vi.fn(),
  // debug: vi.fn(),
  // info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock environment variables
process.env.NODE_ENV = 'test';

// Global test utilities
global.testUtils = {
  // Add global test utilities here
  mockFetch: vi.fn(),
  mockLocalStorage: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
};

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
