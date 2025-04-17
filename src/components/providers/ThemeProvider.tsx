import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type Theme = "light" | "dark";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize theme state and apply it immediately
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";

    try {
      // Check localStorage first
      const stored = localStorage.getItem("theme") as Theme;
      if (stored === "light" || stored === "dark") {
        // Apply theme immediately to avoid flash
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(stored);
        return stored;
      }

      // Check system preference
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const systemTheme = isDark ? "dark" : "light";

      // Apply system theme immediately
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(systemTheme);
      return systemTheme;
    } catch {
      return "light";
    }
  });

  // Update theme in localStorage and DOM
  const setTheme = (newTheme: Theme) => {
    try {
      const root = window.document.documentElement;

      // Remove previous transition class if it exists
      root.classList.remove("theme-transition");

      // Add transition class
      root.classList.add("theme-transition");

      // Update theme
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      localStorage.setItem("theme", newTheme);
      setThemeState(newTheme);

      // Show toast
      toast.success(`Switched to ${newTheme} theme`);

      // Remove transition class after animation completes
      const timeout = setTimeout(() => {
        root.classList.remove("theme-transition");
      }, 150);

      return () => clearTimeout(timeout);
    } catch (error) {
      console.error("Error saving theme preference:", error);
    }
  };

  // Sync with system preferences
  useEffect(() => {
    try {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? "dark" : "light";
        // Only update if user hasn't explicitly set a preference
        if (!localStorage.getItem("theme")) {
          setTheme(newTheme);
        }
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    } catch (error) {
      console.error("Error setting up system theme sync:", error);
    }
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
