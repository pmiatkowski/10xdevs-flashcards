# Plan implementacji widoku "Moje Fiszki"

## 1. Przegląd

Widok "Moje Fiszki" umożliwia zalogowanemu użytkownikowi przeglądanie, edycję, usuwanie oraz tworzenie nowych manualnych fiszek. Użytkownik otrzymuje czytelną listę fiszek wraz z opcjami sortowania i paginacji, a operacje CRUD są potwierdzane komunikatami (Toast).

## 2. Routing widoku

Widok będzie dostępny pod ścieżką: `/flashcards` (dostępny tylko dla zalogowanych użytkowników).

## 3. Struktura komponentów

- **FlashcardList** (React) – główny komponent wyświetlający listę fiszek.
  - Zawiera: listę elementów (FlashcardListItem), komponent sortowania (DropdownMenu/Select), paginację (Pagination) oraz przycisk "Dodaj manualnie".
- **FlashcardListItem** (React) – pojedynczy element listy wyświetlający dane fiszki.
  - Wyświetla: przód, tył, źródło.
  - Obsługuje: tryb edycji inline z przyciskami "Edytuj" i "Usuń".
- **Pagination** (Shadcn/ui) – nawigacja po stronach listy.
- **DropdownMenu/Select** (Shadcn/ui) – wybór kryteriów sortowania.
- **Button** (Shadcn/ui) – przyciski operacyjne ("Dodaj manualnie", "Edytuj", "Usuń").
- **Toast** (Shadcn/ui) – komunikaty błędów i potwierdzeń operacji.

## 4. Szczegóły komponentów

### FlashcardList

- **Opis:** Pobiera dane fiszek z API i wyświetla je przy pomocy listy FlashcardListItem.
- **Główne elementy:**
  - Lista komponentów FlashcardListItem.
  - Komponent sortowania (DropdownMenu/Select).
  - Komponent paginacji (Pagination).
  - Przycisk "Dodaj manualnie", otwierający formularz dodania nowej fiszki.
- **Obsługiwane interakcje:**
  - Zmiana opcji sortowania – aktualizacja listy.
  - Nawigacja paginacyjna – zmiana strony i pobranie odpowiednich danych.
  - Dodanie nowej fiszki – wywołanie funkcji API POST.
- **Warunki walidacji:**
  - Sprawdzenie limitu znaków (przód: 200, tył: 500) dla dodawanych/edycji fiszek.
- **Typy:**
  - Użycie FlashcardDTO (z pliku types.ts).
- **Propsy:**
  - Lista fiszek: FlashcardDTO[].
  - Callbacki operacji CRUD oraz funkcje zmiany strony i sortowania.

### FlashcardListItem

- **Opis:** Reprezentuje jedną fiszkę, umożliwiając edycję inline.
- **Główne elementy:**
  - Wyświetlenie danych fiszki (przód, tył, źródło).
  - Ikony/przyciski: "Edytuj" (przełączenie na tryb edycji) oraz "Usuń" (usuniecie fiszki).
  - Formularz edycji inline z licznikami znaków.
- **Obsługiwane interakcje:**
  - Kliknięcie "Edytuj" – przełączenie w tryb edycji.
  - Zmiana treści – aktualizacja lokalnego stanu (ViewModel) oraz walidacja długości.
  - Kliknięcie "Zapisz" – wywołanie API PUT.
  - Kliknięcie "Usuń" – wywołanie API DELETE (możliwe potwierdzenie).
- **Warunki walidacji:**
  - Przód: max 200 znaków, Tył: max 500 znaków.
- **Typy:**
  - FlashcardDTO oraz lokalny typ EditFlashcardViewModel (pola: front_text, back_text, isEditing, charCountFront, charCountBack).
- **Propsy:**
  - Pojedyncza fiszka: FlashcardDTO.
  - Callbacki dla akcji edycji i usunięcia.

### Pagination

- **Opis:** Umożliwia użytkownikowi nawigację między stronami listy.
- **Główne elementy:**
  - Przyciski nawigacyjne („poprzednia”, „następna”), wyświetlenie bieżącej strony.
- **Obsługiwane interakcje:**
  - Kliknięcie przemieszcza użytkownika na inną stronę listy.
- **Propsy:**
  - currentPage, totalItems, itemsPerPage, onPageChange.

### Sortowanie (DropdownMenu/Select)

- **Opis:** Umożliwia sortowanie listy fiszek według wybranego pola (np. created_at, updated_at).
- **Obsługiwane interakcje:**
  - Wybór opcji sortowania powoduje aktualizację danych.
- **Propsy:**
  - selectedSort, onSortChange.

### Button & Toast

- **Opis:** Standardowe przyciski i komponent do wyświetlania komunikatów.
- **Obsługiwane interakcje:**
  - Kliknięcia przycisków inicjują odpowiednie akcje (np. dodawanie, edycja, usuwanie).
  - Toast automatycznie znika po określonym czasie lub przy zamknięciu.

## 5. Typy

- **FlashcardDTO:** (id, front_text, back_text, source, created_at, updated_at) – używany do obrazowania danych pobieranych z API.
- **EditFlashcardViewModel:**
  - front_text: string
  - back_text: string
  - isEditing: boolean
  - charCountFront: number
  - charCountBack: number
- Dodatkowe typy dla paginacji i sortowania (PaginationProps, SortProps) zgodnie z używanymi komponentami Shadcn/ui.

## 6. Zarządzanie stanem

- Użycie stanu lokalnego w komponencie FlashcardList do przechowywania:
  - Listy fizyczek.
  - Parametrów sortowania i bieżącej strony.
  - Stanu ładowania oraz ewentualnych błędów.
- Stworzenie customowego hooka (useFlashcards) do obsługi wywołań API (GET, POST, PUT, DELETE) oraz aktualizacji lokalnego stanu.
- Zarządzanie stanem edycji wewnątrz FlashcardListItem (tryb edycji, licznik znaków).

## 7. Integracja API

- **GET `/api/flashcards`** – pobranie listy fiszek z uwzględnieniem parametrów paginacji i sortowania.
- **POST `/api/flashcards`** – tworzenie nowej manualnej fiszki; przekazywany payload: { flashcards: [{ front_text, back_text }] }.
- **PUT `/api/flashcards/{flashcardId}`** – aktualizacja istniejącej fiszki; payload: { front_text, back_text }.
- **DELETE `/api/flashcards/{flashcardId}`** – usunięcie fiszki.
- Mapowanie odpowiedzi do typu FlashcardDTO (zdefiniowanego w types.ts) i obsługa błędów (wyświetlanie Toast).

## 8. Interakcje użytkownika

- **Przeglądanie fiszek:** Lista jest dynamicznie ładowana, z widocznym stanem ładowania oraz komunikatem w przypadku pustej listy.
- **Dodawanie fiszki:** Kliknięcie przycisku "Dodaj manualnie" otwiera formularz inline, po wprowadzeniu danych wywoływany jest POST.
- **Edycja fiszki:** Kliknięcie "Edytuj" przełącza dany element w tryb edycji, umożliwiając modyfikację oraz wyświetlanie liczników znaków. Przy zapisie wywoływane jest API PUT, a w przypadku błędów wyświetlany jest Toast.
- **Usuwanie fiszki:** Kliknięcie "Usuń" inicjuje operację usunięcia, która po potwierdzeniu wywołuje API DELETE i aktualizuje listę.
- **Sortowanie i paginacja:** Zmiany w opcjach sortowania lub nawigacji powodują odświeżenie danych.

## 9. Warunki i walidacja

- Walidacja limitu znaków dla pól: przód (max 200), tył (max 500).
- Użycie walidacji po stronie klienta (Zod) przed wysłaniem danych do API.
- Sprawdzanie statusów odpowiedzi API (np. 400, 401, 500) z obsługą Toast przy błędach.
- Widok dostępny tylko po autoryzacji – weryfikacja odbywa się poprzez middleware.

## 10. Obsługa błędów

- W przypadku niepowodzenia operacji CRUD wyświetlany jest Toast z komunikatem błędu.
- Błędy walidacji wejścia (przekroczenie limitu znaków) są wyświetlane inline przy polach formularza.
- Na poziomie listy, w razie problemów z API, wyświetlany jest komunikat informujący o błędzie pobierania danych.

## 11. Kroki implementacji

1. Utworzyć nową stronę widoku w katalogu `./src/pages` o ścieżce `/flashcards`.
2. Zaimplementować hook `useFlashcards` do pobierania danych z API oraz operacji CRUD.
3. Stworzyć komponent **FlashcardList**, który:
   - Pobiera listę fiszek przy pomocy hooka.
   - Renderuje listę przy użyciu komponentów **FlashcardListItem**.
   - Integruje komponenty sortowania i paginacji.
4. Zaimplementować komponent **FlashcardListItem** z trybem edycji inline:
   - Dodanie pól tekstowych z licznikami znaków.
   - Obsługę przycisków "Edytuj", "Zapisz" i "Usuń" z odpowiednimi callbackami.
5. Dodać przycisk "Dodaj manualnie" w komponencie **FlashcardList** oraz obsłużyć formularz dodawania nowej fiszki.
6. Zintegrować komponenty **Pagination** oraz **DropdownMenu/Select** do obsługi paginacji i sortowania.
7. Dodać walidację danych wejściowych przy użyciu Zod, zarówno przy dodawaniu, jak i edycji fiszek.
8. Zaimplementować wywołania API (GET, POST, PUT, DELETE) i mapować odpowiedzi do typu FlashcardDTO.
9. Dodać obsługę Toast do wyświetlania komunikatów o błędach i potwierdzeniach operacji.
10. Przetestować widok pod kątem UX, dostępności (ARIA, obsługa klawiatury) oraz poprawności operacji CRUD.
