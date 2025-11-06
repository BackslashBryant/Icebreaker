import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VibeStep } from "../src/components/onboarding/VibeStep";

describe("VibeStep", () => {
  it("renders vibe selection title and prompt", () => {
    const onVibeSelect = vi.fn();

    render(<VibeStep selectedVibe={null} onVibeSelect={onVibeSelect} />);

    expect(screen.getByText("YOUR VIBE")).toBeInTheDocument();
    expect(screen.getByText(/What kind of energy are you putting out right now/i)).toBeInTheDocument();
  });

  it("renders all 5 vibe options", () => {
    const onVibeSelect = vi.fn();

    render(<VibeStep selectedVibe={null} onVibeSelect={onVibeSelect} />);

    expect(screen.getByText(/Up for banter/i)).toBeInTheDocument();
    expect(screen.getByText(/Open to intros/i)).toBeInTheDocument();
    expect(screen.getByText(/Thinking out loud/i)).toBeInTheDocument();
    expect(screen.getByText(/Killing time/i)).toBeInTheDocument();
    expect(screen.getByText(/Surprise me/i)).toBeInTheDocument();
  });

  it("calls onVibeSelect when a vibe is clicked", async () => {
    const user = userEvent.setup();
    const onVibeSelect = vi.fn();

    render(<VibeStep selectedVibe={null} onVibeSelect={onVibeSelect} />);

    const banterButton = screen.getByText(/Up for banter/i);
    await user.click(banterButton);

    expect(onVibeSelect).toHaveBeenCalledWith("banter");
  });

  it("highlights selected vibe", () => {
    const onVibeSelect = vi.fn();

    render(<VibeStep selectedVibe="banter" onVibeSelect={onVibeSelect} />);

    const banterButton = screen.getByText(/Up for banter/i).closest("button");
    expect(banterButton).toHaveClass("border-accent", "bg-accent/10", "text-accent");
  });
});
