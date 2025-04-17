## Drzewo komponentów dla strony głównej (`index.astro`)

```

index.astro
└─ Layout.astro
   ├─ ThemeProvider (React, client:only)
   │  ├─ HeaderAuthControls (React, client:idle)
   │  │  ├─ (Conditional: !isAuthenticated)
   │  │  │  ├─ <a> (Sign In)
   │  │  │  └─ <a> (Sign Up)
   │  │  └─ (Conditional: isAuthenticated)
   │  │     └─ DropdownMenu (Shadcn/ui)
   │  │        ├─ DropdownMenuTrigger
   │  │        │  └─ Button (Shadcn/ui)
   │  │        └─ DropdownMenuContent
   │  │           ├─ DropdownMenuItem -> <a> (Settings)
   │  │           ├─ DropdownMenuSeparator
   │  │           └─ DropdownMenuItem (Sign Out)
   │  ├─ <slot />
   │  │  └─ DashboardView (React, client:load)
   │  │     ├─ AIGenerationForm (React)
   │  │     ├─ (Conditional: !isAuthenticated && showLoginPrompt && candidates.length > 0)
   │  │     │  └─ CallToActionLogin (React)
   │  │     ├─ (Conditional: candidates.length > 0)
   │  │     │  └─ AICandidateList (React)
   │  │     ├─ (Conditional: generationError)
   │  │     │  └─ div (Error Display)
   │  │     └─ (Conditional: !isLoadingGeneration && !generationError && candidates.length === 0)
   │  │        └─ div (Empty State)
   │  └─ Toaster (React, client-side)
   └─ (Styles)

```

## Drzewo komponentów dla strony logowania (`login.astro`)

```

login.astro
└─ Layout.astro
   ├─ ThemeProvider (React, client:only)
   │  ├─ HeaderAuthControls (React, client:idle)
   │  │  ├─ (Conditional: !isAuthenticated)
   │  │  │  ├─ <a> (Sign In)
   │  │  │  └─ <a> (Sign Up)
   │  │  └─ (Conditional: isAuthenticated)
   │  │     └─ DropdownMenu (Shadcn/ui)
   │  │        ├─ DropdownMenuTrigger
   │  │        │  └─ Button (Shadcn/ui)
   │  │        └─ DropdownMenuContent
   │  │           ├─ DropdownMenuItem -> <a> (Settings)
   │  │           ├─ DropdownMenuSeparator
   │  │           └─ DropdownMenuItem (Sign Out)
   │  ├─ <slot />
   │  │  └─ main
   │  │     └─ div.card
   │  │        └─ LoginForm (React, client:load)
   │  │           └─ form
   │  │              ├─ Label (Shadcn/ui)
   │  │              ├─ Input (Shadcn/ui)
   │  │              ├─ Label (Shadcn/ui)
   │  │              ├─ Input (Shadcn/ui)
   │  │              ├─ Button (Shadcn/ui)
   │  │              ├─ <a> (Sign up)
   │  │              └─ <a> (Forgot password)
   │  └─ Toaster (React, client-side)
   └─ (Styles)
