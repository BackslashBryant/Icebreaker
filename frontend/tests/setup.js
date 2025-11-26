// Test setup file for Vitest
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Suppress React Router future flag warnings in tests
// These warnings are expected and will be addressed when upgrading to React Router v7
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (
    typeof message === "string" &&
    (message.includes("React Router Future Flag Warning") ||
      message.includes("v7_startTransition") ||
      message.includes("v7_relativeSplatPath"))
  ) {
    // Suppress React Router future flag warnings
    return;
  }
  originalConsoleWarn.apply(console, args);
};

// Mock HTMLCanvasElement.getContext for jsdom
HTMLCanvasElement.prototype.getContext = vi.fn(function (contextType) {
  if (contextType === "2d") {
    return {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      stroke: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fill: vi.fn(),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 0,
      createLinearGradient: vi.fn(() => ({
        addColorStop: vi.fn(),
      })),
    };
  }
  return null;
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (not available in jsdom test environment)
global.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    // Mock implementation - no-op
  }
  unobserve() {
    // Mock implementation - no-op
  }
  disconnect() {
    // Mock implementation - no-op
  }
};