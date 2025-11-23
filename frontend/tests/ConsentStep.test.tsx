import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConsentStep } from "../src/components/onboarding/ConsentStep";

describe("ConsentStep", () => {
  it("renders age verification title and intro", () => {
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={false}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    expect(screen.getByText("AGE VERIFICATION")).toBeInTheDocument();
    expect(screen.getByText(/IceBreaker is 18\+ only/i)).toBeInTheDocument();
  });

  it("renders consent checkbox", () => {
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={false}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    const checkbox = screen.getByRole("checkbox", { name: /I am 18 or older/i });
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
  });

  it("disables continue button when consent is unchecked", () => {
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={false}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
    expect(continueButton).toBeDisabled();
  });

  it("enables continue button when consent is checked", () => {
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={true}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
    expect(continueButton).not.toBeDisabled();
  });

  it("calls onConsentChange when checkbox is clicked", async () => {
    const user = userEvent.setup();
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={false}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(onConsentChange).toHaveBeenCalledWith(true);
  });

  it("calls onContinue when continue button is clicked", async () => {
    const user = userEvent.setup();
    const onConsentChange = vi.fn();
    const onContinue = vi.fn();

    render(
      <ConsentStep
        consent={true}
        onConsentChange={onConsentChange}
        onContinue={onContinue}
      />
    );

    const continueButton = screen.getByRole("button", { name: /CONTINUE/i });
    await user.click(continueButton);

    expect(onContinue).toHaveBeenCalled();
  });
});
