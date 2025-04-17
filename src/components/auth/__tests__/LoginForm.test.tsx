import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { LoginForm } from "../LoginForm";
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
vi.stubGlobal("fetch", mockFetch);

// Mock window.location
const mockLocation = new URL("http://localhost:3000");
vi.stubGlobal("location", {
  ...window.location,
  href: "http://localhost:3000",
  origin: "http://localhost:3000",
});

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.href = "http://localhost:3000";
  });

  // Helper function to fill form
  const fillForm = async (user: ReturnType<typeof userEvent.setup>, email: string, password: string) => {
    if (email) {
      await user.type(screen.getByLabelText(/email/i), email);
    }
    if (password) {
      await user.type(screen.getByLabelText(/password/i), password);
    }
  };

  describe("Form Validation", () => {
    it("should show validation error for invalid email", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await fillForm(user, "invalid-email", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      const errorElement = await screen.findByRole("alert");
      expect(errorElement).toHaveTextContent(/please enter a valid email address/i);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should show validation error for empty password", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await fillForm(user, "test@example.com", "");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      const errorElement = await screen.findByRole("alert");
      expect(errorElement).toHaveTextContent(/password is required/i);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should clear validation errors when user types", async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await fillForm(user, "invalid-email", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      const errorElement = await screen.findByRole("alert");
      expect(errorElement).toHaveTextContent(/please enter a valid email address/i);

      await user.clear(screen.getByLabelText(/email/i));
      await user.type(screen.getByLabelText(/email/i), "test@example.com");

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("API Integration", () => {
    it("should handle successful login", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, email: "test@example.com" } }),
      });

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
        expect(mockLocation.href.replace(/\/$/, "")).toBe("http://localhost:3000");
      });
    });

    it("should handle invalid credentials (401)", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: "Invalid credentials" }),
      });

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Invalid email or password");
      });
    });

    it("should handle server error", async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: "Internal server error" }),
      });

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Internal server error");
      });
    });

    it("should handle network error", async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
      });
    });
  });

  describe("Loading State", () => {
    it("should disable form controls while submitting", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });

    it("should show loading spinner while submitting", async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<LoginForm />);

      await fillForm(user, "test@example.com", "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument();
    });
  });

  describe("Navigation Links", () => {
    it("should render sign up link", () => {
      render(<LoginForm />);

      const signUpLink = screen.getByRole("link", { name: /sign up/i });
      expect(signUpLink).toHaveAttribute("href", "/register");
    });

    it("should render forgot password link", () => {
      render(<LoginForm />);

      const forgotPasswordLink = screen.getByRole("link", { name: /forgot your password/i });
      expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
    });
  });
});
