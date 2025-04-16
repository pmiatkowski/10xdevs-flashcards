import { ThemeToggle } from "./ThemeToggle";
import { ThemeProvider } from "./providers/ThemeProvider";

export function ThemeSettingsSection() {
  return (
    <ThemeProvider>
      <div className="flex flex-col space-y-4">
        <h2 className="text-lg font-semibold">Theme Settings</h2>
        <div className="flex items-center justify-between">
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  );
}
