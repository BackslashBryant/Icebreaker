import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Profile from "@/pages/Profile";
import { useSession } from "@/hooks/useSession";

// Mock dependencies
vi.mock("@/hooks/useSession");
vi.mock("@/hooks/useProfile", () => ({
  useProfile: () => ({
    updateVisibility: vi.fn(),
    updateEmergencyContact: vi.fn(),
    loading: false,
  }),
}));
vi.mock("@/hooks/useAccessibility", () => ({
  useAccessibility: () => ({
    reducedMotion: false,
    highContrast: false,
    setReducedMotion: vi.fn(),
    setHighContrast: vi.fn(),
    loading: false,
  }),
}));
vi.mock("@/hooks/usePanic", () => ({
  usePanic: () => ({
    showDialog: false,
    showSuccess: false,
    exclusionExpiresAt: undefined,
    triggerPanic: vi.fn(),
    confirmPanic: vi.fn(),
    closeDialog: vi.fn(),
    closeSuccess: vi.fn(),
  }),
}));
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockUseSession = vi.mocked(useSession);

describe("Profile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        visibility: true,
        emergencyContact: null,
      },
      setSession: vi.fn(),
    });
  });

  it("renders profile page with handle", () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText("PROFILE")).toBeInTheDocument();
    expect(screen.getByText("@TestUser")).toBeInTheDocument();
  });

  it("renders all sections", () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText("VISIBILITY")).toBeInTheDocument();
    expect(screen.getByText("EMERGENCY CONTACT")).toBeInTheDocument();
    expect(screen.getByText("ACCESSIBILITY")).toBeInTheDocument();
  });

  it("renders DONE button", () => {
    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
    expect(screen.getByText("DONE")).toBeInTheDocument();
  });

  it("redirects to onboarding when no session", () => {
    mockUseSession.mockReturnValue({
      session: null,
      setSession: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );

    // Component should redirect (returns null)
    expect(screen.queryByText("PROFILE")).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith("/onboarding");
  });
});

