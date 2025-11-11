import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PersonCard } from "@/components/radar/PersonCard";
import { Person } from "@/hooks/useRadar";
import { useSafety } from "@/hooks/useSafety";

// Mock useSafety hook
vi.mock("@/hooks/useSafety", () => ({
  useSafety: vi.fn(),
}));

const mockUseSafety = vi.mocked(useSafety);

describe("PersonCard", () => {
  const mockPerson: Person = {
    sessionId: "session-1",
    handle: "testuser",
    vibe: "banter",
    tags: ["tag1", "tag2", "tag3"],
    signal: 27.5,
    proximity: "venue",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSafety.mockReturnValue({
      blockUser: vi.fn().mockResolvedValue({ success: true }),
      reportUser: vi.fn().mockResolvedValue({ success: true }),
      isBlocking: false,
      isReporting: false,
    });
  });

  it("does not render when person is null", () => {
    const { container } = render(
      <PersonCard
        person={null}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders person details when open", () => {
    render(
      <PersonCard
        person={mockPerson}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.getByText("banter")).toBeInTheDocument();
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
    expect(screen.getByText("tag3")).toBeInTheDocument();
  });

  it("displays signal score", () => {
    render(
      <PersonCard
        person={mockPerson}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(screen.getByText(/Signal: 27.5/)).toBeInTheDocument();
  });

  it("displays proximity when available", () => {
    render(
      <PersonCard
        person={mockPerson}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(screen.getByText(/venue/)).toBeInTheDocument();
  });

  it("calls onChatRequest when chat button is clicked", async () => {
    const user = userEvent.setup();
    const onChatRequest = vi.fn();
    const onClose = vi.fn();

    render(
      <PersonCard
        person={mockPerson}
        open={true}
        onClose={onClose}
        onChatRequest={onChatRequest}
      />
    );

    const chatButton = screen.getByText("START CHAT →");
    await user.click(chatButton);

    expect(onChatRequest).toHaveBeenCalledWith("session-1");
    expect(onClose).toHaveBeenCalled();
  });

  it("handles person with no tags", () => {
    const personWithoutTags: Person = {
      ...mockPerson,
      tags: [],
    };

    render(
      <PersonCard
        person={personWithoutTags}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(screen.getByText("testuser")).toBeInTheDocument();
    expect(screen.queryByText("tag1")).not.toBeInTheDocument();
  });

  it("shows hint text about long-press", () => {
    render(
      <PersonCard
        person={mockPerson}
        open={true}
        onClose={vi.fn()}
        onChatRequest={vi.fn()}
      />
    );

    expect(screen.getByText(/Long press or right-click for safety options/)).toBeInTheDocument();
  });

  // Note: Tap-hold functionality (long-press, right-click, keyboard shortcuts) is tested via E2E tests
  // due to jsdom limitations with touch events and Dialog component interactions
});

