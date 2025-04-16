# Plan implementacji widoku Ustawienia Konta

## 1. Przegląd

Widok "Ustawienia Konta" umożliwia zalogowanym użytkownikom zarządzanie podstawowymi ustawieniami swojego konta. Głównym celem jest zapewnienie interfejsu do usunięcia konta (z potwierdzeniem) oraz do przełączania preferencji trybu wyświetlania (jasny/ciemny). Widok wyświetla adres e-mail użytkownika jako informację identyfikującą.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/settings`. Dostęp do tej ścieżki musi być chroniony i możliwy tylko dla zalogowanych użytkowników (realizowane przez middleware Astro).

## 3. Struktura komponentów

```

Layout.astro (Zawiera ThemeProvider)
  └─ src/pages/settings.astro (Strona Astro)
     ├─ Sekcja Informacji o Koncie (Wyświetla email)
     ├─ AccountSettingsSection (Komponent React, client:load)
     │  ├─ Button (Shadcn/ui - "Usuń konto", jako trigger Dialogu)
     │  └─ DeleteConfirmationDialog (Shadcn/ui Dialog - zintegrowany)
     │     ├─ DialogContent
     │     │  ├─ DialogHeader/Title/Description (Potwierdzenie usunięcia)
     │     │  ├─ DialogFooter
     │     │  │  ├─ Button (Shadcn/ui - "Anuluj")
     │     │  │  └─ Button (Shadcn/ui - "Potwierdź usunięcie")
     └─ ThemeSettingsSection (Komponent React, client:load)
        └─ ThemeToggle (Komponent React - przełącznik motywu)

```

* `ThemeProvider` (React Context Provider) powinien być zaimplementowany w głównym layoucie (`src/layouts/Layout.astro` lub podobnym), aby objąć całą aplikację.

## 4. Szczegóły komponentów

### `settings.astro` (Strona)

* **Opis komponentu:** Główna strona Astro dla ścieżki `/settings`. Odpowiedzialna za pobranie danych użytkownika (email) po stronie serwera z `Astro.locals`, renderowanie layoutu i osadzanie komponentów React. Weryfikuje sesję użytkownika.

* **Główne elementy:** Standardowa struktura strony Astro, wykorzystanie `Layout.astro`, osadzenie komponentów React (`AccountSettingsSection`, `ThemeSettingsSection`) z dyrektywą `client:load`. Wyświetlenie adresu email pobranego z `Astro.locals.session.user.email`.
* **Obsługiwane interakcje:** Brak bezpośrednich interakcji, przekazuje dane do komponentów React.
* **Obsługiwana walidacja:** Sprawdzenie istnienia aktywnej sesji użytkownika (`Astro.locals.session`). W przypadku braku sesji, middleware powinien przekierować użytkownika.
* **Typy:** Dane sesji użytkownika z `Astro.locals`.
* **Propsy:** Brak (jest to strona, nie komponent).

### `AccountSettingsSection.tsx` (React)

* **Opis komponentu:** Komponent React odpowiedzialny za logikę usuwania konta. Zawiera przycisk inicjujący proces oraz zintegrowany dialog potwierdzający z Shadcn/ui. Zarządza stanem dialogu i procesem wywołania API.

* **Główne elementy:** `div` jako kontener. `Button` z Shadcn/ui (`variant="destructive"`) z tekstem "Usuń konto". Komponent `Dialog` z Shadcn/ui zawierający `DialogTrigger` (owijający przycisk "Usuń konto"), `DialogContent` z nagłówkiem, opisem ostrzegawczym, oraz `DialogFooter` z przyciskami "Anuluj" (`Button variant="outline"`) i "Potwierdź usunięcie" (`Button variant="destructive"`). Wyświetlanie komunikatu błędu (np. za pomocą `Alert` z Shadcn/ui) w przypadku niepowodzenia API.
* **Obsługiwane interakcje:**
  * Kliknięcie przycisku "Usuń konto": Otwiera `Dialog`.
  * Kliknięcie "Anuluj" w dialogu: Zamyka `Dialog`.
  * Kliknięcie "Potwierdź usunięcie" w dialogu: Uruchamia wywołanie API `DELETE /api/users/me`, pokazuje stan ładowania na przycisku.
* **Obsługiwana walidacja:** Brak walidacji po stronie klienta poza potwierdzeniem użytkownika w dialogu.
* **Typy:** `ApiErrorResponseDto` (do obsługi błędów API).
* **Propsy:** Brak.

### `ThemeSettingsSection.tsx` (React)

* **Opis komponentu:** Komponent React wyświetlający opcję zmiany motywu. Zawiera komponent `ThemeToggle`.

* **Główne elementy:** `div` jako kontener. Etykieta (np. "Tryb Ciemny"). Komponent `ThemeToggle`.
* **Obsługiwane interakcje:** Przekazuje interakcje do `ThemeToggle`.
* **Obsługiwana walidacja:** Brak.
* **Typy:** Wymaga dostępu do kontekstu motywu (`ThemeContextType`).
* **Propsy:** Brak.

### `ThemeToggle.tsx` (React)

* **Opis komponentu:** Interaktywny przełącznik (np. `Switch` z Shadcn/ui lub niestandardowe przyciski Ikona Słońca/Księżyca) do zmiany motywu aplikacji. Odczytuje i aktualizuje motyw za pomocą kontekstu.

* **Główne elementy:** Komponent `Switch` z Shadcn/ui lub `Button` z ikonami.
* **Obsługiwane interakcje:** Kliknięcie/zmiana stanu przełącznika: Wywołuje funkcję `setTheme` z kontekstu motywu w celu zmiany motywu ('light'/'dark').
* **Obsługiwana walidacja:** Brak.
* **Typy:** Wymaga dostępu do kontekstu motywu (`ThemeContextType`).
* **Propsy:** Brak.

### `ThemeProvider.tsx` (React Context Provider)

* **Opis komponentu:** Provider kontekstu React zarządzający stanem motywu aplikacji. Odczytuje początkowy motyw z `localStorage` (lub preferencji systemowych), zapisuje zmiany w `localStorage` i udostępnia aktualny motyw oraz funkcję do jego zmiany komponentom potomnym. Dodaje/usuwa klasę `dark` do elementu `<html>`.

* **Główne elementy:** React Context Provider. Logika do odczytu/zapisu w `localStorage` i aktualizacji klasy na `<html>`.
* **Obsługiwane interakcje:** Aktualizuje stan wewnętrzny i `localStorage` po wywołaniu `setTheme`.
* **Obsługiwana walidacja:** Brak.
* **Typy:** `ThemeContextType`.
* **Propsy:** `children: React.ReactNode`.

## 5. Typy

* **`ApiErrorResponseDto` (z `src/types.ts`):** Używany do parsowania odpowiedzi błędów z API (szczególnie 500).

    ```typescript
    // filepath: src/types.ts
    export interface ApiErrorResponseDto {
      message: string;
      code?: string;
      details?: unknown;
    }
    ```

* **`Theme` (Nowy typ alias):** Reprezentuje możliwe stany motywu.

    ```typescript
    // filepath: src/components/providers/ThemeProvider.tsx
    export type Theme = 'light' | 'dark';
    ```

* **`ThemeContextType` (Nowy interfejs):** Definiuje kształt kontekstu dostarczanego przez `ThemeProvider`.

    ```typescript
    // filepath: src/components/providers/ThemeProvider.tsx
    export interface ThemeContextType {
      theme: Theme;
      setTheme: (theme: Theme) => void;
    }
    ```

## 6. Zarządzanie stanem

* **Motyw:** Zarządzany globalnie przez `ThemeProvider` i React Context. Stan (`theme: 'light' | 'dark'`) jest przechowywany w providerze, synchronizowany z `localStorage` i klasą na elemencie `<html>`. Komponenty `ThemeSettingsSection` i `ThemeToggle` konsumują ten kontekst za pomocą niestandardowego hooka `useTheme`.
  * **`useTheme` Hook:** Prosty hook zwracający `{ theme, setTheme }` z `ThemeContext`.

* **Usuwanie Konta:** Zarządzany lokalnie w komponencie `AccountSettingsSection` za pomocą `useState`.
  * `isDialogOpen: boolean`: Kontroluje widoczność modala potwierdzającego.
  * `isDeleting: boolean`: Wskazuje stan ładowania podczas wywołania API.
  * `error: string | null`: Przechowuje komunikaty błędów z API.

## 7. Integracja API

* **Endpoint:** `DELETE /api/users/me`

* **Metoda:** `DELETE`
* **Wywołanie:** Inicjowane przez kliknięcie przycisku "Potwierdź usunięcie" w `AccountSettingsSection`. Używana będzie standardowa funkcja `fetch` przeglądarki.
* **Typy Żądania:** Brak ciała żądania (`body: null`). Nagłówki domyślne (w tym cookie sesji wysyłane automatycznie przez przeglądarkę).
* **Typy Odpowiedzi:**
  * **Sukces (204 No Content):** Brak ciała odpowiedzi. Frontend powinien obsłużyć to jako pomyślne usunięcie.
  * **Błąd (np. 500 Internal Server Error):** Odpowiedź może zawierać ciało JSON zgodne z `ApiErrorResponseDto`. Frontend powinien spróbować sparsować JSON, aby uzyskać `message`.
  * **Błąd (np. 401 Unauthorized):** Odpowiedź prawdopodobnie bez ciała lub z generycznym komunikatem.

## 8. Interakcje użytkownika

* **Wejście na `/settings`:** Użytkownik widzi swój email, przycisk "Usuń konto" i przełącznik motywu.

* **Kliknięcie "Usuń konto":** Otwiera się modal z ostrzeżeniem i prośbą o potwierdzenie.
* **Kliknięcie "Anuluj" w modalu:** Modal znika, stan aplikacji pozostaje bez zmian.
* **Kliknięcie "Potwierdź usunięcie" w modalu:**
  * Przycisk "Potwierdź usunięcie" pokazuje stan ładowania.
  * Wysyłane jest żądanie `DELETE /api/users/me`.
  * *Po sukcesie (204):* Modal znika, użytkownik jest wylogowywany (wywołanie `supabase.auth.signOut()`), a następnie przekierowywany na stronę główną (`/`).
  * *Po błędzie (np. 500):* Stan ładowania znika, w modalu lub obok przycisku "Usuń konto" pojawia się komunikat błędu. Użytkownik pozostaje zalogowany.
* **Kliknięcie przełącznika motywu:**
  * Wygląd aplikacji natychmiast się zmienia (jasny/ciemny).
  * Stan wizualny przełącznika się aktualizuje.
  * Nowa preferencja motywu jest zapisywana w `localStorage`.

## 9. Warunki i walidacja

* **Dostęp do widoku:** Weryfikowany przez middleware Astro na podstawie sesji użytkownika. Komponenty frontendowe zakładają, że użytkownik jest zalogowany, jeśli widok się renderuje.

* **Usuwanie konta:** Jedyną "walidacją" jest jawne potwierdzenie przez użytkownika w modalu. Nie ma walidacji danych wejściowych.

## 10. Obsługa błędów

* **Brak sesji użytkownika:** Middleware Astro powinno przekierować na stronę logowania. Strona `/settings.astro` powinna dodatkowo sprawdzić `Astro.locals.session` i w razie braku zwrócić odpowiedź błędu lub przekierowanie.

* **Błąd API podczas usuwania konta (np. 500):**
  * W komponencie `AccountSettingsSection`, przechwycić błąd w bloku `catch` po wywołaniu `fetch`.
  * Zaktualizować stan `error` komunikatem dla użytkownika (np. "Wystąpił błąd podczas usuwania konta. Spróbuj ponownie później.").
  * Wyświetlić błąd w interfejsie (np. w komponencie `Alert` Shadcn/ui wewnątrz modala lub obok przycisku).
  * Zresetować stan `isDeleting` do `false`.
* **Błąd sieciowy podczas usuwania konta:** Podobnie jak wyżej, obsłużyć w bloku `catch`, ustawić generyczny komunikat błędu sieciowego.
* **Błąd odczytu/zapisu motywu w `localStorage`:** W `ThemeProvider`, użyć `try...catch` wokół operacji na `localStorage`. W przypadku błędu, użyć domyślnego motywu (np. 'light') i zalogować błąd do konsoli. Funkcjonalność przełączania będzie działać wizualnie, ale nie będzie trwała.

## 11. Kroki implementacji

1. **Utworzenie strony Astro:** Stworzyć plik `src/pages/settings.astro`. Dodać podstawową strukturę i layout. Zabezpieczyć ścieżkę `/settings` w middleware Astro (`src/middleware/index.ts`), aby wymagała zalogowanego użytkownika.
2. **Pobranie danych użytkownika:** W części frontmatter `settings.astro`, uzyskać dostęp do `Astro.locals.session.user.email`. Obsłużyć przypadek braku sesji (chociaż middleware powinien to wyłapać wcześniej). Wyświetlić email na stronie.
3. **Implementacja `ThemeProvider`:** Stworzyć `src/components/providers/ThemeProvider.tsx`. Zaimplementować logikę zarządzania stanem motywu, kontekst, odczyt/zapis do `localStorage` i aktualizację klasy `<html>`. Zintegrować provider w głównym layoucie (`src/layouts/Layout.astro`).
4. **Implementacja `ThemeToggle`:** Stworzyć `src/components/ThemeToggle.tsx`. Użyć `Switch` z Shadcn/ui lub przycisków z ikonami. Pobierać i ustawiać motyw za pomocą hooka `useTheme` (który konsumuje `ThemeContext`).
5. **Implementacja `ThemeSettingsSection`:** Stworzyć `src/components/ThemeSettingsSection.tsx`. Wyrenderować etykietę i komponent `ThemeToggle`. Osadzić ten komponent w `settings.astro` z dyrektywą `client:load`.
6. **Implementacja `AccountSettingsSection`:** Stworzyć `src/components/AccountSettingsSection.tsx`.
    * Dodać przycisk "Usuń konto" (`Button variant="destructive"`).
    * Zintegrować komponent `Dialog` Shadcn/ui, wyzwalany przez przycisk. Skonfigurować treść dialogu (ostrzeżenie, przyciski "Anuluj", "Potwierdź usunięcie").
    * Dodać stany `useState` dla `isDialogOpen`, `isDeleting`, `error`.
    * Zaimplementować logikę obsługi kliknięć przycisków w dialogu.
7. **Integracja API usuwania:** W `AccountSettingsSection`, w handlerze kliknięcia "Potwierdź usunięcie":
    * Implementować wywołanie `fetch('DELETE', '/api/users/me')`.
    * Obsłużyć stany ładowania (`isDeleting`).
    * Obsłużyć odpowiedź sukcesu (204): wywołanie `supabase.auth.signOut()`, przekierowanie na `/`. (Upewnić się, że klient Supabase jest dostępny - może wymagać przekazania go jako prop z Astro lub użycia globalnego kontekstu).
    * Obsłużyć odpowiedzi błędów (500, 401, błędy sieciowe): ustawienie stanu `error` i wyświetlenie komunikatu.
8. **Osadzenie `AccountSettingsSection`:** Dodać komponent `AccountSettingsSection` do `settings.astro` z dyrektywą `client:load`.
9. **Styling i Dostępność:** Dopracować style za pomocą Tailwind, upewniając się, że wszystko wygląda poprawnie w obu motywach. Sprawdzić dostępność klawiatury dla przycisków, dialogu i przełącznika motywu. Dodać odpowiednie atrybuty ARIA tam, gdzie to konieczne (Shadcn/ui zazwyczaj robi to dobrze).
10. **Testowanie:** Przetestować wszystkie ścieżki interakcji: usuwanie konta (sukces i błąd), przełączanie motywu, działanie w obu motywach, dostępność, zachowanie po wylogowaniu.
