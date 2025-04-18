import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId } from "react";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const FormField = ({ label, error, ...props }: FormFieldProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div>
        <Input id={id} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} {...props} />
        {error && (
          <p id={errorId} className="text-sm text-destructive mt-1" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
