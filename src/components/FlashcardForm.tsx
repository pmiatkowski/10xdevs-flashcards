import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const flashcardSchema = z.object({
  front_text: z.string().min(1, "Front text is required").max(200, "Front text must be 200 characters or less"),
  back_text: z.string().min(1, "Back text is required").max(500, "Back text must be 500 characters or less"),
});

type FlashcardFormData = z.infer<typeof flashcardSchema>;

interface FlashcardFormProps {
  initialData?: {
    front_text: string;
    back_text: string;
  };
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

export const FlashcardForm: React.FC<FlashcardFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardSchema),
    defaultValues: initialData || {
      front_text: "",
      back_text: "",
    },
  });

  const frontText = watch("front_text");
  const backText = watch("back_text");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="front_text" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Front:
        </label>
        <div className="relative">
          <Textarea
            id="front_text"
            {...register("front_text")}
            disabled={isSubmitting}
            className="resize-none min-h-20 w-full"
            aria-describedby="front_text_count"
          />
          <div
            id="front_text_count"
            className={`mt-1 text-sm text-right ${frontText.length > 200 ? "text-red-500" : "text-gray-500"}`}
          >
            {frontText.length} / 200 characters
          </div>
        </div>
        {errors.front_text && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.front_text.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="back_text" className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
          Back:
        </label>
        <div className="relative">
          <Textarea
            id="back_text"
            {...register("back_text")}
            disabled={isSubmitting}
            className="resize-none min-h-20 w-full"
            aria-describedby="back_text_count"
          />
          <div
            id="back_text_count"
            className={`mt-1 text-sm text-right ${backText.length > 500 ? "text-red-500" : "text-gray-500"}`}
          >
            {backText.length} / 500 characters
          </div>
        </div>
        {errors.back_text && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {errors.back_text.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
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
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
};
