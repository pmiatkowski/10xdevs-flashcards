import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import { toast } from "sonner";
import "@testing-library/jest-dom/vitest";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div data-testid="test-component">
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme("dark")} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme("light")} data-testid="set-light">
        Set Light
      </button>
    </div>
  );
};

describe("ThemeProvider", () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
  };

  // Create a proper MediaQueryList mock
  const createMatchMediaMock = (matches: boolean) => {
    const listeners = new Set<(e: MediaQueryListEvent) => void>();

    return () => ({
      matches,
      addEventListener: (event: string, listener: (e: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener: (event: string, listener: (e: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      dispatchEvent: (event: MediaQueryListEvent) => {
        listeners.forEach((listener) => listener(event));
        return true;
      },
    });
  };

  beforeEach(() => {
    // Setup mocks
    Object.defineProperty(window, "localStorage", { value: localStorageMock });

    // Reset document classes
    document.documentElement.classList.remove("light", "dark", "theme-transition");

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should throw error when useTheme is used outside provider", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => render(<TestComponent />)).toThrow("useTheme must be used within a ThemeProvider");

    consoleError.mockRestore();
  });

  it("should initialize with light theme when no preference is stored", () => {
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(false),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("should initialize with dark theme when system prefers dark", () => {
    localStorageMock.getItem.mockReturnValue(null);
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(true),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should use theme from localStorage if available", () => {
    localStorageMock.getItem.mockReturnValue("dark");
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(false),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should change theme when setTheme is called", async () => {
    localStorageMock.getItem.mockReturnValue("light");
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(false),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const user = userEvent.setup();
    await user.click(screen.getByTestId("set-dark"));

    expect(screen.getByTestId("current-theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
    expect(toast.success).toHaveBeenCalledWith("Switched to dark theme");
  });

  it("should handle system theme changes when no explicit preference is set", () => {
    localStorageMock.getItem.mockReturnValue(null);
    const matchMedia = createMatchMediaMock(false)();
    Object.defineProperty(window, "matchMedia", {
      value: () => matchMedia,
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    // Simulate system theme change
    act(() => {
      matchMedia.dispatchEvent({ matches: true } as MediaQueryListEvent);
    });

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("should cleanup theme transition class after animation", () => {
    vi.useFakeTimers();
    localStorageMock.getItem.mockReturnValue("light");
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(false),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    act(() => {
      screen.getByTestId("set-dark").click();
    });

    expect(document.documentElement.classList.contains("theme-transition")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(document.documentElement.classList.contains("theme-transition")).toBe(false);

    vi.useRealTimers();
  });

  it("should handle localStorage errors gracefully", () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error("localStorage error");
    });
    Object.defineProperty(window, "matchMedia", {
      value: createMatchMediaMock(false),
      writable: true,
    });

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("current-theme")).toHaveTextContent("light");
  });
});
