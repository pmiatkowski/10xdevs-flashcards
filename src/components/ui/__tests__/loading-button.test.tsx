import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingButton } from "../loading-button";

describe("LoadingButton", () => {
  it("renders children when not loading", () => {
    render(<LoadingButton>Click me</LoadingButton>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders loading text when loading", () => {
    render(
      <LoadingButton isLoading loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    expect(screen.getByText("Processing...")).toBeInTheDocument();
    expect(screen.queryByText("Click me")).not.toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    render(
      <LoadingButton isLoading loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(
      <LoadingButton isLoading loadingText="Processing...">
        Click me
      </LoadingButton>
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<LoadingButton disabled>Click me</LoadingButton>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
