import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TagsStep } from "../src/components/onboarding/TagsStep";

describe("TagsStep", () => {
  it("renders tags section title and prompt", () => {
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={[]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username=""
      />
    );

    expect(screen.getByText("TAGS (OPTIONAL)")).toBeInTheDocument();
    expect(screen.getByText(/Want to give folks a sense of your wavelength/i)).toBeInTheDocument();
  });

  it("renders visibility toggle", () => {
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={[]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username=""
      />
    );

    expect(screen.getByText(/Show me on the radar/i)).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("displays warning when no tags selected", () => {
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={[]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username=""
      />
    );

    expect(screen.getByText(/No tags = reduced discoverability/i)).toBeInTheDocument();
  });

  it("does not display warning when tags are selected", () => {
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={["Quietly Curious"]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username=""
      />
    );

    expect(screen.queryByText(/No tags = reduced discoverability/i)).not.toBeInTheDocument();
  });

  it("calls onTagToggle when a tag is clicked", async () => {
    const user = userEvent.setup();
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={[]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username=""
      />
    );

    const tagButton = screen.getByText("Quietly Curious");
    await user.click(tagButton);

    expect(onTagToggle).toHaveBeenCalledWith("Quietly Curious");
  });

  it("displays username when provided", () => {
    const onTagToggle = vi.fn();
    const onVisibilityChange = vi.fn();

    render(
      <TagsStep
        selectedTags={[]}
        onTagToggle={onTagToggle}
        visibility={true}
        onVisibilityChange={onVisibilityChange}
        username="ChillWit42"
      />
    );

    expect(screen.getByText(/Your anonymous handle/i)).toBeInTheDocument();
    expect(screen.getByText("ChillWit42")).toBeInTheDocument();
  });
});
