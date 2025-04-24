import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { FormWrapper } from "../FormWrapper";

describe("FormWrapper", () => {
  it("renders children correctly", () => {
    render(
      <FormWrapper onSubmit={() => undefined}>
        <div data-testid="test-child">Test Content</div>
      </FormWrapper>
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  it("handles form submission", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <FormWrapper onSubmit={handleSubmit}>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </FormWrapper>
    );

    await user.click(screen.getByTestId("submit-button"));
    expect(handleSubmit).toHaveBeenCalled();
  });

  it("prevents default form submission", async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    const preventDefaultMock = vi.fn();
    window.HTMLFormElement.prototype.submit = preventDefaultMock;

    render(
      <FormWrapper onSubmit={handleSubmit}>
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </FormWrapper>
    );

    await user.click(screen.getByTestId("submit-button"));
    expect(handleSubmit).toHaveBeenCalled();
    expect(preventDefaultMock).not.toHaveBeenCalled();
  });

  it("applies disabled state to form elements when submitting", () => {
    render(
      <FormWrapper onSubmit={() => undefined} isSubmitting>
        <input type="text" data-testid="text-input" />
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </FormWrapper>
    );

    expect(screen.getByTestId("text-input")).toBeDisabled();
    expect(screen.getByTestId("submit-button")).toBeDisabled();
  });

  it("applies correct aria attributes when loading", () => {
    render(
      <FormWrapper onSubmit={() => undefined} isSubmitting>
        <div>Loading...</div>
      </FormWrapper>
    );

    const form = screen.getByTestId("form");
    expect(form).toHaveAttribute("aria-busy", "true");
  });

  it("renders with custom class names", () => {
    render(
      <FormWrapper onSubmit={() => undefined} className="custom-class">
        <div>Content</div>
      </FormWrapper>
    );

    const form = screen.getByTestId("form");
    expect(form).toHaveClass("custom-class");
  });

  it("maintains proper form semantics", () => {
    render(
      <FormWrapper onSubmit={() => undefined}>
        <label htmlFor="test-input">Test Input</label>
        <input id="test-input" type="text" />
      </FormWrapper>
    );

    const form = screen.getByTestId("form");
    expect(form.tagName.toLowerCase()).toBe("form");
    expect(screen.getByLabelText("Test Input")).toBeInTheDocument();
  });

  it("supports nested fieldsets", () => {
    render(
      <FormWrapper onSubmit={() => undefined}>
        <fieldset>
          <legend>Test Group</legend>
          <input type="text" />
        </fieldset>
      </FormWrapper>
    );

    expect(screen.getByRole("group", { name: "Test Group" })).toBeInTheDocument();
  });
});
