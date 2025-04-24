import { useState } from "react";
import { toast } from "sonner";
import type { ApiErrorResponseDto } from "@/types";
import { registerSchema, type RegisterFormData } from "@/lib/validation/auth";

export { registerSchema };
export type { RegisterFormData };

export const useRegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (data: RegisterFormData, resetForm?: () => void) => {
    if (isLoading) return;

    // Setting isLoading to true synchronously before any async operations
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("This email is already registered");
        } else {
          const errorData = responseData as ApiErrorResponseDto;
          toast.error("Registration failed", {
            description: `Error: ${errorData.message}`,
          });
        }
        return;
      }

      // Reset form instead of redirecting
      if (resetForm) {
        resetForm();
      }

      // Show toast message about activation link
      toast.success("Registration successful", {
        description: "An activation link has been sent to your email address.",
      });
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Connection error", {
          description: `Failed to connect to registration service. Error: ${err.message}`,
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
    handleRegisterSubmit,
  };
};
