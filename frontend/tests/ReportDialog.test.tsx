import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportDialog } from "@/components/safety/ReportDialog";

describe("ReportDialog", () => {
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
    render(<ReportDialog {...defaultProps} />);
    expect(screen.getByText(/Report TestUser\?/)).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<ReportDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByText(/Report TestUser\?/)).not.toBeInTheDocument();
  });

  it("shows all report categories", () => {
    render(<ReportDialog {...defaultProps} />);
    expect(screen.getByText("Harassment")).toBeInTheDocument();
    expect(screen.getByText("Spam")).toBeInTheDocument();
    expect(screen.getByText("Impersonation")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("allows selecting a category", async () => {
    const user = userEvent.setup();
    render(<ReportDialog {...defaultProps} />);

    const harassmentButton = screen.getByLabelText("Select Harassment");
    await user.click(harassmentButton);

    // Selected category has border-border, bg-muted/20, and font-semibold
    expect(harassmentButton).toHaveClass("border-border");
    expect(harassmentButton).toHaveClass("bg-muted/20");
    expect(harassmentButton).toHaveClass("font-semibold");
    expect(harassmentButton).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onConfirm with selected category when Submit is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ReportDialog {...defaultProps} onConfirm={onConfirm} />);

    const harassmentButton = screen.getByLabelText("Select Harassment");
    await user.click(harassmentButton);

    const submitButton = screen.getByLabelText("Submit report");
    await user.click(submitButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("harassment");
    });
  });

  it("disables Submit button when no category is selected", () => {
    render(<ReportDialog {...defaultProps} />);
    const submitButton = screen.getByLabelText("Submit report");
    expect(submitButton).toBeDisabled();
  });

  it("enables Submit button when category is selected", async () => {
    const user = userEvent.setup();
    render(<ReportDialog {...defaultProps} />);

    const harassmentButton = screen.getByLabelText("Select Harassment");
    await user.click(harassmentButton);

    const submitButton = screen.getByLabelText("Submit report");
    expect(submitButton).not.toBeDisabled();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ReportDialog {...defaultProps} onClose={onClose} />);

    const cancelButton = screen.getByLabelText("Cancel report");
    await user.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<ReportDialog {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("confirms on Enter key when category is selected", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ReportDialog {...defaultProps} onConfirm={onConfirm} />);

    const harassmentButton = screen.getByLabelText("Select Harassment");
    await user.click(harassmentButton);

    fireEvent.keyDown(document, { key: "Enter" });

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith("harassment");
    });
  });

  it("resets selection when dialog closes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ReportDialog {...defaultProps} />);

    const harassmentButton = screen.getByLabelText("Select Harassment");
    await user.click(harassmentButton);
    expect(harassmentButton).toHaveClass("border-border");
    expect(harassmentButton).toHaveClass("bg-muted/20");
    expect(harassmentButton).toHaveAttribute("aria-pressed", "true");

    rerender(<ReportDialog {...defaultProps} isOpen={false} />);
    rerender(<ReportDialog {...defaultProps} isOpen={true} />);

    const harassmentButtonAfter = screen.getByLabelText("Select Harassment");
    expect(harassmentButtonAfter).not.toHaveClass("bg-muted/20");
    expect(harassmentButtonAfter).not.toHaveClass("font-semibold");
    expect(harassmentButtonAfter).toHaveAttribute("aria-pressed", "false");
  });

  it("has accessible labels", () => {
    render(<ReportDialog {...defaultProps} />);
    expect(screen.getByLabelText("Select Harassment")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Spam")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Impersonation")).toBeInTheDocument();
    expect(screen.getByLabelText("Select Other")).toBeInTheDocument();
    expect(screen.getByLabelText("Submit report")).toBeInTheDocument();
    expect(screen.getByLabelText("Cancel report")).toBeInTheDocument();
  });
});

