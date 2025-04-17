import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { FlashcardForm } from "./FlashcardForm";
import { useFlashcards } from "./hooks/useFlashcards";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardListProps {
  limit?: number;
  sortBy?: "created_at" | "updated_at";
  order?: "asc" | "desc";
}

export const FlashcardList: React.FC<FlashcardListProps> = ({ limit = 20, sortBy = "created_at", order = "desc" }) => {
  const {
    flashcards,
    isLoading,
    error,
    currentPage,
    totalItems,
    sortBy: currentSortBy,
    order: currentOrder,
    isCreating,
    isFormVisible,
    setCurrentPage,
    loadFlashcards,
    handleEditToggle,
    handleEditChange,
    handleSaveEdit,
    handleDelete,
    handleCreateFlashcard,
    handleSortChange,
    setIsFormVisible,
  } = useFlashcards({ limit, initialSortBy: sortBy, initialOrder: order });

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const totalPages = Math.ceil(totalItems / limit);

  if (isLoading && flashcards.length === 0) {
    return (
      <div className="text-center p-8">
        <div role="status" className="inline-block">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-200">
        <p className="font-medium">Error Loading Flashcards</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Flashcards</h1>
        <div className="flex gap-2">
          <Button variant="default" onClick={() => setIsFormVisible(true)} disabled={isFormVisible}>
            Create Manually
          </Button>
          <Button variant="outline" asChild disabled={flashcards.length === 0}>
            <a href="/review">Review Cards</a>
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Select
            value={currentSortBy}
            onValueChange={(value: "created_at" | "updated_at") => handleSortChange(value, currentOrder)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Date Created</SelectItem>
              <SelectItem value="updated_at">Date Updated</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentOrder}
            onValueChange={(value: "asc" | "desc") => handleSortChange(currentSortBy, value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest</SelectItem>
              <SelectItem value="asc">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="justify-center"
          />
        )}
      </div>

      {isFormVisible && (
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Create New Flashcard</h2>
          <FlashcardForm
            onSubmit={handleCreateFlashcard}
            onCancel={() => setIsFormVisible(false)}
            submitLabel="Create"
            isSubmitting={isCreating}
          />
        </div>
      )}

      {!isLoading && flashcards.length === 0 && !isFormVisible && (
        <div className="text-center p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You don&apos;t have any flashcards yet.</p>
          <Button variant="default" onClick={() => setIsFormVisible(true)}>
            Create Manually
          </Button>
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="grid gap-6" role="list">
          {flashcards.map((flashcard) => (
            <FlashcardListItem
              key={flashcard.id}
              flashcard={flashcard}
              onEditToggle={handleEditToggle}
              onEditChange={handleEditChange}
              onSaveEdit={handleSaveEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && flashcards.length > 0 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="justify-center"
          />
        </div>
      )}
    </div>
  );
};
