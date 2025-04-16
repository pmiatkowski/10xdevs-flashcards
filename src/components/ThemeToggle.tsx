import { Switch } from "@/components/ui/switch";
import { useTheme } from "./providers/ThemeProvider";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="dark-mode"
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
      />
      <Label
        htmlFor="dark-mode"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Dark mode
      </Label>
    </div>
  );
}
