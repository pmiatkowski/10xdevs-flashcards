import { memo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./FormField";
import { FormWrapper } from "./FormWrapper";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRegisterForm, type RegisterFormData, registerSchema } from "@/components/hooks/useRegisterForm";

const RegisterFormComponent = () => {
  const { isLoading, handleRegisterSubmit } = useRegisterForm();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    handleRegisterSubmit(data, () => reset());
  };

  return (
    <FormWrapper onSubmit={handleSubmit(onSubmit)} isSubmitting={isLoading}>
      <FormField
        label="Email"
        type="email"
        {...register("email")}
        error={errors.email?.message}
        placeholder="Enter your email"
        disabled={isLoading}
      />
      <FormField
        label="Password"
        type="password"
        {...register("password")}
        error={errors.password?.message}
        placeholder="Create a password"
        disabled={isLoading}
      />
      <FormField
        label="Confirm Password"
        type="password"
        {...register("confirmPassword")}
        error={errors.confirmPassword?.message}
        placeholder="Confirm your password"
        disabled={isLoading}
      />
      <div className="space-y-4">
        <LoadingButton type="submit" isLoading={isLoading} loadingText="Creating account..." className="w-full">
          Create Account
        </LoadingButton>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </FormWrapper>
  );
};

RegisterFormComponent.displayName = "RegisterForm";
export const RegisterForm = memo(RegisterFormComponent);
