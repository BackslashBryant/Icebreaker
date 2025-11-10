import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { VisibilityToggle } from "@/components/profile/VisibilityToggle";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { toast } from "sonner";

// Mock dependencies
vi.mock("@/hooks/useProfile");
vi.mock("@/hooks/useSession");
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockUseProfile = vi.mocked(useProfile);
const mockUseSession = vi.mocked(useSession);
const mockToast = vi.mocked(toast);

describe("VisibilityToggle", () => {
  const mockUpdateVisibility = vi.fn();
  const mockSetSession = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProfile.mockReturnValue({
      updateVisibility: mockUpdateVisibility,
      updateEmergencyContact: vi.fn(),
      loading: false,
    });
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        visibility: true,
      },
      setSession: mockSetSession,
    });
  });

  it("renders with visibility enabled", () => {
    render(<VisibilityToggle />);
    expect(screen.getByText("Show me on Radar")).toBeInTheDocument();
    expect(screen.getByLabelText("Hide from Radar")).toBeInTheDocument();
  });

  it("renders with visibility disabled", () => {
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        visibility: false,
      },
      setSession: mockSetSession,
    });
    render(<VisibilityToggle />);
    expect(screen.getByLabelText("Show on Radar")).toBeInTheDocument();
  });

  it("toggles visibility on checkbox change", async () => {
    mockUpdateVisibility.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<VisibilityToggle />);

    const checkbox = screen.getByLabelText("Hide from Radar");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockUpdateVisibility).toHaveBeenCalledWith(false);
    });
  });

  it("shows success toast on successful update", async () => {
    mockUpdateVisibility.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<VisibilityToggle />);

    const checkbox = screen.getByLabelText("Hide from Radar");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith("Visibility updated", {
        description: "You're hidden from Radar",
      });
    });
  });

  it("reverts toggle on error", async () => {
    mockUpdateVisibility.mockResolvedValue({ success: false, error: "Network error" });
    const user = userEvent.setup();
    render(<VisibilityToggle />);

    const checkbox = screen.getByLabelText("Hide from Radar");
    await user.click(checkbox);

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to update visibility", {
        description: "Network error",
      });
      expect(screen.getByLabelText("Hide from Radar")).toBeInTheDocument();
    });
  });

  it("disables checkbox while updating", async () => {
    mockUpdateVisibility.mockImplementation(() => new Promise(() => {})); // Never resolves
    const user = userEvent.setup();
    render(<VisibilityToggle />);

    const checkbox = screen.getByLabelText("Hide from Radar");
    await user.click(checkbox);

    await waitFor(() => {
      expect(checkbox).toBeDisabled();
    });
  });
});

