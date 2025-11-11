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

  it("renders PRESS START button", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for button to render
    await waitFor(() => {
      expect(screen.getByRole("link", { name: /PRESS START/i })).toBeInTheDocument();
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

  it("PRESS START navigates to onboarding", async () => {
    render(
      <BrowserRouter>
        <Welcome />
      </BrowserRouter>
    );

    // Wait for button to render
    await waitFor(() => {
      const startButton = screen.getByRole("link", { name: /PRESS START/i });
      expect(startButton).toHaveAttribute("href", "/onboarding");
    });
  });
});
