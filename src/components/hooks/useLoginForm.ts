import { useState } from "react";
import { toast } from "sonner";
import type { ApiErrorResponseDto } from "@/types";
import { type LoginFormData, loginSchema } from "@/lib/validation/auth";

export { loginSchema };
export type { LoginFormData };

export const useLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (data: LoginFormData) => {
    if (isLoading) return;

    // Setting isLoading to true synchronously before any async operations
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Authentication failed", {
            description: "Invalid email or password. Please check your credentials and try again.",
          });
          return;
        } else {
          const errorData = responseData as ApiErrorResponseDto;
          toast.error("Sign in failed", {
            description: `Error: ${errorData.message}`,
          });
          return;
        }
      }

      toast.success("Successfully signed in", {
        description: "Redirecting to dashboard...",
      });

      // Redirect to home page on success
      window.location.href = window.location.origin;
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Connection error", {
          description: `Failed to connect to authentication service. Error: ${err.message}`,
        });
      } else {
        toast.error("An unexpected error occurred", {
          description: "Please try again later. If the problem persists, contact support.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleLoginSubmit,
  };
};
