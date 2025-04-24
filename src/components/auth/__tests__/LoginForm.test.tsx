import { render, screen, fireEvent, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { LoginForm } from "../LoginForm";
import { z } from "zod";

// Create a mock implementation for useLoginForm
const mockHandleLoginSubmit = vi.fn();
let mockIsLoading = false;

// Mock modules
vi.mock("@/components/hooks/useLoginForm", () => {
  // Create a mock version of the loginSchema with parseAsync method
  const mockLoginSchema = {
    parseAsync: vi.fn(),
  };

  return {
    loginSchema: mockLoginSchema,
    useLoginForm: () => ({
      isLoading: mockIsLoading,
      handleLoginSubmit: mockHandleLoginSubmit,
    }),
  };
});

// Import the mocked dependencies
import { loginSchema } from "@/components/hooks/useLoginForm";

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

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
  });

  it("renders form elements with correct accessibility attributes", () => {
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
    expect(emailInput).toHaveAttribute("aria-invalid", "false");
    expect(emailInput).not.toHaveAttribute("aria-describedby");

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("placeholder", "Enter your password");
    expect(passwordInput).toHaveAttribute("aria-invalid", "false");
    expect(passwordInput).not.toHaveAttribute("aria-describedby");

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    expect(submitButton).toBeEnabled();
  });

  it("shows validation errors for empty fields", async () => {
    // Mock the ZodError that would be thrown by parseAsync for empty fields
    const zodError = new z.ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["email"],
        message: "Email is required",
      },
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["password"],
        message: "Password is required",
      },
    ]);

    // Set up the mock to reject with a ZodError
    loginSchema.parseAsync.mockRejectedValueOnce(zodError);

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for error messages to appear
    const emailError = await screen.findByText("Email is required");
    const passwordError = await screen.findByText("Password is required");

    expect(emailError).toBeInTheDocument();
    expect(passwordError).toBeInTheDocument();

    // Verify aria attributes were updated
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(passwordInput).toHaveAttribute("aria-invalid", "true");
  });

  it("shows error for invalid email format", async () => {
    // Mock the ZodError for invalid email format
    const zodError = new z.ZodError([
      {
        code: "invalid_string",
        validation: "email",
        message: "Please enter a valid email address",
        path: ["email"],
      },
    ]);

    loginSchema.parseAsync.mockRejectedValueOnce(zodError);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Set input values
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
    });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify error message appears
    const emailError = await screen.findByText("Please enter a valid email address");
    expect(emailError).toBeInTheDocument();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  it("handles successful login", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
    };

    // Mock successful validation
    loginSchema.parseAsync.mockResolvedValueOnce(userData);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Set input values using fireEvent
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: userData.email } });
      fireEvent.change(passwordInput, { target: { value: userData.password } });
    });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify handleLoginSubmit was called with correct data
    expect(mockHandleLoginSubmit).toHaveBeenCalledWith(userData);
  });

  it("handles invalid credentials error", async () => {
    const userData = {
      email: "test@example.com",
      password: "wrongpassword",
    };

    // Mock successful validation
    loginSchema.parseAsync.mockResolvedValueOnce(userData);

    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Set input values using fireEvent
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: userData.email } });
      fireEvent.change(passwordInput, { target: { value: userData.password } });
    });

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Verify handleLoginSubmit was called with correct data
    expect(mockHandleLoginSubmit).toHaveBeenCalledWith(userData);
  });

  it("shows loading state during form submission", async () => {
    // Set loading state to true
    mockIsLoading = true;

    render(<LoginForm />);

    // Check for loading UI - use testid instead of text since the text changes in loading state
    const submitButton = screen.getByTestId("signin-button");
    expect(submitButton).toBeDisabled();

    // Verify the loading text is showing
    expect(screen.getByText("Signing in...")).toBeInTheDocument();

    const form = screen.getByTestId("form");
    expect(form).toHaveAttribute("aria-busy", "true");
  });

  it("maintains accessibility during form submission", async () => {
    // Mock the ZodError that would be thrown by parseAsync for empty fields
    const zodError = new z.ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "undefined",
        path: ["email"],
        message: "Email is required",
      },
    ]);

    // Set up the mock to reject with a ZodError
    loginSchema.parseAsync.mockRejectedValueOnce(zodError);

    render(<LoginForm />);

    const submitButton = screen.getByRole("button", { name: /sign in/i });
    await act(async () => {
      fireEvent.click(submitButton);
    });

    // Wait for error messages to appear
    const errorElements = await screen.findAllByRole("alert");
    expect(errorElements.length).toBeGreaterThan(0);

    const emailError = errorElements[0];
    expect(emailError).toHaveTextContent("Email is required");

    // Verify aria attributes were updated
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(emailInput).toHaveAttribute("aria-describedby", emailError.id);
  });
});
