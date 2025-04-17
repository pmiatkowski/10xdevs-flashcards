import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ReviewCard from "../ReviewCard";

describe("ReviewCard", () => {
  const mockCard = {
    id: "1",
    front_text: "What is TypeScript?",
    back_text: "TypeScript is a strongly typed programming language that builds on JavaScript.",
    source: "manual",
    created_at: "2025-04-17T10:00:00Z",
    updated_at: "2025-04-17T10:00:00Z",
  };

  it("should render front text", () => {
    render(<ReviewCard card={mockCard} isBackVisible={false} />);
    expect(screen.getByText(mockCard.front_text)).toBeInTheDocument();
    expect(screen.queryByText(mockCard.back_text)).not.toBeInTheDocument();
  });

  it("should render both front and back text when isBackVisible is true", () => {
    render(<ReviewCard card={mockCard} isBackVisible={true} />);
    expect(screen.getByText(mockCard.front_text)).toBeInTheDocument();
    expect(screen.getByText(mockCard.back_text)).toBeInTheDocument();
  });

  it("should render nothing when card is null", () => {
    const { container } = render(<ReviewCard card={null} isBackVisible={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should have proper ARIA attributes", () => {
    render(<ReviewCard card={mockCard} isBackVisible={true} />);

    // Check front side
    const card = screen.getByRole("region");
    expect(card).toHaveAttribute("aria-labelledby");

    // Check separator
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "horizontal");

    // Check answer section
    const answer = screen.getByRole("region", { name: "Answer" });
    expect(answer).toHaveAttribute("aria-live", "polite");
    expect(answer).toHaveAttribute("aria-atomic", "true");
  });

  it("should call onKeyPress when key is pressed", () => {
    const onKeyPress = vi.fn();
    render(<ReviewCard card={mockCard} isBackVisible={false} onKeyPress={onKeyPress} />);

    const card = screen.getByRole("region");
    card.focus();
    card.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));

    expect(onKeyPress).toHaveBeenCalled();
  });
});
