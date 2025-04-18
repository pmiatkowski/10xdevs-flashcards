import type { ComponentPropsWithoutRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormFieldProps = ComponentPropsWithoutRef<typeof Input> & {
  label: string;
  error?: string;
};

export const FormField = ({ label, error, id, name, ...props }: FormFieldProps) => {
  const inputId = id || name;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div>
        <Input
          id={inputId}
          name={name}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
