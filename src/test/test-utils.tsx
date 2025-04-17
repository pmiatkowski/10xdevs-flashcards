// src/test/test-utils.tsx
import { render, RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { ThemeProvider } from "../components/providers/ThemeProvider";

// Create a custom wrapper that provides all the context providers needed for tests
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  // Add options for any additional providers or context needed
}

interface WrapperProps {
  children: ReactNode;
}

// Root wrapper with all providers
export function AllTheProviders({ children }: WrapperProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

// Custom render function that includes providers
export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
