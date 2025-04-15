import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate the form data
      const validData = resetPasswordSchema.parse(data);
      setIsLoading(true);

      // Send reset password request
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

      // Show success message and redirect to login
      toast.success("Password reset successfully");
      window.location.href = "/login";
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
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
            name="newPassword"
            type="password"
            value={data.newPassword}
            onChange={handleChange}
            placeholder="Enter your new password"
            disabled={isLoading}
            aria-describedby={errors.newPassword ? "new-password-error" : undefined}
          />
          {errors.newPassword && (
            <p id="new-password-error" className="text-sm text-red-500">
              {errors.newPassword}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={data.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            disabled={isLoading}
            aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          />
          {errors.confirmPassword && (
            <p id="confirm-password-error" className="text-sm text-red-500">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Resetting password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-sm text-primary hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    </form>
  );
};
