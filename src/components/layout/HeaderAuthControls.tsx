import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderAuthControlsProps {
  isAuthenticated: boolean;
  userEmail: string | null;
  showLabels?: boolean;
}

export const HeaderAuthControls = ({ isAuthenticated, userEmail, showLabels = true }: HeaderAuthControlsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout failed");
      }

      window.location.href = "/login";
    } catch {
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    if (!showLabels) {
      return (
        <div className="flex items-center">
          <a
            href="/login"
            data-test-id="signin-link"
            className="p-2 text-foreground/80 hover:text-foreground transition-colors"
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Sign In</span>
          </a>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <a
          href="/login"
          data-test-id="signin-link"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Sign In
        </a>
        <a
          href="/register"
          data-test-id="signup-link"
          className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
        >
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            data-test-id="user-email-dropdown"
            variant="ghost"
            size="sm"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
          >
            {showLabels ? userEmail : <User className="h-5 w-5" />}
            {!showLabels && <span className="sr-only">{userEmail}</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href="/settings">Settings</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isLoading} onClick={handleLogout}>
            {isLoading ? "Signing out..." : "Sign Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
