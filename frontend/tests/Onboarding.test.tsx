import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Onboarding from "../src/pages/Onboarding";

// Mock API client
vi.mock("../src/lib/api-client", () => ({
  createSession: vi.fn(),
}));

// Mock useSession hook
vi.mock("../src/hooks/useSession", () => ({
  useSession: () => ({
    session: null,
    setSession: vi.fn(),
    clearSession: vi.fn(),
  }),
}));

describe("Onboarding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders What We Are/Not step initially", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    expect(screen.getByText("WHAT IS ICEBREAKER?")).toBeInTheDocument();
    expect(screen.getByText(/Let's be clear/i)).toBeInTheDocument();
  });

  it("navigates through all steps", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    // Step 0: What We Are
    expect(screen.getByText("WHAT IS ICEBREAKER?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /GOT IT/i }));

    // Step 1: Consent
    expect(screen.getByText("AGE VERIFICATION")).toBeInTheDocument();
    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);
    await user.click(screen.getByRole("button", { name: /CONTINUE/i }));

    // Step 2: Location
    expect(screen.getByText("LOCATION ACCESS")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Skip for now/i }));

    // Step 3: Vibe & Tags
    expect(screen.getByText("YOUR VIBE")).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    expect(screen.getByText(/STEP 1\/4/i)).toBeInTheDocument();
  });

  it("shows back button when step > 0", async () => {
    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <Onboarding />
      </BrowserRouter>
    );

    // Go to step 1
    await user.click(screen.getByRole("button", { name: /GOT IT/i }));

    // Back button should be visible
    expect(screen.getByRole("button", { name: /← BACK/i })).toBeInTheDocument();
  });
});
