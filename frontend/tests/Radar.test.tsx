import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Radar from "@/pages/Radar";

// Canvas and matchMedia are mocked in setup.js

// Mock hooks
const mockUseSession = vi.fn(() => ({
  session: {
    sessionId: "test-session",
    token: "test-token",
    handle: "testuser",
  },
  setSession: vi.fn(),
  clearSession: vi.fn(),
}));

const mockUseLocation = vi.fn(() => ({
  location: { lat: 37.7749, lng: -122.4194 },
  error: null,
  loading: false,
  requestLocation: vi.fn(),
  startWatching: vi.fn(),
  stopWatching: vi.fn(),
  isWatching: true,
}));

const mockUseRadar = vi.fn(() => ({
  people: [
    {
      sessionId: "session-1",
      handle: "user1",
      vibe: "banter",
      tags: ["tag1"],
      signal: 25.5,
      proximity: "venue",
    },
  ],
  selectedPerson: null,
  location: { lat: 37.7749, lng: -122.4194 },
  status: "connected",
  isConnected: true,
  updateLocation: vi.fn(),
  selectPerson: vi.fn(),
  clearSelection: vi.fn(),
  requestChat: vi.fn(),
}));

vi.mock("@/hooks/useSession", () => ({
  useSession: () => mockUseSession(),
}));

vi.mock("@/hooks/useLocation", () => ({
  useLocation: () => mockUseLocation(),
}));

vi.mock("@/hooks/useRadar", () => ({
  useRadar: () => mockUseRadar(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe("Radar Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders radar view with header", () => {
    render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    expect(screen.getByText("RADAR")).toBeInTheDocument();
    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("displays view toggle buttons", () => {
    render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    const toggleButtons = screen.getAllByRole("button", { name: /view/i });
    expect(toggleButtons.length).toBeGreaterThan(0);
  });

  it("has proper ARIA labels", () => {
    const { container } = render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    const main = container.querySelector("main[role='main']");
    expect(main).toHaveAttribute("aria-label", "Radar view content");

    const header = container.querySelector("header[role='banner']");
    expect(header).toBeInTheDocument();
  });

  it("displays people data", () => {
    render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    // Check that people data is available (in sr-only for sweep view)
    // The component shows sweep view by default, so check for sr-only content
    expect(screen.getByText(/user1/i)).toBeInTheDocument();
    expect(screen.getByText(/25.5/i)).toBeInTheDocument();
  });

  it("handles location error state", () => {
    mockUseLocation.mockReturnValueOnce({
      location: null,
      error: "User denied Geolocation",
      loading: false,
      requestLocation: vi.fn(),
      startWatching: vi.fn(),
      stopWatching: vi.fn(),
      isWatching: false,
    });

    render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Location access denied/i)).toBeInTheDocument();
  });

  it("handles connection error state", () => {
    mockUseRadar.mockReturnValueOnce({
      people: [],
      selectedPerson: null,
      location: null,
      status: "error",
      isConnected: false,
      updateLocation: vi.fn(),
      selectPerson: vi.fn(),
      clearSelection: vi.fn(),
      requestChat: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Radar />
      </BrowserRouter>
    );

    expect(screen.getByText(/Connection failed/i)).toBeInTheDocument();
  });
});

