import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormError } from "../FormError";

describe("FormError", () => {
  it("renders error message", () => {
    render(<FormError message="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("includes correct ARIA role", () => {
    render(<FormError message="Test error message" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has unique id for aria-describedby", () => {
    render(<FormError message="Test error message" />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement.id).toMatch(/^error-message-/); // IDs should be prefixed
  });

  it("renders with error styles", () => {
    render(<FormError message="Test error message" />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveClass("text-destructive");
  });

  it("renders nothing when message is empty", () => {
    render(<FormError message="" />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders nothing when message is undefined", () => {
    render(<FormError message={undefined} />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("applies correct text size", () => {
    render(<FormError message="Test error message" />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveClass("text-sm");
  });
});
