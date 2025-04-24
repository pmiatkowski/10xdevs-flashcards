import * as React from "react";
import { cn } from "@/lib/utils";
import type { ReactNode, ReactElement, JSXElementConstructor } from "react";

interface FormWrapperProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
  isSubmitting?: boolean;
}

interface ElementProps {
  disabled?: boolean;
  children?: ReactNode;
  [key: string]: unknown;
}

export const FormWrapper = ({ children, onSubmit, className, isSubmitting }: FormWrapperProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const disableFormElements = (children: ReactNode): ReactNode => {
    return React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;

      const childElement = child as ReactElement<ElementProps, string | JSXElementConstructor<unknown>>;
      const props: ElementProps = {
        ...childElement.props,
        disabled: isSubmitting || childElement.props.disabled,
      };

      if (childElement.props.children) {
        props.children = disableFormElements(childElement.props.children);
      }

      return React.cloneElement(childElement, props);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("space-y-6", className)}
      noValidate
      aria-busy={isSubmitting}
      data-testid="form"
    >
      {isSubmitting ? disableFormElements(children) : children}
    </form>
  );
};
