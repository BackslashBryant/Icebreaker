import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationStep } from "../src/components/onboarding/LocationStep";

// Mock useLocation hook
vi.mock("../src/hooks/useLocation", () => ({
  useLocation: () => ({
    location: null,
    error: null,
    loading: false,
    requestLocation: vi.fn(),
  }),
}));

describe("LocationStep", () => {
  it("renders location access title and explainer", () => {
    const onEnable = vi.fn();
    const onSkip = vi.fn();

    render(<LocationStep onEnable={onEnable} onSkip={onSkip} />);

    expect(screen.getByText("LOCATION ACCESS")).toBeInTheDocument();
    // Text is split across elements, so check for key parts
    expect(screen.getByText(/approximate location/i)).toBeInTheDocument();
    expect(screen.getByText(/Not stored long-term/i)).toBeInTheDocument();
  });

  it("renders Enable Location button", () => {
    const onEnable = vi.fn();
    const onSkip = vi.fn();

    render(<LocationStep onEnable={onEnable} onSkip={onSkip} />);

    expect(screen.getByRole("button", { name: /ENABLE LOCATION/i })).toBeInTheDocument();
  });

  it("renders Skip for now button", () => {
    const onEnable = vi.fn();
    const onSkip = vi.fn();

    render(<LocationStep onEnable={onEnable} onSkip={onSkip} />);

    expect(screen.getByRole("button", { name: /Skip for now/i })).toBeInTheDocument();
  });

  it("calls onSkip when skip button is clicked", async () => {
    const user = await import("@testing-library/user-event").then((m) => m.default.setup());
    const onEnable = vi.fn();
    const onSkip = vi.fn();

    render(<LocationStep onEnable={onEnable} onSkip={onSkip} />);

    const skipButton = screen.getByRole("button", { name: /Skip for now/i });
    await user.click(skipButton);

    expect(onSkip).toHaveBeenCalled();
  });
});
