/* eslint-disable react/display-name */
import { memo, useState } from "react";
import { FormField } from "./FormField";
import { FormWrapper } from "./FormWrapper";
import { LoadingButton } from "@/components/ui/loading-button";
import { loginSchema, useLoginForm } from "@/components/hooks/useLoginForm";
import { z } from "zod";
import { isFeatureEnabled } from "@/lib/featureFlags";

export const LoginForm = memo(() => {
  const { isLoading, handleLoginSubmit } = useLoginForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isForgotPasswordEnabled = isFeatureEnabled("forgot-password");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const validatedData = await loginSchema.parseAsync(data);
      setErrors({});
      await handleLoginSubmit(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as string;
          fieldErrors[field] = err.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <FormWrapper onSubmit={onSubmit} isSubmitting={isLoading}>
      <FormField
        label="Email"
        name="email"
        type="email"
        placeholder="Enter your email"
        error={errors.email}
        data-testid="email-input"
        aria-invalid={!!errors.email}
      />
      <FormField
        label="Password"
        name="password"
        type="password"
        placeholder="Enter your password"
        error={errors.password}
        data-testid="password-input"
        aria-invalid={!!errors.password}
      />
      <div className="space-y-4">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          loadingText="Signing in..."
          data-testid="signin-button"
          className="w-full"
        >
          Sign In
        </LoadingButton>
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
          {isForgotPasswordEnabled && (
            <p className="text-sm text-muted-foreground">
              <a href="/forgot-password" className="text-primary hover:underline">
                Forgot your password?
              </a>
            </p>
          )}
        </div>
      </div>
    </FormWrapper>
  );
});
