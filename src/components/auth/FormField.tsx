import type { ComponentPropsWithoutRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type FormFieldProps = ComponentPropsWithoutRef<typeof Input> & {
  label: string;
  error?: string;
};

export const FormField = ({ label, error, id, name, className, ...props }: FormFieldProps) => {
  const inputId = id || name;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div>
        <Input
          id={inputId}
          name={name}
          className={cn(error && "border-destructive", className)}
          {...(error ? { "aria-invalid": true, "aria-describedby": errorId } : {})}
          {...props}
        />
      </div>
      {error && (
        <div id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};
