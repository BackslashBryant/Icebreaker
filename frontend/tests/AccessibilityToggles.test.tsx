import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccessibilityToggles } from "@/components/profile/AccessibilityToggles";
import { useAccessibility } from "@/hooks/useAccessibility";

// Mock dependencies
vi.mock("@/hooks/useAccessibility");

const mockUseAccessibility = vi.mocked(useAccessibility);

describe("AccessibilityToggles", () => {
  const mockSetReducedMotion = vi.fn();
  const mockSetHighContrast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseAccessibility.mockReturnValue({
      reducedMotion: false,
      highContrast: false,
      setReducedMotion: mockSetReducedMotion,
      setHighContrast: mockSetHighContrast,
      loading: false,
    });
  });

  it("renders both toggles", () => {
    render(<AccessibilityToggles />);
    expect(screen.getByText("Reduce Motion")).toBeInTheDocument();
    expect(screen.getByText("High Contrast")).toBeInTheDocument();
  });

  it("shows current reduced motion state", () => {
    mockUseAccessibility.mockReturnValue({
      reducedMotion: true,
      highContrast: false,
      setReducedMotion: mockSetReducedMotion,
      setHighContrast: mockSetHighContrast,
      loading: false,
    });
    render(<AccessibilityToggles />);
    const checkbox = screen.getByLabelText("Reduce motion");
    expect(checkbox).toBeChecked();
  });

  it("shows current high contrast state", () => {
    mockUseAccessibility.mockReturnValue({
      reducedMotion: false,
      highContrast: true,
      setReducedMotion: mockSetReducedMotion,
      setHighContrast: mockSetHighContrast,
      loading: false,
    });
    render(<AccessibilityToggles />);
    const checkbox = screen.getByLabelText("High contrast mode");
    expect(checkbox).toBeChecked();
  });

  it("toggles reduced motion", async () => {
    const user = userEvent.setup();
    render(<AccessibilityToggles />);

    const checkbox = screen.getByLabelText("Reduce motion");
    await user.click(checkbox);

    expect(mockSetReducedMotion).toHaveBeenCalledWith(true);
  });

  it("toggles high contrast", async () => {
    const user = userEvent.setup();
    render(<AccessibilityToggles />);

    const checkbox = screen.getByLabelText("High contrast mode");
    await user.click(checkbox);

    expect(mockSetHighContrast).toHaveBeenCalledWith(true);
  });

  it("disables toggles while loading", () => {
    mockUseAccessibility.mockReturnValue({
      reducedMotion: false,
      highContrast: false,
      setReducedMotion: mockSetReducedMotion,
      setHighContrast: mockSetHighContrast,
      loading: true,
    });
    render(<AccessibilityToggles />);

    const reducedMotionCheckbox = screen.getByLabelText("Reduce motion");
    const highContrastCheckbox = screen.getByLabelText("High contrast mode");

    expect(reducedMotionCheckbox).toBeDisabled();
    expect(highContrastCheckbox).toBeDisabled();
  });
});

