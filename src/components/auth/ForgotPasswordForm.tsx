import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ForgotPasswordForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Validate the email
      const validData = forgotPasswordSchema.parse({ email });
      setIsLoading(true);

      // Send reset request
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validData.email }),
      });

      if (!response.ok && response.status !== 429) {
        throw new Error("Failed to send reset email");
      }

      if (response.status === 429) {
        toast.error("Too many requests. Please try again later.");
        return;
      }

      // Show success message (even if email doesn't exist)
      setIsSuccess(true);
      toast.success("If an account exists with this email, you will receive reset instructions.");
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">
          If an account exists with this email, you will receive instructions to reset your password.
        </p>
        <Button variant="outline" asChild className="mt-4">
          <a href="/login">Back to Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-muted-foreground mb-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            placeholder="Enter your email"
            disabled={isLoading}
            aria-describedby={error ? "email-error" : undefined}
          />
          {error && (
            <p id="email-error" className="text-sm text-red-500">
              {error}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Instructions"}
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
