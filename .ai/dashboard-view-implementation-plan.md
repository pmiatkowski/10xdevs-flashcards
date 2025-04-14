# Plan implementacji widoku Panelu Głównego (Dashboard)

## 1. Przegląd

Panel Główny (Dashboard) jest centralnym widokiem aplikacji Fiszki AI, **dostępnym zarówno dla zalogowanych użytkowników, jak i gości (niezalogowanych)**. Jego głównym celem jest umożliwienie szybkiego generowania propozycji fiszek (kandydatów) na podstawie wklejonego tekstu przy użyciu AI. **Zalogowani użytkownicy** mogą dodatkowo zarządzać tymi kandydatami (przeglądać, edytować, akceptować, odrzucać). **Goście** mogą jedynie generować i przeglądać kandydatów, z wezwaniem do zalogowania/rejestracji w celu zapisania lub edycji.

## 2. Routing widoku

Widok Panelu Głównego powinien być dostępny pod główną ścieżką aplikacji:

- Ścieżka: `/`
- Plik: `src/pages/index.astro`

## 3. Struktura komponentów

Widok będzie zaimplementowany z wykorzystaniem Astro dla strony i React dla części interaktywnych. Główna struktura komponentów React będzie następująca:

```

DashboardPage.astro (index.astro)
└── DashboardView.tsx (Główny kontener React)
    ├── AIGenerationForm.tsx (Formularz generowania)
    │   ├── Textarea (Shadcn/ui - pole na tekst źródłowy)
    │   └── Button (Shadcn/ui - przycisk "Generuj")
    ├── AICandidateList.tsx (Lista kandydatów)
    │   ├── Button (Shadcn/ui - przycisk "Akceptuj Wszystkie") // Tylko dla zalogowanych
    │   └── AICandidateListItem.tsx (Element listy - mapowany z tablicy kandydatów)
    │       ├── Ikona "@"
    │       ├── Div (wyświetlanie przodu/tyłu) LUB (dla zalogowanych w trybie edycji):
    │       │   ├── Textarea (Shadcn/ui - edycja przodu) + Licznik znaków
    │       │   └── Textarea (Shadcn/ui - edycja tyłu) + Licznik znaków
    │       ├── Button (Shadcn/ui - "Edytuj") // Tylko dla zalogowanych
    │       ├── Button (Shadcn/ui - "Akceptuj") // Tylko dla zalogowanych
    │       ├── Button (Shadcn/ui - "Odrzuć") // Tylko dla zalogowanych
    │       ├── Button (Shadcn/ui - "Zapisz zmiany") // Tylko dla zalogowanych, w trybie edycji
    │       └── Button (Shadcn/ui - "Anuluj") // Tylko dla zalogowanych, w trybie edycji
    └── CallToActionLogin.tsx (Wezwanie do logowania/rejestracji) // Tylko dla gości, po wygenerowaniu kandydatów

```

Komponenty React (`DashboardView`, `AIGenerationForm`, `AICandidateList`, `AICandidateListItem`, **`CallToActionLogin`**) zostaną umieszczone w katalogu `src/components/`.

## 4. Szczegóły komponentów

### `DashboardPage.astro` (`src/pages/index.astro`)

- **Opis:** Główny plik strony Astro dla ścieżki `/`. Renderuje `Layout.astro` i osadza główny komponent React (`DashboardView`). **Odpowiedzialny za pobranie stanu uwierzytelnienia użytkownika (np. z `Astro.locals.session` ustawionego przez middleware) i przekazanie go jako prop do `DashboardView`.**
- **Główne elementy:** `<Layout>`, `<DashboardView client:load isAuthenticated={isUserLoggedIn} />` (lub inna dyrektywa kliencka Astro).
- **Obsługiwane interakcje:** Brak bezpośrednich.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

### `DashboardView.tsx` (`src/components/DashboardView.tsx`)

- **Opis:** Główny kontener React dla widoku Dashboard. Zarządza stanem całego widoku, w tym listą kandydatów, stanami ładowania, błędami oraz obsługuje logikę wywołań API inicjowanych przez komponenty podrzędne. **Rozróżnia funkcjonalność dla zalogowanych użytkowników i gości na podstawie otrzymanego propsa `isAuthenticated`.**
- **Główne elementy:** Renderuje `<AIGenerationForm />`, `<AICandidateList />` **oraz warunkowo `<CallToActionLogin />` (dla gości po wygenerowaniu kandydatów)**. Wykorzystuje hook `useToast` z Shadcn/ui do wyświetlania powiadomień.
- **Obsługiwane interakcje:**
  - `handleGenerate(sourceText: string)`: Wywołuje API generowania (dostępne dla wszystkich).
  - `handleAccept(candidateId: string)`: Wywołuje API akceptacji (**tylko jeśli `isAuthenticated`**).
  - `handleReject(candidateId: string)`: Wywołuje API odrzucenia (**tylko jeśli `isAuthenticated`**).
  - `handleEditToggle(candidateId: string, isEditing: boolean)`: Przełącza tryb edycji dla kandydata (**tylko jeśli `isAuthenticated`**).
  - `handleEditChange(candidateId: string, field: 'front' | 'back', value: string)`: Aktualizuje tymczasową wartość edytowanego pola (**tylko jeśli `isAuthenticated`**).
  - `handleSaveEdit(candidateId: string)`: Wywołuje API aktualizacji kandydata (**tylko jeśli `isAuthenticated`**).
  - `handleAcceptAll()`: Wywołuje API akceptacji dla wszystkich kandydatów (**tylko jeśli `isAuthenticated`**).
  - **Logika zachowania stanu dla gości:** Przy inicjalizacji może próbować odczytać `sourceText` i `candidates` z Session Storage. Po wygenerowaniu kandydatów przez gościa, zapisuje `sourceText` i `candidates` do Session Storage. Po zalogowaniu/rejestracji (co spowoduje przeładowanie strony/komponentu z `isAuthenticated=true`), logika inicjalizacji może ponownie odczytać dane z Session Storage i wyczyścić je.
- **Obsługiwana walidacja:** Pośrednio, poprzez przekazywanie błędów walidacji (otrzymanych z API lub walidacji w `AICandidateListItem`) do stanu i potencjalnie wyświetlanie ich w `Toast`.
- **Typy:** `AICandidateViewModel[]`, `ApiErrorResponseDto`, `GenerateFlashcardCandidatesCommand`, `UpdateAICandidateCommand`.
- **Propsy:**
  - `isAuthenticated: boolean`: Wskazuje, czy użytkownik jest zalogowany.

### `AIGenerationForm.tsx` (`src/components/AIGenerationForm.tsx`)

- **Opis:** Komponent formularza do wprowadzania tekstu źródłowego i inicjowania generowania fiszek AI. **Dostępny dla wszystkich użytkowników.**
- **Główne elementy:** `Textarea` (Shadcn/ui) dla tekstu źródłowego, `Button` (Shadcn/ui) "Generuj". Może zawierać wskaźnik ładowania.
- **Obsługiwane interakcje:** Wprowadzanie tekstu, kliknięcie przycisku "Generuj".
- **Obsługiwana walidacja:** Opcjonalnie: prosta walidacja po stronie klienta (np. czy pole nie jest puste) przed wywołaniem `onSubmit`.
- **Typy:** Brak specyficznych.
- **Propsy:**
  - `onSubmit: (sourceText: string) => void`: Funkcja wywoływana po kliknięciu "Generuj".
  - `isLoading: boolean`: Wskazuje, czy trwa proces generowania.
  - `initialSourceText?: string`: Początkowy tekst do załadowania (np. z Session Storage dla gości).

### `AICandidateList.tsx` (`src/components/AICandidateList.tsx`)

- **Opis:** Komponent wyświetlający listę kandydatów na fiszki (`AICandidateListItem`). **Warunkowo renderuje przycisk "Akceptuj Wszystkie" tylko dla zalogowanych użytkowników.** Przekazuje stan uwierzytelnienia do elementów listy.
- **Główne elementy:** `Button` (Shadcn/ui) "Akceptuj Wszystkie" (**renderowany warunkowo**), lista elementów `AICandidateListItem` renderowana za pomocą `.map()`.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Akceptuj Wszystkie" (**tylko jeśli `isAuthenticated`**).
- **Obsługiwana walidacja:** Brak bezpośredniej. Sprawdza, czy istnieją kandydaci do wyświetlenia. Wyłącza przycisk "Akceptuj Wszystkie", jeśli którykolwiek kandydat jest w trybie edycji.
- **Typy:** `AICandidateViewModel[]`.
- **Propsy:**
  - `candidates: AICandidateViewModel[]`: Tablica kandydatów do wyświetlenia.
  - `isAuthenticated: boolean`: Wskazuje, czy użytkownik jest zalogowany.
  - `onAccept: (candidateId: string) => void`: Callback akceptacji.
  - `onReject: (candidateId: string) => void`: Callback odrzucenia.
  - `onEditToggle: (candidateId: string, isEditing: boolean) => void`: Callback przełączania edycji.
  - `onEditChange: (candidateId: string, field: 'front' | 'back', value: string) => void`: Callback zmiany wartości w edycji.
  - `onSaveEdit: (candidateId: string) => void`: Callback zapisu edycji.
  - `onAcceptAll: () => void`: Callback akceptacji wszystkich.
  - `isBulkLoading: boolean`: Wskazuje, czy trwa akcja "Akceptuj Wszystkie".

### `AICandidateListItem.tsx` (`src/components/AICandidateListItem.tsx`)

- **Opis:** Komponent reprezentujący pojedynczego kandydata na fiszkę na liście. Obsługuje dwa tryby: wyświetlania i edycji. **Przyciski akcji ("Edytuj", "Akceptuj", "Odrzuć", "Zapisz zmiany", "Anuluj") są widoczne i aktywne tylko dla zalogowanych użytkowników.**
- **Główne elementy:**
  - **Tryb wyświetlania:** Ikona "@", tekst `front_text` i `back_text`, przyciski "Edytuj", "Akceptuj", "Odrzuć" (Shadcn/ui `Button`) - **renderowane/aktywne warunkowo**.
  - **Tryb edycji (tylko dla zalogowanych):** `Textarea` (Shadcn/ui) dla `editedFront` z licznikiem znaków, `Textarea` (Shadcn/ui) dla `editedBack` z licznikiem znaków, komunikaty błędów walidacji, przyciski "Zapisz zmiany", "Anuluj" (Shadcn/ui `Button`). Wskaźnik ładowania dla akcji (save/accept/reject).
- **Obsługiwane interakcje:** Kliknięcie przycisków "Edytuj", "Akceptuj", "Odrzuć", "Zapisz zmiany", "Anuluj" (**tylko jeśli `isAuthenticated`**). Wprowadzanie tekstu w polach edycji (**tylko jeśli `isAuthenticated`**).
- **Obsługiwana walidacja:**
  - W trybie edycji, przed zapisem (**tylko jeśli `isAuthenticated`**):
    - `editedFront.length <= 200`: Sprawdzenie maksymalnej długości przodu.
    - `editedBack.length <= 500`: Sprawdzenie maksymalnej długości tyłu.
  - Wyświetlanie komunikatów o błędach walidacji przy polach.
- **Typy:** `AICandidateViewModel`, `UpdateAICandidateCommand`.
- **Propsy:**
  - `candidate: AICandidateViewModel`: Dane kandydata i jego stan UI.
  - `isAuthenticated: boolean`: Wskazuje, czy użytkownik jest zalogowany.
  - `onAccept: (candidateId: string) => void`: Callback akceptacji.
  - `onReject: (candidateId: string) => void`: Callback odrzucenia.
  - `onEditToggle: (candidateId: string, isEditing: boolean) => void`: Callback przełączania edycji.
  - `onEditChange: (candidateId: string, field: 'front' | 'back', value: string) => void`: Callback zmiany wartości w edycji.
  - `onSaveEdit: (candidateId: string) => void`: Callback zapisu edycji.

### `CallToActionLogin.tsx` (`src/components/CallToActionLogin.tsx`) (Nowy)

- **Opis:** Komponent wyświetlany dla niezalogowanych użytkowników po wygenerowaniu przez nich kandydatów. Zachęca do zalogowania się lub zarejestrowania w celu zapisania/edycji fiszek.
- **Główne elementy:** Tekst informacyjny, Link/Przycisk "Zaloguj się", Link/Przycisk "Zarejestruj się".
- **Obsługiwane interakcje:** Kliknięcie linków/przycisków nawigujących do `/login` i `/register`.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych.
- **Propsy:** Brak.

## 5. Typy

Oprócz istniejących typów DTO, potrzebny będzie ViewModel `AICandidateViewModel`:

```typescript
/**
 * AICandidateViewModel rozszerza AICandidateDTO o stan specyficzny dla interfejsu użytkownika.
 */
interface AICandidateViewModel extends AICandidateDTO {
  /** Wskazuje, czy kandydat jest aktualnie w trybie edycji (dotyczy tylko zalogowanych). */
  isEditing: boolean;
  /** Przechowuje tymczasową wartość pola 'przód' podczas edycji (dotyczy tylko zalogowanych). */
  editedFront: string;
  /** Przechowuje tymczasową wartość pola 'tył' podczas edycji (dotyczy tylko zalogowanych). */
  editedBack: string;
  /** Przechowuje błędy walidacji dla pól edycji (dotyczy tylko zalogowanych). */
  validationErrors?: { front?: string; back?: string };
  /** Wskazuje, czy trwa operacja zapisu/akceptacji/odrzucenia dla tego konkretnego elementu (dotyczy tylko zalogowanych). */
  isSaving?: boolean;
}
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany w głównym komponencie `DashboardView.tsx` przy użyciu hooków React (`useState`, `useCallback`, `useEffect`).

- **Główne stany:**
  - `candidates: AICandidateViewModel[]`: Lista kandydatów wraz z ich stanem UI.
  - `sourceText: string`: Tekst wprowadzony w formularzu generowania.
  - `isLoadingGeneration: boolean`: Stan ładowania dla głównego procesu generowania.
  - `generationError: ApiErrorResponseDto | string | null`: Błąd zwrócony podczas generowania.
  - `isBulkLoading: boolean`: Stan ładowania dla akcji "Akceptuj Wszystkie" (tylko dla zalogowanych).
  - `showLoginPrompt: boolean`: Wskazuje, czy pokazać `CallToActionLogin` (dla gości po generacji).

- **Podnoszenie stanu (State Lifting):** Stan `isEditing`, `editedFront`, `editedBack`, `validationErrors`, `isSaving` dla poszczególnych `AICandidateListItem` będzie zarządzany w `DashboardView` w ramach obiektu `AICandidateViewModel` w tablicy `candidates`.

- **Zarządzanie stanem dla gości:**
  - `useEffect` przy montowaniu `DashboardView`: Sprawdza `isAuthenticated`. Jeśli `false`, próbuje odczytać `sourceText` i `candidates` z `sessionStorage`. Jeśli dane istnieją, ustawia odpowiednie stany.
  - Po udanym wygenerowaniu kandydatów przez gościa (`handleGenerate`): Zapisuje `sourceText` i `candidates` do `sessionStorage`. Ustawia `showLoginPrompt = true`.
  - Po zalogowaniu/rejestracji: Strona prawdopodobnie się przeładuje, `DashboardView` zamontuje się z `isAuthenticated=true`. `useEffect` przy montowaniu może (opcjonalnie, jeśli chcemy automatycznie przywrócić) sprawdzić `sessionStorage`, załadować dane, a następnie **wyczyścić `sessionStorage`**, aby uniknąć ponownego ładowania przy kolejnych odświeżeniach. Alternatywnie, użytkownik po prostu widzi pusty dashboard po zalogowaniu. **Prostsze podejście: Nie przywracać automatycznie po logowaniu, gość musi wygenerować ponownie, jeśli chce.** Wtedy zapis do `sessionStorage` nie jest potrzebny. **Decyzja: Implementujemy bez automatycznego przywracania stanu dla gości po logowaniu (zgodnie z US-014, który mówi o zachowaniu stanu, ale nie precyzuje jak - najprościej jest wymagać ponownego wklejenia/generacji).** Zatem `sessionStorage` nie jest potrzebny do tego celu.

## 7. Integracja API

Integracja z API będzie realizowana za pomocą standardowej funkcji `fetch` w `DashboardView.tsx`. **Wywołania API modyfikujące dane (PUT, POST akceptacji, DELETE) będą wykonywane tylko, gdy `isAuthenticated === true`.**

- **Generowanie Kandydatów:**
  - Wywołanie: `POST /api/ai/generate` (dostępne dla wszystkich)
  - Request Body: `GenerateFlashcardCandidatesCommand` (`{ sourceText: string }`)
  - Response (Success 201): `GenerateAiCandidatesResponseDto` (`{ data: AICandidateDTO[] }`)
  - Response (Error): `ApiErrorResponseDto`
- **Aktualizacja Kandydata (Zapis Edycji):**
  - Wywołanie: `PUT /api/ai-candidates/{candidateId}` (**tylko jeśli `isAuthenticated`**)
  - Request Body: `UpdateAICandidateCommand` (`{ front_text: string, back_text: string }`)
  - Response (Success 200): `AICandidateDTO`
  - Response (Error): `ApiErrorResponseDto`
- **Akceptacja Kandydata:**
  - Wywołanie: `POST /api/ai-candidates/{candidateId}/accept` (**tylko jeśli `isAuthenticated`**)
  - Request Body: Brak
  - Response (Success 201): `FlashcardDTO`
  - Response (Error): `ApiErrorResponseDto`
- **Odrzucenie Kandydata:**
  - Wywołanie: `DELETE /api/ai-candidates/{candidateId}` (**tylko jeśli `isAuthenticated`**)
  - Request Body: Brak
  - Response (Success 204): Brak treści
  - Response (Error): `ApiErrorResponseDto`
- **Akceptacja Wszystkich:**
  - Wywołanie: Seria wywołań `POST /api/ai-candidates/{candidateId}/accept` (**tylko jeśli `isAuthenticated`**).

Należy obsłużyć różne kody statusu odpowiedzi i odpowiednio aktualizować stan UI oraz wyświetlać komunikaty dla użytkownika za pomocą `Toast`.

## 8. Interakcje użytkownika

- **Wpisanie tekstu w polu źródłowym:** Aktualizacja stanu pola tekstowego.
- **Kliknięcie "Generuj":** Ustawienie `isLoadingGeneration = true`, wywołanie API. Po odpowiedzi: aktualizacja listy `candidates` lub wyświetlenie błędu w `Toast`, `isLoadingGeneration = false`. **Jeśli `!isAuthenticated`, ustaw `showLoginPrompt = true` po sukcesie.**
- **Kliknięcie "Edytuj" na kandydacie:** (**Tylko jeśli `isAuthenticated`**) Aktualizacja stanu `isEditing = true` dla kandydata, skopiowanie `front_text`/`back_text` do `editedFront`/`editedBack`.
- **Wpisanie tekstu w polach edycji:** (**Tylko jeśli `isAuthenticated`**) Aktualizacja `editedFront`/`editedBack` i `validationErrors`.
- **Kliknięcie "Anuluj" w trybie edycji:** (**Tylko jeśli `isAuthenticated`**) Ustawienie `isEditing = false`.
- **Kliknięcie "Zapisz zmiany" w trybie edycji:** (**Tylko jeśli `isAuthenticated`**) Walidacja długości. Jeśli poprawna: `isSaving = true`, wywołanie `PUT` API. Po odpowiedzi: aktualizacja danych, `isEditing = false`, `isSaving = false`, `Toast`. Jeśli niepoprawna: `validationErrors`.
- **Kliknięcie "Akceptuj" na kandydacie:** (**Tylko jeśli `isAuthenticated`**) `isSaving = true`, wywołanie `POST .../accept` API. Po odpowiedzi: usunięcie kandydata, `isSaving = false`, `Toast`.
- **Kliknięcie "Odrzuć" na kandydacie:** (**Tylko jeśli `isAuthenticated`**) `isSaving = true`, wywołanie `DELETE` API. Po odpowiedzi: usunięcie kandydata, `isSaving = false`, `Toast`.
- **Kliknięcie "Akceptuj Wszystkie":** (**Tylko jeśli `isAuthenticated`**) `isBulkLoading = true`, wywołanie serii `POST .../accept` API. Po zakończeniu: aktualizacja `candidates`, `isBulkLoading = false`, `Toast`.
- **Wyświetlenie `CallToActionLogin`:** Komponent pojawia się dla gości (`!isAuthenticated`) po pomyślnym wygenerowaniu kandydatów (`candidates.length > 0`).

## 9. Warunki i walidacja

- **Formularz generowania:** Pole tekstowe nie powinno być puste.
- **Edycja kandydata (`AICandidateListItem`):**
  - Maksymalna długość `editedFront`: 200 znaków.
  - Maksymalna długość `editedBack`: 500 znaków.
  - Walidacja przeprowadzana po stronie klienta przed próbą zapisu (**tylko jeśli `isAuthenticated`**).
  - Błędy walidacji wyświetlane przy polach.
  - Próba zapisu blokowana, jeśli walidacja nie przejdzie.
- **Przyciski akcji (`AICandidateListItem`, `AICandidateList`):** Przyciski "Edytuj", "Akceptuj", "Odrzuć", "Zapisz zmiany", "Anuluj", "Akceptuj Wszystkie" są **wyłączone lub ukryte**, jeśli `isAuthenticated === false`.
- **Przycisk "Akceptuj Wszystkie":** Dodatkowo wyłączony, jeśli jakikolwiek kandydat jest w trybie edycji.

## 10. Obsługa błędów

- **Błędy API:** Jak poprzednio, obsługa w `DashboardView` z użyciem `Toast`. Należy upewnić się, że stany ładowania są resetowane. Błąd 401/403 przy próbie akcji przez gościa nie powinien wystąpić, jeśli UI poprawnie blokuje te akcje, ale warto zabezpieczyć logikę API.
- **Błędy walidacji (edycja):** Obsługiwane lokalnie w `AICandidateListItem` (**tylko dla zalogowanych**).
- **Brak kandydatów:** Jak poprzednio, komunikat w `AICandidateList`.
- **Częściowe błędy (Akceptuj Wszystkie):** Jak poprzednio, obsługa w `DashboardView` (**tylko dla zalogowanych**).

## 11. Kroki implementacji

1. **Utworzenie plików komponentów:** Stwórz pliki `.tsx` dla `DashboardView`, `AIGenerationForm`, `AICandidateList`, `AICandidateListItem`, **`CallToActionLogin`**.
2. **Struktura `DashboardPage.astro`:** Zaktualizuj index.astro, aby pobierał stan `isAuthenticated` i przekazywał go do `<DashboardView client:load isAuthenticated={...} />`.
3. **Implementacja `AIGenerationForm`:** Zbuduj formularz. Dodaj prop `initialSourceText`.
4. **Implementacja `DashboardView` (szkielet):** Zdefiniuj stany. Dodaj prop `isAuthenticated`. Zaimplementuj podstawowe renderowanie `<AIGenerationForm>`, `<AICandidateList>` i warunkowe `<CallToActionLogin>`.
5. **Implementacja `CallToActionLogin`:** Zbuduj komponent z tekstem i linkami do logowania/rejestracji.
6. **Implementacja `AICandidateListItem` (tryb wyświetlania):** Zbuduj widok. Dodaj prop `isAuthenticated` i **warunkowo renderuj/wyłączaj przyciski akcji**.
7. **Implementacja `AICandidateList`:** Zbuduj komponent. Dodaj prop `isAuthenticated`. **Warunkowo renderuj przycisk "Akceptuj Wszystkie"**. Przekaż `isAuthenticated` do `AICandidateListItem`.
8. **Implementacja logiki generowania w `DashboardView`:** Zaimplementuj `handleGenerate`. Po sukcesie, jeśli `!isAuthenticated`, ustaw `showLoginPrompt = true`.
9. **Implementacja logiki akceptacji/odrzucenia w `DashboardView`:** Zaimplementuj `handleAccept` i `handleReject`, **dodając warunek `if (!isAuthenticated) return;` na początku**.
10. **Implementacja `AICandidateListItem` (tryb edycji):** Dodaj logikę przełączania do trybu edycji. **Upewnij się, że edycja jest możliwa tylko dla `isAuthenticated`**.
11. **Implementacja logiki edycji w `DashboardView`:** Zaimplementuj `handleEditToggle`, `handleEditChange`, `handleSaveEdit`, **dodając warunek `if (!isAuthenticated) return;` na początku funkcji inicjujących akcje**. Dodaj walidację klienta.
12. **Implementacja logiki "Akceptuj Wszystkie" w `DashboardView`:** Zaimplementuj `handleAcceptAll`, **dodając warunek `if (!isAuthenticated) return;` na początku**.
13. **Stylowanie i Dostępność:** Dopracuj wygląd. Upewnij się, że wyłączone/ukryte elementy dla gości są obsługiwane poprawnie.
14. **Testowanie:** Przetestuj oba przepływy (zalogowany i gość), w tym generowanie, wyświetlanie, blokowanie akcji dla gości, działanie akcji dla zalogowanych, obsługę błędów.
