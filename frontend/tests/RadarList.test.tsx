import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadarList } from "@/components/radar/RadarList";
import { Person } from "@/hooks/useRadar";

describe("RadarList", () => {
  const mockPeople: Person[] = [
    {
      sessionId: "session-1",
      handle: "user1",
      vibe: "banter",
      tags: ["tag1", "tag2"],
      signal: 25.5,
      proximity: "venue",
    },
    {
      sessionId: "session-2",
      handle: "user2",
      vibe: "intros",
      tags: [],
      signal: 15.2,
      proximity: null,
    },
  ];

  it("renders empty state when no people", () => {
    const onSelectPerson = vi.fn();
    render(<RadarList people={[]} onSelectPerson={onSelectPerson} />);

    expect(screen.getByText("No one nearby — yet.")).toBeInTheDocument();
  });

  it("renders custom empty message", () => {
    const onSelectPerson = vi.fn();
    render(
      <RadarList
        people={[]}
        onSelectPerson={onSelectPerson}
        emptyMessage="Custom empty message"
      />
    );

    expect(screen.getByText("Custom empty message")).toBeInTheDocument();
  });

  it("renders list of people", () => {
    const onSelectPerson = vi.fn();
    render(<RadarList people={mockPeople} onSelectPerson={onSelectPerson} />);

    expect(screen.getByText("user1")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText("25.5")).toBeInTheDocument();
    expect(screen.getByText("15.2")).toBeInTheDocument();
  });

  it("displays person details correctly", () => {
    const onSelectPerson = vi.fn();
    render(<RadarList people={mockPeople} onSelectPerson={onSelectPerson} />);

    expect(screen.getByText(/banter/)).toBeInTheDocument();
    expect(screen.getByText(/intros/)).toBeInTheDocument();
    expect(screen.getByText("tag1")).toBeInTheDocument();
    expect(screen.getByText("tag2")).toBeInTheDocument();
  });

  it("calls onSelectPerson when person is clicked", async () => {
    const user = userEvent.setup();
    const onSelectPerson = vi.fn();
    render(<RadarList people={mockPeople} onSelectPerson={onSelectPerson} />);

    const firstPerson = screen.getByText("user1").closest("button");
    if (firstPerson) {
      await user.click(firstPerson);
      expect(onSelectPerson).toHaveBeenCalledWith(mockPeople[0]);
    }
  });

  it("has proper ARIA labels", () => {
    const onSelectPerson = vi.fn();
    const { container } = render(
      <RadarList people={mockPeople} onSelectPerson={onSelectPerson} />
    );

    const list = container.querySelector('ul[role="list"]');
    expect(list).toHaveAttribute("aria-label", "Nearby people sorted by compatibility");
  });
});

