// src/test/test-utils.tsx
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "../components/providers/ThemeProvider";

// Create a custom wrapper that provides all the context providers needed for tests
type CustomRenderOptions = Omit<RenderOptions, "wrapper">;

interface WrapperProps {
  children: ReactNode;
}

// Root wrapper with all providers
export function AllTheProviders({ children }: WrapperProps) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// Custom render function that includes providers
export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
