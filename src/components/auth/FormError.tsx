import { useId } from "react";

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  const id = useId();
  const errorId = `error-message-${id}`;

  if (!message) {
    return null;
  }

  return (
    <div id={errorId} role="alert" aria-live="polite" className="text-sm text-destructive">
      {message}
    </div>
  );
};
