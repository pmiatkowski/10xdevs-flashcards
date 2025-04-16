# Architektura UI dla Fiszki AI

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji Fiszki AI opiera się na połączeniu Astro dla struktury strony, routingu i renderowania statycznego/SSR oraz React dla interaktywnych komponentów UI. Biblioteka Shadcn/ui zostanie wykorzystana do zapewnienia spójnego wyglądu, funkcjonalności i dostępności komponentów. Nawigacja główna będzie realizowana za pomocą paska bocznego oraz belki górnej (header). Zarządzanie stanem będzie głównie lokalne (w komponentach i hookach React), z możliwością użycia Zustand w razie potrzeby. Interakcje z backendem (Supabase) będą odbywać się wyłącznie poprzez dedykowane endpointy API Astro (`/api/*`), wywoływane z komponentów React za pośrednictwem niestandardowych hooków i usług. Uwierzytelnianie jest zarządzane po stronie serwera przez middleware Astro i Supabase Auth. **Aplikacja będzie wspierać tryb jasny i ciemny, z możliwością przełączania przez użytkownika i zapamiętywaniem wyboru.**

## 2. Lista widoków

### Widok: Logowanie / Rejestracja / Odzyskiwanie Hasła

* **Ścieżka widoku:** `/login`, `/register`, `/forgot-password`, `/reset-password` (lub obsługa przez modal/komponent Supabase UI na innych stronach, jeśli użytkownik nie jest zalogowany)
* **Główny cel:** Umożliwienie użytkownikom zalogowania się, utworzenia nowego konta lub odzyskania zapomnianego hasła.
* **Kluczowe informacje do wyświetlenia:** Formularz logowania (email, hasło), Formularz rejestracji (email, hasło), Formularz odzyskiwania hasła (email), Formularz resetowania hasła (nowe hasło), Linki do przełączania między logowaniem a rejestracją, Link "Zapomniałem hasła".
* **Kluczowe komponenty widoku:** `LoginForm` (React), `RegisterForm` (React), `ForgotPasswordForm` (React), `ResetPasswordForm` (React), `Input` (Shadcn/ui), `Button` (Shadcn/ui), `Toast` (Shadcn/ui - dla błędów logowania/rejestracji/odzyskiwania).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Jasne komunikaty błędów walidacji (inline) i błędów operacji (Toast). Prosty przepływ. Link "Zapomniałem hasła" na stronie logowania. Proces odzyskiwania hasła przez e-mail.
  * Dostępność: Poprawne etykiety pól, obsługa nawigacji klawiaturą, odpowiednie atrybuty ARIA dla formularzy.
  * Bezpieczeństwo: Komunikacja przez HTTPS. Walidacja po stronie klienta (Zod) i serwera. Hasła nie są przechowywane w stanie aplikacji. Token JWT zarządzany przez bezpieczne ciasteczka (HttpOnly, Secure) po stronie serwera (Supabase Auth). Bezpieczne linki do resetowania hasła (jednorazowe, ograniczone czasowo).

### Widok: Panel Główny (Dashboard)

* **Ścieżka widoku:** `/` (dostępny dla zalogowanych i niezalogowanych)
* **Główny cel:** Zapewnienie centralnego punktu dostępu do kluczowej funkcji generowania fiszek AI na podstawie wklejonego tekstu. Umożliwienie wypróbowania funkcji AI dla gości.
* **Kluczowe informacje do wyświetlenia:** Formularz do wklejenia tekstu i generowania fiszek AI, a poniżej – lista wygenerowanych kandydatów. Dla gości: informacja o konieczności zalogowania/rejestracji w celu zapisania/edycji kandydatów. **Przełącznik trybu ciemnego.**
* **Kluczowe komponenty widoku:**
  * `AIGenerationForm` (React) – formularz do wklejania tekstu (dostępny dla wszystkich).
  * Lista kandydatów (np. `AICandidateList` oraz `AICandidateListItem`) wyświetlana bezpośrednio pod formularzem.
  * Elementy sterujące akcjami na kandydatów: przyciski "Akceptuj", "Odrzuć", „Edytuj” wykonywane inline - **dostępne tylko dla zalogowanych użytkowników** (wyszarzone lub ukryte dla gości).
  * Opcja zbiorczego zapisywania wszystkich kandydatów na raz - **dostępna tylko dla zalogowanych użytkowników**.
  * Komponent `CallToActionLogin` (React/Astro) - widoczny dla gości, zachęcający do logowania/rejestracji w celu zapisania wygenerowanych kandydatów.
  * `Toast` (Shadcn/ui – dla błędów generowania AI i operacji na fiszkach).
  * **`ThemeToggle` (React) - komponent przełączający tryb jasny/ciemny.**
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Goście mogą wygenerować kandydatów i zobaczyć wyniki. Aby je zapisać lub edytować, muszą się zalogować/zarejestrować (stan formularza i kandydatów powinien zostać zachowany po logowaniu/rejestracji). Zalogowani użytkownicy mają pełną funkcjonalność edycji inline, akceptacji, odrzucania. **Przełącznik trybu ciemnego łatwo dostępny.**
  * Dostępność: Wyraźne etykiety pól, obsługa klawiatury dla formularza i przycisków inline (dla zalogowanych). Odpowiednie atrybuty ARIA. Jasne wskazanie, które akcje są niedostępne dla gości. **Przełącznik trybu ciemnego dostępny z klawiatury i odpowiednio oznaczony dla czytników ekranu.**
  * Bezpieczeństwo: Walidacja danych wejściowych formularza AI (klient/serwer). Ograniczenie liczby żądań generowania (rate limiting po stronie API). Operacje zapisu/edycji/akceptacji/odrzucenia autoryzowane po stronie API (RLS) - dostępne tylko dla zalogowanych.

### Widok: Moje Fiszki

* **Ścieżka widoku:** `/flashcards` (**dostępny tylko dla zalogowanych**)
* **Główny cel:** Wyświetlanie, zarządzanie (edycja, usuwanie) i tworzenie manualne zapisanych fiszek użytkownika.
* **Kluczowe informacje do wyświetlenia:** Lista zapisanych fiszek (przód, tył, źródło), opcje sortowania, paginacja, przycisk do tworzenia nowej fiszki manualnie.
* **Kluczowe komponenty widoku:**
  * `FlashcardList` (React) oraz `FlashcardListItem` (React, używający `Card` z Shadcn/ui) – lista wyświetlana inline.
  * Edycja fiszek odbywa się inline (bez użycia modal) przy użyciu elementów edycji, które umożliwiają modyfikację treści oraz zapis lub odrzucenie zmian.
  * `Pagination` (Shadcn/ui) oraz `DropdownMenu`/`Select` (Shadcn/ui – do sortowania).
  * `Button` (Shadcn/ui – "Dodaj manualnie", "Edytuj", "Usuń") – przyciski działające inline.
  * `Toast` (Shadcn/ui – dla błędów operacji CRUD).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Lista fiszek jest wyświetlana w sposób czytelny, a opcja edycji odbywa się bezpośrednio na elemencie listy (inline). Użytkownik widzi także wyraźne stany ładowania i stany pustej listy.
  * Dostępność: Odpowiednia struktura listy, obsługa klawiatury dla przycisków i pól inline oraz zgodność z zasadami ARIA.
  * Bezpieczeństwo: Widok chroniony przez middleware. Operacje CRUD autoryzowane po stronie API (RLS). Walidacja danych w edycji fiszki prowadzona zarówno po stronie klienta (Zod) jak i serwera.

### Widok: Sesja Powtórek (Spaced Repetition)

* **Ścieżka widoku:** `/review` (lub podobna) (**dostępny tylko dla zalogowanych**)
* **Główny cel:** Przeprowadzenie użytkownika przez sesję powtórek zaplanowanych fiszek zgodnie z logiką zewnętrznego algorytmu.
* **Kluczowe informacje do wyświetlenia:** Przód aktualnej fiszki, Przycisk do pokazania tyłu, Tył fiszki (po odsłonięciu), Przyciski oceny odpowiedzi (np. "Łatwe", "Trudne", "Powtórz" - zależne od algorytmu).
* **Kluczowe komponenty widoku:** `ReviewCard` (React), `Button` (Shadcn/ui - "Pokaż odpowiedź", przyciski oceny). (Szczegóły TBD - zależne od wybranego algorytmu/biblioteki).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Prosty, skoncentrowany interfejs. Płynne przechodzenie między fiszkami. Jasne instrukcje.
  * Dostępność: Obsługa klawiatury do odsłaniania odpowiedzi i oceniania. Czytelny tekst fiszek.
  * Bezpieczeństwo: Widok chroniony przez middleware. Interakcja z algorytmem powtórek odbywa się po stronie klienta lub przez API, w zależności od implementacji algorytmu.

### Widok: Ustawienia Konta

* **Ścieżka widoku:** `/settings` (**dostępny tylko dla zalogowanych**)
* **Główny cel:** Umożliwienie użytkownikowi zarządzania kontem, w tym jego usunięcia **oraz zmiany preferencji trybu wyświetlania.**
* **Kluczowe informacje do wyświetlenia:** Adres e-mail użytkownika, Przycisk "Usuń konto", **Przełącznik trybu ciemnego.**
* **Kluczowe komponenty widoku:** `Button` (Shadcn/ui - "Usuń konto"), `Dialog` (Shadcn/ui - do potwierdzenia usunięcia), **`ThemeToggle` (React).**
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Prosty interfejs. Wymagane potwierdzenie przed usunięciem konta. **Przełącznik trybu ciemnego łatwo dostępny.**
  * Dostępność: Poprawna obsługa klawiatury dla przycisku i dialogu potwierdzającego. **Przełącznik trybu ciemnego dostępny z klawiatury.**
  * Bezpieczeństwo: Widok chroniony przez middleware. Usunięcie konta wymaga potwierdzenia i jest obsługiwane przez bezpieczny endpoint API (`DELETE /api/users/me`).

## 3. Mapa podróży użytkownika

**Główny przepływ (Generowanie AI i Recenzja - Zalogowany Użytkownik):**

1. **Logowanie:** Użytkownik trafia na `/login`. Wprowadza dane, formularz jest walidowany (`LoginForm`). Po sukcesie, middleware Astro (korzystając z Supabase Auth) ustawia ciasteczko i użytkownik jest przekierowywany na `/`.
2. **Panel Główny (Dashboard):** Użytkownik widzi `/`. Wkleja tekst do `AIGenerationForm` i klika "Generuj Fiszki". Wyświetlany jest stan ładowania. Hook `useAIGeneration` wysyła żądanie `POST /api/ai/generate`.
3. **Generowanie (Backend):** API endpoint przetwarza tekst, wywołuje AI, zapisuje kandydatów w Supabase powiązanych z ID użytkownika.
4. **Informacja zwrotna:** Po sukcesie API zwraca listę kandydatów. Hook `useAIGeneration` aktualizuje stan. Użytkownik może otrzymać powiadomienie `Toast`.
5. **Recenzja Kandydatów:**
    * **Akceptacja:** Użytkownik klika "Akceptuj" na `AICandidateListItem`. Wywoływane jest żądanie `POST /api/ai-candidates/{id}/accept`. Kandydat znika z listy. Może pojawić się `Toast` potwierdzający.
    * **Odrzucenie:** Użytkownik klika "Odrzuć". Wywoływane jest żądanie `DELETE /api/ai-candidates/{id}`. Kandydat znika z listy.
    * **Edycja:** Użytkownik klika "Edytuj". Pojawiają się pola inline-edit `FlashcardForm`. Użytkownik edytuje, walidacja działa. Klika "Zapisz". Wywoływane jest żądanie `PUT /api/ai-candidates/{id}`. Edycja inline się zamyka.
6. **Moje Fiszki:** Użytkownik przechodzi na `/flashcards`. Widzi zaakceptowane fiszki (`FlashcardList` / `FlashcardListItem`). Hook `useFlashcards` pobiera dane przez `GET /api/flashcards`.
7. **Zarządzanie Fiszkami:** Użytkownik może edytować (inline-edit z `FlashcardForm`, `PUT /api/flashcards/{id}`) lub usuwać ("Usuń", `Dialog`, `DELETE /api/flashcards/{id}`).
8. **Sesja Powtórek:** Użytkownik przechodzi na `/review` i rozpoczyna sesję.

**Przepływ Generowania AI - Gość (Niezalogowany Użytkownik):**

1. **Panel Główny (Dashboard):** Użytkownik (gość) trafia na `/`. Widzi `AIGenerationForm`.
2. **Generowanie:** Wkleja tekst, klika "Generuj Fiszki". Wyświetlany jest stan ładowania. Hook `useAIGeneration` wysyła żądanie `POST /api/ai/generate` (API może obsługiwać generowanie dla gości, np. bez zapisywania do DB lub z tymczasowym ID).
3. **Wyświetlenie Kandydatów:** API zwraca listę kandydatów. Hook `useAIGeneration` aktualizuje stan. Lista `AICandidateList` jest wyświetlana.
4. **Ograniczone Akcje:** Przyciski "Akceptuj", "Odrzuć", "Edytuj" na `AICandidateListItem` są nieaktywne (wyszarzone lub ukryte).
5. **Wezwanie do Działania:** Widoczny jest komponent `CallToActionLogin` informujący, że aby zapisać lub edytować kandydatów, należy się zalogować lub zarejestrować.
6. **Logowanie/Rejestracja:** Użytkownik klika link logowania/rejestracji. Jest przekierowywany na `/login` lub `/register`.
7. **Zachowanie Stanu:** Po pomyślnym logowaniu/rejestracji, użytkownik jest przekierowywany z powrotem na `/`. Wprowadzony tekst źródłowy i wygenerowani kandydaci powinni zostać przywróceni (np. poprzez przekazanie danych w stanie nawigacji, local/session storage lub ponowne wygenerowanie na podstawie zapamiętanego tekstu).
8. **Pełna Funkcjonalność:** Użytkownik (teraz zalogowany) może zarządzać kandydatami (akceptować, odrzucać, edytować).

**Przepływ Manualnego Tworzenia (Zalogowany Użytkownik):**

1. **Logowanie:** Jak wyżej.
2. **Moje Fiszki:** Użytkownik przechodzi na `/flashcards`.
3. **Inicjacja Tworzenia:** Klika przycisk "Dodaj manualnie". Otwiera się `Dialog` z pustym `FlashcardForm`.
4. **Wypełnianie Formularza:** Użytkownik wpisuje tekst przodu i tyłu. Liczniki znaków i walidacja działają.
5. **Zapis:** Klika "Zapisz". Wywoływane jest żądanie `POST /api/flashcards`.
6. **Informacja zwrotna:** Dialog się zamyka, lista fiszek jest odświeżana, nowa fiszka jest widoczna. Może pojawić się `Toast` potwierdzający.

**Przepływ Odzyskiwania Hasła:**

1. **Inicjacja:** Użytkownik na `/login` klika "Zapomniałem hasła". Jest przekierowywany na `/forgot-password`.
2. **Podanie Emaila:** Wpisuje swój adres e-mail w `ForgotPasswordForm` i klika "Wyślij link". Wywoływane jest żądanie do API Supabase Auth.
3. **Wysłanie Emaila:** Backend wysyła e-mail z linkiem do resetowania hasła. Użytkownik widzi potwierdzenie/`Toast`.
4. **Reset Hasła:** Użytkownik klika link w e-mailu. Jest przekierowywany na `/reset-password` (ze specjalnym tokenem w URL).
5. **Ustawienie Nowego Hasła:** Wpisuje nowe hasło w `ResetPasswordForm` i potwierdza. Formularz wysyła żądanie do API Supabase Auth.
6. **Potwierdzenie:** Po pomyślnym zresetowaniu hasła, użytkownik jest informowany (np. `Toast`) i może zostać przekierowany na `/login`.

## 4. Układ i struktura nawigacji

* **Główny Układ (`src/layouts/Layout.astro`):** Definiuje ogólną strukturę strony, w tym:
  * **Belka Górna (Header):** Zawiera logo/nazwę aplikacji oraz dynamiczne linki/przyciski:
    * Dla gości: "Zaloguj się", "Zarejestruj się".
    * Dla zalogowanych: Nazwa użytkownika (lub email), przycisk/link "Wyloguj".
  * **Pasek Boczny (Sidebar):** Zaimplementowany jako komponent React (`SidebarNav`) używający `NavMenu` z Shadcn/ui. Widoczny tylko dla zalogowanych użytkowników. Zawiera linki nawigacyjne do głównych widoków chronionych:
    * Panel Główny (`/`) - Link może być widoczny dla wszystkich, ale zawartość strony się różni.
    * Moje Fiszki (`/flashcards`)
    * Sesja Powtórek (`/review`)
    * Ustawienia (`/settings`)
    * **Zawiera przełącznik trybu ciemnego (`ThemeToggle`).**
  * **Obszar Treści Głównej:** Slot (`<slot />`) na zawartość poszczególnych stron/widoków.
  * **Kontener na Toast:** Globalny element `Toaster` z Shadcn/ui.
* **Routing:** Obsługiwany przez Astro (file-based routing w `src/pages`). Middleware (`src/middleware/index.ts`) przechwytuje żądania, sprawdza uwierzytelnienie (sesja Supabase Auth pobierana z ciasteczka) i przekierowuje na `/login`, jeśli użytkownik nie jest zalogowany, a próbuje uzyskać dostęp do chronionego widoku (np. `/flashcards`, `/review`, `/settings`). Strona główna (`/`) jest dostępna dla wszystkich, ale jej zawartość/funkcjonalność jest dostosowywana w komponencie `DashboardView` na podstawie stanu uwierzytelnienia przekazanego z Astro.
* **Zarządzanie trybem ciemnym:**
  * **Implementacja:** Wykorzystanie wbudowanej obsługi trybu ciemnego w Tailwind CSS (`dark:` wariant) i Shadcn/ui. Klasa `dark` będzie dodawana/usuwana z elementu `<html>`.
  * **Przełączanie:** Komponent `ThemeToggle` (React) będzie odpowiedzialny za zmianę trybu.
  * **Persystencja:** Wybrany tryb (jasny/ciemny) będzie zapisywany w `localStorage` przeglądarki, aby zachować wybór użytkownika między sesjami. Odczytanie preferencji z `localStorage` i ustawienie odpowiedniej klasy na `<html>` nastąpi po stronie klienta przy inicjalizacji aplikacji (np. w skrypcie w `Layout.astro` lub w głównym komponencie React).

## 5. Kluczowe komponenty

* **`Layout.astro`:** Główny szablon strony, zawiera logikę wyświetlania belki górnej (z linkami logowania/rejestracji/wylogowania w zależności od stanu sesji Supabase pobranej po stronie serwera), warunkowo renderuje `SidebarNav` i zawiera slot na treść strony oraz `Toaster`. **Może zawierać skrypt inicjalizujący tryb ciemny na podstawie `localStorage`.**
* **`HeaderAuthLinks` (Astro/React):** Komponent (lub logika w `Layout.astro`) renderujący odpowiednie linki/przyciski w belce górnej na podstawie stanu uwierzytelnienia.
* **`SidebarNav` (React):** Komponent paska bocznego z linkami nawigacyjnymi (`NavMenu` Shadcn/ui), renderowany warunkowo w `Layout.astro` dla zalogowanych użytkowników.
* **`FlashcardForm` (React):** Formularz do tworzenia/edycji fiszek. Używa `react-hook-form`, Zod, `Input`, `Textarea`, `Button`, liczników znaków.
* **`AIGenerationForm` (React):** Formularz na Dashboardzie do wklejania tekstu.
* **`AICandidateList` (React):** Komponent renderujący listę kandydatów. Przekazuje stan uwierzytelnienia do `AICandidateListItem`.
* **`AICandidateListItem` (React):** Reprezentuje pojedynczego kandydata. Warunkowo włącza/wyłącza lub ukrywa przyciski akcji ("Akceptuj", "Odrzuć", "Edytuj") na podstawie przekazanego stanu uwierzytelnienia.
* **`FlashcardList` (React):** Komponent renderujący listę zapisanych fiszek.
* **`FlashcardListItem` (React):** Reprezentuje pojedynczą zapisaną fiszkę z przyciskami "Edytuj", "Usuń".
* **`CallToActionLogin` (React/Astro):** Komponent wyświetlany na Dashboardzie dla gości po wygenerowaniu kandydatów.
* **`LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm` (React):** Komponenty formularzy do obsługi autentykacji.
* **`ThemeToggle` (React):** Nowy komponent (np. przycisk z ikoną słońca/księżyca) odpowiedzialny za przełączanie trybu ciemnego. Będzie odczytywał i zapisywał stan w `localStorage` oraz modyfikował klasę na elemencie `<html>`.
* **`Pagination`, `DropdownMenu`, `Select`, `Dialog`, `Toast`, `Button`, `Input`, `Textarea`, `Card` (Shadcn/ui):** Wykorzystywane w różnych komponentach. **Komponenty Shadcn/ui automatycznie dostosują swój wygląd do aktywnego trybu (jasny/ciemny) na podstawie klasy `dark` na `<html>`.**
* **Hooki niestandardowe (React):**
  * `useAuth()`: Może obsługiwać logikę formularzy logowania/rejestracji/odzyskiwania, zarządzanie stanem ładowania/błędów tych operacji. Interakcja z API Supabase Auth odbywa się przez endpointy API Astro.
  * `useFlashcards()`: Pobiera listę fiszek (`GET /api/flashcards`), obsługuje CRUD. Dostępny tylko w kontekście zalogowanego użytkownika.
  * `useAICandidates()`: Pobiera listę kandydatów (`GET /api/ai-candidates`), obsługuje akceptację/odrzucenie/edycję. Dostępny tylko w kontekście zalogowanego użytkownika.
  * `useAIGeneration()`: Obsługuje wysyłanie tekstu (`POST /api/ai/generate`), zarządza stanem ładowania/błędu. Musi obsługiwać zarówno przypadki zalogowane, jak i niezalogowane (gość). Może potrzebować logiki do tymczasowego przechowywania danych dla gości.
  * `useDeleteUser()`: Obsługuje żądanie usunięcia konta (`DELETE /api/users/me`).
  * **`useTheme()`:** Nowy hook (lub logika w `ThemeToggle`) zarządzający stanem trybu ciemnego, interakcją z `localStorage` i aktualizacją klasy `<html>`.
