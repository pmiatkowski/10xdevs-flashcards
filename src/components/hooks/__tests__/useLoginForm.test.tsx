import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLoginForm } from "../useLoginForm";
import { toast } from "sonner";
import type { LoginFormData } from "@/lib/validation/auth";

// Mock validation schema
vi.mock("@/lib/validation/auth", () => ({
  loginSchema: {
    parse: vi.fn(),
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = new URL("http://localhost:3000");
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    href: mockLocation.href,
    origin: mockLocation.origin,
  },
  writable: true,
});

describe("useLoginForm", () => {
  const validFormData: LoginFormData = {
    email: "test@example.com",
    password: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = mockLocation.href;
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useLoginForm());
    expect(result.current.isLoading).toBe(false);
  });

  it("handles successful login", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: "test-id" } }),
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLoginSubmit(validFormData);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validFormData),
    });

    expect(toast.success).toHaveBeenCalledWith("Successfully signed in", {
      description: "Redirecting to dashboard...",
    });
    expect(window.location.href).toBe(mockLocation.origin);
  });

  it("handles invalid credentials error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Invalid credentials" }),
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLoginSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("Authentication failed", {
      description: "Invalid email or password. Please check your credentials and try again.",
    });
  });

  it("handles unexpected API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal server error" }),
    });

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLoginSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("Sign in failed", {
      description: "Error: Internal server error",
    });
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLoginSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("Connection error", {
      description: `Failed to connect to authentication service. Error: ${networkError.message}`,
    });
  });

  it("handles unexpected errors", async () => {
    mockFetch.mockRejectedValueOnce("Unexpected error");

    const { result } = renderHook(() => useLoginForm());

    await act(async () => {
      await result.current.handleLoginSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred", {
      description: "Please try again later. If the problem persists, contact support.",
    });
  });

  it("manages loading state during login", async () => {
    // Create a controlled promise to test loading state
    let resolvePromise: (value: unknown) => void = () => undefined;
    const responsePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockImplementationOnce(() => responsePromise);

    const { result } = renderHook(() => useLoginForm());

    // Start submission but don't await it yet to check intermediate state
    const submissionPromise = result.current.handleLoginSubmit(validFormData);

    // We need to use act and wait for state update to be processed
    await act(async () => {
      // Small delay to allow React to process the state update
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Should be loading after submission started
    expect(result.current.isLoading).toBe(true);

    // Resolve the fetch promise
    await act(async () => {
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ user: { id: "test-id" } }),
      });
      // Wait for the submission to complete
      await submissionPromise;
    });

    // Should not be loading after completion
    expect(result.current.isLoading).toBe(false);
  });
});
