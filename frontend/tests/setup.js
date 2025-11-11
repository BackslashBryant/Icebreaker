// Test setup file for Vitest
import { vi } from "vitest";
import "@testing-library/jest-dom";

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
