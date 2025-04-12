# Architektura UI dla Fiszki AI

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika (UI) dla aplikacji Fiszki AI opiera się na połączeniu Astro dla struktury strony, routingu i renderowania statycznego/SSR oraz React dla interaktywnych komponentów UI. Biblioteka Shadcn/ui zostanie wykorzystana do zapewnienia spójnego wyglądu, funkcjonalności i dostępności komponentów. Nawigacja główna będzie realizowana za pomocą paska bocznego. Zarządzanie stanem będzie głównie lokalne (w komponentach i hookach React), z możliwością użycia Zustand w razie potrzeby. Interakcje z backendem (Supabase) będą odbywać się wyłącznie poprzez dedykowane endpointy API Astro (`/api/*`), wywoływane z komponentów React za pośrednictwem niestandardowych hooków i usług. Uwierzytelnianie jest zarządzane po stronie serwera przez middleware Astro.

## 2. Lista widoków

### Widok: Logowanie / Rejestracja

* **Ścieżka widoku:** `/login`, `/register` (lub obsługa przez modal/komponent Supabase UI na innych stronach, jeśli użytkownik nie jest zalogowany)
* **Główny cel:** Umożliwienie użytkownikom zalogowania się lub utworzenia nowego konta.
* **Kluczowe informacje do wyświetlenia:** Formularz logowania (email, hasło), Formularz rejestracji (email, hasło), Linki do przełączania między logowaniem a rejestracją.
* **Kluczowe komponenty widoku:** `LoginForm` (React), `RegisterForm` (React), `Input` (Shadcn/ui), `Button` (Shadcn/ui), `Toast` (Shadcn/ui - dla błędów logowania/rejestracji).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Jasne komunikaty błędów walidacji (inline) i błędów logowania/rejestracji (Toast). Prosty przepływ.
  * Dostępność: Poprawne etykiety pól, obsługa nawigacji klawiaturą, odpowiednie atrybuty ARIA dla formularzy.
  * Bezpieczeństwo: Komunikacja przez HTTPS. Walidacja po stronie klienta (Zod) i serwera. Hasła nie są przechowywane w stanie aplikacji. Token JWT zarządzany przez bezpieczne ciasteczka (HttpOnly, Secure) po stronie serwera.

### Widok: Panel Główny (Dashboard)

* **Ścieżka widoku:** `/` (po zalogowaniu)
* **Główny cel:** Zapewnienie centralnego punktu dostępu do kluczowej funkcji generowania fiszek AI na podstawie wklejonego tekstu.
* **Kluczowe informacje do wyświetlenia:** Formularz do wklejenia tekstu i generowania fiszek AI, a poniżej – lista wygenerowanych kandydatów.
* **Kluczowe komponenty widoku:**
  * `AIGenerationForm` (React) – formularz do wklejania tekstu.
  * Lista kandydatów (np. `AICandidateList` oraz `AICandidateListItem`) wyświetlana bezpośrednio pod formularzem.
  * Elementy sterujące akcjami na kandydatów: przyciski "Akceptuj", "Odrzuć", „Edytuj” wykonywane inline bez użycia modal.
  * Opcja zbiorczego zapisywania wszystkich kandydatów na raz.
  * `Toast` (Shadcn/ui – dla błędów generowania AI i operacji na fiszkach).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Po wygenerowaniu fiszek lista pojawia się pod formularzem. Użytkownik może edytować pojedyncze fiszki inline, zapisać je lub odrzucić zmiany, a także zapisać wszystkie kandydatów jednocześnie.
  * Dostępność: Wyraźne etykiety pól, obsługa klawiatury dla formularza i przycisków inline. Odpowiednie atrybuty ARIA.
  * Bezpieczeństwo: Walidacja danych wejściowych formularza AI (klient/serwer). Ograniczenie liczby żądań generowania (rate limiting po stronie API). Operacje autoryzowane po stronie API (RLS). Walidacja danych w edycji fiszki (klient/serwer).

### Widok: Moje Fiszki

* **Ścieżka widoku:** `/flashcards`
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
  * Bezpieczeństwo: Operacje CRUD autoryzowane po stronie API (RLS). Walidacja danych w edycji fiszki prowadzona zarówno po stronie klienta (Zod) jak i serwera.

### Widok: Sesja Powtórek (Spaced Repetition)

* **Ścieżka widoku:** `/review` (lub podobna)
* **Główny cel:** Przeprowadzenie użytkownika przez sesję powtórek zaplanowanych fiszek zgodnie z logiką zewnętrznego algorytmu.
* **Kluczowe informacje do wyświetlenia:** Przód aktualnej fiszki, Przycisk do pokazania tyłu, Tył fiszki (po odsłonięciu), Przyciski oceny odpowiedzi (np. "Łatwe", "Trudne", "Powtórz" - zależne od algorytmu).
* **Kluczowe komponenty widoku:** `ReviewCard` (React), `Button` (Shadcn/ui - "Pokaż odpowiedź", przyciski oceny). (Szczegóły TBD - zależne od wybranego algorytmu/biblioteki).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Prosty, skoncentrowany interfejs. Płynne przechodzenie między fiszkami. Jasne instrukcje.
  * Dostępność: Obsługa klawiatury do odsłaniania odpowiedzi i oceniania. Czytelny tekst fiszek.
  * Bezpieczeństwo: Interakcja z algorytmem powtórek odbywa się po stronie klienta lub przez API, w zależności od implementacji algorytmu.

### Widok: Ustawienia Konta

* **Ścieżka widoku:** `/settings`
* **Główny cel:** Umożliwienie użytkownikowi zarządzania kontem, w tym jego usunięcia.
* **Kluczowe informacje do wyświetlenia:** Adres e-mail użytkownika, Przycisk "Usuń konto".
* **Kluczowe komponenty widoku:** `Button` (Shadcn/ui - "Usuń konto"), `Dialog` (Shadcn/ui - do potwierdzenia usunięcia).
* **UX, dostępność i względy bezpieczeństwa:**
  * UX: Prosty interfejs. Wymagane potwierdzenie przed usunięciem konta.
  * Dostępność: Poprawna obsługa klawiatury dla przycisku i dialogu potwierdzającego.
  * Bezpieczeństwo: Usunięcie konta wymaga potwierdzenia i jest obsługiwane przez bezpieczny endpoint API (`DELETE /api/users/me`).

## 3. Mapa podróży użytkownika

**Główny przepływ (Generowanie AI i Recenzja):**

1. **Logowanie/Rejestracja:** Użytkownik trafia na `/login` lub `/register`. Wprowadza dane, formularz jest walidowany (`LoginForm`/`RegisterForm`). Po sukcesie, middleware Astro ustawia ciasteczko i użytkownik jest przekierowywany na `/`.
2. **Panel Główny (Dashboard):** Użytkownik widzi `/`. Wkleja tekst do `AIGenerationForm` i klika "Generuj Fiszki". Wyświetlany jest stan ładowania. Hook `useAIGeneration` wysyła żądanie `POST /api/ai/generate`.
3. **Generowanie (Backend):** API endpoint przetwarza tekst, wywołuje AI, zapisuje kandydatów w Supabase.
4. **Informacja zwrotna:** Po sukcesie API zwraca listę kandydatów (lub pustą listę). Hook `useAIGeneration` aktualizuje stan. Użytkownik może otrzymać powiadomienie `Toast`.
5. **Recenzja Kandydatów:**
    * **Akceptacja:** Użytkownik klika "Akceptuj" na `AICandidateListItem`. Wywoływane jest żądanie `POST /api/ai-candidates/{id}/accept`. Kandydat znika z listy. Może pojawić się `Toast` potwierdzający.
    * **Odrzucenie:** Użytkownik klika "Odrzuć". Wywoływane jest żądanie `DELETE /api/ai-candidates/{id}`. Kandydat znika z listy.
    * **Edycja:** Użytkownik klika "Edytuj". Pojawiają się pola inline-edit `FlashcardForm` na fiszcze przód i tył z wypełnionym danymi kandydata. Użytkownik edytuje, walidacja działa. Klika "Zapisz". Wywoływane jest żądanie`PUT /api/ai-candidates/{id}`. Edycja inline się zamyka.
6. **Moje Fiszki:** Użytkownik przechodzi na `/flashcards`. Widzi zaakceptowane fiszki (`FlashcardList` / `FlashcardListItem`). Hook `useFlashcards` pobiera dane przez `GET /api/flashcards`.
7. **Zarządzanie Fiszkami:** Użytkownik może edytować (podobnie jak kandydata, inline-edit z `FlashcardForm`, wywołując `PUT /api/flashcards/{id}`) lub usuwać (przycisk "Usuń", `Dialog` potwierdzający, wywołanie `DELETE /api/flashcards/{id}`).
8. **Sesja Powtórek:** Użytkownik przechodzi na `/review` (np. przez link w pasku bocznym) i rozpoczyna sesję.

**Przepływ Manualnego Tworzenia:**

1. **Logowanie:** Jak wyżej.
2. **Moje Fiszki:** Użytkownik przechodzi na `/flashcards`.
3. **Inicjacja Tworzenia:** Klika przycisk "Dodaj manualnie". Otwiera się `Dialog` z pustym `FlashcardForm`.
4. **Wypełnianie Formularza:** Użytkownik wpisuje tekst przodu i tyłu. Liczniki znaków i walidacja działają.
5. **Zapis:** Klika "Zapisz". Wywoływane jest żądanie `POST /api/flashcards`.
6. **Informacja zwrotna:** Dialog się zamyka, lista fiszek jest odświeżana, nowa fiszka jest widoczna. Może pojawić się `Toast` potwierdzający.

## 4. Układ i struktura nawigacji

* **Główny Układ (`src/layouts/Layout.astro`):** Definiuje ogólną strukturę strony, w tym stały pasek boczny (sidebar) i obszar na treść główną dla poszczególnych widoków. Zawiera również globalne elementy, takie jak kontener na `Toast`.
* **Pasek Boczny (Sidebar):** Zaimplementowany jako komponent React (`SidebarNav`) używający `NavMenu` z Shadcn/ui. Zawiera linki nawigacyjne do głównych widoków:
  * Panel Główny (`/`)
  * Moje Fiszki (`/flashcards`)
  * Sesja Powtórek (`/review`)
  * Ustawienia (`/settings`)
  * Wyloguj (przycisk/link wywołujący endpoint API do wylogowania lub czyszczący stan po stronie klienta, jeśli to konieczne - choć główna logika jest serwerowa).
* **Routing:** Obsługiwany przez Astro (file-based routing w `src/pages`). Middleware (`src/middleware/index.ts`) przechwytuje żądania, sprawdza uwierzytelnienie (JWT w ciasteczku) i przekierowuje na `/login`, jeśli użytkownik nie jest zalogowany, a próbuje uzyskać dostęp do chronionego widoku.

## 5. Kluczowe komponenty

* **`Layout.astro`:** Główny szablon strony, zawiera `SidebarNav` i slot na treść strony.
* **`SidebarNav` (React):** Komponent paska bocznego z linkami nawigacyjnymi (`NavMenu` Shadcn/ui).
* **`FlashcardForm` (React):** Formularz do tworzenia/edycji fiszek (manualnych i kandydatów AI). Używa `react-hook-form`, Zod, `Input`, `Textarea`, `Button`, liczników znaków.
* **`AIGenerationForm` (React):** Formularz na Dashboardzie do wklejania tekstu i inicjowania generowania AI. Używa `Textarea`, `Button`.
* **`FlashcardList` / `AICandidateList` (React):** Komponenty renderujące listy fiszek/kandydatów, obsługujące paginację i sortowanie. Wykorzystują `useFlashcards`/`useAICandidates`.
* **`FlashcardListItem` / `AICandidateListItem` (React):** Komponenty reprezentujące pojedynczy element na liście. Używają `Card` (Shadcn/ui) do wyświetlania treści (przód/tył fragment), wskaźnika źródła ('@' lub 'manual'/'ai') oraz przycisków akcji (`Button` - Edytuj, Usuń, Akceptuj, Odrzuć).
* **`Pagination` (Shadcn/ui):** Używany w `FlashcardList` i `AICandidateList`.
* **`DropdownMenu` / `Select` (Shadcn/ui):** Używane do sortowania w `FlashcardList` i `AICandidateList`.
* **`Dialog` (Shadcn/ui):** Używany do potwierdzeń (np. usunięcia) oraz jako kontener dla `FlashcardForm` przy tworzeniu/edycji.
* **`Toast` (Shadcn/ui):** Używany globalnie do wyświetlania powiadomień o sukcesie lub błędach operacji API.
* **Hooki niestandardowe (React):**
  * `useAuth()`: (Może nie być potrzebny bezpośrednio w UI, gdyż stan jest serwerowy, ale może zarządzać stanem ładowania logowania/rejestracji).
  * `useFlashcards()`: Pobiera listę fiszek (`GET /api/flashcards`), obsługuje paginację, sortowanie, stan ładowania/błędu. Udostępnia funkcje do tworzenia (`POST /api/flashcards`), aktualizacji (`PUT /api/flashcards/{id}`), usuwania (`DELETE /api/flashcards/{id}`).
  * `useAICandidates()`: Pobiera listę kandydatów (`GET /api/ai-candidates`), obsługuje paginację, sortowanie, stan ładowania/błędu. Udostępnia funkcje do aktualizacji (`PUT /api/ai-candidates/{id}`), akceptacji (`POST /api/ai-candidates/{id}/accept`), odrzucenia (`DELETE /api/ai-candidates/{id}`).
  * `useAIGeneration()`: Obsługuje wysyłanie tekstu do generowania (`POST /api/ai/generate`), zarządza stanem ładowania/błędu.
  * `useDeleteUser()`: Obsługuje żądanie usunięcia konta (`DELETE /api/users/me`).
