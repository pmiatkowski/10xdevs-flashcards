import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { FormField } from "../FormField";
import type { UseFormRegisterReturn } from "react-hook-form";

describe("FormField", () => {
  const mockRegister: UseFormRegisterReturn = {
    onChange: () => undefined,
    onBlur: () => undefined,
    ref: () => undefined,
    name: "testField",
  };

  it("renders with basic props", () => {
    render(<FormField label="Test Label" type="text" placeholder="Test placeholder" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Test placeholder");
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(input).not.toHaveAttribute("aria-describedby");
  });

  it("renders with error state", () => {
    render(<FormField label="Test Label" type="text" error="Test error message" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    const errorMessage = screen.getByText("Test error message");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", errorMessage.id);
    expect(errorMessage).toHaveAttribute("role", "alert");
  });

  it("handles disabled state", () => {
    render(<FormField label="Test Label" type="text" disabled {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toBeDisabled();
  });

  it("passes through aria-label when provided", () => {
    render(<FormField label="Test Label" type="text" aria-label="Custom aria label" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("aria-label", "Custom aria label");
  });

  it("renders required attribute when specified", () => {
    render(<FormField label="Test Label" type="text" required {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveAttribute("required");
  });

  it("renders with custom class names", () => {
    render(<FormField label="Test Label" type="text" className="custom-class" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveClass("custom-class");
  });

  it("renders with proper label association", () => {
    render(<FormField label="Test Label" type="text" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    const label = screen.getByText("Test Label");
    expect(input.id).toBe(label.getAttribute("for"));
  });

  it("applies error styles when error is present", () => {
    render(<FormField label="Test Label" type="text" error="Test error" {...mockRegister} />);

    const input = screen.getByLabelText("Test Label");
    expect(input).toHaveClass("border-destructive");
  });

  it("renders error message", () => {
    render(<FormField label="Test Label" type="text" error="Test error message" {...mockRegister} />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("includes correct ARIA role when error is present", () => {
    render(<FormField label="Test Label" type="text" error="Test error message" {...mockRegister} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("has unique id for aria-describedby when error is present", () => {
    render(<FormField label="Test Label" type="text" error="Test error message" {...mockRegister} />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement.id).toMatch(/^testField-error$/);
  });

  it("applies correct text size when error is present", () => {
    render(<FormField label="Test Label" type="text" error="Test error message" {...mockRegister} />);
    const errorElement = screen.getByRole("alert");
    expect(errorElement).toHaveClass("text-sm");
  });
});
