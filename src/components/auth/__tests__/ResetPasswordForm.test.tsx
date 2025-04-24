import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ResetPasswordForm } from "../ResetPasswordForm";
import { toast } from "sonner";
import userEvent from "@testing-library/user-event";

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
const mockLocation = new URL("http://localhost:3000/reset-password?token=valid-token");
Object.defineProperty(window, "location", {
  value: {
    ...window.location,
    href: mockLocation.href,
    search: mockLocation.search,
  },
  writable: true,
});

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form with correct accessibility attributes", () => {
    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    expect(newPasswordInput).toHaveAttribute("type", "password");
    expect(newPasswordInput).toHaveAttribute("placeholder", "Enter your new password");
    expect(newPasswordInput).toHaveAttribute("aria-invalid", "false");
    expect(newPasswordInput).not.toHaveAttribute("aria-describedby");

    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    expect(confirmPasswordInput).toHaveAttribute("type", "password");
    expect(confirmPasswordInput).toHaveAttribute("placeholder", "Confirm your password");
    expect(confirmPasswordInput).toHaveAttribute("aria-invalid", "false");
    expect(confirmPasswordInput).not.toHaveAttribute("aria-describedby");

    const submitButton = screen.getByRole("button", { name: /update password/i });
    expect(submitButton).toBeEnabled();
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 4 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it("shows error when passwords don't match", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(newPasswordInput, "password123");
    await user.type(confirmPasswordInput, "password456");

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords don't match/i)).toBeInTheDocument();
    });
  });

  it("handles successful password reset", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Password updated successfully" }),
    });

    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "valid-token",
          newPassword: "newpassword123",
        }),
      });

      expect(toast.success).toHaveBeenCalledWith("Password reset successfully");
      expect(window.location.href).toBe("/login");
    });
  });

  it("handles invalid or expired token error", async () => {
    const user = userEvent.setup();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "Invalid or expired token" }),
    });

    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid or expired reset link");
    });
  });

  it("shows loading state during form submission", async () => {
    const user = userEvent.setup();
    // Mock fetch to never resolve to keep loading state
    mockFetch.mockImplementationOnce(() => new Promise((): void => undefined));

    render(<ResetPasswordForm />);

    const newPasswordInput = screen.getByLabelText(/^new password$/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/updating password/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(newPasswordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
    });
  });

  it("maintains accessibility during form submission", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    const submitButton = screen.getByRole("button", { name: /update password/i });
    await user.click(submitButton);

    await waitFor(() => {
      const newPasswordInput = screen.getByLabelText(/^new password$/i);
      const errorMessage = screen.getByText(/password must be at least 4 characters/i);

      expect(newPasswordInput).toHaveAttribute("aria-invalid", "true");
      expect(newPasswordInput).toHaveAttribute("aria-describedby", errorMessage.id);
    });
  });

  it("shows error for missing reset token", () => {
    // Mock window.location without token
    Object.defineProperty(window, "location", {
      value: {
        ...window.location,
        href: "http://localhost:3000/reset-password",
        search: "",
      },
      writable: true,
    });

    render(<ResetPasswordForm />);

    expect(screen.getByText(/invalid reset link/i)).toBeInTheDocument();
    expect(screen.queryByRole("form")).not.toBeInTheDocument();
  });
});
