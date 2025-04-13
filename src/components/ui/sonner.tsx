import { Toaster as Sonner } from "sonner";

export const Toaster = ({ ...props }: Props) => {
  // Use defaultProps which works with Astro's setup
  const defaultProps: Props = {
    position: "top-right",
    toastOptions: {
      classNames: {
        toast: "group",
        error: "dark:bg-red-800/20 dark:border-red-800 dark:text-red-200",
        success: "dark:bg-green-800/20 dark:border-green-800 dark:text-green-200",
        info: "dark:bg-blue-800/20 dark:border-blue-800 dark:text-blue-200",
      },
      style: {
        background: "var(--background)",
        border: "1px solid var(--border)",
        color: "var(--foreground)",
      },
    },
  };

  return <Sonner {...defaultProps} {...props} />;
};

type Props = React.ComponentProps<typeof Sonner>;
