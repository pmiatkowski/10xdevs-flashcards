import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import type { ApiErrorResponseDto } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const useLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [name]: omitted, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validData = loginSchema.parse(data);
      setIsLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Invalid email or password", {
            description: "Please check your credentials and try again",
          });
          return;
        } else {
          const errorData = responseData as ApiErrorResponseDto;
          toast.error("Sign in failed", {
            description: errorData.message || "An error occurred during sign in",
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
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        toast.error("An unexpected error occurred", {
          description: "Please try again later",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    data,
    errors,
    handleChange,
    handleSubmit,
  };
};
