import React from "react";
import { Button } from "./ui/button";

export const CallToActionLogin: React.FC = () => {
  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-amber-700 dark:text-amber-200">
      <h3 className="text-lg font-semibold mb-2">Want to save these flashcards?</h3>
      <p className="mb-4">
        Create an account or log in to save your generated flashcards, edit them, and build your personal study deck.
      </p>
      <div className="flex flex-wrap gap-4">
        <Button
          variant="default"
          onClick={() => (window.location.href = "/register")}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          Create Account
        </Button>
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/login")}
          className="border-amber-600 text-amber-700 hover:bg-amber-50"
        >
          Log In
        </Button>
      </div>
    </div>
  );
};
