import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRegisterForm } from "../useRegisterForm";
import { toast } from "sonner";
import type { RegisterFormData } from "@/lib/validation/auth";

// Mock zod validation
vi.mock("@/lib/validation/auth", () => ({
  registerSchema: {
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

describe("useRegisterForm", () => {
  const validFormData: RegisterFormData = {
    email: "test@example.com",
    password: "password123",
    confirmPassword: "password123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = mockLocation.href;
  });

  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useRegisterForm());
    expect(result.current.isLoading).toBe(false);
  });

  it("handles successful registration", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: "test-id" } }),
    });

    const { result } = renderHook(() => useRegisterForm());
    const mockResetForm = vi.fn();

    await act(async () => {
      await result.current.handleRegisterSubmit(validFormData, mockResetForm);
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validFormData.email,
        password: validFormData.password,
      }),
    });

    expect(mockResetForm).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith("Registration successful", {
      description: "An activation link has been sent to your email address.",
    });
    // No redirection should happen
    expect(window.location.href).toBe(mockLocation.href);
  });

  it("handles email already registered error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: "Email already exists" }),
    });

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleRegisterSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("This email is already registered");
    expect(window.location.href).toBe(mockLocation.href);
  });

  it("handles unexpected API errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal server error" }),
    });

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleRegisterSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("Registration failed", {
      description: "Error: Internal server error",
    });
  });

  it("handles network errors", async () => {
    const networkError = new Error("Network error");
    mockFetch.mockRejectedValueOnce(networkError);

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleRegisterSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("Connection error", {
      description: `Failed to connect to registration service. Error: ${networkError.message}`,
    });
  });

  it("handles unexpected errors", async () => {
    mockFetch.mockRejectedValueOnce("Unexpected error");

    const { result } = renderHook(() => useRegisterForm());

    await act(async () => {
      await result.current.handleRegisterSubmit(validFormData);
    });

    expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred", {
      description: "Please try again later. If the problem persists, contact support.",
    });
  });

  it("manages loading state during registration", async () => {
    // Create a controlled promise to test loading state
    let resolvePromise: (value: unknown) => void = () => undefined;
    const responsePromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockFetch.mockImplementationOnce(() => responsePromise);

    const { result } = renderHook(() => useRegisterForm());
    const mockResetForm = vi.fn();

    // Start submission but don't await it yet to check intermediate state
    const submissionPromise = result.current.handleRegisterSubmit(validFormData, mockResetForm);

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
    expect(mockResetForm).toHaveBeenCalled();
  });
});
