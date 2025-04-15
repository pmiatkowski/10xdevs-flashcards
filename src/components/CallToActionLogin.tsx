import React from "react";
import { Button } from "@/components/ui/button";

export const CallToActionLogin: React.FC = () => {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Save Your Flashcards</h3>
      <p className="text-muted-foreground mb-6">
        Create an account or sign in to save these flashcards to your collection, edit them, and start learning!
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="flex-1">
          <a href="/register">Create Account</a>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href="/login">Sign In</a>
        </Button>
      </div>
    </div>
  );
};
