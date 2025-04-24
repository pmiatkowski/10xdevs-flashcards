import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { resetPasswordSchema } from "@/lib/validation/auth";

interface ResetPasswordFormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordForm = () => {
  const [data, setData] = useState<ResetPasswordFormData>({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Get token from URL
  const token = new URLSearchParams(window.location.search).get("token");

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-500">Invalid reset link. Please request a new password reset.</p>
        <a href="/forgot-password" className="text-primary hover:underline">
          Go to Forgot Password
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (isLoading) return;

    try {
      const validData = resetPasswordSchema.parse(data);
      setIsLoading(true);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: validData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 400) {
          toast.error("Invalid or expired reset link");
        } else {
          toast.error(error.message || "Failed to reset password");
        }
        return;
      }

      toast.success("Password reset successfully");
      window.location.href = "/login";
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-4">Enter your new password below.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <Input
            id="newPassword"
            type="password"
            value={data.newPassword}
            onChange={(e) => setData({ ...data, newPassword: e.target.value })}
            placeholder="Enter your new password"
            aria-invalid={!!errors.newPassword}
            aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
            disabled={isLoading}
          />
          {errors.newPassword && (
            <p id="newPassword-error" className="text-sm text-destructive">
              {errors.newPassword}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={data.confirmPassword}
            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="text-sm text-destructive">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <LoadingButton
          type="submit"
          className="w-full"
          disabled={isLoading}
          isLoading={isLoading}
          loadingText="Updating password..."
        >
          Update Password
        </LoadingButton>
        <div className="text-center">
          <a href="/login" className="text-sm text-primary hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </form>
  );
};
