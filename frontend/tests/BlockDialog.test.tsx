import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BlockDialog } from "@/components/safety/BlockDialog";

describe("BlockDialog", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    partnerHandle: "TestUser",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders when open", () => {
    render(<BlockDialog {...defaultProps} />);
    expect(screen.getByText(/Block TestUser\?/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<BlockDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Block TestUser\?/)).not.toBeInTheDocument();
  });

  it("shows partner handle in title", () => {
    render(<BlockDialog {...defaultProps} partnerHandle="AnotherUser" />);
    expect(screen.getByText(/Block AnotherUser\?/)).toBeInTheDocument();
  });

  it("calls onConfirm when Block button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<BlockDialog {...defaultProps} onConfirm={onConfirm} />);

    const blockButton = screen.getByLabelText("Confirm block");
    await user.click(blockButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<BlockDialog {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByLabelText("Cancel block");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<BlockDialog {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("confirms on Enter key", async () => {
    const onConfirm = vi.fn();
    render(<BlockDialog {...defaultProps} onConfirm={onConfirm} />);

    fireEvent.keyDown(document, { key: "Enter" });

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  it("shows loading state when confirming", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => new Promise(() => {})); // Never resolves
    render(<BlockDialog {...defaultProps} onConfirm={onConfirm} />);

    const blockButton = screen.getByLabelText("Confirm block");
    await user.click(blockButton);

    await waitFor(() => {
      expect(screen.getByText("Blocking...")).toBeInTheDocument();
    });
  });

  it("disables buttons when confirming", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn(() => new Promise(() => {})); // Never resolves
    render(<BlockDialog {...defaultProps} onConfirm={onConfirm} />);

    const blockButton = screen.getByLabelText("Confirm block");
    await user.click(blockButton);

    await waitFor(() => {
      expect(blockButton).toBeDisabled();
      expect(screen.getByLabelText("Cancel block")).toBeDisabled();
    });
  });

  it("has accessible labels", () => {
    render(<BlockDialog {...defaultProps} />);
    expect(screen.getByLabelText("Confirm block")).toBeInTheDocument();
    expect(screen.getByLabelText("Cancel block")).toBeInTheDocument();
  });
});

