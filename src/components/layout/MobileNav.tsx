import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

interface MobileNavProps {
  isAuthenticated: boolean;
}

export const MobileNav = ({ isAuthenticated }: MobileNavProps) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] px-2">
        <nav className="flex flex-col gap-4 mt-8 px-4">
          {isAuthenticated && (
            <>
              <SheetClose asChild>
                <a
                  href="/"
                  className="px-4 py-2 -mx-4 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Generate
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="/flashcards"
                  className="px-4 py-2 -mx-4 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  My Flashcards
                </a>
              </SheetClose>
            </>
          )}
          {!isAuthenticated && (
            <>
              <SheetClose asChild>
                <a
                  href="/login"
                  data-test-id="signin-link"
                  className="px-4 py-2 -mx-4 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Sign In
                </a>
              </SheetClose>
              <SheetClose asChild>
                <a
                  href="/register"
                  data-test-id="signup-link"
                  className="px-4 py-2 -mx-4 text-foreground/80 hover:text-foreground hover:bg-accent rounded-md transition-colors"
                >
                  Sign Up
                </a>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
