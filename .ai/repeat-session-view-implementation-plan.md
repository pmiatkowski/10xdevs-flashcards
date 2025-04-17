# Plan implementacji widoku Sesja Powtórek

## 1. Przegląd

Widok "Sesja Powtórek" (`/review`) umożliwia zalogowanym użytkownikom przeprowadzanie sesji nauki z wykorzystaniem algorytmu Spaced Repetition (SR). Użytkownikowi prezentowane są kolejno fiszki zaplanowane do powtórki. Widok pokazuje przód fiszki, pozwala odsłonić tył, a następnie ocenić łatwość przypomnienia sobie odpowiedzi, co wpływa na harmonogram przyszłych powtórek. Sesja trwa do momentu przejrzenia wszystkich zaplanowanych na dany moment fiszek.

## 2. Routing widoku

Widok powinien być dostępny pod ścieżką `/review`. Dostęp do tej ścieżki musi być chroniony i możliwy tylko dla zalogowanych użytkowników (realizowane przez middleware).

## 3. Struktura komponentów

```

src/pages/review.astro
└── src/components/ReviewSession.tsx (client:load)
    ├── src/components/ReviewCard.tsx
    │   └── (Wyświetla tekst przodu/tyłu fiszki)
    ├── button.tsx (Przycisk "Pokaż odpowiedź")
    └── src/components/ui/button.tsx[] (Przyciski oceny: np. "Łatwe", "Trudne", "Powtórz")

```

## 4. Szczegóły komponentów

### `ReviewPage.astro` (`src/pages/review.astro`)

- **Opis komponentu:** Strona Astro hostująca sesję powtórek. Odpowiada za routing i renderowanie głównego komponentu React. Zakłada się, że middleware (`src/middleware/index.ts`) obsłuży przekierowanie niezalogowanych użytkowników.
- **Główne elementy:** Renderuje komponent `<ReviewSession client:load />`.
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji użytkownika.
- **Obsługiwana walidacja:** Sprawdzenie statusu logowania (delegowane do middleware).
- **Typy:** Brak specyficznych typów dla tej strony.
- **Propsy:** Brak.

### `ReviewSession.tsx` (`src/components/ReviewSession.tsx`)

- **Opis komponentu:** Główny komponent React zarządzający logiką sesji powtórek. Odpowiada za:
  - Pobranie fiszek użytkownika.
  - Inicjalizację i interakcję z wybraną biblioteką/logiką Spaced Repetition (SR).
  - Zarządzanie stanem sesji (ładowanie, błędy, aktualna fiszka, widoczność odpowiedzi, zakończenie sesji).
  - Renderowanie komponentu `ReviewCard` dla aktualnej fiszki.
  - Renderowanie przycisku "Pokaż odpowiedź".
  - Renderowanie przycisków oceny po odsłonięciu odpowiedzi.
  - Obsługę akcji użytkownika (odsłonięcie odpowiedzi, ocena).
- **Główne elementy:** `div` (kontener), `ReviewCard`, `Button` ("Pokaż odpowiedź"), `Button[]` (przyciski oceny). Warunkowo renderuje wskaźnik ładowania, komunikaty o błędach lub komunikat o zakończeniu sesji.
- **Obsługiwane interakcje:**
  - Kliknięcie przycisku "Pokaż odpowiedź".
  - Kliknięcie jednego z przycisków oceny.
- **Obsługiwana walidacja:**
  - Sprawdzenie, czy dane fiszek zostały załadowane.
  - Sprawdzenie, czy sesja nie została zakończona.
  - Sprawdzenie, czy odpowiedź została odsłonięta przed umożliwieniem oceny.
- **Typy:** `FlashcardDTO[]`, `ReviewSessionState`, `CurrentCardViewModel`.
- **Propsy:** Brak (komponent ładowany z `client:load`).

### `ReviewCard.tsx` (`src/components/ReviewCard.tsx`)

- **Opis komponentu:** Komponent React odpowiedzialny za wyświetlanie treści pojedynczej fiszki (przodu i tyłu).
- **Główne elementy:** `div` (kontener karty), `div` (przód fiszki), `div` (tył fiszki - warunkowo renderowany).
- **Obsługiwane interakcje:** Brak bezpośrednich interakcji (kontrolowane przez rodzica).
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardDTO`, `boolean` (dla widoczności tyłu).
- **Propsy:**

    ```typescript
    interface ReviewCardProps {
      card: FlashcardDTO | null; // Aktualnie wyświetlana fiszka
      isBackVisible: boolean; // Czy tył fiszki ma być widoczny
    }
    ```

### `Button` (`src/components/ui/button.tsx`)

- **Opis komponentu:** Standardowy komponent przycisku z biblioteki Shadcn/ui.
- **Główne elementy:** Element `<button>`.
- **Obsługiwane interakcje:** `onClick`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Standardowe propsy HTML dla przycisku + warianty Shadcn.
- **Propsy:** Standardowe propsy przycisku (np. `onClick`, `children`, `variant`, `disabled`).

## 5. Typy

- **`FlashcardDTO` (z `src/types.ts`):** Podstawowy typ danych dla fiszki pobieranej z API.

  ```typescript
  // filepath: src/types.ts
  export interface FlashcardDTO {
    id: string;
    front_text: string;
    back_text: string;
    source: string; // 'manual' | 'ai'
    created_at: string;
    updated_at: string;
    // UWAGA: Brak pól specyficznych dla SR (np. dueDate, interval, easeFactor)
  }
  ```

- **`ReviewSessionState` (stan wewnętrzny `ReviewSession.tsx` lub hooka `useReviewSession`):**

  ```typescript
  interface ReviewSessionState {
    isLoading: boolean; // Czy trwa ładowanie fiszek
    error: string | null; // Komunikat błędu
    allFlashcards: FlashcardDTO[]; // Wszystkie pobrane fiszki użytkownika
    reviewQueue: FlashcardDTO[]; // Fiszki do powtórki w tej sesji (określone przez SR)
    currentCardIndex: number; // Indeks aktualnej fiszki w reviewQueue
    isBackVisible: boolean; // Czy tył aktualnej fiszki jest widoczny
    isSessionComplete: boolean; // Czy sesja została zakończona
    // srAlgorithmState: any; // Wewnętrzny stan algorytmu SR (zależny od biblioteki)
  }
  ```

- **`CurrentCardViewModel` (stan pochodny w `ReviewSession.tsx`):**

  ```typescript
  interface CurrentCardViewModel {
    card: FlashcardDTO | null; // Aktualna fiszka lub null
    showRatingButtons: boolean; // Czy pokazać przyciski oceny (gdy isBackVisible = true)
  }
  ```

- **`FlashcardWithSRData` (Typ koncepcyjny - **wymaga zmian backendowych**):**
  - **Opis:** Reprezentuje fiszkę wraz z danymi wymaganymi przez algorytm SR. Obecnie te dane nie są dostępne w bazie ani API.
  - **Potencjalne pola:** `flashcardId: string`, `dueDate: Date`, `interval: number`, `easeFactor: number`, `repetitions: number`.
  - **Obejście:** W pierwszej implementacji stan SR będzie zarządzany wyłącznie po stronie klienta (np. w `localStorage`), powiązany z `FlashcardDTO.id`.

## 6. Zarządzanie stanem

Cała logika i stan sesji powtórek będą zarządzane wewnątrz komponentu `ReviewSession.tsx`. Zalecane jest stworzenie dedykowanego hooka `useReviewSession` w celu enkapsulacji tej logiki:

- **`useReviewSession(initialFlashcards: FlashcardDTO[])`:**
  - **Cel:** Zarządzanie cyklem życia sesji powtórek.
  - **Odpowiedzialności:**
    - Inicjalizacja wybranej biblioteki SR (np. `ts-fsrs`) z pobranymi fiszkami i stanem SR (załadowanym np. z `localStorage`).
    - Określenie kolejki fiszek do powtórki (`reviewQueue`).
    - Udostępnianie aktualnej fiszki (`currentCard`).
    - Zarządzanie widocznością odpowiedzi (`isBackVisible`, funkcja `showAnswer`).
    - Obsługa ocen użytkownika (funkcja `rateCard(rating)`), aktualizacja stanu SR dla fiszki (i zapis np. w `localStorage`), przejście do następnej fiszki.
    - Zarządzanie stanami `isLoading`, `error`, `isSessionComplete`.
    - Udostępnianie dostępnych opcji oceny (`ratingOptions`) zgodnych z algorytmem SR.
  - **Zwracane wartości:** `{ currentCard, isBackVisible, showAnswer, rateCard, isLoading, error, isSessionComplete, ratingOptions }`.

Stan SR (dueDate, interval, easeFactor itp.) dla każdej fiszki będzie tymczasowo przechowywany w `localStorage`, powiązany z `FlashcardDTO.id`, do czasu wprowadzenia odpowiednich zmian w backendzie.

## 7. Integracja API

- **Endpoint:** `GET /api/flashcards`
- **Cel:** Pobranie wszystkich fiszek należących do zalogowanego użytkownika.
- **Wywołanie:** W hooku `useEffect` komponentu `ReviewSession.tsx` (lub wewnątrz hooka `useReviewSession`) po zamontowaniu komponentu. Należy rozważyć pobranie wszystkich fiszek (bez paginacji lub z dużym `limit`), ponieważ obecny endpoint nie wspiera filtrowania po dacie powtórki.
- **Typy:**
  - **Żądanie:** Brak ciała. Parametry zapytania (opcjonalne): `limit`, `offset`, `sortBy`, `order`.
  - **Odpowiedź (Sukces - 200 OK):**

      ```typescript
      // Zgodnie z implementacją endpointu
      interface GetFlashcardsResponse {
        data: FlashcardDTO[];
        total: number;
      }
      ```

  - **Odpowiedź (Błąd):** `401 Unauthorized`, `500 Internal Server Error` (zgodnie z `formatError`).
- **Obsługa odpowiedzi:**
  - Po pomyślnym pobraniu (`200 OK`): Zaktualizuj stan `allFlashcards`, zainicjuj algorytm SR, określ `reviewQueue`, ustaw `isLoading = false`.
  - W przypadku błędu (`401`, `500`, błąd sieci): Ustaw stan `error` z odpowiednim komunikatem, ustaw `isLoading = false`.

## 8. Interakcje użytkownika

- **Rozpoczęcie sesji:** Użytkownik nawiguje do `/review`. Komponent `ReviewSession` ładuje dane i wyświetla pierwszą fiszkę (przód).
- **Odsłonięcie odpowiedzi:** Użytkownik klika przycisk "Pokaż odpowiedź". Stan `isBackVisible` zmienia się na `true`, `ReviewCard` pokazuje tył fiszki, pojawiają się przyciski oceny.
- **Ocena odpowiedzi:** Użytkownik klika jeden z przycisków oceny (np. "Łatwe", "Trudne"). Wywoływana jest funkcja `rateCard` z hooka `useReviewSession`, która:
  - Aktualizuje stan SR dla bieżącej fiszki (i zapisuje go np. w `localStorage`).
  - Przesuwa wskaźnik `currentCardIndex` na następną fiszkę w `reviewQueue`.
  - Resetuje `isBackVisible` na `false`.
  - Jeśli nie ma więcej fiszek w `reviewQueue`, ustawia `isSessionComplete` na `true`.
- **Zakończenie sesji:** Gdy `isSessionComplete` jest `true`, wyświetlany jest komunikat o zakończeniu sesji. Użytkownik może opuścić widok nawigując gdzie indziej.
- **Obsługa klawiatury (do implementacji):**
  - Np. `Spacja` do odsłonięcia odpowiedzi.
  - Np. Klawisze numeryczne `1`, `2`, `3`... do wyboru oceny.

## 9. Warunki i walidacja

- **Dostęp do widoku:** Chroniony przez middleware (`src/middleware/index.ts`), który sprawdza `Astro.locals.session`. Niezalogowani użytkownicy są przekierowywani.
- **Ładowanie danych:** Komponent `ReviewSession` wyświetla wskaźnik ładowania (`isLoading === true`), dopóki dane z API nie zostaną pobrane i algorytm SR zainicjalizowany.
- **Brak fiszek:** Jeśli API zwróci pustą listę fiszek lub algorytm SR nie znajdzie żadnych fiszek do powtórki, wyświetlany jest odpowiedni komunikat (np. "Brak fiszek do powtórki na dziś.").
- **Dostępność akcji:**
  - Przycisk "Pokaż odpowiedź" jest aktywny tylko gdy `isLoading === false`, `error === null`, `isSessionComplete === false` i `isBackVisible === false`.
  - Przyciski oceny są widoczne i aktywne tylko gdy `isLoading === false`, `error === null`, `isSessionComplete === false` i `isBackVisible === true`.

## 10. Obsługa błędów

- **Błąd pobierania fiszek (API):** Jeśli wywołanie `GET /api/flashcards` zakończy się błędem (np. 500, błąd sieci), stan `error` w `ReviewSession` jest ustawiany. Komponent powinien wyświetlić użytkownikowi komunikat o błędzie (np. "Wystąpił błąd podczas ładowania sesji powtórek. Spróbuj ponownie później.") i ukryć interfejs sesji.
- **Błąd inicjalizacji/działania algorytmu SR:** Błędy zgłaszane przez bibliotekę SR powinny być przechwytywane w hooku `useReviewSession`, stan `error` ustawiany, a użytkownik informowany o problemie.
- **Brak fiszek / Brak fiszek do powtórki:** Nie jest to błąd sensu stricto, ale stan, który należy obsłużyć, wyświetlając odpowiedni komunikat zamiast interfejsu sesji.

## 11. Kroki implementacji

1. **Utwórz stronę Astro:** Stwórz plik `src/pages/review.astro`. Upewnij się, że middleware chroni tę trasę.
2. **Utwórz komponent React `ReviewSession`:** Stwórz plik `src/components/ReviewSession.tsx`. Dodaj podstawową strukturę JSX (kontener, miejsce na kartę i przyciski). Renderuj go w `review.astro` z dyrektywą `client:load`.
3. **Utwórz komponent React `ReviewCard`:** Stwórz plik `src/components/ReviewCard.tsx`. Zaimplementuj logikę wyświetlania przodu i warunkowego wyświetlania tyłu na podstawie propsów `card` i `isBackVisible`. Ostyluj kartę używając Tailwind.
4. **Zaimplementuj pobieranie danych:** W `ReviewSession.tsx` (lub w hooku `useReviewSession`), użyj `useEffect` do wywołania `fetch('/api/flashcards')` po zamontowaniu komponentu. Obsłuż stany ładowania (`isLoading`) i błędu (`error`). Zapisz pobrane fiszki w stanie (`allFlashcards`).
5. **Wybierz i zintegruj bibliotekę SR:** Wybierz bibliotekę JavaScript/TypeScript do Spaced Repetition (np. `ts-fsrs`). Zintegruj ją w `ReviewSession.tsx` (lub w hooku `useReviewSession`).
6. **Zaimplementuj logikę sesji (w `useReviewSession`):**
    - Zainicjuj algorytm SR z pobranymi fiszkami (`allFlashcards`) i stanem SR załadowanym z `localStorage`.
    - Określ kolejkę powtórek (`reviewQueue`) na podstawie `dueDate` z algorytmu SR.
    - Zaimplementuj logikę wyboru `currentCard` na podstawie `currentCardIndex`.
    - Zaimplementuj funkcję `showAnswer` do zmiany `isBackVisible`.
    - Zaimplementuj funkcję `rateCard(rating)` do aktualizacji stanu SR w algorytmie, zapisu stanu SR w `localStorage` i przejścia do następnej karty lub zakończenia sesji (`isSessionComplete`).
7. **Dodaj interfejs użytkownika w `ReviewSession.tsx`:**
    - Renderuj `ReviewCard` przekazując `currentCard` i `isBackVisible`.
    - Dodaj przycisk "Pokaż odpowiedź" (`Button` z Shadcn/ui) i podepnij funkcję `showAnswer`. Ukryj go, gdy `isBackVisible` jest `true`.
    - Dodaj przyciski oceny (`Button` z Shadcn/ui) odpowiadające opcjom z algorytmu SR. Wyświetlaj je tylko gdy `isBackVisible` jest `true`. Podepnij funkcję `rateCard` do ich `onClick`.
    - Dodaj obsługę stanów `isLoading`, `error` i `isSessionComplete` (wyświetlanie spinnera, komunikatów o błędach lub zakończeniu sesji).
8. **Dodaj obsługę braku fiszek:** Jeśli `reviewQueue` jest puste po inicjalizacji, wyświetl odpowiedni komunikat.
9. **Styling:** Użyj Tailwind CSS do ostylowania komponentów `ReviewSession` i `ReviewCard` zgodnie z wytycznymi projektu i Shadcn/ui.
10. **Dostępność:** Zaimplementuj obsługę klawiatury dla kluczowych akcji (odsłanianie odpowiedzi, ocena). Upewnij się, że fokus jest zarządzany poprawnie.
11. **Testowanie:** Przetestuj różne scenariusze: pierwsza sesja, kolejne sesje, brak fiszek, błędy API, różne oceny.
12. **Refaktoryzacja:** Przejrzyj kod, wyodrębnij logikę do hooka `useReviewSession`, upewnij się, że kod jest zgodny z wytycznymi projektu.
