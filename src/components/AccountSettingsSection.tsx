import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ApiErrorResponseDto } from "@/types";
import { toast } from "sonner";

export function AccountSettingsSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch("/api/users/me", {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ApiErrorResponseDto;
        throw new Error(errorData.message || "Failed to delete account");
      }

      // Show success toast and redirect
      toast.success("Account deleted successfully");
      window.location.href = "/login";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred while deleting your account";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-semibold">Account Settings</h2>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive" className="w-fit" aria-label="Delete account">
            Delete Account
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your data, including flashcards, will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="text-red-500 text-sm" role="alert">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
