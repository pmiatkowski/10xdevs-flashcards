import { memo } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { useLoginForm } from "@/components/hooks/useLoginForm";

export const LoginForm = memo(() => {
  const { isLoading, data, errors, handleChange, handleSubmit } = useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormField
        label="Email"
        name="email"
        type="email"
        data-test-id="email-input"
        value={data.email}
        onChange={handleChange}
        placeholder="Enter your email"
        disabled={isLoading}
        error={errors.email}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        data-test-id="password-input"
        value={data.password}
        onChange={handleChange}
        placeholder="Enter your password"
        disabled={isLoading}
        error={errors.password}
      />

      <div className="space-y-4">
        <Button type="submit" className="w-full" disabled={isLoading} data-test-id="signin-button">
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
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-primary hover:underline">
              Sign up
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            <a href="/forgot-password" className="text-primary hover:underline">
              Forgot your password?
            </a>
          </p>
        </div>
      </div>
    </form>
  );
});
