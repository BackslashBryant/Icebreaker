import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmergencyContactInput } from "@/components/profile/EmergencyContactInput";
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

describe("EmergencyContactInput", () => {
  const mockUpdateEmergencyContact = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockUseProfile.mockReturnValue({
      updateVisibility: vi.fn(),
      updateEmergencyContact: mockUpdateEmergencyContact,
      loading: false,
    });
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        emergencyContact: null,
      },
      setSession: vi.fn(),
    });
  });

  it("renders in view mode when no contact set", () => {
    render(<EmergencyContactInput />);
    expect(screen.getByText("No emergency contact set")).toBeInTheDocument();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("renders in view mode with existing contact", () => {
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        emergencyContact: "+1234567890",
      },
      setSession: vi.fn(),
    });
    render(<EmergencyContactInput />);
    expect(screen.getByText("+1234567890")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("switches to edit mode when Add/Edit clicked", async () => {
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    const addButton = screen.getByText("Add");
    await user.click(addButton);

    expect(screen.getByPlaceholderText("+1234567890 or email@example.com")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("validates phone number format", async () => {
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Add"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.type(input, "invalid-phone");
    await user.click(screen.getByText("Save"));

    expect(screen.getByText(/Must be a valid phone number/)).toBeInTheDocument();
    expect(mockUpdateEmergencyContact).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Add"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.type(input, "invalid-email");
    await user.click(screen.getByText("Save"));

    expect(screen.getByText(/Must be a valid phone number/)).toBeInTheDocument();
    expect(mockUpdateEmergencyContact).not.toHaveBeenCalled();
  });

  it("accepts valid phone number", async () => {
    mockUpdateEmergencyContact.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Add"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.type(input, "+1234567890");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockUpdateEmergencyContact).toHaveBeenCalledWith("+1234567890");
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it("accepts valid email address", async () => {
    mockUpdateEmergencyContact.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Add"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.type(input, "test@example.com");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockUpdateEmergencyContact).toHaveBeenCalledWith("test@example.com");
      expect(mockToast.success).toHaveBeenCalled();
    });
  });

  it("clears contact when empty string saved", async () => {
    mockUpdateEmergencyContact.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        emergencyContact: "+1234567890",
      },
      setSession: vi.fn(),
    });
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.clear(input);
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockUpdateEmergencyContact).toHaveBeenCalledWith(null);
    });
  });

  it("cancels edit and reverts to original value", async () => {
    const user = userEvent.setup();
    mockUseSession.mockReturnValue({
      session: {
        sessionId: "test-session",
        token: "test-token",
        handle: "TestUser",
        emergencyContact: "+1234567890",
      },
      setSession: vi.fn(),
    });
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Edit"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.clear(input);
    await user.type(input, "new@example.com");
    await user.click(screen.getByText("Cancel"));

    expect(screen.getByText("+1234567890")).toBeInTheDocument();
    expect(mockUpdateEmergencyContact).not.toHaveBeenCalled();
  });

  it("shows error toast on save failure", async () => {
    mockUpdateEmergencyContact.mockResolvedValue({ success: false, error: "Network error" });
    const user = userEvent.setup();
    render(<EmergencyContactInput />);

    await user.click(screen.getByText("Add"));
    const input = screen.getByPlaceholderText("+1234567890 or email@example.com");

    await user.type(input, "+1234567890");
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Failed to save emergency contact", {
        description: "Network error",
      });
    });
  });
});

