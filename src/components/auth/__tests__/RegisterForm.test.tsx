import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { RegisterForm } from "../RegisterForm";
import { toast } from "sonner";

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
  },
  writable: true,
});

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form elements correctly", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("validates empty fields", async () => {
    render(<RegisterForm />);

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password must be at least 4 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it("validates email format", async () => {
    render(<RegisterForm />);

    // Submit form first to show errors
    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  it("validates password length", async () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    fireEvent.change(passwordInput, { target: { value: "123" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 4 characters/i)).toBeInTheDocument();
    });
  });

  it("validates password confirmation match", async () => {
    render(<RegisterForm />);

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "password456" } });

    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("handles successful registration", async () => {
    render(<RegisterForm />);

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ user: { id: "test-id" } }),
    });

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      // Verify fetch was called with correct data
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      });

      // Verify redirect
      expect(window.location.href).toBe("/");
    });
  });

  it("handles email already registered error", async () => {
    render(<RegisterForm />);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ message: "Email already exists" }),
    });

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("This email is already registered");
    });
  });

  it("handles unexpected server error", async () => {
    render(<RegisterForm />);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal server error" }),
    });

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Internal server error");
    });
  });

  it("handles network error", async () => {
    render(<RegisterForm />);

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
    });
  });

  it("clears field errors on input change", async () => {
    render(<RegisterForm />);

    // Submit form first to show errors
    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    // Change input to valid email
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    // Error message should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email address/i)).not.toBeInTheDocument();
    });
  });

  it("disables form submission while loading", async () => {
    render(<RegisterForm />);

    // Setup mock that doesn't resolve immediately
    mockFetch.mockImplementationOnce(
      () =>
        new Promise(() => {
          // Promise that never resolves to simulate loading state
        })
    );

    // Fill in form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: "password123" },
    });

    // Submit form
    const submitButton = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });
  });

  it("maintains accessibility attributes during form interaction", async () => {
    render(<RegisterForm />);

    // Submit empty form to trigger errors
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      // Check ARIA attributes for error states
      const emailInput = screen.getByLabelText(/email/i);
      const emailError = screen.getByText(/please enter a valid email address/i);

      expect(emailInput).toHaveAttribute("aria-describedby", emailError.id);
      expect(emailError).toHaveAttribute("role", "alert");
    });
  });
});
