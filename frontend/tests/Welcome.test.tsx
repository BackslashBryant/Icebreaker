import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Welcome from "../src/pages/Welcome";

// Mock BootSequence to skip animation
vi.mock("../src/components/custom/BootSequence", () => ({
  BootSequence: ({ onComplete }: { onComplete: () => void }) => {
    // Immediately call onComplete to skip boot sequence
    setTimeout(() => onComplete(), 0);
    return null;
  },
}));

describe("Welcome", () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ok" }),
    } as Response);

    // Ensure window.matchMedia is properly mocked before component renders
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

    // Skip boot sequence by setting seen-boot flag
    sessionStorage.setItem("icebreaker:seen-boot", "true");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders logo and brand tagline", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for main content to render (don't wait for HealthStatus which may be async)
    await waitFor(() => {
      expect(screen.getByText("ICEBREAKER")).toBeInTheDocument();
    });

    expect(screen.getByText(/Real world/i)).toBeInTheDocument();
    expect(screen.getByText(/Real time/i)).toBeInTheDocument();
    expect(screen.getByText(/Real connections/i)).toBeInTheDocument();
  });

  it("renders Press Start button", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for button to render (using testid since button wraps Link)
    await waitFor(() => {
      const button = screen.getByTestId("cta-press-start");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent(/Press Start/i);
    });
  });

  it("renders Not for me button", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Not for me/i })).toBeInTheDocument();
    });
  });

  it("Get started navigates to onboarding", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for button to render (Button with asChild renders as Link)
    await waitFor(() => {
      const button = screen.getByTestId("cta-press-start");
      expect(button).toBeInTheDocument();
    });
    
    // Button with asChild renders as the Link, so check the button itself
    const button = screen.getByTestId("cta-press-start");
    expect(button.tagName).toBe("A");
    expect(button).toHaveAttribute("href", "/onboarding");
  });
});
