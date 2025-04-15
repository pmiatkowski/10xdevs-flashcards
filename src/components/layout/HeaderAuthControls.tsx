import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface HeaderAuthControlsProps {
  isAuthenticated: boolean;
  userEmail: string | null;
}

export const HeaderAuthControls = ({ isAuthenticated, userEmail }: HeaderAuthControlsProps) => {
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

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to sign out");
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <a href="/login" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
          Sign In
        </a>
        <a href="/register" className="text-sm font-medium text-slate-200 hover:text-white transition-colors">
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-slate-300 hidden sm:inline">{userEmail}</span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        disabled={isLoading}
        className="text-slate-200 hover:text-white hover:bg-slate-800"
      >
        {isLoading ? "Signing out..." : "Sign Out"}
      </Button>
    </div>
  );
};
